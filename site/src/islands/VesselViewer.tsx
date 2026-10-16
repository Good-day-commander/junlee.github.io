/*
  VesselViewer: the PINO-DEMO-01 coronary vessel, pressure-painted, read
  through a vertical CFD | PINO wipe.

  Public API
    <VesselViewer manifestUrl="/data/pino/manifest.json" mode="hero" onState={...} />
    props    manifestUrl   manifest; vessel.bin is resolved next to it
             mode          'hero' (fills its positioned parent, vessel from
                           left-centre to the right edge, pressure only) or
                           'chapter' (16/10 frame, centred, field toggle)
             onState       called on every state change, including each
                           develop frame so a readout can count 0 → 1.78 s
             initialWipe   handle position 0..1 (default 0.5)
             developDelayMs  pause after first visibility before the develop
             fallbackSrc   static raster when WebGL is missing (default:
                           vessel-static.png next to the manifest)
             control       'auto' (default): wipe handle on frames 640 px
                           and wider, a two-state CFD | PINO toggle below;
                           'handle' or 'toggle' forces one
             quiet         the home plate: pressure only, no field toggle,
                           no field note, no idle drift, no orbit, the
                           vessel cropped at the distal FFR probe plane
                           (scene.ts setClipDistal); the wipe
                           (handle or two-state), the colorbar with its ticks
                           and the develop (once, snapped under reduced
                           motion) stay
             summary       { case_id, vertexCount, ranges } from the
                           manifest, so the server render prints the
                           colorbar ticks and the loading line; defaults to
                           a build-time copy when manifestUrl is the shipped
                           /data/pino/manifest.json
    state    ViewerState { wipe, field, ready, webgl, develop, elapsedS,
             developDone, error? }
             wipe: handle position from the left edge; CFD is painted left
             of it, PINO right of it (0 = all PINO, 1 = all CFD).
    events   window 'vesselviewer:state' (CustomEvent<ViewerState>) mirrors
             onState so a sibling island (FfrCurve followViewer) can listen.

  Interaction
    handle   pointer drag, arrow keys (2 %), Shift+arrows / PageUp/Down
             (10 %), Home/End; role=slider with aria-valuenow 0..100
    canvas   pointer drag orbits; wheel is untouched so the page scrolls;
             vertical touch pans scroll the page (touch-action: pan-y)
    narrow   under 640 px the handle gives way to a two-state CFD | PINO
             toggle (44 px tall) that tweens the wipe to either edge. In
             chapter mode the chrome also leaves the image: the colorbar
             turns horizontal and sits in a row under the canvas, with the
             field toggle and the two-state in a second row, so nothing is
             printed over the vessel or over another control. The row
             layout is a container query on the root, so the server HTML
             already reserves its space.
    motion   develop 1.78 s on first visibility (snaps under reduced
             motion); idle drift one revolution per 60 s, paused offscreen,
             on document.hidden, during drags and under reduced motion
             (never in quiet mode)
    framing  the camera is fitted to the vessel's projected bounding box
             (scene.ts): centred at 42 % of the frame height, 8 %–92 % of
             the width, clear of the colorbar column; refitted on resize
    fields   error is PINO − CFD on a fixed symmetric scale (the 99th
             percentile of |p_err| rounded up to 0.5 kPa, colors.ts), with
             one mono note under the field toggle saying what it shows;
             in chapter mode all three colorbars and both notes are in the
             server HTML, the ones not chosen carrying the hidden
             attribute, so every number the plate can show is in the
             static page (packet §7);
             the speed arrays are a second file (vessel-speed.bin),
             requested the first time Speed or Error is chosen, so the
             quiet home plate never downloads them
    fallback no WebGL → the static PNG (or a labelled frame) and the same
             DOM colorbar; never a blank
*/
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cssDivergingGradient, cssGradient } from '@/lib/colormaps';
import { formatInt, formatPaRange } from '@/lib/format';
import { fieldColors, fieldNote, legendFor, type FieldColors, type Legend } from './vessel/colors';
import { summaryFor, summaryOf, type ViewerSummary } from './vessel/summary';
import {
  developMs,
  fallbackImageUrl,
  loadManifest,
  loadVessel,
  loadSpeed,
  hasSpeed,
  VIEWER_STATE_EVENT,
  type PinoManifest,
  type VesselData,
  type ViewerField,
} from './vessel/data';
import { hasWebGL, VesselScene } from './vessel/scene';
import s from './vessel/viewer.module.css';

