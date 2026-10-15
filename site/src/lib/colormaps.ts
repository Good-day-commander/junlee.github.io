/*
  Colormaps, implemented once and shared by the islands and any colorbar.

    turbo      pressure fields (same p range for CFD and PINO)
    diverging  signed pressure error, symmetric about zero, with a distinct
               above-range color for values past +absMax (the throat)
    viridis    spectrograms

  Samplers take t in [0, 1] and return [r, g, b] in 0..255. Out-of-range t is
  clamped, except that `diverging` returns DIVERGING_OVER for t > 1 so the
  above-range region reads as a different ink, not as the saturated end.
*/

export type RGB = [number, number, number];
export type ColormapName = 'turbo' | 'diverging' | 'viridis';
export type Sampler = (t: number) => RGB;

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);
const to255 = (v: number): number => Math.round(Math.min(1, Math.max(0, v)) * 255);

/* Turbo: Google's polynomial approximation (Mikhailov, 2019). */
export function turbo(t: number): RGB {
  const x = clamp01(t);
  const x2 = x * x;
  const x3 = x2 * x;
  const x4 = x3 * x;
  const x5 = x4 * x;
  const r = 0.13572138 + 4.6153926 * x - 42.66032258 * x2 + 132.13108234 * x3 - 152.94239396 * x4 + 59.28637943 * x5;
  const g = 0.09140261 + 2.19418839 * x + 4.84296658 * x2 - 14.18503333 * x3 + 4.27729857 * x4 + 2.82956604 * x5;
  const b = 0.1066733 + 12.64194608 * x - 60.58204836 * x2 + 110.36276771 * x3 - 89.90310912 * x4 + 27.34824973 * x5;
  return [to255(r), to255(g), to255(b)];
}

/* Viridis: degree-6 polynomial fit of matplotlib's viridis (Zucker). */
export function viridis(t: number): RGB {
  const x = clamp01(t);
  const c0 = [0.2777273272234177, 0.005407344544966578, 0.3340998053353061];
  const c1 = [0.1050930431085774, 1.404613529898575, 1.384590162594685];
  const c2 = [-0.3308618287255563, 0.214847559468213, 0.09509516302823659];
  const c3 = [-4.634230498983486, -5.799100973351585, -19.33244095627987];
  const c4 = [6.228269936347081, 14.17993336680509, 56.69055260068105];
  const c5 = [4.776384997670288, -13.74514537774601, -65.35303263337234];
  const c6 = [-5.435455855934631, 4.645852612178535, 26.3124352495832];
  const out: RGB = [0, 0, 0];
  for (let i = 0; i < 3; i += 1) {
    const v = c0[i] + x * (c1[i] + x * (c2[i] + x * (c3[i] + x * (c4[i] + x * (c5[i] + x * c6[i])))));
    out[i] = to255(v);
  }
  return out;
}

/*
  Diverging: a cool-warm ramp (blue, bone, red) sampled piecewise-linearly
  from Moreland's cool-warm endpoints. t = 0.5 is zero error.
*/
const DIVERGING_STOPS: Array<[number, RGB]> = [
  [0.0, [59, 76, 192]],
  [0.25, [124, 159, 249]],
  [0.5, [221, 221, 221]],
  [0.75, [245, 156, 125]],
  [1.0, [180, 4, 38]],
];

/** Color for values above the symmetric error range (> +absMax). */
export const DIVERGING_OVER: RGB = [255, 214, 0];

export function diverging(t: number): RGB {
  if (t > 1) return DIVERGING_OVER;
  const x = clamp01(t);
  for (let i = 1; i < DIVERGING_STOPS.length; i += 1) {
    const [t1, c1] = DIVERGING_STOPS[i];
    if (x <= t1) {
      const [t0, c0] = DIVERGING_STOPS[i - 1];
      const f = t1 === t0 ? 0 : (x - t0) / (t1 - t0);
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * f),
        Math.round(c0[1] + (c1[1] - c0[1]) * f),
        Math.round(c0[2] + (c1[2] - c0[2]) * f),
      ];
    }
  }
  return DIVERGING_STOPS[DIVERGING_STOPS.length - 1][1];
}

export const colormaps: Record<ColormapName, Sampler> = { turbo, diverging, viridis };

export function sample(name: ColormapName, t: number): RGB {
  return colormaps[name](t);
}

/** Map a value in [min, max] to t in [0, 1] (clamped). */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return clamp01((value - min) / (max - min));
}

/**
 * Map a signed value to the diverging colormap's t for a symmetric range
 * [-absMax, +absMax]. Values above +absMax return t > 1 so `diverging`
 * paints them with DIVERGING_OVER; values below -absMax clamp to 0.
 */
export function normalizeDiverging(value: number, absMax: number): number {
  if (absMax <= 0) return 0.5;
  if (value > absMax) return 1 + Number.EPSILON;
  return clamp01(0.5 + value / (2 * absMax));
}

/** Signed value → RGB, including the above-range color. */
export function divergingValue(value: number, absMax: number): RGB {
  return diverging(normalizeDiverging(value, absMax));
}

export function cssColor(rgb: RGB): string {
  return `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
}

/**
 * CSS linear-gradient string for a colorbar.
 * `stops` is the number of color stops sampled along the ramp (default 16).
 * `direction` is any CSS gradient direction; vertical colorbars use 'to top'.
 */
export function cssGradient(name: ColormapName, stops = 16, direction = 'to top'): string {
  const n = Math.max(2, Math.floor(stops));
  const fn = colormaps[name];
  const parts: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1);
    parts.push(`${cssColor(fn(t))} ${(t * 100).toFixed(2)}%`);
  }
  return `linear-gradient(${direction}, ${parts.join(', ')})`;
}

/**
 * Gradient for the diverging colorbar with the above-range band appended on
 * top. `overFraction` is the share of the bar given to the over band.
 */
export function cssDivergingGradient(stops = 16, overFraction = 0.08, direction = 'to top'): string {
  const n = Math.max(2, Math.floor(stops));
  const main = 1 - overFraction;
  const parts: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1);
    parts.push(`${cssColor(diverging(t))} ${(t * main * 100).toFixed(2)}%`);
  }
  const over = cssColor(DIVERGING_OVER);
  parts.push(`${over} ${(main * 100).toFixed(2)}%`, `${over} 100%`);
  return `linear-gradient(${direction}, ${parts.join(', ')})`;
}

/** Packed RGB lookup table (size * 3 bytes) for fast per-vertex coloring. */
export function buildLut(name: ColormapName, size = 256): Uint8Array {
  const n = Math.max(2, Math.floor(size));
  const fn = colormaps[name];
  const lut = new Uint8Array(n * 3);
  for (let i = 0; i < n; i += 1) {
    const [r, g, b] = fn(i / (n - 1));
    lut[i * 3] = r;
    lut[i * 3 + 1] = g;
    lut[i * 3 + 2] = b;
  }
  return lut;
}
