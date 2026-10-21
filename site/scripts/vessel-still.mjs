#!/usr/bin/env node
/*
  vessel-still: the quiet home plate rendered to stills, for the moments
  the live vessel is not there yet (or cannot be):
    src/assets/plate/vessel-poster.webp           the plate's poster, 2:1, a
    src/assets/plate/vessel-poster-portrait.webp  server-rendered <picture>
                                                  under the canvas
                                                  (Plate.astro); the portrait
                                                  one for the 3:4 phone plate,
                                                  where the live vessel is
                                                  framed upright
    public/data/pino/vessel-static.png            the no-WebGL fallback the
                                                  viewer shows in place of the
                                                  canvas
  The fallback and the 2:1 poster are the same frame, so the two agree: the
  fallback at 1600 x 800, the poster at 1200 x 600 (at 1600 x 800 no WebP
  quality took it under 5.7 KB; 1200 x 600 at quality 35 is about 4 KB).

    pnpm build && node scripts/vessel-still.mjs     (starts its own preview)
    BASE_URL=http://localhost:4371 node scripts/vessel-still.mjs   (a running one)

  Opens / at 1440 x 900 (and 390 x 844 for the portrait poster), device
  scale 2, reduced motion (the develop snaps and the drift holds, so the
  frame is the finished vessel at the wipe's first position), waits for the
  viewer to report ready, hides the plate chrome (colorbar, wipe handle or
  toggle, the old poster) so only the painted vessel on its film remains,
  screenshots the canvas less one CSS pixel per side (where the plate
  hairline overlaps it) and scales it to the plate's ratio. The posters are
  lossy WebP held to POSTER_BUDGET each (one of them is on the home first
  load, which stays under 450 KB); the fallback a palette PNG (budget
  120 KB). Run `pnpm build` again afterwards so dist carries them.
*/
import { chromium } from 'playwright';
import sharp from 'sharp';
import { spawn } from 'node:child_process';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const posterOut = path.join(root, 'src', 'assets', 'plate', 'vessel-poster.webp');
const portraitOut = path.join(root, 'src', 'assets', 'plate', 'vessel-poster-portrait.webp');
const stillOut = path.join(root, 'public', 'data', 'pino', 'vessel-static.png');
const POSTER_QUALITY = Number(process.env.POSTER_QUALITY || 35);
const POSTER_BUDGET = 4.5 * 1024;
const STILL_BUDGET = 120 * 1024;

let server = null;
let baseUrl = process.env.BASE_URL?.replace(/\/$/, '');
if (!baseUrl) {
  const port = 4371;
  server = spawn(process.execPath, [path.join(root, 'node_modules', 'astro', 'astro.js'), 'preview', '--port', String(port), '--host', '127.0.0.1'], {
    cwd: root,
    stdio: 'ignore',
  });
  baseUrl = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${baseUrl}/`)).ok) break;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
}

/* The painted vessel on its film at one viewport, scaled to w x h. */
async function capture(browser, viewport, w, h) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, reducedMotion: 'reduce', colorScheme: 'light' });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  const viewer = page.locator('.home-plate [data-island="VesselViewer"]');
  await viewer.waitFor();
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
    document.querySelectorAll('.home-plate__poster').forEach((el) => (el.style.visibility = 'hidden'));
  });
  const shot = await viewer.locator('canvas').first().screenshot({ type: 'png' });
  await context.close();
  const { width: sw, height: sh } = await sharp(shot).metadata();
  return sharp(shot)
    .extract({ left: 2, top: 2, width: sw - 4, height: sh - 4 })
    .resize(w, h, { fit: 'cover', kernel: 'lanczos3' })
    .png()
    .toBuffer();
}

const webp = (frame, w, h) =>
  sharp(frame).resize(w, h, { kernel: 'lanczos3' }).webp({ quality: POSTER_QUALITY, effort: 6, smartSubsample: true }).toBuffer();

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const wide = await capture(browser, { width: 1440, height: 900 }, 1600, 800);
  let still = await sharp(wide).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toBuffer();
  if (still.length > STILL_BUDGET) still = await sharp(wide).png({ palette: true, colours: 128, effort: 10, compressionLevel: 9 }).toBuffer();
  writeFileSync(stillOut, still);
  mkdirSync(path.dirname(posterOut), { recursive: true });
  writeFileSync(posterOut, await webp(wide, 1200, 600));

  const tall = await capture(browser, { width: 390, height: 844 }, 600, 800);
  writeFileSync(portraitOut, await webp(tall, 600, 800));

  for (const [file, budget] of [
    [stillOut, STILL_BUDGET],
    [posterOut, POSTER_BUDGET],
    [portraitOut, POSTER_BUDGET],
  ]) {
    const meta = await sharp(file).metadata();
    const size = statSync(file).size;
    console.log(`vessel-still: ${path.relative(process.cwd(), file)} ${meta.width} x ${meta.height}, ${size} B (${(size / 1024).toFixed(1)} KB)`);
    if (size > budget) {
      console.error(`vessel-still: ${path.basename(file)} is over its ${(budget / 1024).toFixed(1)} KB budget`);
      process.exitCode = 1;
    }
  }
} finally {
  await browser.close();
  server?.kill();
}
