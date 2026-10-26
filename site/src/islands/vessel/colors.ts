/*
  Per-vertex colors for the vessel, one Float32 RGB triple per vertex in
  linear light (the renderer encodes to sRGB on output, so the colormap's
  sRGB samples are linearised once here, through a 256-entry table).

  Each field yields two color sets: A paints the left of the wipe, B the
  right. Pressure: A = CFD, B = PINO, one shared p range. Error: both sides
  carry p_pino - p_cfd on a fixed symmetric diverging range (errorScalePa:
  the 99th percentile of |p_err| rounded up to the next 0.5 kPa), anything
  above +scale in the over color; the wipe is switched off. Speed: A = CFD,
  B = PINO near-wall speed on 0..vmag_wall_max; the inlet and outlet caps
  are masked to bone-3 because their vertices carry an interior value on a
  different range (manifest viewer_notes).

  Every bar has the same five-tick layout (0, 1/4, 1/2, 3/4, 1 of its
  range). legendFor reads only the manifest's ranges, so the server render
  can print the bar before the manifest is fetched.
*/
import {
  buildLut,
  DIVERGING_OVER,
  normalize,
  normalizeDiverging,
  type ColormapName,
  type RGB,
} from '@/lib/colormaps';
import { formatDecimal, formatKpa, THIN } from '@/lib/format';
import type { PinoManifest, VesselData, ViewerField } from './data';

/** The ranges a legend needs; a subset of the manifest, small enough to pass as an island prop. */
export type LegendRanges = Pick<
  PinoManifest['ranges'],
  'p' | 'p_err_abs_max' | 'p_err_min' | 'p_err_max' | 'vmag_wall_max'
>;

/** Error bars step in 0.5 kPa. */
export const ERROR_STEP_PA = 500;

/*
  The fixed symmetric error scale in Pa: the 99th percentile of |p_err|
  (manifest p_err_abs_max) rounded up to the next ERROR_STEP_PA. For
  the demo case that is 512.6 Pa → 1 000 Pa (±1.0 kPa).
*/
export function errorScalePa(r: Pick<LegendRanges, 'p_err_abs_max'>): number {
  const p99 = Math.abs(r.p_err_abs_max);
  return Math.max(ERROR_STEP_PA, Math.ceil(p99 / ERROR_STEP_PA - 1e-9) * ERROR_STEP_PA);
}

export const FIELD_COLORMAP: Record<ViewerField, ColormapName> = {
  pressure: 'turbo',
  error: 'diverging',
  speed: 'viridis',
};

/* sRGB of --bone-3 (oklch 0.56 0.012 85), the cap mask. */
export const BONE_3_SRGB: RGB = [120, 116, 109];
/* sRGB of --bone (oklch 0.94 0.006 85), the wipe seam. */
export const BONE_SRGB: RGB = [237, 235, 231];

export function srgbToLinear(c: number): number {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

const lutCache = new Map<ColormapName, Float32Array>();

/** 256 x RGB colormap table in linear light. */
export function linearLut(name: ColormapName): Float32Array {
  const hit = lutCache.get(name);
  if (hit) return hit;
  const bytes = buildLut(name, 256);
  const lut = new Float32Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) lut[i] = srgbToLinear(bytes[i]);
  lutCache.set(name, lut);
  return lut;
}

const OVER_LINEAR = DIVERGING_OVER.map(srgbToLinear) as unknown as [number, number, number];
const MASK_LINEAR = BONE_3_SRGB.map(srgbToLinear) as unknown as [number, number, number];

function paintLinear(
  out: Float32Array,
  values: Float32Array,
  lut: Float32Array,
  toT: (v: number) => number,
  mask?: Uint8Array,
): void {
  const n = values.length;
  for (let i = 0; i < n; i += 1) {
    const o = i * 3;
    if (mask && mask[i] !== 0) {
      out[o] = MASK_LINEAR[0];
      out[o + 1] = MASK_LINEAR[1];
      out[o + 2] = MASK_LINEAR[2];
      continue;
    }
    const t = toT(values[i]);
    if (t > 1) {
      out[o] = OVER_LINEAR[0];
      out[o + 1] = OVER_LINEAR[1];
      out[o + 2] = OVER_LINEAR[2];
      continue;
    }
    const k = Math.round((t < 0 ? 0 : t) * 255) * 3;
    out[o] = lut[k];
    out[o + 1] = lut[k + 1];
    out[o + 2] = lut[k + 2];
  }
}

export interface FieldColors {
  a: Float32Array;
  b: Float32Array;
  /** False when both sides carry the same field (error). */
  wipe: boolean;
}

