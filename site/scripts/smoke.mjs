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
  { route: '/', viewer: true, h1: OWNER, updates: true },
  { route: '/research/', viewer: true },
  { route: '/cv/' },
];
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
