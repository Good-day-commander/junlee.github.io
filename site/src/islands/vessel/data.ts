/*
  PINO viewer data: manifest types and the binary loader.

  Contract (pino-viewer-manifest/1, written by website_assets/web/convert.py):
  one little-endian file, every array section starting at a 4-byte aligned
  byteOffset, so each one can be viewed in place with a typed array and
  nothing is copied. Typed arrays read in the platform's byte order; every
  platform the site targets is little-endian, which the manifest declares.
*/

export type ViewerField = 'pressure' | 'error' | 'speed';

export interface ArraySpec {
  dtype: 'float32' | 'uint32' | 'uint8';
  components: number;
  count: number;
  byteOffset: number;
  byteLength: number;
  units?: string;
  min?: number;
  max?: number;
}

export interface PinoManifest {
  case_id: string;
  schema: string;
  vertexCount: number;
  triangleCount: number;
  buffers: {
    file: string;
    byteLength: number;
    arrays: {
      positions: ArraySpec & { bounds: { min: number[]; max: number[] } };
      indices: ArraySpec;
      p_cfd: ArraySpec;
      p_pino: ArraySpec;
      p_err: ArraySpec;
      vmag_cfd: ArraySpec;
      vmag_pino: ArraySpec;
      region: ArraySpec;
    };
  };
  ranges: {
    p: [number, number];
    p_err_abs_max: number;
    p_err_min: number;
    p_err_max: number;
    vmag_wall_max: number;
    vmag_cap_max: number;
    streamline_vmag_max: number;
  };
  geometry: {
    bounds: { min: number[]; max: number[]; size: number[] };
    inlet_center: number[];
    outlet_center: number[];
    ffr_probes: {
      proximal: { center_mm: number[]; s_mm: number };
      distal: { center_mm: number[]; s_mm: number };
    };
  };
  metrics: {
    case: {
      pressure_Pa: { R2: number; MAE: number; RMSE: number };
      velocity_mps: { R2: number; MAE: number; RMSE: number };
      ffr: { cfd: number; pino: number };
    };
    cohort: {
      n_cases: number;
      pressure_R2: { median: number; q25: number; q75: number };
      velocity_R2: { median: number; q25: number; q75: number };
    };
  };
  timing: {
    pino: { gpu: string; inference_ms_median: number; query_points: string };
  };
  p_proximal_Pa: number;
}

export interface VesselData {
  manifest: PinoManifest;
  positions: Float32Array;
  indices: Uint32Array;
  p_cfd: Float32Array;
  p_pino: Float32Array;
  p_err: Float32Array;
  vmag_cfd: Float32Array;
  vmag_pino: Float32Array;
  region: Uint8Array;
}

export interface Centerline {
  case_id: string;
  s_mm: number[];
  p_cfd: number[];
  p_pino: number[];
  p_proximal_Pa: number;
  ffr: { cfd: number; pino: number; probe_s: { proximal: number; distal: number } };
}

/** Develop duration in ms: the measured median inference time, else 1780. */
export function developMs(manifest: PinoManifest | null): number {
  const v = manifest?.timing?.pino?.inference_ms_median;
  return typeof v === 'number' && v > 0 ? Math.round(v) : 1780;
}

function resolve(relative: string, base: string): string {
  if (typeof window === 'undefined') return relative;
  return new URL(relative, new URL(base, window.location.href)).toString();
}

async function fetchOk(url: string, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText || ''}`.trim() + ` for ${url}`);
  return res;
}

export async function loadManifest(manifestUrl: string, signal?: AbortSignal): Promise<PinoManifest> {
  const res = await fetchOk(manifestUrl, signal);
  const manifest = (await res.json()) as PinoManifest;
  if (!manifest?.buffers?.arrays?.positions) throw new Error('manifest has no vessel buffers');
  return manifest;
}

function view<T extends Float32Array | Uint32Array | Uint8Array>(
  buf: ArrayBuffer,
  spec: ArraySpec,
  Ctor: { new (b: ArrayBuffer, o: number, n: number): T; BYTES_PER_ELEMENT: number },
): T {
  const n = spec.count * spec.components;
  if (spec.byteOffset % Ctor.BYTES_PER_ELEMENT !== 0) throw new Error(`unaligned array at ${spec.byteOffset}`);
  if (spec.byteOffset + n * Ctor.BYTES_PER_ELEMENT > buf.byteLength) throw new Error('array runs past the buffer');
  return new Ctor(buf, spec.byteOffset, n);
}

export async function loadVessel(
  manifest: PinoManifest,
  manifestUrl: string,
  signal?: AbortSignal,
): Promise<VesselData> {
  const url = resolve(manifest.buffers.file, manifestUrl);
  const res = await fetchOk(url, signal);
  const buf = await res.arrayBuffer();
  if (buf.byteLength !== manifest.buffers.byteLength) {
    throw new Error(`vessel.bin is ${buf.byteLength} B, manifest says ${manifest.buffers.byteLength}`);
  }
  const a = manifest.buffers.arrays;
  return {
    manifest,
    positions: view(buf, a.positions, Float32Array),
    indices: view(buf, a.indices, Uint32Array),
    p_cfd: view(buf, a.p_cfd, Float32Array),
    p_pino: view(buf, a.p_pino, Float32Array),
    p_err: view(buf, a.p_err, Float32Array),
    vmag_cfd: view(buf, a.vmag_cfd, Float32Array),
    vmag_pino: view(buf, a.vmag_pino, Float32Array),
    region: view(buf, a.region, Uint8Array),
  };
}

export async function loadCenterline(url: string, signal?: AbortSignal): Promise<Centerline> {
  const res = await fetchOk(url, signal);
  const c = (await res.json()) as Centerline;
  if (!Array.isArray(c?.s_mm) || !Array.isArray(c?.p_cfd) || !Array.isArray(c?.p_pino)) {
    throw new Error('centerline.json is missing s_mm, p_cfd or p_pino');
  }
  return c;
}

/** Static fallback raster next to the manifest (vessel-static.png). */
export function fallbackImageUrl(manifestUrl: string): string {
  const i = manifestUrl.lastIndexOf('/');
  return `${i >= 0 ? manifestUrl.slice(0, i + 1) : ''}vessel-static.png`;
}

/** Event name for cross-island state: window.dispatchEvent(new CustomEvent(name, { detail: ViewerState })). */
export const VIEWER_STATE_EVENT = 'vesselviewer:state';