export type { ViewerField } from './vessel/data';
export { VIEWER_STATE_EVENT } from './vessel/data';
export type { ViewerSummary } from './vessel/summary';

export interface ViewerState {
  /** Handle position from the left edge: CFD left of it, PINO right. 0 = all PINO, 1 = all CFD. */
  wipe: number;
  field: ViewerField;
  /** True once the manifest and buffers are loaded and the first frame drew. */
  ready: boolean;
  /** False when the static fallback is showing. */
  webgl: boolean;
  /** Develop progress 0..1 (PINO side resolving from the CFD colors). */
  develop: number;
  /** Develop progress in seconds, counting to the measured inference time. */
  elapsedS: number;
  developDone: boolean;
  error?: string;
}

export interface VesselViewerProps {
  manifestUrl: string;
  mode?: 'hero' | 'chapter';
  onState?: (s: ViewerState) => void;
  initialWipe?: number;
  developDelayMs?: number;
  fallbackSrc?: string;
  /** Wipe control: 'auto' picks the handle at 640 px and wider, the two-state toggle below. */
  control?: 'auto' | 'handle' | 'toggle';
  /** Home plate: pressure only, wipe and colorbar, no toggle, note, drift or orbit. */
  quiet?: boolean;
  /** Manifest values for the server render (colorbar ticks, loading line). */
  summary?: ViewerSummary;
  className?: string;
}

type Status = 'loading' | 'ready' | 'error' | 'nowebgl';

const FIELDS: Array<{ id: ViewerField; label: string }> = [
  { id: 'pressure', label: 'Pressure' },
  { id: 'error', label: 'Error' },
  { id: 'speed', label: 'Speed' },
];

