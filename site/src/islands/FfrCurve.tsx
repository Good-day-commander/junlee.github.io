/*
  FfrCurve: Pd/Pa (section-mean p / p_proximal) along the vessel for CFD
  (ink) and PINO (signal) against s in mm, with the two probe planes marked
  and the FFR values read on the distal plane, as the manifest instructs
  (never at the curve ends).

  Nothing is printed on the data. The probe labels sit in a band above the
  plot with their dashed planes running up to them; the FFR values sit in a
  legend row beneath the chart (HTML, so it wraps between items on a phone
  and never inside one), keyed to the curves by their stroke swatches. The
  curves carry only a dot where they cross the distal plane.

  Precision: FFR two decimals, the site's chrome precision (the metrics
  table on /research keeps three).

  Public API
    <FfrCurve centerlineUrl="/data/pino/centerline.json" wipe={0.5} mode="hero" />
    props    centerlineUrl  centerline.json
             wipe           handle position 0..1 from VesselViewer; maps to
                            s = wipe · s_max and highlights that station
             followViewer   listen to the window 'vesselviewer:state' event
                            instead (for two separate Astro islands)
             mode           'hero' (flatter) | 'chapter'
    SSR      renders a sized, labelled frame; measures and draws on mount.
*/
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { formatDecimal, formatMm } from '@/lib/format';
import { loadCenterline, VIEWER_STATE_EVENT, type Centerline } from './vessel/data';
import s from './vessel/ffr.module.css';

export interface FfrCurveProps {
  /** URL of centerline.json: { s_mm, p_cfd, p_pino, p_proximal_Pa, ffr }. */
  centerlineUrl: string;
  /** Wipe position [0..1] shared with VesselViewer; highlights that s along the curve. */
  wipe?: number;
  followViewer?: boolean;
  mode?: 'hero' | 'chapter';
  className?: string;
}

/*
  top: the label band above the plot, two rows: the probe labels on the
  first, the Pd/Pa axis title on the second (left of the plot, over the
  tick column), so the title never reads as part of a probe label.
  bottom: x tick labels, then the axis title. The Frame around the chart pads
  its body clear of the corner chrome.
*/
const PAD = { top: 44, right: 14, bottom: 42, left: 46 };
const PROBE_BASELINE = 14;
/* Mono label metrics for collision checks: 0.7rem JetBrains Mono, about 0.6 em per glyph. */
const LABEL_PX = 11.2;
const GLYPH_PX = LABEL_PX * 0.6;
const FFR_DIGITS = 2;

function interp(xs: number[], ys: number[], x: number): number {
  if (x <= xs[0]) return ys[0];
  const n = xs.length;
  if (x >= xs[n - 1]) return ys[n - 1];
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  const f = (x - xs[lo]) / (xs[hi] - xs[lo] || 1);
  return ys[lo] + (ys[hi] - ys[lo]) * f;
}

