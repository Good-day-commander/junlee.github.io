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
               holds at least one row, and a click on the summary opens it
    viewer     on / and /research/ the vessel viewer reaches
               data-status="ready" within 15 s of being scrolled into view
               (status "nowebgl" or "error" fails)
    wipe       on those pages a visible CFD | PINO control: the wipe handle
               (role=slider) or the two-state toggle (CFD and PINO buttons)
    layer      the phone layer (640px and under) at 390, and its absence at
               1440. On /: the Work section is hidden at 390 and each
               Selected DOI shows as the word "DOI"; at 1440 the rows and the
               full DOIs show. On /research/: at 390 every outputs line with
               more than one item shows a caret control (aria-label "Show N
               more") and hides the rest; a tap shows it and a second tap
               hides it; at 1440 there is no control and every line is whole. On /cv/: at 390 the folding sections
               (details.cv-fold) are closed on load, a click on the Talks
               heading opens it, and the jump row shows one link per section;
               at 1440 every fold is open and the jump row is hidden.
    anchor     at 390, /cv/#P3 loaded cold lands on P3 inside an opened
               Patents section, and a hashchange to #I1 opens Talks and
               lands on it
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
  { route: '/research/', viewer: true, layer: 'research' },
  { route: '/cv/', layer: 'cv' },
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
    const ok = closed && text.length > date.length && date.length > 0 && rows > 0 && opened;
    record(
      'updates',
      where,
      ok,
      ok
        ? `closed on load, "${date}" + sentence, ${rows} more row${rows === 1 ? '' : 's'}, opens on click`
        : `closed ${closed}, summary "${clip(text, 40)}", date "${date}", rows ${rows}, opened ${opened}`,
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
            (p) => p.querySelector('.project__more')?.getAttribute('aria-label') === `Show ${p.querySelectorAll('.project__outputs-rest a').length} more`,
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
      const after = await page.evaluate((restId) => {
        const b = document.querySelector(`[aria-controls="${restId}"]`);
        return { rest: document.getElementById(restId).checkVisibility(), button: b.checkVisibility(), expanded: b.getAttribute('aria-expanded') };
      }, id);
      await button.click();
      const again = await page.evaluate((restId) => {
        const b = document.querySelector(`[aria-controls="${restId}"]`);
        return { rest: document.getElementById(restId).checkVisibility(), expanded: b.getAttribute('aria-expanded') };
      }, id);
      const ok =
        s.multi > 0 && s.buttons === s.multi && s.rests === 0 && s.counts && after.rest && after.button && after.expanded === 'true' && !again.rest && again.expanded === 'false';
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
      const talks = await page.evaluate(() => document.querySelector('#talks details.cv-fold')?.open === true);
      const ok = s.folds > 0 && s.open === 0 && talks && s.jump && s.links === s.sections && s.targets === s.links;
      record(
        'layer',
        where,
        ok,
        `${s.folds - s.open} of ${s.folds} folds closed on load, Talks ${talks ? 'opens' : 'does not open'} on click; jump row ${s.jump ? 'shown' : 'hidden'}, ${s.targets} of ${s.sections} sections linked`,
      );
    }
  } catch (e) {
    record('layer', where, false, clip(String(e)));
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

    if (spec.viewer) await checkViewer(page, where, navStart);

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
