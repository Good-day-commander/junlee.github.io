#!/usr/bin/env node
/*
  CI smoke test, run after `pnpm build` (which already passed the budget gate).

    node scripts/smoke.mjs

  Starts `astro preview` on a free port (it serves dist/public, the config's
  outDir), drives Playwright chromium through the built site and exits 1 on
  any failure. Stops the server it started on every exit path.

  Pages: /, /research/, /cv/, each at 1440 x 900 and 390 x 844.

  Checks
    console    no console error and no page error on any page
    h1         the home <h1> reads "Hyeong Jun Lee"
    updates    on / the Updates row (details.updates) ships closed, its
               summary has a sentence and a mono (t-mono) date, the list
               holds at least one row, and a click on the summary opens it;
               once the 250 ms height move has ended (read at 300 ms,
               polled for 2 s more) the list sits inside the row's box
    more       on /research/ every Method and metrics row (details.more)
               ships closed, its summary carries the words, and a click on
               the summary opens it; once the height move has ended its
               content sits inside the row's box
    folded     on /research/, once those rows are open, every plate inside
               one draws within 10 s of being scrolled into view: the Pd/Pa
               curve its chart (svg), a spectrogram leaves data-phase="latent"
    plates     on /research/ #pino keeps its Pd/Pa curve in view, outside
               Method and metrics, and it draws its chart within 10 s; the
               viewer caption's "CFD left, PINO right" clause shows exactly
               when the viewer has the wipe handle (data-control="handle")
    study      on /research/ the A⁺4DCT results plate sits on film (.plate);
               its case control shows, holds one option per case panel and
               exactly the chosen panel shows with its chart row marked;
               choosing another case moves both; every video is muted,
               playsinline, preload="none", carries a poster and does not
               autoplay, and no .mp4 has been fetched
    order      at 1440, /research/ lists its projects newest first by start
               year, and no project title ends in a parenthetical label
               such as "(ongoing)" or "(published)"
    viewer     on / and /research/ the vessel viewer reaches
               data-status="ready" within 15 s of being scrolled into view
               (status "nowebgl" or "error" fails)
    wipe       on those pages a visible CFD | PINO control: the wipe handle
               (role=slider) or the two-state toggle (CFD and PINO buttons)
    layer      the phone layer (640px and under) at 390, and its absence at
               1440. On /: the Work section is hidden at 390 and each
               Selected DOI shows as the word "DOI"; at 1440 the rows and the
               full DOIs show. On /research/: at 390 every outputs line with
               more than one item shows a caret control (aria-label "More
               outputs, N", unchanged by a tap; aria-expanded carries the
               state) and hides the rest; a tap shows it and a second tap
               hides it; at 1440 there is no control and every line is whole. On /cv/: at 390 the folding sections
               (details.cv-fold) are closed on load, a click on the Talks
               heading opens it (its content inside the section's box once
               the height move has ended), and the jump row shows one link per section;
               at 1440 every fold is open and the jump row is hidden.
    lightbox   on /cv/ at 1440, with the full-size photo held back 3 s, a
               click on the first talk photo opens the dialog, fully opaque
               once its 250 ms fade has ended, at the photo's own ratio
               (data-w / data-h) before the file arrives; Escape closes it
               and the image source is gone once the 150 ms fade has ended
    anchor     at 390, /cv/#P3 loaded cold lands on P3 inside an opened
               Patents section, and a hashchange to #I1 opens Talks and
               lands on it
    poster     on / with JavaScript off, the home plate shows its poster
               (the vessel still, empty alt) across the frame: the 2:1 still
               at 1440, the 3:4 portrait still at 390
    failure    at 1440, with the plate's data refused (404), the home plate
               and the #pino Pd/Pa plate print their one approved sentence
               and no file name or URL, and the curve plate keeps its height
    mailto     no page carries more than three mailto: anchors
    redirect   /publications/ and /record/ land on /cv/#publications and
               /cv/#talks, and the anchors exist on the CV
    agents     /llms.txt and /cv.md are served, non-empty and start with a
               markdown h1; /cv.json parses and names the owner

  Requires the Playwright chromium browser:
    pnpm exec playwright install chromium              (local)
    pnpm exec playwright install --with-deps chromium  (CI)

  Headless chromium renders WebGL through SwiftShader; it is enabled
  explicitly because recent chromium no longer falls back to it silently.
  CHROMIUM_ARGS adds launch flags.
*/
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist', 'public');
const ASTRO = join(ROOT, 'node_modules', 'astro', 'astro.js');
const HOST = '127.0.0.1';
const OWNER = 'Hyeong Jun Lee';
const VIEWER_READY_MS = 15_000;
const SERVER_START_MS = 60_000;

