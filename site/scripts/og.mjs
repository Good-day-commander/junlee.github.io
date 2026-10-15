#!/usr/bin/env node
/*
  Open Graph image: a 1200x630 capture of the home hero (headline + vessel),
  written to site/public/og.png. Run against `pnpm preview` (port 4321)
  after `pnpm build`; rebuild afterwards so dist picks the file up.
  BASE_URL, SETTLE_MS and CHROMIUM_ARGS work as in screenshot.mjs.
*/
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(here, '..', 'public', 'og.png');
const baseUrl = (process.env.BASE_URL || 'http://localhost:4321').replace(/\/$/, '');
const settleMs = Number(process.env.SETTLE_MS || 4000);
const chromiumArgs = (process.env.CHROMIUM_ARGS || '').split(/\s+/).filter(Boolean);

async function main() {
  const browser = await chromium.launch({ args: chromiumArgs });
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    const response = await page.goto(`${baseUrl}/?og`, { waitUntil: 'networkidle', timeout: 60_000 });
    if (!response || !response.ok()) throw new Error(`HTTP ${response ? response.status() : 'no response'}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(settleMs);
    await page.screenshot({ path: target, fullPage: false, animations: 'allow' });
    process.stdout.write(`captured ${path.relative(process.cwd(), target)}\n`);
    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
