#!/usr/bin/env node
/*
  Budget and completeness gate, run after `astro build` (packet §10).

    node scripts/budget.mjs          fail (exit 1) on any budget breach
    node scripts/budget.mjs --soft   print the same report, never fail

  Reads dist/public only; no dependencies. HTML is scanned with a small
  tag-balancing reader (enough for Astro's own output, not a general parser).

  Checks
    words     visible words in <main> after removing script, style, svg,
              template, noscript and role="img" elements (a colorbar's
              ticks are the image's, not reading text): home <= 250, research <= 1000, each
              research article[id] (one project) <= 260 (cv is measured, not budgeted)
    mailto    no page carries more than 3 mailto: links (the nav's Email, the visible address, the footer);
              a redirect stub carries none
    h1        the home <h1> text is the owner's name (cv.json basics.name)
    json-ld   every page (redirect stubs excepted) has at least one
              application/ld+json block, every block parses, and one of them
              holds a Person
    agents    /llms.txt, /llms-full.txt, /index.md, /research.md, /cv.md and
              /cv.json exist and are non-empty; cv.json parses and carries
              the JSON Resume sections and meta.canonical
    alt       <img> without an alt attribute: warning only
    email     every file in dist (binary-safe; PDF Flate streams inflated)
              is scanned for e-mail addresses; any address other than
              cv.json basics.email is a warning (not a failure: the CV PDF
              is the owner's export and the build cannot edit it)
    mailto    every mailto: target in dist must be cv.json basics.email:
              in HTML, text, markdown, JSON and scripts a wrong target
              fails; in a PDF a wrong target fails when its link
              annotation sits on a page (/Annots), and is a warning when
              the link object is orphaned (not clickable, still readable
              by a parser)
*/
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOFT = process.argv.includes('--soft');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist', 'public');

/* mailto: up to 3 per page since revision 2c (the nav's Email, the address shown as text, the footer), 0 in a redirect stub. */
const BUDGET = { home: 250, research: 1000, researchArticle: 260, mailto: 3, mailtoRedirect: 0 };
const AGENT_FILES = ['llms.txt', 'llms-full.txt', 'index.md', 'research.md', 'cv.md', 'cv.json'];
const CV_JSON_KEYS = ['basics', 'work', 'education', 'publications', 'awards', 'skills', 'projects'];

const failures = [];
const warnings = [];
const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);

/* ---------- html helpers ---------- */

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ndash: '–', mdash: '—', middot: '·', copy: '©', rarr: '→', larr: '←',
};
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Index just past the close tag that balances the element opening at `start`. */
function matchingClose(html, start, name) {
  const re = new RegExp(`<(/?)${name}(?=[\\s>/])[^>]*?(/?)>`, 'gi');
  re.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m[1]) depth -= 1;
    else if (!m[2]) depth += 1;
    if (depth <= 0) return re.lastIndex;
  }
  return html.length;
}

/** Remove whole elements (open tag to balancing close) of the given names. */
function removeElements(html, names) {
  let out = html;
  for (const name of names) {
    const openRe = new RegExp(`<${name}(?=[\\s>/])`, 'i');
    let idx;
    while ((idx = out.search(openRe)) !== -1) {
      out = `${out.slice(0, idx)} ${out.slice(matchingClose(out, idx, name))}`;
    }
  }
  return out;
}

/** Open tag and inner HTML of every element whose open tag matches `openRe`. */
function elements(html, name, openRe) {
  const found = [];
  const re = new RegExp(openRe.source, 'gi');
  let m;
  while ((m = re.exec(html))) {
    const start = m.index;
    const end = matchingClose(html, start, name);
    const openEnd = html.indexOf('>', start) + 1;
    const closeStart = html.lastIndexOf('<', end - 1);
    found.push({ open: html.slice(start, openEnd), inner: closeStart >= openEnd ? html.slice(openEnd, closeStart) : '' });
  }
  return found;
}

