/*
  Build-time readers for the two data manifests the home page prints numbers
  from. Runs in Astro frontmatter only (node:fs), never in the browser.

  The viewers fetch /data/pino/manifest.json and /data/pulse/manifest.json at
  runtime; the same files are read here so the corner readouts, the FFR line
  and the inference time are computed, never typed. The VIEWER and PULSE
  agents copy the files from website_assets/web into site/public/data; until
  that copy exists the loader falls back to the website_assets source so the
  page builds either way.
*/
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface PinoManifest {
  case_id: string;
  vertexCount: number;
  triangleCount: number;
  p_proximal_Pa: number;
  ranges: {
    p: [number, number];
    p_err_abs_max: number;
    vmag_wall_max: number;
    streamline_vmag_max: number;
  };
  metrics: {
    case: {
      pressure_Pa: { R2: number; MAE: number; RMSE: number };
      velocity_mps: { R2: number; MAE: number; RMSE: number };
      ffr: { cfd: number; pino: number };
    };
    cohort: {
      n_cases: number;
      source: string;
      pressure_R2: { median: number; q25: number; q75: number };
      velocity_R2: { median: number; q25: number; q75: number };
      ffr_MAE_vs_cfd: number;
    };
  };
  timing: {
    pino: { gpu: string; inference_ms_median: number; query_points: string };
  };
  model: { name: string; protocol: string; training_cases: number };
  selection: {
    case_rank_by_R2_pressure: string;
    cohort_median_R2_pressure: number;
  };
}

export interface PulseManifest {
  stft: {
    rows: number;
    cols: number;
    recommended_crop_hz: [number, number];
    method: { fs_hz: number; window: string };
    note: string;
  };
  cwt: { rows: number; cols: number };
  pipeline: {
    source: string;
    metrics: {
      development_oof: { cohort: string; AUC: number; AUC_95CI: [number, number] };
      additional_same_center_temporal: { cohort: string; AUC: number; AUC_95CI: [number, number] };
    };
  };
}

/*
  Candidate locations for a manifest, in order. `astro build` bundles this
  module into site/.astro/pages/, so import.meta.url is not a reliable base;
  the primary candidates resolve from process.cwd(), which is site/ both in
  CI (`pnpm build` inside site/) and locally (`pnpm -C site`). The
  source-relative URLs remain as a fallback for a dev server started from
  another directory.
*/
function candidates(rel: string): string[] {
  const cwd = process.cwd();
  return [
    resolve(cwd, 'public/data', rel),
    resolve(cwd, '../website_assets/web', rel),
    fileURLToPath(new URL(`../../../public/data/${rel}`, import.meta.url)),
    fileURLToPath(new URL(`../../../../website_assets/web/${rel}`, import.meta.url)),
  ];
}

function readFirst<T>(paths: string[]): T {
  for (const path of paths) {
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8')) as T;
  }
  throw new Error(`home/manifests: none of these files exist:\n${paths.join('\n')}`);
}

export function loadPinoManifest(): PinoManifest {
  return readFirst<PinoManifest>(candidates('pino/manifest.json'));
}

export function loadPulseManifest(): PulseManifest {
  return readFirst<PulseManifest>(candidates('pulse/manifest.json'));
}

/** "n=195, 58 bolus" → 195; null when the cohort string carries no n. */
export function cohortN(cohort: string): number | null {
  const m = /n\s*=\s*(\d+)/.exec(cohort);
  return m ? Number(m[1]) : null;
}

/** "NVIDIA L40S" → "L40S" for the corner readout; the vendor is implied. */
export function shortGpu(gpu: string): string {
  return gpu.replace(/^NVIDIA\s+/i, '');
}
