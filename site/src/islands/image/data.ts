/*
  Build-time read of the 4D CT phase manifest, for Astro frontmatter only.
  The JSON is imported statically, so it lands in the server render and in
  the PhaseScrubber's serialized props (so the island renders its rail,
  legend and Phase 0 plate server-side), never in a client bundle by itself.
  A manifest whose notes no longer name the acquired phases or the reported
  metrics fails the build here instead of shipping a wrong readout.
*/
import imageJson from '../../../public/data/image/manifest.json';
import { acquiredPhases, reportedMetrics, type ImageManifest } from './manifest';

export const imageManifest = imageJson as unknown as ImageManifest;
export const imageManifestUrl = '/data/image/manifest.json';
export const imageBase = '/data/image/';

const acquired = acquiredPhases(imageManifest);
if (acquired.length !== 2) {
  throw new Error('islands/image/data.ts: manifest notes no longer name the two acquired CT phases');
}
const metrics = reportedMetrics(imageManifest);
if (!metrics) {
  throw new Error('islands/image/data.ts: manifest notes no longer carry the reported PSNR / SSIM / Dice / CT-FFR accuracy');
}

export const imageAcquired = acquired;
export const imageMetrics = metrics;
