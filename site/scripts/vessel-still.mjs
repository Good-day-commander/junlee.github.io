#!/usr/bin/env node
/*
  vessel-still: the no-WebGL fallback raster for the vessel viewer
  (public/data/pino/vessel-static.png), captured from the quiet home plate.

    pnpm build && pnpm exec astro preview --port 4371   (in another shell)
    BASE_URL=http://localhost:4371 node scripts/vessel-still.mjs

  Opens / at 1440 x 900, device scale 2, reduced motion (the develop snaps,
  so the frame is the finished CFD | PINO wipe at its initial 50 %), waits
  for the viewer to report ready, hides the plate chrome (colorbar, wipe
  handle) so only the painted vessel remains, screenshots the canvas (less
  one CSS pixel per side, where the plate hairline overlaps it), and
  writes a palette PNG through sharp (budget 120 KB; the viewer shows it
  with object-fit: contain on the same film ground).
*/
import { chromium } from 'playwright';
import sharp from 'sharp';
import { statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '..', 'public', 'data', 'pino', 'vessel-static.png');
const baseUrl = (process.env.BASE_URL || 'http://localhost:4371').replace(/\/$/, '');
const LIMIT = 120 * 1024;

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
    colorScheme: 'light',
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const root = page.locator('.home-plate [data-island="VesselViewer"]');
  await root.waitFor();
  await page.waitForFunction(
    () => document.querySelector('.home-plate [data-island="VesselViewer"]')?.getAttribute('data-status') === 'ready',
    null,
    { timeout: 30000 },
  );
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const r = document.querySelector('.home-plate [data-island="VesselViewer"]');
    const canvas = r?.querySelector('canvas');
    if (!r || !canvas) throw new Error('vessel-still: no viewer canvas');
    for (const el of r.querySelectorAll('*')) {
      if (el !== canvas && !el.contains(canvas)) el.style.visibility = 'hidden';
    }
  });
  const shot = await root.locator('canvas').first().screenshot({ type: 'png' });
  /* Drop one CSS pixel on every side: the plate's hairline border can overlap the canvas edge. */
  const { width: sw, height: sh } = await sharp(shot).metadata();
  const png = await sharp(shot).extract({ left: 2, top: 2, width: sw - 4, height: sh - 4 }).png().toBuffer();
  let buf = await sharp(png).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toBuffer();
  if (buf.length > LIMIT) buf = await sharp(png).png({ palette: true, colours: 128, effort: 10, compressionLevel: 9 }).toBuffer();
  await sharp(buf).toFile(out);
  const meta = await sharp(out).metadata();
  console.log(`vessel-still: ${path.relative(process.cwd(), out)} ${meta.width} x ${meta.height}, ${(statSync(out).size / 1024).toFixed(1)} KB`);
  if (statSync(out).size > LIMIT) {
    console.error('vessel-still: over the 120 KB budget');
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
