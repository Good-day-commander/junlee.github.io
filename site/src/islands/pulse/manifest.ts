/*
  Pulse manifest contract (pulse-viewer-manifest/1) and loader.

  /data/pulse/manifest.json describes two dB arrays written by
  website_assets/web/convert.py:
    stft.bin  float32 row-major [rows = frequency][cols = time], linear f
    cwt.bin   float32 row-major [rows = frequency][cols = time], log f
  Both little-endian, no header. Every number the island shows comes from
  this file or from the arrays themselves.
*/

export type Variant = 'stft' | 'cwt';

export interface GridMethod {
  window?: string;
  nperseg?: number;
  noverlap?: number;
  nfft?: number;
  wavelet?: string;
  n_scales?: number;
  f_range_hz?: [number, number];
  fs_hz?: number;
  scale?: string;
}

export interface GridSpec {
  file: string;
  rows: number;
  cols: number;
  dtype: 'float32';
  byteLength: number;
  layout: string;
  f_hz: number[];
  t_s: number[];
  f_scale?: 'linear' | 'log';
  db_min: number;
  db_max: number;
  /** [1st percentile, max] inside the recommended crop: the display range. */
  db_display: [number, number];
  recommended_crop_hz?: [number, number];
  method?: GridMethod;
  note?: string;
}

export interface PulseManifest {
  schema: string;
  generated: string;
  byteOrder: 'little-endian';
  colormap: 'viridis';
  stft: GridSpec;
  cwt: GridSpec;
  pipeline?: Record<string, unknown>;
}

export interface LoadedGrid {
  spec: GridSpec;
  data: Float32Array;
}

function resolve(base: string, file: string): string {
  if (/^(https?:)?\/\//.test(file) || file.startsWith('/')) return file;
  const cut = base.lastIndexOf('/');
  return cut === -1 ? file : `${base.slice(0, cut + 1)}${file}`;
}

async function fetchOk(url: string, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res;
}

export async function loadManifest(url: string, signal?: AbortSignal): Promise<PulseManifest> {
  const res = await fetchOk(url, signal);
  const json = (await res.json()) as PulseManifest;
  if (!json || !json.stft || !json.cwt) throw new Error(`${url} is not a pulse manifest`);
  return json;
}

export async function loadGrid(
  manifestUrl: string,
  spec: GridSpec,
  signal?: AbortSignal,
): Promise<LoadedGrid> {
  const url = resolve(manifestUrl, spec.file);
  const res = await fetchOk(url, signal);
  const buffer = await res.arrayBuffer();
  const expected = spec.rows * spec.cols * 4;
  if (buffer.byteLength < expected) {
    throw new Error(`${spec.file}: ${buffer.byteLength} B, expected ${expected} B`);
  }
  // Float32Array over a fetched ArrayBuffer starts at offset 0, so no copy is needed.
  // The arrays were written little-endian, which is every browser platform we serve.
  return { spec, data: new Float32Array(buffer, 0, spec.rows * spec.cols) };
}

export async function loadVariant(
  manifestUrl: string,
  variant: Variant,
  signal?: AbortSignal,
): Promise<{ manifest: PulseManifest; grid: LoadedGrid }> {
  const manifest = await loadManifest(manifestUrl, signal);
  const grid = await loadGrid(manifestUrl, manifest[variant], signal);
  return { manifest, grid };
}
