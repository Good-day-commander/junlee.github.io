/*
  PINO viewer data: manifest types and the binary loader.

  Two contracts, one little-endian file each, every array section starting
  at a 4-byte aligned byteOffset:

    pino-viewer-manifest/2  what the site ships (site/scripts/quantize-vessel.mjs):
      uint16 streams, zigzag delta per component, planar bytes (all low
      bytes, then all high bytes); quantized arrays carry
      quantization { offset, scale } (per axis for positions) and decode to
      float32 as offset + q * scale; indices decode to uint16 as they are;
      p_err is not stored and is derived here as p_pino - p_cfd (its
      definition); region stays uint8.
    pino-viewer-manifest/1  the float32 export (website_assets/web/convert.py):
      every array is viewed in place with a typed array. Still read, so a
      before / after capture can run the same viewer on both files.

  Either way the viewer receives the same VesselData (float32 positions and
  fields), so nothing downstream knows which file it came from.

  Chunks (v2): the speed arrays (vmag_cfd, vmag_pino) live in a second file,
  buffers.chunks.speed (vessel-speed.bin); their specs carry chunk: "speed"
  and offsets inside that file. loadVessel returns them as null and
  loadSpeed fills them in on demand, so the home plate (pressure only)
  never requests the file.

  Gzip (v2): each file also ships gzip -9 (buffers.gzip, chunks.speed.gzip).
  GitHub Pages sends application/octet-stream uncompressed, so the .gz is
  what keeps the home plate's wire size near the gzip figure; it is
  inflated here with DecompressionStream. A server that already decoded it
  (Content-Encoding on a .gz) is detected by the missing gzip magic, and a
  browser without DecompressionStream fetches the raw .bin instead.
*/

export type ViewerField = 'pressure' | 'error' | 'speed';

export interface ArraySpec {
  dtype: 'float32' | 'uint32' | 'uint16' | 'uint8';
  components: number;
  count: number;
  byteOffset: number;
  byteLength: number;
  units?: string;
  min?: number;
  max?: number;
  /** v2: value = offset + q * scale (arrays per component for positions). */
  quantization?: { offset: number | number[]; scale: number | number[]; max_abs_error?: number };
  /** v2: zigzag delta per component, planar bytes. stride overrides the delta stride (indices: 1). */
  encoding?: { delta?: 'zigzag'; layout?: 'planar-bytes'; stride?: number };
  /** v2: the array is not stored and is computed from others (p_err = p_pino - p_cfd). */
  derived?: string;
  /** v2: the array lives in buffers.chunks[chunk], not in buffers.file. */
  chunk?: 'speed';
}

export interface GzipSpec {
  file: string;
  byteLength: number;
}

export interface ChunkSpec {
  file: string;
  byteLength: number;
  gzip?: GzipSpec;
  arrays: string[];
}

