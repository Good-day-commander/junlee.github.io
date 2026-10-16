#!/usr/bin/env node
/*
  Review captures for the Impeccable finish review.

  Starts nothing itself. Run `pnpm preview` (port 4321) or `pnpm dev` first,
  then `pnpm shots`. Set BASE_URL to point somewhere else, ROUTES to a
  comma-separated subset of the route list (e.g. ROUTES=/,/research) and
  SCHEMES to one of light,dark.

  Output (<repo>/.impeccable/review/), full page:
    <name>-desktop.png / <name>-mobile.png          light scheme (the default ground)
    <name>-desktop-dark.png / <name>-mobile-dark.png dark scheme
  The home page drops the name prefix (desktop.png, mobile-dark.png, ...).
  Plus uhd-first-viewport.png: the home first viewport at 3840 x 2160,
  device scale 1, light scheme (the "vessel sits too low on UHD" check).

  Pages are captured after network idle plus a settle delay so entrance
  motion has finished; prefers-reduced-motion is forced to no-preference so
  the authored motion is what gets reviewed.

  Full pages are stitched from viewport tiles (sharp) instead of
  Playwright's fullPage mode: fullPage briefly resizes the window to 1 px,
  which the vessel viewer reads as a phone and answers by switching its
  wipe to the two-state toggle, so the capture would not show the page as
  a visitor sees it. While tiling, sticky chrome is set static so it
  prints once at the top.

  Requires the Playwright chromium browser: `pnpm exec playwright install chromium`.
*/
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '..', '..', '.impeccable', 'review');
const baseUrl = (process.env.BASE_URL || 'http://localhost:4321').replace(/\/$/, '');
const settleMs = Number(process.env.SETTLE_MS || 5000);
const chromiumArgs = (process.env.CHROMIUM_ARGS || '').split(/\s+/).filter(Boolean);

// Walk the page one viewport at a time so IntersectionObserver-gated
// islands hydrate and loading="lazy" images request, then return to top.
async function walkPage(page) {
  await page.evaluate(async () => {
    const step = Math.max(240, Math.floor(window.innerHeight * 0.8));
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const limit = () => document.documentElement.scrollHeight - window.innerHeight;
    for (let y = 0; y <= limit(); y += step) {
      window.scrollTo(0, y);
      await sleep(120);
    }
    window.scrollTo(0, limit());
    await sleep(200);
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');
}

const allRoutes = [
  { route: '/', name: '' },
  { route: '/research', name: 'research' },
  { route: '/cv', name: 'cv' },
];
const wanted = process.env.ROUTES ? new Set(process.env.ROUTES.split(',').map((r) => r.trim())) : null;
const routes = wanted ? allRoutes.filter((r) => wanted.has(r.route)) : allRoutes;
const schemes = (process.env.SCHEMES || 'light,dark').split(',').map((s) => s.trim());

const viewports = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile', width: 390, height: 844 },
];

function fileName(name, label, scheme) {
  const suffix = scheme === 'dark' ? '-dark' : '';
  return name ? `${name}-${label}${suffix}.png` : `${label}${suffix}.png`;
}

/* Full-page capture without resizing the window: one screenshot per viewport, composited. */
async function stitch(page, target, width, height) {
  await page.addStyleTag({ content: '.nav, .cv-bar { position: static !important; }' });
  await page.waitForTimeout(150);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const tiles = [];
  for (let y = 0; y < total; y += height) {
    const top = Math.min(y, Math.max(0, total - height));
    await page.evaluate((t) => window.scrollTo(0, t), top);
    await page.waitForTimeout(250);
    const buf = await page.screenshot({ animations: 'allow' });
    tiles.push({ input: buf, top, left: 0 });
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sharp({ create: { width, height: total, channels: 3, background: '#ffffff' } })
    .composite(tiles)
    .png()
    .toFile(target);
}

async function capture(browser, { width, height, scheme, route, target, fullPage }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    colorScheme: scheme,
    isMobile: width < 768,
    hasTouch: width < 768,
  });
  const page = await context.newPage();
  const url = `${baseUrl}${route}`;
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    if (!response || !response.ok()) throw new Error(`HTTP ${response ? response.status() : 'no response'}`);
    await page.evaluate(() => document.fonts.ready);
    if (fullPage) await walkPage(page);
    await page.waitForTimeout(settleMs);
    if (fullPage) await stitch(page, target, width, height);
    else await page.screenshot({ path: target, animations: 'allow' });
    process.stdout.write(`captured ${path.relative(process.cwd(), target)} (${url}, ${width}x${height}, ${scheme})\n`);
    return true;
  } catch (error) {
    process.stderr.write(`failed ${url} at ${width}px ${scheme}: ${error.message}\n`);
    return false;
  } finally {
    await context.close();
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ args: chromiumArgs });
  let failures = 0;
  try {
    for (const scheme of schemes) {
      for (const vp of viewports) {
        for (const { route, name } of routes) {
          const target = path.join(outDir, fileName(name, vp.label, scheme));
          const ok = await capture(browser, { width: vp.width, height: vp.height, scheme, route, target, fullPage: true });
          if (!ok) failures += 1;
        }
      }
    }
    if (!wanted || wanted.has('/')) {
      const target = path.join(outDir, 'uhd-first-viewport.png');
      const ok = await capture(browser, { width: 3840, height: 2160, scheme: 'light', route: '/', target, fullPage: false });
      if (!ok) failures += 1;
    }
  } finally {
    await browser.close();
  }
  if (failures > 0) {
    process.stderr.write(`${failures} capture(s) failed. Is the site running at ${baseUrl}? (pnpm preview)\n`);
    process.exit(1);
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