/*
  Remove every element that carries the boolean `hidden` attribute (the
  vessel viewer's colorbars and notes for the fields not chosen): they are
  in the HTML for agents, not visible words for a reader.
*/
function removeHidden(html) {
  const re = /<([a-z][a-z0-9-]*)\b[^>]*?\shidden(?:\s*=\s*(?:""|''|"hidden"|'hidden'))?(?=[\s/>])[^>]*>/i;
  let out = html;
  let m;
  while ((m = re.exec(out))) {
    out = `${out.slice(0, m.index)} ${out.slice(matchingClose(out, m.index, m[1]))}`;
  }
  return out;
}

/*
  An element with role="img" is an image to every reader: its aria-label
  is its text and its children are presentational (the plates' colorbars,
  whose tick numbers are drawn as DOM text so they are in the server HTML).
  Like an <svg>, it is not reading text, so its words are not counted.
*/
function removeImages(html) {
  const re = /<([a-z][a-z0-9-]*)\b[^>]*?\srole\s*=\s*["']?img["']?(?=[\s/>])[^>]*>/i;
  let out = html;
  let m;
  while ((m = re.exec(out))) {
    if (/\/>$/.test(m[0]) || m[1].toLowerCase() === 'canvas' || m[1].toLowerCase() === 'img') {
      out = `${out.slice(0, m.index)} ${out.slice(m.index + m[0].length)}`;
      continue;
    }
    out = `${out.slice(0, m.index)} ${out.slice(matchingClose(out, m.index, m[1]))}`;
  }
  return out;
}

const STRIP = ['script', 'style', 'svg', 'template', 'noscript'];
function visibleText(html) {
  return decode(
    removeElements(removeImages(removeHidden(html)), STRIP)
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}
function wordCount(html) {
  return visibleText(html)
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

function attr(tag, name) {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3]) : null;
}

/* ---------- files ---------- */

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (entry.endsWith('.html')) out.push(p);
  }
  return out;
}

function pageFile(route) {
  const candidates = route === '/' ? ['index.html'] : [`${route.slice(1)}/index.html`, `${route.slice(1)}.html`];
  for (const c of candidates) {
    const p = join(DIST, c);
    if (existsSync(p)) return p;
  }
  return null;
}

