/*
  Turns a loaded dB grid into a small source canvas (one pixel per cell,
  top row = highest frequency) plus the axis geometry needed to place it.

  Frequency rows are cells: a linear grid has cells f ± df/2, a log grid
  (the CWT, equal steps in log f) has cells f·r^±1/2. The visible domain is
  the crop intersected with the outer cell edges, so no part of the plot
  shows a frequency the array does not carry.
*/
import { buildLut } from '@/lib/colormaps';
import type { GridSpec, LoadedGrid } from './manifest';

export type Scale = 'linear' | 'log';

export interface Raster {
  /** cols × rows, one pixel per cell, row 0 = highest visible frequency. */
  source: HTMLCanvasElement;
  cols: number;
  rows: number;
  /** Inclusive row window into spec.f_hz. */
  rowStart: number;
  rowEnd: number;
  scale: Scale;
  /** Visible frequency domain [lo, hi] in Hz. */
  fDomain: [number, number];
  /** Outer cell edges of the visible rows [bottom, top] in Hz. */
  fEdges: [number, number];
  /** Time domain [lo, hi] in s: outer cell edges of the columns. */
  tDomain: [number, number];
  /** Centre time of each column, from the manifest. */
  t_s: number[];
  /** dB range painted onto viridis after the bottom clip. */
  dbLo: number;
  dbHi: number;
}

const VIRIDIS_LUT = typeof document === 'undefined' ? null : buildLut('viridis', 256);

/** Transform for the frequency axis. */
export function axisTransform(scale: Scale): (f: number) => number {
  return scale === 'log' ? (f) => Math.log(f) : (f) => f;
}

/** Fraction from the top of the plot (0) to the bottom (1) for a frequency. */
export function fracFromTop(raster: Pick<Raster, 'scale' | 'fDomain'>, f: number): number {
  const T = axisTransform(raster.scale);
  const [lo, hi] = raster.fDomain;
  const span = T(hi) - T(lo);
  return span === 0 ? 0 : (T(hi) - T(f)) / span;
}

/** Fraction from the left of the plot for a time. */
export function fracFromLeft(raster: Pick<Raster, 'tDomain'>, t: number): number {
  const [lo, hi] = raster.tDomain;
  const span = hi - lo;
  return span === 0 ? 0 : (t - lo) / span;
}

function inferScale(spec: Pick<GridSpec, 'f_scale' | 'f_hz'>): Scale {
  if (spec.f_scale) return spec.f_scale;
  const f = spec.f_hz;
  if (f.length < 3 || f[0] <= 0) return 'linear';
  const d0 = f[1] - f[0];
  const d1 = f[2] - f[1];
  return Math.abs(d1 - d0) > 1e-6 * Math.max(1, Math.abs(d0)) ? 'log' : 'linear';
}

/**
 * Fraction of the display range clipped from the bottom before mapping to
 * viridis. The manifest's db_display already starts at the 1st percentile;
 * clipping another tenth keeps the floor from reading as a mid-purple haze.
 */
export const DB_BOTTOM_CLIP = 0.1;

/**
 * The axis geometry of a raster, without the pixels: what the server render
 * needs to print the frequency and time ticks and the dB range before the
 * .bin arrives (research.astro computes it from the pulse manifest at
 * build; buildRaster computes the same values in the browser).
 */
export type RasterAxes = Pick<Raster, 'rows' | 'cols' | 'rowStart' | 'rowEnd' | 'scale' | 'fDomain' | 'fEdges' | 'tDomain' | 'dbLo' | 'dbHi'>;

export function rasterAxes(
  spec: Pick<GridSpec, 'f_hz' | 't_s' | 'rows' | 'cols' | 'f_scale' | 'db_display'>,
  crop?: [number, number],
  bottomClip: number = DB_BOTTOM_CLIP,
): RasterAxes {
  const f = spec.f_hz;
  const scale = inferScale(spec);
  const cropLo = crop ? Math.min(crop[0], crop[1]) : -Infinity;
  const cropHi = crop ? Math.max(crop[0], crop[1]) : Infinity;

  // Rows whose centre lies inside the crop; fall back to every row if the crop is empty.
  let rowStart = -1;
  let rowEnd = -1;
  for (let r = 0; r < spec.rows; r += 1) {
    if (f[r] >= cropLo - 1e-9 && f[r] <= cropHi + 1e-9) {
      if (rowStart === -1) rowStart = r;
      rowEnd = r;
    }
  }
  if (rowStart === -1 || rowEnd - rowStart < 1) {
    rowStart = 0;
    rowEnd = spec.rows - 1;
  }
  const rows = rowEnd - rowStart + 1;
  const cols = spec.cols;

  // Outer cell edges.
  let bottomEdge: number;
  let topEdge: number;
  if (scale === 'log') {
    const r = f.length > 1 ? f[1] / f[0] : 1;
    const half = Math.sqrt(r);
    bottomEdge = f[rowStart] / half;
    topEdge = f[rowEnd] * half;
  } else {
    const df = f.length > 1 ? f[1] - f[0] : 1;
    bottomEdge = f[rowStart] - df / 2;
    topEdge = f[rowEnd] + df / 2;
  }
  const fLo = Math.max(bottomEdge, Number.isFinite(cropLo) ? cropLo : bottomEdge, scale === 'log' ? Number.MIN_VALUE : -Infinity);
  const fHi = Math.min(topEdge, Number.isFinite(cropHi) ? cropHi : topEdge);

  const t = spec.t_s;
  const dt = t.length > 1 ? t[1] - t[0] : 1;
  const tDomain: [number, number] = [t[0] - dt / 2, t[t.length - 1] + dt / 2];

  const [d0, d1] = spec.db_display;
  const dbLo = d0 + (d1 - d0) * Math.min(0.9, Math.max(0, bottomClip));
  const dbHi = d1;
  return {
    rows,
    cols,
    rowStart,
    rowEnd,
    scale,
    fDomain: [fLo, fHi],
    fEdges: [bottomEdge, topEdge],
    tDomain,
    dbLo,
    dbHi,
  };
}