export function fieldColors(data: VesselData, field: ViewerField, reuse?: FieldColors): FieldColors {
  const n = data.manifest.vertexCount;
  const a = reuse?.a?.length === n * 3 ? reuse.a : new Float32Array(n * 3);
  const b = reuse?.b?.length === n * 3 ? reuse.b : new Float32Array(n * 3);
  const r = data.manifest.ranges;
  if (field === 'pressure') {
    const lut = linearLut('turbo');
    const [lo, hi] = r.p;
    const toT = (v: number) => normalize(v, lo, hi);
    paintLinear(a, data.p_cfd, lut, toT);
    paintLinear(b, data.p_pino, lut, toT);
    return { a, b, wipe: true };
  }
  if (field === 'error') {
    const lut = linearLut('diverging');
    const scale = errorScalePa(r);
    const toT = (v: number) => normalizeDiverging(v, scale);
    paintLinear(a, data.p_err, lut, toT);
    b.set(a);
    return { a, b, wipe: false };
  }
  if (!data.vmag_cfd || !data.vmag_pino) throw new Error('the speed chunk is not loaded (loadSpeed)');
  const lut = linearLut('viridis');
  const toT = (v: number) => normalize(v, 0, r.vmag_wall_max);
  paintLinear(a, data.vmag_cfd, lut, toT, data.region);
  paintLinear(b, data.vmag_pino, lut, toT, data.region);
  return { a, b, wipe: true };
}

/* Colorbar description for the DOM strip. t is the fraction along the bar from its bottom (or left). */
export interface LegendTick {
  t: number;
  text: string;
  /** Labels the above-range band; a horizontal bar has no room for it and drops it. */
  over?: boolean;
}
export interface Legend {
  field: ViewerField;
  colormap: ColormapName;
  /** Field name for the label row. */
  name: string;
  /** Printed between name and unit when the label runs on one line (the error bar). */
  joiner?: string;
  unit: string;
  ticks: LegendTick[];
  /** Share of the strip given to the above-range band (diverging only). */
  overFraction: number;
  /** One sentence for assistive tech. */
  summary: string;
}

/* Five ticks at 0, 1/4, 1/2, 3/4 and 1 of the main band (the same layout on every bar). */
function fiveTicks(lo: number, hi: number, band: number, text: (v: number) => string): LegendTick[] {
  return [0, 0.25, 0.5, 0.75, 1].map((f) => ({ t: f * band, text: text(lo + (hi - lo) * f) }));
}

/*
  One unit per quantity across the site: surface pressure and its error are
  kPa at one decimal in every readout and colorbar; speed is m/s at two.
  Accepts the whole manifest or just its ranges.
*/
export function legendFor(field: ViewerField, source: PinoManifest | { ranges: LegendRanges }): Legend {
  const r = source.ranges;
  if (field === 'pressure') {
    const [lo, hi] = r.p;
    const f = (v: number) => formatKpa(v, 1);
    const unit = 'kPa';
    return {
      field,
      colormap: 'turbo',
      name: 'pressure',
      unit,
      ticks: fiveTicks(lo, hi, 1, f),
      overFraction: 0,
      summary: `Surface pressure from ${f(lo)} to ${f(hi)} ${unit}, one range for CFD and PINO.`,
    };
  }
  if (field === 'error') {
    const m = errorScalePa(r);
    // The above-range band is drawn only when some node lies past +scale.
    const hasOver = r.p_err_max > m;
    const over = hasOver ? 0.08 : 0;
    const main = 1 - over;
    const signed = (v: number) => (Math.abs(v) < 1e-9 ? '0' : `${v > 0 ? '+' : ''}${formatKpa(v, 1)}`);
    const ticks = fiveTicks(-m, m, main, signed);
    if (hasOver) ticks.push({ t: main + over / 2, text: `> ${signed(m)}`, over: true });
    const scale = `±${formatKpa(m, 1)}`;
    return {
      field,
      colormap: 'diverging',
      name: 'error · PINO − CFD',
      joiner: ' · ',
      unit: `${scale}${THIN}kPa`,
      ticks,
      overFraction: over,
      summary: hasOver
        ? `Pressure error, PINO minus CFD, on a fixed symmetric scale of ${scale} kPa; nodes above +${formatKpa(m, 1)} kPa take the above-range color.`
        : `Pressure error, PINO minus CFD, on a fixed symmetric scale of ${scale} kPa; this case runs from ${signed(r.p_err_min)} to ${signed(r.p_err_max)} kPa.`,
    };
  }
  const hi = r.vmag_wall_max;
  const f = (v: number) => formatDecimal(v, 2);
  return {
    field,
    colormap: 'viridis',
    name: 'near-wall speed',
    unit: 'm/s',
    ticks: fiveTicks(0, hi, 1, f),
    overFraction: 0,
    summary: `Near-wall speed from 0 to ${f(hi)} m/s; inlet and outlet caps are masked.`,
  };
}

/* The mono note under the field toggle (chapter mode): what the error or speed field shows; none for pressure. */
export function fieldNote(field: ViewerField, source: PinoManifest | { ranges: LegendRanges }): string {
  const r = source.ranges;
  if (field === 'error') {
    const signed = (v: number) => `${v > 0 ? '+' : ''}${formatKpa(v, 1)}`;
    return `PINO minus CFD at each node. Here ${signed(r.p_err_min)} to ${signed(r.p_err_max)}${THIN}kPa, largest at the throat.`;
  }
  if (field === 'speed') {
    return 'Speed one node inside the no-slip wall; inlet and outlet caps masked.';
  }
  // Pressure needs none: the wipe and the shared bar say it.
  return '';
}
