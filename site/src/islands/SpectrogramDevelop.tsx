/*
  SpectrogramDevelop: a canvas spectrogram of a smartwatch PPG recording that
  develops like a strip coming off the printer. Columns paint left to right
  over ~4 s the first time the frame is in view, a thin bone playhead rides
  the developing edge with a mono time readout, and a Replay ghost button
  runs it again. Reduced motion paints the whole strip at once, Replay
  included.

  replayGroup: plates that develop side by side share one Replay control
  placed once by the page. With a group the island prints no button of its
  own and restarts when the document dispatches
  `spectrogram:replay` with `detail.group` equal to its group.

  Data: /data/pulse/manifest.json + stft.bin | cwt.bin (see pulse/manifest.ts).
  Colour: viridis over the manifest's db_display range, bottom tenth clipped.
  Axes are DOM text in mono (Hz on the left, s below), placed by fraction so
  they stay right through resizes. Standing alone, the island is its own
  .frame (border, corner label, three-tier caption stack through the what /
  result / consequence props). Inside a page Frame it is mounted `bare`: no
  border and no top-left label of its own, so the host frame's chrome is the
  only chrome and nothing is printed twice. The clock readout stays in the
  top-right corner either way.

  Server render: the page passes axes (rasterAxes of the manifest grid,
  computed at build), so the frequency and time ticks and the dB range are
  in the server HTML; the loaded raster replaces them with the same values.
  The loading line is printed only after hydration, never in the static
  markup.

  Exports
    SpectrogramDevelop  props { manifestUrl, variant = 'stft', crop, axes, ... }
    CwtStrip            static CWT scalogram for a side-by-side (no develop)
*/
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import replayIcon from '@phosphor-icons/core/assets/regular/arrow-counter-clockwise.svg?raw';
import { cssGradient } from '@/lib/colormaps';
import { formatDecimal, formatSeconds } from '@/lib/format';
import { loadVariant } from './pulse/manifest';
import type { PulseManifest, Variant } from './pulse/manifest';
import { buildRaster, frequencyTicks, paintRaster, timeTicks } from './pulse/raster';
import type { Raster, RasterAxes } from './pulse/raster';
import './pulse/spectrogram.css';

export interface SpectrogramDevelopProps {
  manifestUrl: string;
  variant?: Variant;
  /** Frequency window [lo, hi] in Hz; defaults to the manifest's recommended_crop_hz (STFT) or the full range (CWT). */
  crop?: [number, number];
  /** Develop time in ms for the full strip. */
  duration?: number;
  /** Length of the recording in seconds, for the accessible name (from the pulse manifest). */
  recordingS?: number;
  /** CSS aspect-ratio of the plot stage. */
  aspect?: string;
  /** Bilinear upsampling instead of one hard-edged block per cell. */
  smooth?: boolean;
  /** Caption stack: heading, one mono line with the number, one consequence line. */
  what?: ReactNode;
  result?: ReactNode;
  consequence?: ReactNode;
  /** Short frame label in the top-left corner; defaults to "PPG · STFT". */
  label?: string;
  /** Inside a host Frame: no border and no top-left label of its own (the host carries them). */
  bare?: boolean;
  /** Axis geometry from the manifest at build time (rasterAxes), for the server render. */
  axes?: RasterAxes;
  /** Shared Replay: no own button; restart on a `spectrogram:replay` event for this group. */
  replayGroup?: string;
  class?: string;
  className?: string;
  id?: string;
}

const VIRIDIS_BAR = cssGradient('viridis', 16, 'to right');

type Status = 'loading' | 'ready' | 'error';
type Phase = 'latent' | 'developing' | 'done';

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface CoreProps extends SpectrogramDevelopProps {
  /** false paints the finished strip at once and hides the develop controls. */
  develop: boolean;
}