const VIEWPORTS = [
  { label: '1440', width: 1440, height: 900 },
  { label: '390', width: 390, height: 844 },
];
const PAGES = [
  { route: '/', viewer: true, h1: OWNER, updates: true, layer: 'home' },
  { route: '/research/', viewer: true, more: true, plates: true, study: true, layer: 'research' },
  { route: '/cv/', layer: 'cv', lightbox: true },
];
/* The phone layer's breakpoint (the identity block's): at or under it the pages fold, above it nothing does. */
const PHONE_MAX = 640;
const REDIRECTS = [
  { route: '/publications/', to: '/cv/', hash: '#publications' },
  { route: '/record/', to: '/cv/', hash: '#talks' },
];

/* ---------- results ---------- */

const rows = [];
function record(check, where, ok, detail = '') {
  rows.push({ check, where, ok: Boolean(ok), detail });
}

function printTable() {
  const head = { check: 'check', where: 'where', status: 'result', detail: 'detail' };
  const body = rows.map((r) => ({ check: r.check, where: r.where, status: r.ok ? 'pass' : 'FAIL', detail: r.detail }));
  const w = (k) => Math.max(head[k].length, ...body.map((r) => r[k].length));
  const line = (r) => `  ${r.check.padEnd(w('check'))}  ${r.where.padEnd(w('where'))}  ${r.status.padEnd(w('status'))}  ${r.detail}`.trimEnd();
  console.log('');
  console.log(line(head));
  console.log(`  ${'-'.repeat(w('check'))}  ${'-'.repeat(w('where'))}  ${'-'.repeat(w('status'))}  ${'-'.repeat(Math.max(6, w('detail')))}`);
  for (const r of body) console.log(line(r));
  const failed = rows.filter((r) => !r.ok).length;
  console.log('');
  console.log(failed ? `smoke: ${failed} of ${rows.length} checks failed` : `smoke: all ${rows.length} checks passed`);
  return failed;
}

const clip = (s, n = 140) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
/* The height move of an opened details (styles/global.css) is 250 ms; read the box after it. */
const MOVE_MS = 300;
/*
  An open details shows all of its content: every child but the summary ends
  inside the details' own box. Read after MOVE_MS and polled for up to 2 s
  more, so a slow runner's late frame is not read as a stuck move.
*/
async function revealed(details) {
  const deadline = Date.now() + 2000;
  for (;;) {
    const ok = await details.evaluate((d) => {
      const bottom = d.getBoundingClientRect().bottom;
      return d.open && [...d.children].filter((c) => c.tagName !== 'SUMMARY').every((c) => c.getBoundingClientRect().bottom <= bottom + 0.5);
    });
    if (ok || Date.now() > deadline) return ok;
    await new Promise((r) => setTimeout(r, 100));
  }
}

/* ---------- server ---------- */

function freePort() {
  return new Promise((res, rej) => {
    const srv = createServer();
    srv.unref();
    srv.on('error', rej);
    srv.listen(0, HOST, () => {
      const { port } = srv.address();
      srv.close(() => res(port));
    });
  });
}

let server = null;
let serverLog = '';
let stopped = false;

function stopServer() {
  if (stopped || !server || server.exitCode !== null || server.signalCode !== null) return;
  stopped = true;
  if (process.platform === 'win32') {
    // Take down the whole tree (astro may hold child handles).
    spawnSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' });
  } else {
    server.kill('SIGTERM');
  }
}

