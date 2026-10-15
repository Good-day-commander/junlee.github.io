/*
  Per-vertex colors for the vessel, one Float32 RGB triple per vertex in
  linear light (the renderer encodes to sRGB on output, so the colormap's
  sRGB samples are linearised once here, through a 256-entry table).

  Each field yields two color sets: A paints the left of the wipe, B the
  right. Pressure: A = CFD, B = PINO, one shared p range. Error: both sides
  carry p_pino - p_cfd on the symmetric diverging range, the throat above
  +absMax in the over color; the wipe is switched off. Speed: A = CFD, B =
  PINO near-wall speed on 0..vmag_wall_max; the inlet and outlet caps are
  masked to bone-3 because their vertices carry an interior value on a
  different range (manifest viewer_notes).
*/
import {
  buildLut,
  DIVERGING_OVER,
  normalize,
  normalizeDiverging,
  type ColormapName,
  type RGB,
} from '@/lib/colormaps';
import { formatDecimal, formatInt, formatKpa } from '@/lib/format';
import type { PinoManifest, VesselData, ViewerField } from './data';

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
    const toT = (v: number) => normalizeDiverging(v, r.p_err_abs_max);
    paintLinear(a, data.p_err, lut, toT);
    b.set(a);
    return { a, b, wipe: false };
  }
  const lut = linearLut('viridis');
  const toT = (v: number) => normalize(v, 0, r.vmag_wall_max);
  paintLinear(a, data.vmag_cfd, lut, toT, data.region);
  paintLinear(b, data.vmag_pino, lut, toT, data.region);
  return { a, b, wipe: true };
}

/* Colorbar description for the DOM strip. t is the fraction along the bar from its bottom. */
export interface LegendTick {
  t: number;
  text: string;
}
export interface Legend {
  field: ViewerField;
  colormap: ColormapName;
  /** Field name for the label row. */
  name: string;
  unit: string;
  ticks: LegendTick[];
  /** Share of the strip given to the above-range band (diverging only). */
  overFraction: number;
  /** One sentence for assistive tech. */
  summary: string;
}

export function legendFor(field: ViewerField, manifest: PinoManifest, hero: boolean): Legend {
  const r = manifest.ranges;
  if (field === 'pressure') {
    const [lo, hi] = r.p;
    const mid = (lo + hi) / 2;
    const f = hero ? (v: number) => formatKpa(v, 1) : (v: number) => formatInt(v);
    const unit = hero ? 'kPa' : 'Pa';
    return {
      field,
      colormap: 'turbo',
      name: 'pressure',
      unit,
      ticks: [
        { t: 0, text: f(lo) },
        { t: 0.5, text: f(mid) },
        { t: 1, text: f(hi) },
      ],
      overFraction: 0,
      summary: `Surface pressure from ${f(lo)} to ${f(hi)} ${unit}, one range for CFD and PINO.`,
    };
  }
  if (field === 'error') {
    const m = r.p_err_abs_max;
    const over = 0.08;
    const main = 1 - over;
    const txt = (v: number) => (v > 0 ? `+${formatInt(v)}` : formatInt(v));
    return {
      field,
      colormap: 'diverging',
      name: 'PINO − CFD',
      unit: 'Pa',
      ticks: [
        { t: 0, text: txt(-m) },
        { t: main * 0.5, text: '0' },
        { t: main, text: txt(m) },
        { t: main + over / 2, text: `> ${txt(m)}` },
      ],
      overFraction: over,
      summary: `Pressure error PINO minus CFD on a symmetric range of ±${formatInt(m)} Pa; the throat exceeds +${formatInt(m)} Pa and is painted in the above-range color.`,
    };
  }
  const hi = r.vmag_wall_max;
  const f = (v: number) => formatDecimal(v, 2);
  return {
    field,
    colormap: 'viridis',
    name: 'near-wall speed',
    unit: 'm/s',
    ticks: [
      { t: 0, text: f(0) },
      { t: 0.5, text: f(hi / 2) },
      { t: 1, text: f(hi) },
    ],
    overFraction: 0,
    summary: `Near-wall speed from 0 to ${f(hi)} m/s; inlet and outlet caps are masked.`,
  };
}
