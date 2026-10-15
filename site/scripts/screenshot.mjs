#!/usr/bin/env node
/*
  Review captures for the Impeccable finish review.

  Starts nothing itself. Run `pnpm preview` (port 4321) or `pnpm dev` first,
  then `pnpm shots`. Set BASE_URL to point somewhere else, and ROUTES to a
  comma-separated subset of the route list (e.g. ROUTES=/,/research).

  Output: <repo>/.impeccable/review/<name>-desktop.png (1440 wide) and
  <name>-mobile.png (390 wide), full page. The home page is desktop.png and
  mobile.png. Pages are captured after network idle plus 2.5 s so entrance
  motion has settled; prefers-reduced-motion is forced to no-preference so
  the authored motion is what gets reviewed.

  Requires the Playwright chromium browser: `pnpm exec playwright install chromium`.
*/
import { chromium } from 'playwright';
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
  { route: '/publications', name: 'publications' },
  { route: '/record', name: 'record' },
  { route: '/cv', name: 'cv' },
];
const wanted = process.env.ROUTES
  ? new Set(process.env.ROUTES.split(',').map((r) => r.trim()))
  : null;
const routes = wanted ? allRoutes.filter((r) => wanted.has(r.route)) : allRoutes;

const viewports = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile', width: 390, height: 844 },
];

function fileName(name, label) {
  return name ? `${name}-${label}.png` : `${label}.png`;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ args: chromiumArgs });
  let failures = 0;
  try {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference',
        colorScheme: 'dark',
        isMobile: vp.width < 768,
        hasTouch: vp.width < 768,
      });
      for (const { route, name } of routes) {
        const page = await context.newPage();
        const url = `${baseUrl}${route}`;
        const target = path.join(outDir, fileName(name, vp.label));
        try {
          const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
          if (!response || !response.ok()) {
            throw new Error(`HTTP ${response ? response.status() : 'no response'}`);
          }
          await page.evaluate(() => document.fonts.ready);
          await walkPage(page);
          await page.waitForTimeout(settleMs);
          await page.screenshot({ path: target, fullPage: true, animations: 'allow' });
          process.stdout.write(`captured ${path.relative(process.cwd(), target)} (${url})\n`);
        } catch (error) {
          failures += 1;
          process.stderr.write(`failed ${url} at ${vp.width}px: ${error.message}\n`);
        } finally {
          await page.close();
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
  if (failures > 0) {
    process.stderr.write(
      `${failures} capture(s) failed. Is the site running at ${baseUrl}? (pnpm preview)\n`,
    );
    process.exit(1);
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