async function startServer() {
  const port = await freePort();
  server = spawn(process.execPath, [ASTRO, 'preview', '--host', HOST, '--port', String(port)], {
    cwd: ROOT,
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', FORCE_COLOR: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (d) => (serverLog += d));
  server.stderr.on('data', (d) => (serverLog += d));
  const base = `http://${HOST}:${port}`;
  const deadline = Date.now() + SERVER_START_MS;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`astro preview exited (${server.exitCode}):\n${serverLog}`);
    try {
      const r = await fetch(`${base}/`);
      if (r.ok) return base;
    } catch {
      /* not listening yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`astro preview did not answer on ${base} within ${SERVER_START_MS / 1000} s:\n${serverLog}`);
}

/* ---------- checks ---------- */

async function checkAgents(base) {
  const get = async (path) => {
    const r = await fetch(base + path);
    return { status: r.status, text: r.ok ? await r.text() : '' };
  };

  for (const path of ['/llms.txt', '/cv.md']) {
    try {
      const { status, text } = await get(path);
      const firstLine = text.split(/\r?\n/).find((l) => l.trim()) ?? '';
      const ok = status === 200 && text.trim().length > 0 && /^# \S/.test(firstLine);
      record('agents', path, ok, ok ? `${text.length} chars, "${clip(firstLine, 40)}"` : `HTTP ${status}, first line "${clip(firstLine, 40)}"`);
    } catch (e) {
      record('agents', path, false, clip(String(e)));
    }
  }

  try {
    const { status, text } = await get('/cv.json');
    let cv = null;
    try {
      cv = JSON.parse(text);
    } catch (e) {
      record('agents', '/cv.json', false, `HTTP ${status}, does not parse: ${clip(e.message, 80)}`);
    }
    if (cv) {
      const name = cv?.basics?.name;
      record('agents', '/cv.json', name === OWNER, name === OWNER ? `parses, basics.name "${name}"` : `basics.name is ${JSON.stringify(name)}`);
    }
  } catch (e) {
    record('agents', '/cv.json', false, clip(String(e)));
  }
}

async function checkViewer(page, where, navStart) {
  const viewer = page.locator('[data-island="VesselViewer"]').first();
  try {
    // client:visible: the island hydrates only once it is on screen.
    await viewer.waitFor({ state: 'attached', timeout: 5_000 });
    await viewer.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () => {
        const el = document.querySelector('[data-island="VesselViewer"]');
        const st = el?.getAttribute('data-status');
        return st === 'ready' || st === 'error' || st === 'nowebgl';
      },
      null,
      { timeout: VIEWER_READY_MS },
    );
    const status = await viewer.getAttribute('data-status');
    const ms = Date.now() - navStart;
    record('viewer', where, status === 'ready', status === 'ready' ? `ready ${(ms / 1000).toFixed(1)} s after navigation` : `data-status="${status}"`);
    if (status !== 'ready') {
      record('wipe', where, false, 'viewer not ready');
      return;
    }
  } catch (e) {
    const status = await viewer.getAttribute('data-status').catch(() => null);
    record('viewer', where, false, `not ready within ${VIEWER_READY_MS / 1000} s (data-status="${status}")`);
    record('wipe', where, false, 'viewer not ready');
    return;
  }

  const control = await viewer.getAttribute('data-control');
  const handle = viewer.locator('[role="slider"][aria-label="CFD | PINO wipe"]');
  const cfd = viewer.getByRole('button', { name: 'CFD', exact: true });
  const pino = viewer.getByRole('button', { name: 'PINO', exact: true });
  // The handle itself is a zero-width line at the wipe position; its grip carries the size and the CFD | PINO labels.
  const grip = handle.locator(':scope > span').first();
  const handleOk =
    (await handle.count()) === 1 &&
    (await grip.isVisible()) &&
    /CFD\s*PINO/.test(((await grip.textContent()) ?? '').trim());
  const toggleOk = (await cfd.count()) === 1 && (await pino.count()) === 1 && (await cfd.isVisible()) && (await pino.isVisible());
  const ok = control === 'toggle' ? toggleOk : handleOk;
  record('wipe', where, ok, ok ? (control === 'toggle' ? 'two-state toggle' : 'wipe handle') : `data-control="${control}", handle ${handleOk}, toggle ${toggleOk}`);
}

/* The home Updates row: closed on load, a dated sentence in the summary, more rows behind it, opened by a click. */
async function checkUpdates(page, where) {
  try {
    const details = page.locator('details.updates');
    const n = await details.count();
    if (n !== 1) {
      record('updates', where, false, `${n} details.updates on the page`);
      return;
    }
    const closed = (await details.getAttribute('open')) === null;
    const summary = details.locator(':scope > summary');
    const text = ((await summary.textContent()) ?? '').replace(/\s+/g, ' ').trim();
    const dateEl = summary.locator('.t-mono');
    const date = (await dateEl.count()) ? ((await dateEl.first().textContent()) ?? '').trim() : '';
    const rows = await details.locator(':scope > ol > li').count();
    await summary.click();
    const opened = (await details.getAttribute('open')) !== null;
    await page.waitForTimeout(MOVE_MS);
    const shown = await revealed(details);
    const ok = closed && text.length > date.length && date.length > 0 && rows > 0 && opened && shown;
    record(
      'updates',
      where,
      ok,
      ok
        ? `closed on load, "${date}" + sentence, ${rows} more row${rows === 1 ? '' : 's'}, opens on click and shows them`
        : `closed ${closed}, summary "${clip(text, 40)}", date "${date}", rows ${rows}, opened ${opened}, rows inside the box ${shown}`,
    );
  } catch (e) {
    record('updates', where, false, clip(String(e)));
  }
}

/* The phone layer at 390 and its absence at 1440 (see "layer" above). Runs right after load, before the walk. */
async function checkLayer(page, where, spec, vp) {
  const phone = vp.width <= PHONE_MAX;
  try {
    if (spec.layer === 'home') {
      const s = await page.evaluate(() => {
        const shown = (sel) => [...document.querySelectorAll(sel)].filter((el) => el.checkVisibility()).length;
        const all = (sel) => document.querySelectorAll(sel).length;
        return {
          names: shown('.caps__name a'),
          texts: shown('.caps__row-text'),
          rows: all('.caps__row-text'),
          dois: shown('.sel__doi'),
          doiAll: all('.sel__doi'),
          doiShort: shown('.sel__doi-short'),
          doiFull: shown('.sel__doi-full'),
          venues: shown('.sel__venue'),
        };
      });
      /* Phones: the whole Work section is hidden and each Selected DOI shows as the word "DOI"; wider: everything shows. */
      const ok =
        s.rows > 0 &&
        s.doiAll > 0 &&
        s.venues > 0 &&
        s.dois === s.doiAll &&
        (phone
          ? s.names === 0 && s.texts === 0 && s.doiShort === s.doiAll && s.doiFull === 0
          : s.names === s.rows && s.texts === s.rows && s.doiFull === s.doiAll && s.doiShort === 0);
      record(
        'layer',
        where,
        ok,
        `${s.names} Work names, row texts ${s.texts}/${s.rows} shown, Selected DOIs ${s.dois}/${s.doiAll} (short ${s.doiShort}, full ${s.doiFull})`,
      );
      return;
    }
    if (spec.layer === 'research') {
      const s = await page.evaluate(() => {
        const lines = [...document.querySelectorAll('.project__outputs')].filter((p) => p.querySelector('.project__outputs-rest'));
        return {
          multi: lines.length,
          buttons: lines.filter((p) => p.querySelector('.project__more')?.checkVisibility()).length,
          rests: lines.filter((p) => p.querySelector('.project__outputs-rest').checkVisibility()).length,
          counts: lines.every(
            (p) => p.querySelector('.project__more')?.getAttribute('aria-label') === `More outputs, ${p.querySelectorAll('.project__outputs-rest a').length}`,
          ),
        };
      });
      if (!phone) {
        const ok = s.multi > 0 && s.buttons === 0 && s.rests === s.multi;
        record('layer', where, ok, `${s.multi} outputs lines with more than one item: ${s.buttons} +N controls shown, ${s.rests} lines whole`);
        return;
      }
      const button = page.locator('.project__more:visible').first();
      const id = await button.getAttribute('aria-controls');
      await button.click();
      const label = await button.getAttribute('aria-label');
      const after = await page.evaluate((restId) => {
        const b = document.querySelector(`[aria-controls="${restId}"]`);
        return { rest: document.getElementById(restId).checkVisibility(), button: b.checkVisibility(), expanded: b.getAttribute('aria-expanded'), label: b.getAttribute('aria-label') };
      }, id);
      await button.click();
      const again = await page.evaluate((restId) => {
        const b = document.querySelector(`[aria-controls="${restId}"]`);
        return { rest: document.getElementById(restId).checkVisibility(), expanded: b.getAttribute('aria-expanded') };
      }, id);
      const ok =
        s.multi > 0 &&
        s.buttons === s.multi &&
        s.rests === 0 &&
        s.counts &&
        after.rest &&
        after.button &&
        after.expanded === 'true' &&
        after.label === label &&
        !again.rest &&
        again.expanded === 'false';
      record(
        'layer',
        where,
        ok,
        ok
          ? `${s.buttons} caret controls, the rest hidden; a tap shows #${id}, a second tap hides it again`
          : `lines ${s.multi}, controls ${s.buttons}, rests shown ${s.rests}, labels ${s.counts}, after click ${JSON.stringify(after)}, again ${JSON.stringify(again)}`,
      );
      return;
    }
    if (spec.layer === 'cv') {
      const s = await page.evaluate(() => {
        const folds = [...document.querySelectorAll('details.cv-fold')];
        const jump = document.querySelector('nav.cv-jump');
        const links = jump ? [...jump.querySelectorAll('a')] : [];
        return {
          folds: folds.length,
          open: folds.filter((d) => d.open).length,
          jump: Boolean(jump?.checkVisibility()),
          links: links.length,
          targets: links.filter((a) => document.getElementById(a.hash.slice(1))?.matches('section.cv-section')).length,
          sections: document.querySelectorAll('section.cv-section').length,
        };
      });
      if (!phone) {
        const ok = s.folds > 0 && s.open === s.folds && !s.jump;
        record('layer', where, ok, `${s.open} of ${s.folds} folds open, jump row ${s.jump ? 'shown' : 'hidden'}`);
        return;
      }
      await page.locator('#talks details.cv-fold > summary').click();
      await page.waitForTimeout(MOVE_MS);
      const talks = await revealed(page.locator('#talks details.cv-fold'));
      const ok = s.folds > 0 && s.open === 0 && talks && s.jump && s.links === s.sections && s.targets === s.links;
      record(
        'layer',
        where,
        ok,
        `${s.folds - s.open} of ${s.folds} folds closed on load, Talks ${talks ? 'opens and shows its content' : 'does not open in full'} on click; jump row ${s.jump ? 'shown' : 'hidden'}, ${s.targets} of ${s.sections} sections linked`,
      );
    }
  } catch (e) {
    record('layer', where, false, clip(String(e)));
  }
}

/* /cv/ at 1440: the photo dialog opens at its photo's ratio before the full-size file arrives, and lets the image go after its fade. */
async function checkLightbox(page, where) {
  const link = page.locator('a[data-lightbox]').first();
  try {
    const href = new URL(await link.getAttribute('href'), page.url()).href;
    await page.route(href, async (route) => {
      await new Promise((r) => setTimeout(r, 3000));
      await route.continue().catch(() => {});
    });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await page.waitForTimeout(MOVE_MS);
    await page
      .waitForFunction(() => Number(getComputedStyle(document.getElementById('photo-lightbox')).opacity) === 1, null, { timeout: 1500 })
      .catch(() => {});
    const open = await page.evaluate(() => {
      const d = document.getElementById('photo-lightbox');
      const img = d.querySelector('img');
      const a = document.querySelector('a[data-lightbox]');
      const r = img.getBoundingClientRect();
      return {
        open: d.open,
        opacity: Number(getComputedStyle(d).opacity),
        loaded: img.complete && img.naturalWidth > 0,
        ratio: r.height ? r.width / r.height : 0,
        want: Number(a.dataset.w) / Number(a.dataset.h),
        width: Math.round(r.width),
        fits: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
      };
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(MOVE_MS);
    await page.waitForFunction(() => !document.querySelector('#photo-lightbox img').hasAttribute('src'), null, { timeout: 1500 }).catch(() => {});
    const closed = await page.evaluate(() => {
      const d = document.getElementById('photo-lightbox');
      return { open: d.open, src: d.querySelector('img').hasAttribute('src') };
    });
    const ratioOk = open.want > 0 && Math.abs(open.ratio / open.want - 1) < 0.01;
    const ok = open.open && open.opacity === 1 && !open.loaded && ratioOk && open.width > 200 && open.fits && !closed.open && !closed.src;
    record(
      'lightbox',
      where,
      ok,
      ok
        ? `opens ${open.width} px wide at the photo's ratio before the file arrives, opaque after the fade; Escape closes it and drops the image`
        : `open ${open.open}, opacity ${open.opacity}, loaded ${open.loaded}, ratio ${open.ratio.toFixed(3)} for ${open.want.toFixed(3)}, width ${open.width}, fits ${open.fits}; after Escape open ${closed.open}, src ${closed.src}`,
    );
  } catch (e) {
    record('lightbox', where, false, clip(String(e)));
  } finally {
    await page.unrouteAll({ behavior: 'ignoreErrors' }).catch(() => {});
  }
}

/* A cold load of /cv/#P3 at phone width, then a hashchange to #I1: each lands inside a section the handler opened. */
async function checkAnchor(context, base) {
  const where = '/cv/#P3 @390';
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const at = (id, section) =>
    page.evaluate(
      ({ id, section }) => {
        const r = document.getElementById(id).getBoundingClientRect();
        return { open: document.querySelector(`#${section} details.cv-fold`)?.open === true, top: Math.round(r.top), vh: window.innerHeight };
      },
      { id, section },
    );
  try {
    await page.goto(`${base}/cv/#P3`, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const p3 = await at('P3', 'patents');
    await page.evaluate(() => {
      window.location.hash = '#I1';
    });
    await page.waitForTimeout(500);
    const i1 = await at('I1', 'talks');
    const lands = (x) => x.open && x.top >= 0 && x.top < x.vh / 2;
    const ok = lands(p3) && lands(i1) && errors.length === 0;
    record(
      'anchor',
      where,
      ok,
      `P3 at y ${p3.top} in ${p3.open ? 'an open' : 'a closed'} Patents section; #I1 by hashchange at y ${i1.top}, Talks ${i1.open ? 'open' : 'closed'}${errors.length ? `; ${clip(errors.join(' | '), 80)}` : ''}`,
    );
  } catch (e) {
    record('anchor', where, false, clip(String(e)));
  } finally {
    await page.close();
  }
}

/* /research: each demo's Method and metrics (details.more) ships closed at every width and opens on a click on its summary. */
async function checkMore(page, where) {
  try {
    const details = page.locator('details.more');
    const n = await details.count();
    if (n === 0) {
      record('more', where, false, 'no details.more on the page');
      return;
    }
    const closed = await details.evaluateAll((els) => els.filter((d) => !d.open).length);
    let labelled = 0;
    let opened = 0;
    for (let i = 0; i < n; i += 1) {
      const d = details.nth(i);
      const summary = d.locator(':scope > summary');
      if (/Method and metrics/.test((await summary.textContent()) ?? '')) labelled += 1;
      await summary.click();
      if ((await d.getAttribute('open')) !== null) opened += 1;
    }
    await page.waitForTimeout(MOVE_MS);
    let shown = 0;
    for (let i = 0; i < n; i += 1) if (await revealed(details.nth(i))) shown += 1;
    const ok = n === closed && n === labelled && n === opened && n === shown;
    record(
      'more',
      where,
      ok,
      ok
        ? `${n} closed on load, each opens on a click and shows its content`
        : `${closed} of ${n} closed on load, ${labelled} labelled, ${opened} opened on click, ${shown} with the content inside the box`,
    );
  } catch (e) {
    record('more', where, false, clip(String(e)));
  }
}

/* /research: a plate folded into Method and metrics hydrates (client:visible) and draws once its row is open. */
async function checkFolded(page, where) {
  const DRAW_MS = 10_000;
  try {
    const islands = page.locator('details.more [data-island]');
    const n = await islands.count();
    if (n === 0) {
      record('folded', where, true, 'no plate inside Method and metrics');
      return;
    }
    const drawn = [];
    const missing = [];
    for (let i = 0; i < n; i += 1) {
      const el = islands.nth(i);
      const kind = (await el.getAttribute('data-island')) ?? '?';
      const variant = await el.getAttribute('data-variant');
      const label = variant ? `${kind} ${variant}` : kind;
      const open = await el.evaluate((node) => Boolean(node.closest('details')?.open));
      await el.scrollIntoViewIfNeeded();
      const ok =
        open &&
        (await page
          .waitForFunction(
            (idx) => {
              const node = document.querySelectorAll('details.more [data-island]')[idx];
              if (!node) return false;
              const k = node.getAttribute('data-island');
              if (k === 'FfrCurve') return Boolean(node.querySelector('svg[role="img"]'));
              if (k === 'SpectrogramDevelop' || k === 'CwtStrip') return node.getAttribute('data-phase') !== 'latent';
              return true;
            },
            i,
            { timeout: DRAW_MS },
          )
          .then(
            () => true,
            () => false,
          ));
      (ok ? drawn : missing).push(open ? label : `${label} (row closed)`);
    }
    record(
      'folded',
      where,
      missing.length === 0,
      missing.length === 0 ? `${drawn.join(', ')} drawn once opened` : `not drawn within ${DRAW_MS / 1000} s: ${missing.join(', ')}`,
    );
  } catch (e) {
    record('folded', where, false, clip(String(e)));
  }
}

/* /research #pino: the curve stays in view beside the viewer and draws; the caption names sides only beside the wipe handle. Runs after checkViewer, so data-control is final. */
async function checkPlates(page, where) {
  const DRAW_MS = 10_000;
  try {
    const curve = page.locator('#pino [data-island="FfrCurve"]');
    const n = await curve.count();
    const folded = n > 0 ? await curve.first().evaluate((node) => Boolean(node.closest('details'))) : false;
    let drawn = false;
    if (n === 1 && !folded) {
      await curve.scrollIntoViewIfNeeded();
      drawn = await page
        .waitForFunction(() => Boolean(document.querySelector('#pino [data-island="FfrCurve"] svg[role="img"]')), null, { timeout: DRAW_MS })
        .then(
          () => true,
          () => false,
        );
    }
    const caption = await page.evaluate(() => {
      const viewer = document.querySelector('#pino [data-island="VesselViewer"]');
      const wide = viewer?.closest('.art')?.querySelector('.art__caption-wide');
      return { control: viewer?.getAttribute('data-control') ?? null, shown: Boolean(wide?.checkVisibility()), present: Boolean(wide) };
    });
    const captionOk = caption.present && caption.shown === (caption.control === 'handle');
    const ok = n === 1 && !folded && drawn && captionOk;
    record(
      'plates',
      where,
      ok,
      ok
        ? `Pd/Pa curve in view and drawn; side clause ${caption.shown ? 'shown' : 'hidden'} with the ${caption.control === 'handle' ? 'wipe handle' : 'two-state toggle'}`
        : `curves ${n}, inside the fold ${folded}, drawn ${drawn}; control "${caption.control}", side clause ${caption.present ? (caption.shown ? 'shown' : 'hidden') : 'missing'}`,
    );
  } catch (e) {
    record('plates', where, false, clip(String(e)));
  }
}

/* The A⁺4DCT results plate: film, a working case control, videos that cost nothing until played. */
async function checkStudy(page, where) {
  try {
    const study = page.locator('[data-coronary-study]');
    if ((await study.count()) !== 1) {
      record('study', where, false, `${await study.count()} results plates on the page`);
      return;
    }
    await study.scrollIntoViewIfNeeded();
    const read = () =>
      study.evaluate((root) => {
        const select = root.querySelector('select');
        const label = root.querySelector('.study__select');
        const panels = [...root.querySelectorAll('[data-study-case]')];
        return {
          film: Boolean(root.querySelector('.plate')),
          control: Boolean(label && !label.hidden && label.checkVisibility()),
          options: select ? select.options.length : 0,
          value: select?.value ?? null,
          panels: panels.length,
          shown: panels.filter((p) => !p.hidden).map((p) => p.dataset.studyCase),
          marked: [...root.querySelectorAll('[data-study-row]')].filter((r) => r.dataset.selected === 'true').map((r) => r.dataset.studyRow),
          videos: [...root.querySelectorAll('video')].map((v) => v.muted && v.hasAttribute('playsinline') && v.getAttribute('preload') === 'none' && Boolean(v.getAttribute('poster')) && !v.autoplay && v.paused),
          fetched: performance.getEntriesByType('resource').filter((e) => /\.mp4(\?|$)/.test(e.name)).length,
        };
      });
    const before = await read();
    const other = before.value === '0' ? '1' : '0';
    await study.locator('select').selectOption(other);
    const after = await read();
    const follows = (s, v) => s.shown.length === 1 && s.shown[0] === v && s.marked.length === 1 && s.marked[0] === v;
    const videosOk = before.videos.length === before.panels && before.videos.every(Boolean);
    const ok =
      before.film && before.control && before.options === before.panels && before.panels > 0 &&
      follows(before, before.value) && follows(after, other) && videosOk && after.fetched === 0;
    record(
      'study',
      where,
      ok,
      ok
        ? `film plate, ${before.panels} cases; case ${before.value} shown, then ${other} after a change; ${before.videos.length} videos muted, inline, preload none, posters, no .mp4 fetched`
        : `film ${before.film}, control ${before.control}, options ${before.options}/${before.panels}, shown ${before.shown}->${after.shown}, marked ${before.marked}->${after.marked}, videos ok ${videosOk}, mp4 fetched ${after.fetched}`,
    );
  } catch (e) {
    record('study', where, false, clip(String(e)));
  }
}

/* /research/ is newest first by start year, and titles carry no status label in parentheses. */
async function checkOrder(page, where) {
  try {
    const rows = await page.$$eval('article.project', (els) =>
      els.map((a) => ({
        id: a.id,
        start: Number((a.querySelector('.project__years')?.textContent ?? '').match(/\d{4}/)?.[0] ?? NaN),
        title: (a.querySelector('.project__title')?.textContent ?? '').trim(),
      })),
    );
    const outOfOrder = rows.filter((r, i) => i > 0 && !(r.start <= rows[i - 1].start)).map((r) => r.id);
    const labelled = rows.filter((r) => /\([^)]*\)\s*$/.test(r.title)).map((r) => r.id);
    const ok = rows.length > 0 && outOfOrder.length === 0 && labelled.length === 0;
    record(
      'order',
      where,
      ok,
      ok
        ? `${rows.length} projects, ${rows[0].start} down to ${rows[rows.length - 1].start}; no title ends in a parenthesis`
        : `${rows.length} projects; out of order: ${outOfOrder.join(', ') || 'none'}; titles with a label: ${labelled.join(', ') || 'none'}`,
    );
  } catch (e) {
    record('order', where, false, clip(String(e)));
  }
}

async function checkPage(context, base, spec, vp) {
  const where = `${spec.route} @${vp.label}`;
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  try {
    const navStart = Date.now();
    const res = await page.goto(base + spec.route, { waitUntil: 'load' });
    record('load', where, res?.ok(), `HTTP ${res?.status()}`);

    if (spec.h1) {
      const h1 = page.locator('main h1, h1').first();
      const text = ((await h1.textContent().catch(() => null)) ?? '').replace(/\s+/g, ' ').trim();
      record('h1', where, text === spec.h1, `"${text}"`);
    }

    if (spec.updates) await checkUpdates(page, where);

    if (spec.layer) await checkLayer(page, where, spec, vp);

    if (spec.lightbox && vp.width > PHONE_MAX) await checkLightbox(page, where);

    if (spec.more) {
      await checkMore(page, where);
      await checkFolded(page, where);
    }

    if (spec.viewer) await checkViewer(page, where, navStart);

    if (spec.plates) await checkPlates(page, where);

    if (spec.study) {
      await checkStudy(page, where);
      if (vp.width > PHONE_MAX) await checkOrder(page, where);
    }

    // Walk the page so every client:visible island hydrates before errors are read.
    await page.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const step = Math.max(240, Math.floor(window.innerHeight * 0.8));
      const limit = () => document.documentElement.scrollHeight - window.innerHeight;
      for (let y = 0; y <= limit(); y += step) {
        window.scrollTo(0, y);
        await sleep(100);
      }
      window.scrollTo(0, limit());
      await sleep(200);
    });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});

    const mailtos = await page.locator('a[href^="mailto:"]').count();
    record('mailto', where, mailtos <= 3, `${mailtos} anchor${mailtos === 1 ? '' : 's'}`);
  } catch (e) {
    errors.push(`smoke: ${e.message}`);
  } finally {
    record('console', where, errors.length === 0, errors.length ? clip(errors.join(' | '), 200) : 'clean');
    await page.close();
  }
}

