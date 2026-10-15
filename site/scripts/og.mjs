#!/usr/bin/env node
/*
  Open Graph images, 1200x630 each: the home hero (headline + vessel) to
  site/public/og.png, and the first viewport of every other page (its
  heading and lede in the page's own surface) to site/public/og/<page>.png.
  Each page passes its card and a matching alt to Base (ogImage, ogAlt).
  Run against `pnpm preview` (port 4321) after `pnpm build`; rebuild
  afterwards so dist picks the files up. ROUTES limits the run (e.g.
  ROUTES=/,/cv); BASE_URL, SETTLE_MS and CHROMIUM_ARGS work as in
  screenshot.mjs.
*/
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, '..', 'public');
const cards = [
  { route: '/?og', file: 'og.png', scheme: 'dark' },
  { route: '/research/', file: 'og/research.png', scheme: 'dark' },
  { route: '/publications/', file: 'og/publications.png', scheme: 'light' },
  { route: '/record/', file: 'og/record.png', scheme: 'light' },
  { route: '/cv/', file: 'og/cv.png', scheme: 'light' },
];
const wanted = process.env.ROUTES ? new Set(process.env.ROUTES.split(',').map((r) => r.trim().replace(/\/$/, '') || '/')) : null;
const todo = wanted ? cards.filter((c) => wanted.has(c.route.replace(/\?og$/, '').replace(/\/$/, '') || '/')) : cards;
const baseUrl = (process.env.BASE_URL || 'http://localhost:4321').replace(/\/$/, '');
const settleMs = Number(process.env.SETTLE_MS || 4000);
const chromiumArgs = (process.env.CHROMIUM_ARGS || '').split(/\s+/).filter(Boolean);

async function main() {
  const browser = await chromium.launch({ args: chromiumArgs });
  try {
    await mkdir(path.join(publicDir, 'og'), { recursive: true });
    for (const card of todo) {
      const context = await browser.newContext({
        viewport: { width: 1200, height: 630 },
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference',
        colorScheme: card.scheme,
      });
      const page = await context.newPage();
      const response = await page.goto(`${baseUrl}${card.route}`, { waitUntil: 'networkidle', timeout: 60_000 });
      if (!response || !response.ok()) throw new Error(`${card.route}: HTTP ${response ? response.status() : 'no response'}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(settleMs);
      const target = path.join(publicDir, card.file);
      await page.screenshot({ path: target, fullPage: false, animations: 'allow' });
      process.stdout.write(`captured ${path.relative(process.cwd(), target)}
`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