export function FfrCurve({ centerlineUrl, wipe, followViewer = false, mode = 'chapter', className }: FfrCurveProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Centerline | null>(null);
  const [error, setError] = useState('');
  const [width, setWidth] = useState(0);
  const [followed, setFollowed] = useState<number | undefined>(undefined);
  const uid = useId();

  useEffect(() => {
    const ac = new AbortController();
    loadCenterline(centerlineUrl, ac.signal)
      .then(setData)
      .catch((err) => {
        if (ac.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => ac.abort();
  }, [centerlineUrl]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(Math.round(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!followViewer) return;
    const handler = (e: Event) => {
      const d = (e as CustomEvent<{ wipe: number }>).detail;
      if (d && typeof d.wipe === 'number') setFollowed(d.wipe);
    };
    window.addEventListener(VIEWER_STATE_EVENT, handler);
    return () => window.removeEventListener(VIEWER_STATE_EVENT, handler);
  }, [followViewer]);

  const activeWipe = followViewer ? followed : wipe;
  const ratio = mode === 'hero' ? 0.38 : 0.5;
  const height = width ? Math.max(mode === 'hero' ? 150 : 200, Math.min(360, Math.round(width * ratio))) : 0;

  const chart = useMemo(() => {
    if (!data || !width || !height) return null;
    const pp = data.p_proximal_Pa;
    const sArr = data.s_mm;
    const cfd = data.p_cfd.map((p) => p / pp);
    const pino = data.p_pino.map((p) => p / pp);
    const sMax = sArr[sArr.length - 1];
    const yMin = Math.min(...cfd, ...pino);
    const yMax = Math.max(...cfd, ...pino, 1);
    const y0 = Math.floor((yMin - 0.01) * 20) / 20;
    const y1 = Math.ceil((yMax + 0.002) * 100) / 100;
    const iw = width - PAD.left - PAD.right;
    const ih = height - PAD.top - PAD.bottom;
    const x = (v: number) => PAD.left + (v / sMax) * iw;
    const y = (v: number) => PAD.top + (1 - (v - y0) / (y1 - y0)) * ih;
    const path = (ys: number[]) =>
      ys.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(sArr[i]).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');

    const xStep = sMax > 40 ? 10 : 5;
    const xTicks: number[] = [];
    for (let v = 0; v <= sMax + 1e-6; v += xStep) xTicks.push(v);
    const yTicks: number[] = [];
    for (let v = y0; v <= y1 + 1e-9; v += 0.05) yTicks.push(Math.round(v * 100) / 100);

    const probes = data.ffr.probe_s;
    const hasWipe = typeof activeWipe === 'number' && Number.isFinite(activeWipe);
    const sW = hasWipe ? Math.max(0, Math.min(1, activeWipe as number)) * sMax : 0;
    const wCfd = hasWipe ? interp(sArr, cfd, sW) : 0;
    const wPino = hasWipe ? interp(sArr, pino, sW) : 0;

    /*
      Probe labels: centred on their plane, clamped to the plot's width, and
      pushed apart if the two would touch.
    */
    const probeText = {
      proximal: `proximal ${formatMm(probes.proximal)}`,
      distal: `distal ${formatMm(probes.distal)}`,
    };
    const lo = PAD.left;
    const hi = width - PAD.right;
    const place = (k: 'proximal' | 'distal') => {
      const w = probeText[k].length * GLYPH_PX;
      const c = x(probes[k]);
      const left = Math.min(Math.max(c - w / 2, lo), hi - w);
      return { left, w };
    };
    const pl = place('proximal');
    const dl = place('distal');
    const gap = 10;
    const overlap = pl.left + pl.w + gap - dl.left;
    if (overlap > 0) {
      pl.left = Math.max(lo, pl.left - overlap / 2);
      dl.left = Math.min(hi - dl.w, pl.left + pl.w + gap);
    }

    return {
      probeText,
      probeLabelX: { proximal: pl.left, distal: dl.left },
      sMax,
      y0,
      y1,
      x,
      y,
      cfdPath: path(cfd),
      pinoPath: path(pino),
      xTicks,
      yTicks,
      probes,
      hasWipe,
      sW,
      wCfd,
      wPino,
      distalCfdY: y(interp(sArr, cfd, probes.distal)),
      distalPinoY: y(interp(sArr, pino, probes.distal)),
      iw,
      ih,
    };
  }, [data, width, height, activeWipe]);

  const title = 'Pressure ratio along the vessel, CFD and PINO';
  const desc = data
    ? `Pd/Pa from the inlet to the outlet at ${formatMm(data.s_mm[data.s_mm.length - 1])}. On the distal probe plane at ${formatMm(data.ffr.probe_s.distal)}, CFD reads FFR ${formatDecimal(data.ffr.cfd, FFR_DIGITS)} and PINO ${formatDecimal(data.ffr.pino, FFR_DIGITS)}; the proximal plane sits at ${formatMm(data.ffr.probe_s.proximal)}.`
    : 'Loading the centerline pressure curve.';

  const aspectStyle = { aspectRatio: mode === 'hero' ? '1 / 0.38' : '2 / 1' };

  return (
    <div
      ref={rootRef}
      className={[s.root, className].filter(Boolean).join(' ')}
      data-island="FfrCurve"
      data-mode={mode}
      style={height ? undefined : aspectStyle}
    >
      {chart && data ? (
        <svg
          className={s.svg}
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-labelledby={`${uid}-t ${uid}-d`}
        >
          <title id={`${uid}-t`}>{title}</title>
          <desc id={`${uid}-d`}>{desc}</desc>

          {chart.yTicks.map((v) => (
            <g key={`y${v}`}>
              <line className={s.grid} x1={PAD.left} x2={width - PAD.right} y1={chart.y(v)} y2={chart.y(v)} />
              <text className={s.tick} x={PAD.left - 8} y={chart.y(v)} textAnchor="end" dominantBaseline="middle">
                {formatDecimal(v, 2)}
              </text>
            </g>
          ))}
          <line className={s.axis} x1={PAD.left} x2={width - PAD.right} y1={height - PAD.bottom} y2={height - PAD.bottom} />
          {chart.xTicks.map((v) => (
            <g key={`x${v}`}>
              <line className={s.axis} x1={chart.x(v)} x2={chart.x(v)} y1={height - PAD.bottom} y2={height - PAD.bottom + 4} />
              <text className={s.tick} x={chart.x(v)} y={height - PAD.bottom + 16} textAnchor="middle">
                {v}
              </text>
            </g>
          ))}
          <text className={s.axisLabel} x={width - PAD.right} y={height - 6} textAnchor="end">
            s, mm from the inlet
          </text>
          <text className={s.axisLabel} x={PAD.left - 8} y={PAD.top - 14} textAnchor="end">
            Pd/Pa
          </text>

          {/* Probe planes: dashed lines run up into the label band */}
          {(['proximal', 'distal'] as const).map((k) => (
            <g key={k}>
              <line
                className={s.probe}
                x1={chart.x(chart.probes[k])}
                x2={chart.x(chart.probes[k])}
                y1={PROBE_BASELINE + 5}
                y2={height - PAD.bottom}
              />
              <text className={s.probeLabel} x={chart.probeLabelX[k]} y={PROBE_BASELINE} textAnchor="start">
                {chart.probeText[k]}
              </text>
            </g>
          ))}

          <path className={s.cfd} d={chart.cfdPath} />
          <path className={s.pino} d={chart.pinoPath} />

          {/* Where each curve crosses the distal plane: the FFR reading, valued in the legend row */}
          <circle className={s.wipeDotCfd} cx={chart.x(chart.probes.distal)} cy={chart.distalCfdY} r={3} />
          <circle className={s.wipeDotPino} cx={chart.x(chart.probes.distal)} cy={chart.distalPinoY} r={3} />

          {/* Wipe station */}
          {chart.hasWipe && (
            <g>
              <line className={s.wipeLine} x1={chart.x(chart.sW)} x2={chart.x(chart.sW)} y1={PAD.top} y2={height - PAD.bottom} />
              <circle className={s.wipeDotCfd} cx={chart.x(chart.sW)} cy={chart.y(chart.wCfd)} r={3.5} />
              <circle className={s.wipeDotPino} cx={chart.x(chart.sW)} cy={chart.y(chart.wPino)} r={3.5} />
            </g>
          )}
        </svg>
      ) : (
        <p className={s.status} role="status" aria-live="polite">
          {error ? `the pressure curve did not load: ${error}` : 'loading the pressure curve'}
        </p>
      )}
      {/* Always rendered, so the frame does not grow when the data arrives. */}
      <div className={s.legendRow}>
        {chart && data && (
          <>
          <span className={s.legendLead}>FFR, distal plane</span>
          <span className={s.key}>
            <span className={`${s.swatch} ${s.swatchCfd}`} aria-hidden="true" />
            CFD <span className={s.keyValue}>{formatDecimal(data.ffr.cfd, FFR_DIGITS)}</span>
          </span>
          <span className={s.key}>
            <span className={`${s.swatch} ${s.swatchPino}`} aria-hidden="true" />
            PINO <span className={`${s.keyValue} ${s.isPino}`}>{formatDecimal(data.ffr.pino, FFR_DIGITS)}</span>
          </span>
          {chart.hasWipe && (
            <span className={s.station} aria-live="off">
              at {formatMm(chart.sW)}: CFD {formatDecimal(chart.wCfd, FFR_DIGITS)} · PINO{' '}
              {formatDecimal(chart.wPino, FFR_DIGITS)}
            </span>
          )}
          </>
        )}
      </div>
    </div>
  );
}

export default FfrCurve;