/* The home plate's poster is in the server HTML: with JavaScript off the plate shows the vessel still (2:1 wide, 3:4 on a phone), not a blank film. */
async function checkPoster(browser, base, vp) {
  const where = `/ @${vp.label} no JS`;
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto(`${base}/`, { waitUntil: 'load' });
    const s = await page.evaluate(() => {
      const img = document.querySelector('.home-plate__frame img.home-plate__poster');
      if (!img) return null;
      const frame = img.closest('.home-plate__frame').getBoundingClientRect();
      return { natural: [img.naturalWidth, img.naturalHeight], opacity: getComputedStyle(img).opacity, width: img.getBoundingClientRect().width, frame: frame.width, alt: img.getAttribute('alt') };
    });
    const portrait = vp.width <= PHONE_MAX;
    const ratioOk = Boolean(s) && (portrait ? s.natural[1] > s.natural[0] : s.natural[0] > s.natural[1]);
    const ok = Boolean(s) && s.natural[0] > 0 && ratioOk && s.opacity === '1' && s.width >= s.frame - 2 && s.alt === '';
    record('poster', where, ok, s ? `${s.natural.join(' x ')} still, opacity ${s.opacity}, ${Math.round(s.width)} of ${Math.round(s.frame)} px wide, alt "${s.alt}"` : 'no poster in the plate');
  } catch (e) {
    record('poster', where, false, clip(String(e)));
  } finally {
    await context.close();
  }
}