const isRedirect = (html) => /<meta\s+http-equiv\s*=\s*["']?refresh/i.test(html);

/* ---------- run ---------- */

if (!existsSync(DIST)) {
  console.error(`budget: ${relative(ROOT, DIST)} does not exist; run astro build first.`);
  process.exit(SOFT ? 0 : 1);
}

/* agent files */
const agentRows = [];
let ownerName = null;
let ownerEmail = null;
for (const f of AGENT_FILES) {
  const p = join(DIST, f);
  if (!existsSync(p) || statSync(p).size === 0) {
    fail(`agents: /${f} is missing from dist/public`);
    agentRows.push([`/${f}`, 'MISSING']);
    continue;
  }
  const text = readFileSync(p, 'utf8');
  agentRows.push([`/${f}`, `${(Buffer.byteLength(text) / 1024).toFixed(1)} KB`, text.split(/\s+/).filter(Boolean).length]);
  if (f === 'cv.json') {
    try {
      const cv = JSON.parse(text);
      ownerName = cv?.basics?.name ?? null;
      ownerEmail = cv?.basics?.email ?? null;
      if (!cv?.meta?.canonical) fail('agents: cv.json has no meta.canonical');
      for (const key of CV_JSON_KEYS) if (!(key in cv)) fail(`agents: cv.json lacks "${key}"`);
    } catch (e) {
      fail(`agents: cv.json does not parse (${e.message})`);
    }
  }
}
ownerName ??= 'Hyeong Jun Lee';

/* the three budgeted pages */
const PAGES = [
  { key: 'home', route: '/', budget: BUDGET.home },
  { key: 'research', route: '/research', budget: BUDGET.research },
  { key: 'cv', route: '/cv', budget: null },
];
const pageRows = [];
const sectionRows = [];
for (const page of PAGES) {
  const file = pageFile(page.route);
  if (!file) {
    fail(`words: ${page.route} was not built`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  const mains = elements(html, 'main', /<main(?=[\s>])/);
  if (mains.length === 0) {
    fail(`words: ${page.route} has no <main>`);
    continue;
  }
  const words = mains.reduce((n, m) => n + wordCount(m.inner), 0);
  const row = [page.route, words, page.budget ?? '-', ''];
  pageRows.push(row);
  if (page.budget !== null && words > page.budget) {
    fail(`words: ${page.route} <main> has ${words} visible words (budget ${page.budget}, over by ${words - page.budget})`);
  }
  if (page.key === 'research') {
    for (const s of elements(mains[0].inner, 'article', /<article(?=[\s>])/)) {
      const id = attr(s.open, 'id');
      if (!id) continue;
      const n = wordCount(s.inner);
      sectionRows.push([`#${id}`, n, BUDGET.researchArticle]);
      if (n > BUDGET.researchArticle) {
        fail(`words: /research article#${id} has ${n} visible words (budget ${BUDGET.researchArticle}, over by ${n - BUDGET.researchArticle})`);
      }
    }
  }
  if (page.key === 'home') {
    const h1s = elements(html, 'h1', /<h1(?=[\s>])/);
    const h1 = h1s.length ? visibleText(h1s[0].inner) : '';
    row[3] = `h1 "${h1}"`;
    if (h1 !== ownerName) fail(`h1: the home <h1> reads "${h1 || '(none)'}", expected "${ownerName}"`);
  }
}

/* every built page: mailto, JSON-LD, alt */
const mailRows = [];
const ldRows = [];
for (const file of walk(DIST).sort()) {
  const route = `/${relative(DIST, file).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '')}`;
  const html = readFileSync(file, 'utf8');
  const mailto = (html.match(/href\s*=\s*["']?mailto:/gi) ?? []).length;
  if (isRedirect(html)) {
    mailRows.push([`${route} (redirect)`, mailto, BUDGET.mailtoRedirect]);
    if (mailto > BUDGET.mailtoRedirect) fail(`mailto: redirect stub ${route} has ${mailto} mailto: links (max ${BUDGET.mailtoRedirect})`);
    ldRows.push([route, 'redirect stub, skipped']);
    continue;
  }

  mailRows.push([route, mailto, BUDGET.mailto]);
  if (mailto > BUDGET.mailto) fail(`mailto: ${route} has ${mailto} mailto: links (max ${BUDGET.mailto})`);

  const blocks = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  if (blocks.length === 0) {
    fail(`json-ld: ${route} has no application/ld+json block`);
    ldRows.push([route, 'none']);
  } else {
    const types = [];
    let parsed = true;
    for (const b of blocks) {
      try {
        const doc = JSON.parse(b);
        const nodes = Array.isArray(doc) ? doc : Array.isArray(doc['@graph']) ? doc['@graph'] : [doc];
        for (const n of nodes) types.push(...[].concat(n?.['@type'] ?? []));
      } catch (e) {
        parsed = false;
        fail(`json-ld: ${route} has a block that does not parse (${e.message})`);
      }
    }
    if (parsed && !types.includes('Person')) fail(`json-ld: ${route} has no Person node`);
    const tally = types.reduce((acc, t) => ((acc[t] = (acc[t] ?? 0) + 1), acc), {});
    const summary = Object.entries(tally)
      .map(([t, n]) => (n > 1 ? `${t} x${n}` : t))
      .join(', ');
    ldRows.push([route, `${blocks.length} block${blocks.length > 1 ? 's' : ''}: ${summary}`]);
  }

  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (attr(m[0], 'alt') === null) warn(`alt: ${route} has an <img> without alt (${attr(m[0], 'src') ?? 'no src'})`);
  }
}

/* every file: e-mail addresses other than the owner's (a retired address left in a PDF, a typo) */
function walkAll(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walkAll(p));
    else out.push(p);
  }
  return out;
}
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const emailRows = [];
if (ownerEmail) {
  const others = new Map();
  for (const file of walkAll(DIST)) {
    if (/\.(png|jpe?g|webp|avif|gif|ico|woff2?|bin|gz)$/i.test(file)) continue;
    const buf = readFileSync(file);
    const texts = [buf.toString('latin1')];
    if (/\.pdf$/i.test(file)) {
      const raw = texts[0];
      for (const m of raw.matchAll(/stream\r?\n/g)) {
        const start = m.index + m[0].length;
        const end = raw.indexOf('endstream', start);
        if (end < 0) continue;
        try {
          texts.push(inflateSync(buf.subarray(start, end)).toString('latin1'));
        } catch {
          /* not a Flate stream */
        }
      }
    }
    /* mailto: targets (the link a reader clicks), stricter than the address scan */
    const rel = `/${relative(DIST, file).replace(/\\/g, '/')}`;
    if (/\.pdf$/i.test(file)) {
      const raw = texts[0];
      const onPage = new Set();
      for (const m of raw.matchAll(/\/Annots\s*\[([^\]]*)\]/g)) {
        for (const r of m[1].matchAll(/(\d+)\s+\d+\s+R/g)) onPage.add(Number(r[1]));
      }
      for (const m of raw.matchAll(/(?:^|[\r\n])(\d+)\s+\d+\s+obj\b((?:(?!endobj)[\s\S])*?)\/URI\s*\(mailto:([^)]*)\)/g)) {
        const obj = m[1];
        const target = m[3];
        if (target.toLowerCase() === ownerEmail.toLowerCase()) continue;
        const shown = target.replace(/^(.)[^@]*/, '$1***');
        if (onPage.has(Number(obj))) fail(`mailto: ${rel} links to ${shown} (object ${obj}, on a page), not ${ownerEmail}`);
        else warn(`mailto: ${rel} holds an orphaned link object ${obj} to ${shown} (on no page, not clickable; the owner should re-export the PDF to drop it)`);
      }
    } else {
      for (const m of texts[0].matchAll(/mailto:([^"'\s<>)?&]+)/gi)) {
        let target = m[1];
        try {
          target = decodeURIComponent(target);
        } catch {
          /* keep as written */
        }
        if (target.toLowerCase() === ownerEmail.toLowerCase()) continue;
        fail(`mailto: ${rel} links to ${target.replace(/^(.)[^@]*/, '$1***')}, not ${ownerEmail}`);
      }
    }
    for (const t of texts) {
      for (const [addr] of t.matchAll(EMAIL)) {
        if (addr.toLowerCase() === ownerEmail.toLowerCase()) continue;
        if (!others.has(addr)) others.set(addr, new Set());
        others.get(addr).add(rel);
      }
    }
  }
  for (const [addr, files] of others) {
    const list = [...files].sort();
    // Redacted in the log (CI logs can be public): first character and the domain only.
    const shown = addr.replace(/^(.)[^@]*/, '$1***');
    emailRows.push([shown, list.join(', ')]);
    warn(`email: ${shown} is not the owner's address (${ownerEmail}) and appears in ${list.join(', ')}`);
  }
}

/* ---------- report ---------- */

function table(title, head, rows) {
  const all = [head, ...rows].map((r) => r.map((c) => String(c ?? '')));
  const widths = head.map((_, i) => Math.max(...all.map((r) => (r[i] ?? '').length)));
  console.log(`\n${title}`);
  for (const r of all) console.log(`  ${r.map((c, i) => c.padEnd(widths[i])).join('  ')}`.trimEnd());
}

console.log(`budget: ${relative(process.cwd(), DIST) || DIST}${SOFT ? ' (soft: report only)' : ''}`);
table('Visible words in <main>', ['page', 'words', 'budget', 'note'], pageRows);
if (sectionRows.length) table('Research article[id]', ['project', 'words', 'budget'], sectionRows);
table('mailto: links per page', ['page', 'mailto', 'max'], mailRows);
table('JSON-LD', ['page', 'blocks and @types'], ldRows);
table('Agent files', ['file', 'size', 'words'], agentRows);
console.log(`
E-mail addresses: ${emailRows.length ? `${emailRows.length} other than ${ownerEmail} (see warnings)` : `only ${ownerEmail ?? '(owner address unknown)'}`}`);

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length})`);
  for (const w of warnings) console.log(`  warn  ${w}`);
}
if (failures.length) {
  console.log(`\n${SOFT ? 'Would fail' : 'Failed'} (${failures.length})`);
  for (const f of failures) console.log(`  FAIL  ${f}`);
  if (!SOFT) {
    console.log('\nbudget: failed. Fix the items above, or run with --soft to report without failing.');
    process.exit(1);
  }
  console.log('\nbudget: soft mode, exiting 0 despite the failures above.');
} else {
  console.log('\nbudget: all checks passed.');
}