export interface PinoManifest {
  case_id: string;
  schema: string;
  vertexCount: number;
  triangleCount: number;
  buffers: {
    file: string;
    byteLength: number;
    gzip?: GzipSpec;
    chunks?: { speed?: ChunkSpec };
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
  indices: Uint16Array | Uint32Array;
  p_cfd: Float32Array;
  p_pino: Float32Array;
  p_err: Float32Array;
  /** Null until loadSpeed has fetched the speed chunk (v2 with chunks). */
  vmag_cfd: Float32Array | null;
  vmag_pino: Float32Array | null;
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

/**
  One packed file: its gzip twin inflated in the browser when both exist,
  else the raw file. Always checked against the raw byteLength.
*/
async function fetchPacked(
  file: string,
  byteLength: number,
  gzip: GzipSpec | undefined,
  manifestUrl: string,
  signal?: AbortSignal,
): Promise<ArrayBuffer> {
  let buf: ArrayBuffer | null = null;
  if (gzip && typeof DecompressionStream === 'function') {
    try {
      const res = await fetchOk(resolve(gzip.file, manifestUrl), signal);
      const got = await res.arrayBuffer();
      const head = new Uint8Array(got, 0, Math.min(2, got.byteLength));
      if (head[0] === 0x1f && head[1] === 0x8b) {
        const stream = new Blob([got]).stream().pipeThrough(new DecompressionStream('gzip'));
        buf = await new Response(stream).arrayBuffer();
      } else {
        buf = got; // the server already removed the gzip layer
      }
    } catch (e) {
      if (signal?.aborted) throw e;
      buf = null; // fall through to the raw file
    }
    if (buf && buf.byteLength !== byteLength) buf = null;
  }
  if (!buf) {
    const res = await fetchOk(resolve(file, manifestUrl), signal);
    buf = await res.arrayBuffer();
  }
  if (buf.byteLength !== byteLength) throw new Error(`${file} is ${buf.byteLength} B, manifest says ${byteLength}`);
  return buf;
}

export async function loadManifest(manifestUrl: string, signal?: AbortSignal): Promise<PinoManifest> {
  const res = await fetchOk(manifestUrl, signal);
  const manifest = (await res.json()) as PinoManifest;
  if (!manifest?.buffers?.arrays?.positions) throw new Error('manifest has no vessel buffers');
  return manifest;
}

function view<T extends Float32Array | Uint32Array | Uint16Array | Uint8Array>(
  buf: ArrayBuffer,
  spec: ArraySpec,
  Ctor: { new (b: ArrayBuffer, o: number, n: number): T; BYTES_PER_ELEMENT: number },
): T {
  const n = spec.count * spec.components;
  if (spec.byteOffset % Ctor.BYTES_PER_ELEMENT !== 0) throw new Error(`unaligned array at ${spec.byteOffset}`);
  if (spec.byteOffset + n * Ctor.BYTES_PER_ELEMENT > buf.byteLength) throw new Error('array runs past the buffer');
  return new Ctor(buf, spec.byteOffset, n);
}

/* v2 stream → uint16 codes: planar bytes back to words, then the zigzag deltas summed per component. */
function unpackU16(buf: ArrayBuffer, spec: ArraySpec): Uint16Array {
  const n = spec.count * spec.components;
  if (spec.byteOffset + n * 2 > buf.byteLength) throw new Error('array runs past the buffer');
  const bytes = new Uint8Array(buf, spec.byteOffset, n * 2);
  const planar = spec.encoding?.layout === 'planar-bytes';
  const zigzag = spec.encoding?.delta === 'zigzag';
  const stride = spec.encoding?.stride ?? spec.components;
  const out = new Uint16Array(n);
  for (let i = 0; i < n; i += 1) {
    const w = planar ? bytes[i] | (bytes[n + i] << 8) : bytes[i * 2] | (bytes[i * 2 + 1] << 8);
    if (!zigzag) {
      out[i] = w;
      continue;
    }
    const d = (w >>> 1) ^ -(w & 1);
    out[i] = ((i >= stride ? out[i - stride] : 0) + d) & 0xffff;
  }
  return out;
}

/* v2 quantized stream → float32 values. */
function dequantize(buf: ArrayBuffer, spec: ArraySpec): Float32Array {
  const q = unpackU16(buf, spec);
  const qz = spec.quantization;
  if (!qz) throw new Error('quantized array without offset / scale');
  const c = spec.components;
  const off = Array.isArray(qz.offset) ? qz.offset : [qz.offset];
  const sc = Array.isArray(qz.scale) ? qz.scale : [qz.scale];
  const out = new Float32Array(q.length);
  for (let i = 0; i < q.length; i += 1) {
    const k = c > 1 ? i % c : 0;
    out[i] = off[k] + q[i] * sc[k];
  }
  return out;
}

function floatArray(buf: ArrayBuffer, spec: ArraySpec): Float32Array {
  if (spec.dtype === 'float32') return view(buf, spec, Float32Array);
  if (spec.dtype === 'uint16' && spec.quantization) return dequantize(buf, spec);
  throw new Error(`unsupported ${spec.dtype} field array`);
}

function indexArray(buf: ArrayBuffer, spec: ArraySpec): Uint16Array | Uint32Array {
  if (spec.dtype === 'uint32') return view(buf, spec, Uint32Array);
  if (spec.dtype === 'uint16') return spec.encoding ? unpackU16(buf, spec) : view(buf, spec, Uint16Array);
  throw new Error(`unsupported ${spec.dtype} index array`);
}

export async function loadVessel(
  manifest: PinoManifest,
  manifestUrl: string,
  signal?: AbortSignal,
): Promise<VesselData> {
  const { file, byteLength, gzip } = manifest.buffers;
  const buf = await fetchPacked(file, byteLength, gzip, manifestUrl, signal);
  const a = manifest.buffers.arrays;
  const p_cfd = floatArray(buf, a.p_cfd);
  const p_pino = floatArray(buf, a.p_pino);
  let p_err: Float32Array;
  if (a.p_err.derived) {
    p_err = new Float32Array(p_cfd.length);
    for (let i = 0; i < p_err.length; i += 1) p_err[i] = p_pino[i] - p_cfd[i];
  } else {
    p_err = floatArray(buf, a.p_err);
  }
  return {
    manifest,
    positions: floatArray(buf, a.positions),
    indices: indexArray(buf, a.indices),
    p_cfd,
    p_pino,
    p_err,
    vmag_cfd: a.vmag_cfd.chunk ? null : floatArray(buf, a.vmag_cfd),
    vmag_pino: a.vmag_pino.chunk ? null : floatArray(buf, a.vmag_pino),
    region: view(buf, a.region, Uint8Array),
  };
}

/** True once the speed arrays are decoded (always true for a single-file vessel). */
export function hasSpeed(data: VesselData): boolean {
  return data.vmag_cfd !== null && data.vmag_pino !== null;
}

/** Fetch and decode the speed chunk into data (in place). A no-op when it is already there. */
export async function loadSpeed(data: VesselData, manifestUrl: string, signal?: AbortSignal): Promise<void> {
  if (hasSpeed(data)) return;
  const chunk = data.manifest.buffers.chunks?.speed;
  if (!chunk) throw new Error('manifest has no speed chunk');
  const buf = await fetchPacked(chunk.file, chunk.byteLength, chunk.gzip, manifestUrl, signal);
  const a = data.manifest.buffers.arrays;
  data.vmag_cfd = floatArray(buf, a.vmag_cfd);
  data.vmag_pino = floatArray(buf, a.vmag_pino);
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