/*
  Failure states (CLAUDE.md, copy rules): with a plate's data refused, the
  plate prints its one approved sentence, never a file name or URL, and
  keeps its size. The islands send the reason to the console, so console
  errors are expected here and not read.
*/
const FAILURES = [
  {
    route: '/',
    block: '**/data/pino/vessel.bin*',
    plate: '.home-plate__frame',
    island: 'VesselViewer',
    sentence: 'The vessel did not load. Reload the page to try again.',
  },
  {
    route: '/research/',
    block: '**/data/pino/centerline.json',
    plate: '#pino .art__frame--curve',
    island: 'FfrCurve',
    sentence: 'The pressure curve did not load. Reload the page to try again.',
  },
];
async function checkFailure(browser, base, spec) {
  const where = `${spec.route} @1440 ${spec.island}`;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.route(spec.block, (r) => r.fulfill({ status: 404, body: 'not found' }));
  try {
    await page.goto(base + spec.route, { waitUntil: 'load' });
    const plate = page.locator(spec.plate).first();
    await plate.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      ([sel, island]) => document.querySelector(`${sel} [data-island="${island}"]`)?.getAttribute('data-status') === 'error',
      [spec.plate, spec.island],
      { timeout: VIEWER_READY_MS },
    );
    const s = await plate.evaluate((el) => ({ text: el.innerText.replace(/\s+/g, ' ').trim(), height: el.getBoundingClientRect().height }));
    const leaks = /https?:|\/data\/|\.bin\b|\.json\b|\b404\b/.test(s.text);
    const ok = s.text.includes(spec.sentence) && !leaks && s.height >= 150;
    record('failure', where, ok, ok ? `"${spec.sentence}", plate ${Math.round(s.height)} px tall` : `text "${clip(s.text, 90)}", leaks ${leaks}, ${Math.round(s.height)} px tall`);
  } catch (e) {
    record('failure', where, false, clip(String(e)));
  } finally {
    await context.close();
  }
}