export function buildRaster(
  grid: LoadedGrid,
  crop?: [number, number],
  bottomClip: number = DB_BOTTOM_CLIP,
): Raster {
  const { spec, data } = grid;
  const axes = rasterAxes(spec, crop, bottomClip);
  const { rows, cols, rowEnd, dbLo, dbHi } = axes;
  const inv = dbHi > dbLo ? 1 / (dbHi - dbLo) : 0;

  const source = document.createElement('canvas');
  source.width = cols;
  source.height = rows;
  const ctx = source.getContext('2d');
  if (!ctx) throw new Error('2D canvas is unavailable');
  const lut = VIRIDIS_LUT ?? buildLut('viridis', 256);
  const image = ctx.createImageData(cols, rows);
  const px = image.data;
  for (let y = 0; y < rows; y += 1) {
    const row = rowEnd - y; // top of the image is the highest frequency
    const base = row * cols;
    for (let x = 0; x < cols; x += 1) {
      let u = (data[base + x] - dbLo) * inv;
      if (!(u > 0)) u = 0;
      else if (u > 1) u = 1;
      const k = Math.round(u * 255) * 3;
      const o = (y * cols + x) * 4;
      px[o] = lut[k];
      px[o + 1] = lut[k + 1];
      px[o + 2] = lut[k + 2];
      px[o + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  return { ...axes, source, t_s: spec.t_s };
}

export interface Tick {
  value: number;
  /** 0..1 along the axis: from the top for frequency, from the left for time. */
  frac: number;
  label: string;
}

const LOG_CANDIDATES = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];

function niceStep(span: number, target: number): number {
  const raw = span / Math.max(1, target);
  const mag = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 5, 10]) {
    if (m * mag >= raw) return m * mag;
  }
  return 10 * mag;
}

function fmt(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toFixed(2)));
}

/*
  A tick that falls within 1% of the axis length outside the domain (the crop
  asked for 5 Hz, the last cell edge is 4.99 Hz) is kept and pinned to the edge.
*/
const EDGE_TOLERANCE = 0.01;

function pushTick(out: Tick[], value: number, frac: number): void {
  if (frac < -EDGE_TOLERANCE || frac > 1 + EDGE_TOLERANCE) return;
  out.push({ value, frac: Math.min(1, Math.max(0, frac)), label: fmt(value) });
}

export function frequencyTicks(raster: Pick<Raster, 'scale' | 'fDomain'>, target = 5): Tick[] {
  const [lo, hi] = raster.fDomain;
  const out: Tick[] = [];
  if (raster.scale === 'log') {
    for (const v of LOG_CANDIDATES) pushTick(out, v, fracFromTop(raster, v));
    return out;
  }
  const step = niceStep(hi - lo, target);
  const first = (Math.ceil(lo / step) - 1) * step;
  for (let v = first; v <= hi + step; v += step) {
    const value = Number(v.toFixed(6));
    pushTick(out, value, fracFromTop(raster, value));
  }
  return out;
}

export function timeTicks(raster: Pick<Raster, 'tDomain'>, target = 6): Tick[] {
  const [lo, hi] = raster.tDomain;
  const step = niceStep(hi - lo, target);
  const first = (Math.ceil(lo / step) - 1) * step;
  const out: Tick[] = [];
  for (let v = first; v <= hi + step; v += step) {
    const value = Number(v.toFixed(6));
    pushTick(out, value, fracFromLeft(raster, value));
  }
  return out;
}

/**
 * Paint the raster into a display canvas.
 *   progress   share of columns developed, 0..1
 *   ghost      alpha of the undeveloped (latent) image under the developed
 *              columns; 0 paints nothing there
 */
export function paintRaster(
  ctx: CanvasRenderingContext2D,
  raster: Raster,
  width: number,
  height: number,
  progress: number,
  ghost: number,
  smooth: boolean,
): number {
  ctx.save();
  ctx.imageSmoothingEnabled = smooth;
  if (smooth) ctx.imageSmoothingQuality = 'high';
  // Destination band for the whole image: the outer cell edges mapped into the domain.
  const top = fracFromTop(raster, raster.fEdges[1]) * height;
  const bottom = fracFromTop(raster, raster.fEdges[0]) * height;
  const band = bottom - top;
  const cols = raster.cols;
  const shown = Math.max(0, Math.min(cols, Math.round(progress * cols)));

  if (ghost > 0 && shown < cols) {
    ctx.globalAlpha = ghost;
    ctx.drawImage(raster.source, 0, 0, cols, raster.rows, 0, top, width, band);
  }
  if (shown > 0) {
    ctx.globalAlpha = 1;
    const dw = (shown / cols) * width;
    ctx.drawImage(raster.source, 0, 0, shown, raster.rows, 0, top, dw, band);
  }
  ctx.restore();
  return shown;
}
