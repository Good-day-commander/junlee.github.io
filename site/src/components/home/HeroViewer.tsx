/*
  Hero island: the VesselViewer in hero mode plus the bottom-right develop
  readout. The readout is the one authored moment on the page: once the
  viewer reports ready, the mono counter runs from 0.00 s to the measured
  inference time (1.78 s on one L40S) while the PINO layer develops over the
  CFD field inside the viewer. Reduced motion: the final value is printed
  and never animated. Server-rendered HTML already carries the final value,
  so the no-JS page and the review screenshot read the true number.

  The VesselViewer's onState is a function prop, which Astro cannot pass
  from .astro, so this small React wrapper owns the bridge. Props are plain
  strings and numbers computed in Hero.astro from the PINO manifest.

  quiet (the round-3 home plate): the viewer in quiet mode (pressure only,
  wipe, colorbar, develop once, no drift or orbit) and no corner readout at
  all; the page prints the case line as a caption under the frame, in
  Astro, so its numbers are in the server HTML. inferenceSeconds and gpu are
  then unused and may be left out. summary passes the manifest's case id,
  node count and ranges to the viewer for its server-rendered colorbar.
*/
import { useCallback, useEffect, useRef, useState } from 'react';
import VesselViewer, { type ViewerState, type ViewerSummary } from '@/islands/VesselViewer';
import { formatDecimal, formatSeconds } from '@/lib/format';

export interface HeroViewerProps {
  manifestUrl: string;
  /** Measured inference time in seconds (manifest timing.pino.inference_ms_median / 1000). Unused when quiet. */
  inferenceSeconds?: number;
  /**
    "FFR Pd/Pa 0.83 CFD · 0.82 PINO", computed in Astro. Kept for the
    current Hero.astro; prefer ffrCfd / ffrPino, which this island formats
    itself (two decimals, the site's FFR precision in chrome).
  */
  ffrLine?: string;
  /** Case FFR on the distal probe plane (manifest metrics.case.ffr.cfd). */
  ffrCfd?: number;
  /** Case FFR on the distal probe plane (manifest metrics.case.ffr.pino). */
  ffrPino?: number;
  /** "L40S". Unused when quiet. */
  gpu?: string;
  /**
    Where the CFD | PINO hairline starts, 0..1 of the frame width. The
    headline block holds the lower left of the hero, so the hairline is
    set to cross the vessel right of the headline column instead of
    cutting through its last glyphs at the exact middle.
  */
  initialWipe?: number;
  /** Home plate: quiet viewer, no corner readout (default false). Hairline starts mid-frame (0.5). */
  quiet?: boolean;
  /** Manifest case id, node count and ranges, so the colorbar ticks are in the server HTML. */
  summary?: ViewerSummary;
}

/*
  The readout is two fixed lines, never one string left to wrap: a label
  line "FFR Pd/Pa" and a value line "CFD 0.83 · PINO 0.82", so a narrow
  frame cannot split a value from its solver. The older single-string prop
  is parsed into the same two lines.
*/
const FFR_LINE = /^(.*?)\s+([\d.]+)\s+CFD\s+·\s+([\d.]+)\s+PINO\s*$/;

function ffrLines(ffrLine?: string, cfd?: number, pino?: number): [string, string] | null {
  if (typeof cfd === 'number' && typeof pino === 'number') {
    return ['FFR Pd/Pa', `CFD ${formatDecimal(cfd, 2)} · PINO ${formatDecimal(pino, 2)}`];
  }
  if (!ffrLine) return null;
  const m = FFR_LINE.exec(ffrLine);
  if (!m) return [ffrLine, ''];
  return [m[1], `CFD ${formatDecimal(Number(m[2]), 2)} · PINO ${formatDecimal(Number(m[3]), 2)}`];
}

const NOWRAP = { whiteSpace: 'nowrap' } as const;

/** If the viewer never reports ready (WebGL unavailable), stop showing 0.00 after this. */
const READY_FALLBACK_MS = 8000;

export default function HeroViewer({
  manifestUrl,
  inferenceSeconds,
  ffrLine,
  ffrCfd,
  ffrPino,
  gpu = '',
  initialWipe,
  quiet = false,
  summary,
}: HeroViewerProps) {
  const ffr = ffrLines(ffrLine, ffrCfd, ffrPino);
  const seconds = inferenceSeconds ?? 0;
  const [ready, setReady] = useState(false);
  const [wipe, setWipe] = useState<number | null>(null);
  const [shown, setShown] = useState(seconds);
  const reduced = useRef(false);

  // On hydration: arm the counter (drop to 0.00) unless motion is reduced or there is no readout.
  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced.current || quiet) return undefined;
    setShown(0);
    const fallback = window.setTimeout(() => setReady(true), READY_FALLBACK_MS);
    return () => window.clearTimeout(fallback);
  }, [quiet]);

  // Once ready: count linearly, like a stopwatch, over exactly the measured time.
  useEffect(() => {
    if (!ready || quiet) return undefined;
    if (reduced.current || seconds <= 0) {
      setShown(seconds);
      return undefined;
    }
    const duration = seconds * 1000;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      setShown(seconds * t);
      if (t < 1) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [ready, seconds, quiet]);

  const onState = useCallback((s: ViewerState) => {
    if (s.ready) setReady(true);
    setWipe(s.wipe);
  }, []);

  const viewer = (
    <div className="hero__viewer" data-quiet={quiet ? 'true' : undefined}>
      <VesselViewer
        manifestUrl={manifestUrl}
        mode="hero"
        quiet={quiet}
        summary={summary}
        onState={onState}
        initialWipe={initialWipe ?? (quiet ? 0.5 : 0.56)}
      />
    </div>
  );

  if (quiet) return viewer;

  return (
    <>
      {viewer}
      <p
        className="frame__corner frame__corner--br hero__corner hero__readout"
        data-ready={ready ? 'true' : undefined}
        data-wipe={wipe === null ? undefined : wipe.toFixed(3)}
      >
        {ffr && (
          <span className="hero__readout-line" style={NOWRAP}>
            {ffr[0]}
          </span>
        )}
        {ffr && ffr[1] && (
          <span className="hero__readout-line" style={NOWRAP}>
            {ffr[1]}
          </span>
        )}
        <span className="hero__readout-line" style={NOWRAP}>
          inference <span className="hero__count">{formatSeconds(shown)}</span> · {gpu}
        </span>
      </p>
    </>
  );
}