async function checkRedirect(context, base, spec) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await page.goto(base + spec.route, { waitUntil: 'load' });
    // The static stub is a meta refresh (plus a script); wait for the CV to load.
    await page.waitForURL((u) => u.pathname === spec.to && u.hash === spec.hash, { timeout: 10_000 });
    await page.waitForLoadState('load');
    const anchor = await page.locator(spec.hash).count();
    const url = new URL(page.url());
    const ok = anchor === 1 && errors.length === 0;
    record('redirect', spec.route, ok, ok ? `-> ${url.pathname}${url.hash}` : `-> ${url.pathname}${url.hash}, anchor ${anchor}, errors ${errors.length}`);
  } catch (e) {
    record('redirect', spec.route, false, `stayed on ${new URL(page.url()).pathname}${new URL(page.url()).hash}: ${clip(e.message.split('\n')[0], 80)}`);
  } finally {
    await page.close();
  }
}

/* ---------- main ---------- */

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error(`smoke: ${DIST} has no index.html; run "pnpm build" first`);
    return 1;
  }
  if (!existsSync(ASTRO)) {
    console.error(`smoke: astro is not installed (${ASTRO}); run "pnpm install"`);
    return 1;
  }

  const base = await startServer();
  console.log(`smoke: astro preview on ${base} (dist/public)`);

  const extraArgs = (process.env.CHROMIUM_ARGS || '').split(/\s+/).filter(Boolean);
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', ...extraArgs] });
  try {
    await checkAgents(base);
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: 'no-preference',
      });
      for (const spec of PAGES) await checkPage(context, base, spec, vp);
      if (vp.width <= PHONE_MAX) await checkAnchor(context, base);
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    for (const spec of REDIRECTS) await checkRedirect(context, base, spec);
    await context.close();
    for (const vp of VIEWPORTS) await checkPoster(browser, base, vp);
    for (const spec of FAILURES) await checkFailure(browser, base, spec);
  } finally {
    await browser.close();
  }
  return printTable() ? 1 : 0;
}

process.on('exit', stopServer);
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    stopServer();
    process.exit(130);
  });
}

main()
  .then((code) => {
    stopServer();
    process.exitCode = code;
  })
  .catch((e) => {
    console.error(`smoke: ${e.stack || e}`);
    if (rows.length) printTable();
    stopServer();
    process.exitCode = 1;
  });