function SpectrogramCore({
  manifestUrl,
  variant = 'stft',
  crop,
  duration = 4000,
  recordingS,
  aspect,
  smooth = false,
  what,
  result,
  consequence,
  label,
  bare = false,
  axes: axesProp,
  replayGroup,
  class: classA,
  className,
  id,
  develop,
}: CoreProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  const rasterRef = useRef<Raster | null>(null);
  const progressRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const elapsedRef = useRef(0);
  const startedRef = useRef(false);

  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [manifest, setManifest] = useState<PulseManifest | null>(null);
  const [raster, setRaster] = useState<Raster | null>(null);
  const [phase, setPhase] = useState<Phase>('latent');
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reactId = useId();
  const headingId = `${id ?? reactId}-what`;

  const spec = manifest ? manifest[variant] : null;

  /* Paint at a given progress and move the playhead + readout. Pure DOM work, no React state. */
  const paint = useCallback(
    (progress: number) => {
      const canvas = canvasRef.current;
      const r = rasterRef.current;
      if (!canvas || !r) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { w, h, dpr } = sizeRef.current;
      if (w === 0 || h === 0) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const shown = paintRaster(ctx, r, w, h, progress, develop ? 0.14 : 0, smooth);
      const edge = (shown / r.cols) * w;
      if (playheadRef.current) {
        playheadRef.current.style.transform = `translateX(${edge.toFixed(2)}px)`;
      }
      if (readoutRef.current) {
        const t = shown > 0 ? r.t_s[Math.min(r.cols, shown) - 1] : Math.max(0, r.tDomain[0]);
        readoutRef.current.textContent = formatSeconds(Math.abs(t) < 0.005 ? 0 : t, 2);
      }
    },
    [develop, smooth],
  );

  /* Load manifest + array, build the raster, and paint the first frame synchronously. */
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setError(null);
    loadVariant(manifestUrl, variant, controller.signal)
      .then(({ manifest: m, grid }) => {
        if (controller.signal.aborted) return;
        const cropNow = crop ?? (variant === 'stft' ? grid.spec.recommended_crop_hz : undefined);
        const r = buildRaster(grid, cropNow);
        rasterRef.current = r;
        progressRef.current = 0;
        elapsedRef.current = 0;
        startedRef.current = false;
        setManifest(m);
        setRaster(r);
        setPhase('latent');
        setStatus('ready');
        // First frame now, in this task, so the stage is never empty once data is here.
        paint(0);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus('error');
      });
    return () => controller.abort();
  }, [manifestUrl, variant, crop, attempt, paint]);

  /* Keep the canvas sized to the stage at devicePixelRatio (capped at 2); repaint at the current progress. */
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const fit = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      sizeRef.current = { w, h, dpr };
      paint(progressRef.current);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mq.addEventListener('change', fit);
    return () => {
      ro.disconnect();
      mq.removeEventListener('change', fit);
    };
  }, [paint, raster]);

  /* First visibility. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  const finish = useCallback(() => {
    stop();
    progressRef.current = 1;
    paint(1);
    setPhase('done');
  }, [paint, stop]);

  const run = useCallback(() => {
    stop();
    elapsedRef.current = 0;
    lastTsRef.current = 0;
    progressRef.current = 0;
    paint(0);
    setPhase('developing');
    const step = (ts: number) => {
      if (lastTsRef.current === 0) lastTsRef.current = ts;
      // Cap the per-frame delta so a hidden tab resumes where it paused instead of jumping to the end.
      const delta = Math.min(50, ts - lastTsRef.current);
      lastTsRef.current = ts;
      elapsedRef.current += delta;
      const p = Math.min(1, elapsedRef.current / Math.max(1, duration));
      progressRef.current = p;
      paint(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = 0;
        setPhase('done');
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [duration, paint, stop]);

  /* Replay, own button or page-level: under reduced motion it paints the finished strip, as the first develop does. */
  const replay = useCallback(() => (prefersReducedMotion() ? finish() : run()), [finish, run]);

  /* Start once: data ready and the frame in view. */
  useEffect(() => {
    if (status !== 'ready' || !visible || startedRef.current) return;
    startedRef.current = true;
    if (!develop || prefersReducedMotion()) finish();
    else run();
  }, [status, visible, develop, finish, run]);

  useEffect(() => stop, [stop]);

  /* A page-level Replay for this group restarts the develop (once the data is here). */
  useEffect(() => {
    if (!develop || !replayGroup) return;
    const onReplay = (e: Event) => {
      const group = (e as CustomEvent<{ group?: string }>).detail?.group;
      if (group !== replayGroup || status !== 'ready') return;
      startedRef.current = true;
      replay();
    };
    document.addEventListener('spectrogram:replay', onReplay);
    return () => document.removeEventListener('spectrogram:replay', onReplay);
  }, [develop, replayGroup, status, replay]);

  /* The loaded raster wins; before it (and on the server) the build-time axes print the same ticks. */
  const ax: RasterAxes | null = raster ?? axesProp ?? null;
  const fTicks = useMemo(() => (ax ? frequencyTicks(ax, 5) : []), [ax]);
  const tTicks = useMemo(() => (ax ? timeTicks(ax, 6) : []), [ax]);

  const frameLabel = label ?? `PPG · ${variant.toUpperCase()}`;
  const hasStack = Boolean(what || result || consequence);
  const stageAspect = aspect ?? (develop ? '16 / 9' : '16 / 6');

  const altText = useMemo(() => {
    if (!ax) return `${variant.toUpperCase()} spectrogram of a smartwatch PPG recording, loading`;
    const [fLo, fHi] = ax.fDomain;
    const [tLo, tHi] = ax.tDomain;
    return `${variant.toUpperCase()} spectrogram of a ${recordingS ?? formatDecimal(tHi - tLo, 0)} s smartwatch PPG recording, ${formatDecimal(fLo, 1)} to ${formatDecimal(fHi, 1)} Hz${ax.scale === 'log' ? ' on a log axis' : ''}, power in dB on a viridis scale from ${formatDecimal(ax.dbLo, 0)} to ${formatDecimal(ax.dbHi, 0)} dB`;
  }, [ax, variant, recordingS]);

  const classes = [
    bare ? 'pulse--bare' : 'frame',
    'pulse',
    develop ? 'pulse--develop' : 'pulse--static',
    classA,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <figure
      ref={rootRef}
      id={id}
      className={classes}
      data-island={develop ? 'SpectrogramDevelop' : 'CwtStrip'}
      data-variant={variant}
      data-phase={phase}
      aria-labelledby={what ? headingId : undefined}
    >
      {!bare && <span className="frame__corner frame__corner--tl frame__corner--caps">{frameLabel}</span>}
      <span className="frame__corner frame__corner--tr pulse__readout" aria-live="off">
        <span className="pulse__readout-k">t</span>
        <span ref={readoutRef}>{status === 'ready' ? '' : ax ? formatSeconds(Math.max(0, ax.tDomain[0]), 2) : '—'}</span>
      </span>

      <div className="pulse__plot">
        <span className="pulse__unit-f t-label">Hz</span>
        <div className="pulse__y" aria-hidden="true">
          {fTicks.map((tk) => (
            <span key={tk.value} style={{ top: `${(tk.frac * 100).toFixed(3)}%` }}>
              {tk.label}
            </span>
          ))}
        </div>
        <div className="pulse__stage" ref={stageRef} style={{ aspectRatio: stageAspect }}>
          <canvas ref={canvasRef} className="pulse__canvas" role="img" aria-label={altText} />
          {develop && <div ref={playheadRef} className="pulse__playhead" data-on={phase === 'developing'} />}
          {status === 'loading' && mounted && (
            <div className="pulse__state" role="status">
              <p>
                loading {variant}.bin
                {spec ? ` (${formatDecimal(spec.byteLength / 1024, 0)} kB)` : ''}
              </p>
            </div>
          )}
          {status === 'error' && (
            <div className="pulse__state pulse__state--error" role="alert">
              <p>The spectrogram data did not load{error ? `: ${error}` : ''}.</p>
              <div>
                <button type="button" className="pulse__btn" onClick={() => setAttempt((n) => n + 1)}>
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="pulse__x" aria-hidden="true">
          {tTicks.map((tk, i) => (
            <span
              key={tk.value}
              className={tk.frac > 0.96 ? 'pulse__tick--end' : undefined}
              style={{ left: `${(tk.frac * 100).toFixed(3)}%` }}
            >
              {i === tTicks.length - 1 ? `${tk.label} s` : tk.label}
            </span>
          ))}
        </div>
      </div>

      <div className="pulse__bar">
        <span className="pulse__scale" aria-label={ax ? `Colour scale, ${formatDecimal(ax.dbLo, 0)} to ${formatDecimal(ax.dbHi, 0)} dB` : undefined}>
          <span>{ax ? formatDecimal(ax.dbLo, 0) : '—'}</span>
          <span className="pulse__scale-bar" style={{ backgroundImage: VIRIDIS_BAR }} aria-hidden="true" />
          <span>{ax ? formatDecimal(ax.dbHi, 0) : '—'}</span>
          <span className="pulse__scale-unit">dB</span>
        </span>
        {develop && !replayGroup && (
          <button
            type="button"
            className="pulse__btn"
            onClick={replay}
            disabled={status !== 'ready'}
            aria-label="Replay the development of the spectrogram"
          >
            <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: replayIcon }} />
            Replay
          </button>
        )}
      </div>

      {hasStack && (
        <figcaption className="frame__stack">
          {what && (
            <h3 className="frame__what" id={headingId}>
              {what}
            </h3>
          )}
          {result && <p className="frame__result">{result}</p>}
          {consequence && <p className="frame__consequence">{consequence}</p>}
        </figcaption>
      )}
    </figure>
  );
}

export function SpectrogramDevelop(props: SpectrogramDevelopProps) {
  return <SpectrogramCore {...props} develop />;
}

export type CwtStripProps = Omit<SpectrogramDevelopProps, 'variant' | 'duration'>;

/** Static CWT scalogram (log frequency axis) for a side-by-side with the STFT. */
export function CwtStrip(props: CwtStripProps) {
  return <SpectrogramCore {...props} variant="cwt" develop={false} />;
}

export default SpectrogramDevelop;
