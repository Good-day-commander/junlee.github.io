/*
  Build-time data for the research page. Every number on /research comes
  from content.ts or from the two data manifests the DATA agent produced
  (copied into site/public/data/ by the VIEWER and PULSE agents); nothing is
  retyped here. The JSON is imported statically, so it is bundled into the
  server render only; the islands fetch the same files at runtime by URL.
*/
import pinoJson from '../../../public/data/pino/manifest.json';
import pulseJson from '../../../public/data/pulse/manifest.json';

/* Only the fields the page reads; the manifests carry more. */
export interface PinoManifest {
  case_id: string;
  vertexCount: number;
  triangleCount: number;
  ranges: { p: [number, number]; p_err_abs_max: number };
  geometry: { ffr_probes: { proximal: { s_mm: number }; distal: { s_mm: number } } };
  metrics: {
    case: {
      points: string;
      pressure_Pa: { R2: number; MAE: number; RMSE: number };
      velocity_mps: { R2: number; MAE: number; RMSE: number; quantity: string };
      ffr: { cfd: number; pino: number };
    };
    cohort: {
      n_cases: number;
      source: string;
      pressure_R2: { median: number };
      pressure_MAE_Pa: { median: number };
      velocity_R2: { median: number };
      ffr_MAE_vs_cfd: number;
    };
  };
  timing: {
    pino: { gpu: string; inference_ms_median: number; query_points: string };
  };
  p_proximal_Pa: number;
  model: { name: string; protocol: string; training_cases: number; selection_cases: number };
  mesh: { volume_nodes: string; streamlines: number };
  selection: { case_rank_by_R2_pressure: string; case_rank_by_R2_velocity: string };
}

export interface PulseManifest {
  stft: {
    rows: number;
    cols: number;
    recommended_crop_hz: [number, number];
    method: { window: string; nperseg: number; noverlap: number; fs_hz: number };
    t_s: number[];
  };
  cwt: {
    rows: number;
    cols: number;
    t_s: number[];
    method: { wavelet: string; n_scales: number; f_range_hz: [number, number]; fs_hz: number };
  };
  pipeline: {
    ensemble: string;
    input_representation: string;
    prediction_target: string;
    cross_validation: string;
    aggregation: string;
    metrics: {
      development_oof: { cohort: string; AUC: number; AUC_95CI: [number, number] };
      additional_same_center_temporal: { cohort: string; AUC: number; AUC_95CI: [number, number] };
    };
  };
}

export const pino = pinoJson as unknown as PinoManifest;
export const pulse = pulseJson as unknown as PulseManifest;

/** "13/85 (1 = best)" → { rank: 13, of: 85 } */
export function parseRank(text: string): { rank: number; of: number } {
  const m = /(\d+)\s*\/\s*(\d+)/.exec(text);
  if (!m) throw new Error(`research/data.ts: cannot parse rank from "${text}"`);
  return { rank: Number(m[1]), of: Number(m[2]) };
}

/** "n=195, 58 bolus" → 195 */
export function parseCohortN(text: string): number {
  const m = /n\s*=\s*(\d+)/.exec(text);
  if (!m) throw new Error(`research/data.ts: cannot parse n from "${text}"`);
  return Number(m[1]);
}

/** "Primary-6: ... = 30 networks - ..." → 30 */
export function parseNetworkCount(text: string): number {
  const m = /=\s*(\d+)\s*networks/.exec(text);
  if (!m) throw new Error(`research/data.ts: cannot parse network count from "${text}"`);
  return Number(m[1]);
}

/** "5-fold stratified cross-validation ..." → 5 */
export function parseFolds(text: string): number {
  const m = /(\d+)-fold/.exec(text);
  if (!m) throw new Error(`research/data.ts: cannot parse fold count from "${text}"`);
  return Number(m[1]);
}

/** Public URLs the islands load at runtime (served from site/public/data/). */
export const urls = {
  pinoManifest: '/data/pino/manifest.json',
  centerline: '/data/pino/centerline.json',
  pulseManifest: '/data/pulse/manifest.json',
} as const;
