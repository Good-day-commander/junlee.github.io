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
import { fieldColors, legendFor, type FieldColors, type Legend } from './vessel/colors';
import {
  developMs,
  fallbackImageUrl,
  loadManifest,
  loadVessel,
  VIEWER_STATE_EVENT,
  type PinoManifest,
  type VesselData,
  type ViewerField,
} from './vessel/data';
import { hasWebGL, VesselScene } from './vessel/scene';
import s from './vessel/viewer.module.css';

export type { ViewerField } from './vessel/data';
export { VIEWER_STATE_EVENT } from './vessel/data';

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

    // The root's width picks the layout; the stage (the canvas box) sizes the renderer.
    const ro = new ResizeObserver(() => {
      setCompact(root.clientWidth < COMPACT_PX);
      const r = stage.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) scene?.setSize(r.width, r.height, window.devicePixelRatio || 1);
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
  }, [manifestUrl, mode, applyField, emit, maybeDevelop]);

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

  const setField = useCallback(
    (f: ViewerField) => {
      if (f === live.current.field) return;
      setFieldState(f);
      applyField(f);
      emit({ field: f });
    },
    [applyField, emit],
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
    if (!scene || status !== 'ready') return;
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

  const legend: Legend | null = useMemo(
    () => (manifest ? legendFor(field, manifest) : null),
    [manifest, field],
  );
  /* Both orientations: the strip is vertical over the image, horizontal in the rows layout. */
  const gradients = useMemo(() => {
    if (!legend) return undefined;
    const g = (dir: 'to top' | 'to right') =>
      legend.colormap === 'diverging'
        ? cssDivergingGradient(24, legend.overFraction, dir)
        : cssGradient(legend.colormap, 24, dir);
    return { v: g('to top'), h: g('to right') };
  }, [legend]);

  const showHandle = status === 'ready' && field !== 'error' && !useToggle;
  const showTwoState = status === 'ready' && field !== 'error' && useToggle;
  const showFields = mode === 'chapter' && status === 'ready';
  const pct = Math.round(wipe * 100);
  const caseId = manifest?.case_id ?? 'PINO-DEMO-01';
  const nodes = manifest ? formatInt(manifest.vertexCount) : '8 649';
  const pRange = manifest ? formatPaRange(manifest.ranges.p[0], manifest.ranges.p[1]) : '';
  const fallback = fallbackSrc ?? fallbackImageUrl(manifestUrl);

  const srSummary = manifest
    ? `${caseId}, a coronary vessel surface of ${nodes} nodes painted with ${legend?.summary ?? ''} CFD is shown left of the wipe handle, PINO right of it.`
    : `${caseId}, coronary vessel surface pressure, CFD against PINO.`;

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
      role="group"
      aria-label={`${caseId} vessel viewer`}
      aria-busy={status === 'loading' || undefined}
    >
      <p className={s.srOnly}>{srSummary}</p>

      <div className={s.layout}>
        <div ref={stageRef} className={s.stage} onPointerDown={onStagePointerDown}>
          <canvas ref={canvasRef} className={s.canvas} aria-hidden="true" />

          {status === 'nowebgl' && (
            <img
              className={s.fallback}
              src={fallback}
              alt={`${caseId}: vessel surface coloured by pressure ${pRange}, CFD on the left half and PINO on the right.`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                setErrorText('WebGL is unavailable in this browser');
                setStatus('error');
              }}
            />
          )}

          {status === 'loading' && (
            <p className={s.status} aria-live="polite">
              <strong>{caseId}</strong>
              <br />
              loading {nodes} nodes
            </p>
          )}
          {status === 'error' && (
            <p className={s.status} role="status">
              <strong>{caseId}</strong>
              <br />
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
          {legend && gradients && (
            <div
              className={s.colorbar}
              role="img"
              aria-label={`Colorbar: ${legend.summary}`}
              style={{ '--cb-v': gradients.v, '--cb-h': gradients.h } as CSSProperties}
            >
              <span className={s.cbLabel}>
                {legend.name} <span className={s.unit}>{legend.unit}</span>
              </span>
              <ol className={s.ticks} aria-hidden="true">
                {legend.ticks.map((t) => (
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
              <div className={s.strip} />
            </div>
          )}

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

          {mode === 'chapter' && status === 'ready' && field === 'speed' && (
            <p className={s.note}>
              Inlet and outlet caps are masked: the wall is no-slip, so surface speed is the first
              interior node&rsquo;s, and cap vertices carry an interior value on a different range.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VesselViewer;