/* Matches the container query in viewer.module.css (rows layout below 640 px). */
const COMPACT_PX = 640;
const ORBIT_RAD_PER_PX = 0.005;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function VesselViewer({
  manifestUrl,
  mode = 'hero',
  onState,
  initialWipe = 0.5,
  developDelayMs = 250,
  fallbackSrc,
  control = 'auto',
  quiet = false,
  summary: summaryProp,
  className,
}: VesselViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<VesselScene | null>(null);
  const dataRef = useRef<VesselData | null>(null);
  const colorsRef = useRef<FieldColors | undefined>(undefined);
  const onStateRef = useRef(onState);
  onStateRef.current = onState;

  const [status, setStatus] = useState<Status>('loading');
  const [errorText, setErrorText] = useState<string>('');
  const [manifest, setManifest] = useState<PinoManifest | null>(null);
  const [wipe, setWipeState] = useState(clamp01(initialWipe));
  const [field, setFieldState] = useState<ViewerField>('pressure');
  const [compact, setCompact] = useState(false);
  const [dragging, setDragging] = useState<'none' | 'wipe' | 'orbit'>('none');
  const [reduced, setReduced] = useState(false);
  /* The loading line is printed only after hydration, never in the static markup (no JS: no false promise). */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Mutable mirror of the state for emit() and the scene callbacks.
  const live = useRef<ViewerState>({
    wipe: clamp01(initialWipe),
    field: 'pressure',
    ready: false,
    webgl: true,
    develop: 0,
    elapsedS: 0,
    developDone: false,
  });
  const developStarted = useRef(false);
  const visibleRef = useRef(false);
  const developTimer = useRef<number>(0);

  const emit = useCallback((patch: Partial<ViewerState>) => {
    const next = { ...live.current, ...patch };
    live.current = next;
    onStateRef.current?.(next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<ViewerState>(VIEWER_STATE_EVENT, { detail: next }));
    }
  }, []);

  const applyField = useCallback((next: ViewerField) => {
    const data = dataRef.current;
    const scene = sceneRef.current;
    if (!data || !scene) return;
    colorsRef.current = fieldColors(data, next, colorsRef.current);
    scene.setColors(colorsRef.current.a, colorsRef.current.b, colorsRef.current.wipe);
  }, []);

  const maybeDevelop = useCallback(() => {
    const scene = sceneRef.current;
    const data = dataRef.current;
    if (!scene || !data || developStarted.current || !visibleRef.current) return;
    developStarted.current = true;
    const duration = developMs(data.manifest);
    const start = () => scene.startDevelop(duration);
    if (developDelayMs > 0) {
      developTimer.current = window.setTimeout(start, developDelayMs);
    } else {
      start();
    }
  }, [developDelayMs]);

  /* Scene lifetime: renderer, observers, data. */
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!root || !stage || !canvas) return;
    const ac = new AbortController();
    let cancelled = false;

    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(rm.matches);

    const webgl = hasWebGL();
    let scene: VesselScene | null = null;
    if (webgl) {
      try {
        scene = new VesselScene(canvas, mode, {
          onDevelop: (t, elapsedMs) =>
            emit({ develop: t, elapsedS: elapsedMs / 1000, developDone: t >= 1 }),
          onDevelopDone: () => emit({ develop: 1, developDone: true }),
          onWipe: (w) => {
            setWipeState(w);
            emit({ wipe: w });
          },
          onContextLost: () => {
            setStatus('nowebgl');
            emit({ webgl: false, ready: false });
          },
        });
        scene.setReducedMotion(rm.matches);
        scene.setWipe(live.current.wipe);
        // Idle drift stays on everywhere, home plate included (owner, 2026-10-17).
        if (quiet) {
          // The stretch past the distal FFR probe sits on the floor of the range (a grey stub): cropped on the plate.
          scene.setClipDistal(true);
        }
      } catch {
        scene = null;
      }
    }
    sceneRef.current = scene;
    if (!scene) {
      setStatus('nowebgl');
      live.current = { ...live.current, webgl: false };
    }

    const onReduced = (e: MediaQueryListEvent) => {
      setReduced(e.matches);
      scene?.setReducedMotion(e.matches);
    };
    rm.addEventListener('change', onReduced);

    /*
      The colorbar column (strip and tick labels) when it sits over the
      image, so the framing keeps the vessel clear of it; 0 when the bar
      sits in the rows under the image. The label above the bar is left out:
      it sits above the bar's top tick, beside the vessel's upper edge.
    */
    const colorbarInset = (r: DOMRect): number => {
      const bar = root.querySelector<HTMLElement>('[data-colorbar]:not([hidden])');
      if (!bar || getComputedStyle(bar).position !== 'absolute') return 0;
      let left = Infinity;
      bar.querySelectorAll<HTMLElement>('[data-strip], li').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.width > 0) left = Math.min(left, b.left);
      });
      return Number.isFinite(left) ? Math.max(0, r.right - left + 8) : 0;
    };

    // The root's width picks the layout; the stage (the canvas box) sizes the renderer.
    const ro = new ResizeObserver(() => {
      setCompact(root.clientWidth < COMPACT_PX);
      const r = stage.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        scene?.setInsets(colorbarInset(r));
        scene?.setSize(r.width, r.height, window.devicePixelRatio || 1);
      }
    });
    ro.observe(root);
    ro.observe(stage);

    const syncActive = () => scene?.setActive(visibleRef.current && !document.hidden);
    const io = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries.some((e) => e.isIntersecting);
        syncActive();
        if (visibleRef.current) maybeDevelop();
      },
      { threshold: 0.12 },
    );
    io.observe(root);
    document.addEventListener('visibilitychange', syncActive);

    (async () => {
      try {
        const m = await loadManifest(manifestUrl, ac.signal);
        if (cancelled) return;
        setManifest(m);
        if (!scene) return;
        const data = await loadVessel(m, manifestUrl, ac.signal);
        if (cancelled) return;
        dataRef.current = data;
        {
          const r = stage.getBoundingClientRect();
          if (r.width > 0) scene.setInsets(colorbarInset(r));
        }
        scene.setGeometry(data);
        applyField(live.current.field);
        scene.renderNow();
        setStatus('ready');
        emit({ ready: true, webgl: true });
        maybeDevelop();
      } catch (err) {
        if (cancelled || ac.signal.aborted) return;
        const message = err instanceof Error ? err.message : String(err);
        setErrorText(message);
        setStatus('error');
        emit({ ready: false, error: message });
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
      window.clearTimeout(developTimer.current);
      rm.removeEventListener('change', onReduced);
      document.removeEventListener('visibilitychange', syncActive);
      ro.disconnect();
      io.disconnect();
      scene?.dispose();
      sceneRef.current = null;
      dataRef.current = null;
    };
  }, [manifestUrl, mode, quiet, applyField, emit, maybeDevelop]);

  const useToggle = control === 'toggle' || (control === 'auto' && compact);

  /* Narrow frames start on the PINO side so the develop is visible. */
  const compactInit = useRef(false);
  useEffect(() => {
    if (!useToggle || compactInit.current) return;
    compactInit.current = true;
    if (live.current.wipe > 0 && live.current.wipe < 1) {
      sceneRef.current?.setWipe(0);
      setWipeState(0);
      emit({ wipe: 0 });
    }
  }, [useToggle, emit]);

  const setWipe = useCallback(
    (v: number) => {
      const w = clamp01(v);
      sceneRef.current?.setWipe(w);
      setWipeState(w);
      emit({ wipe: w });
    },
    [emit],
  );

  /* The speed chunk, fetched once on demand (Speed or Error chosen); never in quiet mode. */
  const speedLoad = useRef<{ data: VesselData; promise: Promise<void> } | null>(null);
  const ensureSpeed = useCallback((): Promise<void> => {
    const data = dataRef.current;
    if (!data || hasSpeed(data)) return Promise.resolve();
    if (speedLoad.current?.data !== data) {
      const promise = loadSpeed(data, manifestUrl).catch((err) => {
        speedLoad.current = null;
        throw err;
      });
      speedLoad.current = { data, promise };
    }
    return speedLoad.current.promise;
  }, [manifestUrl]);

  const setField = useCallback(
    (f: ViewerField) => {
      if (quiet || f === live.current.field) return;
      setFieldState(f);
      emit({ field: f });
      const data = dataRef.current;
      if (f === 'speed' && data && !hasSpeed(data)) {
        // Paint once the chunk arrives, unless the reader has moved on; on failure fall back to pressure.
        ensureSpeed().then(
          () => {
            if (live.current.field === 'speed') applyField('speed');
          },
          () => {
            if (live.current.field !== 'speed') return;
            setFieldState('pressure');
            applyField('pressure');
            emit({ field: 'pressure' });
          },
        );
        return;
      }
      applyField(f);
      // Error is one click from Speed: warm the chunk so Speed paints at once.
      if (f === 'error') ensureSpeed().catch(() => undefined);
    },
    [quiet, applyField, emit, ensureSpeed],
  );

  /* Handle drag */
  const onHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const stage = stageRef.current;
    if (!stage) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLDivElement).focus({ preventScroll: true });
    const rect = stage.getBoundingClientRect();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    setDragging('wipe');
    sceneRef.current?.setDragging(true);
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      setWipe((ev.clientX - rect.left) / rect.width);
    };
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
      setDragging('none');
      sceneRef.current?.setDragging(false);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
    setWipe((e.clientX - rect.left) / rect.width);
  };

  const onHandleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const w = live.current.wipe;
    let next: number | null = null;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        next = w - step;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        next = w + step;
        break;
      case 'PageDown':
        next = w - 0.1;
        break;
      case 'PageUp':
        next = w + 0.1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    setWipe(next);
  };

  /* Orbit drag anywhere else on the image */
  const onStagePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const scene = sceneRef.current;
    if (quiet || !scene || status !== 'ready') return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const el = e.target as HTMLElement;
    if (el.closest('button, [role="slider"], a')) return;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    let lastX = e.clientX;
    let lastY = e.clientY;
    setDragging('orbit');
    scene.setDragging(true);
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      scene.orbitBy((ev.clientX - lastX) * ORBIT_RAD_PER_PX, (ev.clientY - lastY) * ORBIT_RAD_PER_PX);
      lastX = ev.clientX;
      lastY = ev.clientY;
    };
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
      setDragging('none');
      scene.setDragging(false);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  };

  const onTwoState = (side: 'cfd' | 'pino') => {
    const to = side === 'cfd' ? 1 : 0;
    const scene = sceneRef.current;
    if (scene) scene.tweenWipe(to, reduced ? 0 : 400);
    else setWipe(to);
  };

  /* The loaded manifest wins; before it arrives (and on the server) the summary prints the same numbers. */
  const summary: ViewerSummary | undefined = useMemo(
    () => (manifest ? summaryOf(manifest) : (summaryProp ?? summaryFor(manifestUrl))),
    [manifest, summaryProp, manifestUrl],
  );
  /*
    Every bar the plate can show, each with both orientations of its strip
    (vertical over the image, horizontal in the rows layout). The quiet
    plate has pressure only; the chapter viewer renders all three and hides
    the ones not chosen, so their ticks are in the server HTML.
  */
  const barFields: ViewerField[] = useMemo(
    () => (mode === 'chapter' && !quiet ? FIELDS.map((f) => f.id) : ['pressure']),
    [mode, quiet],
  );
  const bars = useMemo(() => {
    if (!summary) return [];
    return barFields.map((f) => {
      const lg = legendFor(f, summary);
      const g = (dir: 'to top' | 'to right') =>
        lg.colormap === 'diverging' ? cssDivergingGradient(24, lg.overFraction, dir) : cssGradient(lg.colormap, 24, dir);
      return { field: f, legend: lg, gradients: { v: g('to top'), h: g('to right') } };
    });
  }, [summary, barFields]);
  const legend: Legend | null = bars.find((b) => b.field === field)?.legend ?? null;

  const showHandle = status === 'ready' && field !== 'error' && !useToggle;
  const showTwoState = status === 'ready' && field !== 'error' && useToggle;
  const showFields = mode === 'chapter' && !quiet && status === 'ready';
  /* Notes for the error and speed fields (chapter only), shown while their field is chosen. */
  const notes =
    mode === 'chapter' && !quiet && summary
      ? FIELDS.map((f) => ({ field: f.id, text: fieldNote(f.id, summary) })).filter((n) => n.text)
      : [];
  const pct = Math.round(wipe * 100);
  /* The case identifier stays in the manifest; readers see "a patient's coronary vessel" (owner, 2026-10-17). */
  const subject = "A patient's coronary vessel";
  const nodes = summary ? formatInt(summary.vertexCount) : '';
  const pRange = summary ? formatPaRange(summary.ranges.p[0], summary.ranges.p[1]) : '';
  const fallback = fallbackSrc ?? fallbackImageUrl(manifestUrl);

  /*
    Screen-reader summary of the canvas. Quiet (the home plate) prints none:
    the host page captions the plate in Astro (case, nodes, FFR, inference)
    and the colorbar's own label carries the field and its range, so a
    third copy would only be read twice.
  */
  const legendLine = legend?.summary ? legend.summary.charAt(0).toLowerCase() + legend.summary.slice(1) : '';
  const srSummary = quiet
    ? ''
    : summary
      ? `${subject}, ${nodes} surface nodes: ${legendLine} CFD is on the left and PINO on the right; slide or toggle to compare.`
      : `${subject}: surface pressure, CFD against PINO.`;

  return (
    <div
      ref={rootRef}
      className={[s.root, className].filter(Boolean).join(' ')}
      data-island="VesselViewer"
      data-mode={mode}
      data-status={status}
      data-dragging={dragging}
      data-field={field}
      data-control={useToggle ? 'toggle' : 'handle'}
      data-quiet={quiet ? 'true' : undefined}
      role="group"
      aria-label="Coronary vessel viewer, CFD against the neural operator"
      aria-busy={status === 'loading' || undefined}
    >
      {srSummary && <p className={s.srOnly}>{srSummary}</p>}

      <div className={s.layout}>
        <div ref={stageRef} className={s.stage} onPointerDown={onStagePointerDown}>
          <canvas ref={canvasRef} className={s.canvas} aria-hidden="true" />

          {status === 'nowebgl' && (
            <img
              className={s.fallback}
              src={fallback}
              alt={`${subject} coloured by surface pressure ${pRange}, CFD on the left half and PINO on the right.`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                setErrorText('WebGL is unavailable in this browser');
                setStatus('error');
              }}
            />
          )}

          {status === 'loading' && mounted && (
            <p className={s.status} aria-live="polite">
              {quiet ? (
                /* Quiet: the host caption under the plate already prints the case and node count. */
                'loading'
              ) : (
                <>{nodes ? `loading the vessel, ${nodes} nodes` : 'loading the vessel'}</>
              )}
            </p>
          )}
          {status === 'error' && (
            <p className={s.status} role="status">
              {errorText ? `the vessel did not load: ${errorText}` : 'the vessel did not load'}
              <br />
              {pRange ? `surface pressure ${pRange}` : 'reload the page to try again'}
            </p>
          )}

          {showHandle && (
            <div
              className={s.handle}
              role="slider"
              tabIndex={0}
              aria-label="CFD | PINO wipe"
              aria-orientation="horizontal"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-valuetext={`CFD left ${pct} %, PINO right ${100 - pct} %`}
              style={{ left: `${wipe * 100}%` } as CSSProperties}
              onPointerDown={onHandlePointerDown}
              onKeyDown={onHandleKeyDown}
            >
              <span className={s.grip} aria-hidden="true">
                <span>CFD</span>
                <span className={s.gripBar} />
                <span>PINO</span>
              </span>
            </div>
          )}
        </div>

        {/*
          Chrome: over the image on wide frames (absolute, pointer-events
          only on the controls); under it, in rows, on narrow chapter frames.
        */}
        <div className={s.chrome}>
          {bars.map(({ field: f, legend: lg, gradients }) => (
            <div
              key={f}
              className={s.colorbar}
              data-colorbar=""
              data-field={f}
              hidden={f !== field || undefined}
              role="img"
              aria-label={`Colorbar: ${lg.summary}`}
              style={{ '--cb-v': gradients.v, '--cb-h': gradients.h } as CSSProperties}
            >
              <span className={s.cbLabel} data-long={lg.joiner ? 'true' : undefined}>
                <span className={s.cbName}>{lg.name}</span>
                {lg.joiner ? <span className={s.joiner}>{lg.joiner}</span> : ' '}
                <span className={s.unit}>{lg.unit}</span>
              </span>
              <ol className={s.ticks} aria-hidden="true">
                {lg.ticks.map((t) => (
                  <li
                    key={t.t}
                    className={s.tick}
                    data-over={t.over ? 'true' : undefined}
                    data-edge={t.t <= 0.001 ? 'start' : t.t >= 0.999 ? 'end' : undefined}
                    style={{ '--t': t.t } as CSSProperties}
                  >
                    {t.text}
                  </li>
                ))}
              </ol>
              <div className={s.strip} data-strip="" />
            </div>
          ))}

          {(showFields || showTwoState) && (
            <div className={s.controls}>
              {showFields && (
                <fieldset className={`${s.segment} ${s.fields}`}>
                  <legend>Field</legend>
                  {FIELDS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={s.segBtn}
                      aria-pressed={field === f.id}
                      onClick={() => setField(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </fieldset>
              )}
              {showTwoState && (
                <fieldset className={`${s.segment} ${s.twoState}`}>
                  <legend>Shown solution</legend>
                  <button
                    type="button"
                    className={s.segBtn}
                    aria-pressed={wipe >= 0.5}
                    onClick={() => onTwoState('cfd')}
                  >
                    CFD
                  </button>
                  <button
                    type="button"
                    className={s.segBtn}
                    aria-pressed={wipe < 0.5}
                    onClick={() => onTwoState('pino')}
                  >
                    PINO
                  </button>
                </fieldset>
              )}
            </div>
          )}

          {notes.map((n) => (
            <p key={n.field} className={s.note} data-field={n.field} hidden={!(showFields && field === n.field) || undefined}>
              {n.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VesselViewer;
