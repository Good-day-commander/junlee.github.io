/*
  PhaseScrubber: Case 1 of the 4D coronary CT paper (J1, Fig. 8) through
  one cardiac cycle, phase by phase, on a light-box plate inside the film
  frame. Two phases are acquired CT (marked on the rail); the eight between
  them were synthesized by the diffusion deformable model and then solved
  with CFD. The frames are the authors' own renders; this island only
  chooses which one is on the light box.

  Public API
    <PhaseScrubber client:visible manifestUrl="/data/image/manifest.json"
                   manifest={imageManifest} field="pressure" compact />
    props  manifestUrl  manifest.json; frame files resolve next to it
           manifest     optional build-time copy of the same JSON, so the
                        server render already has the rail, legend and the
                        Phase 0 plate (no fetch, no layout shift)
           field        'pressure' (default) | 'wss'
           compact      plate + rail + readout only (home front): no field
                        toggle, no play button

  Interaction
    rail     pointer drag or click snaps to the nearest phase; the grip is a
             role=slider (arrows, Home/End, PageUp/Down)
    play     Play/Pause ghost loops the cycle at 6 fps (full mode)
    toggle   Pressure | WSS segmented control (full mode)
    motion   the cycle plays once on first visibility and stops at Phase 0;
             nothing plays by itself under prefers-reduced-motion, offscreen
             or on document.hidden
    loading  Phase 0 is a plain <img> in the server render; the other
             frames of the shown field are fetched and decoded on mount, the
             other field after that (full mode) or on toggle. Nothing is
             printed while they load.
    failure  a frame of the shown field that does not load (or a manifest
             that does not) prints one sentence, FAILED below, with Retry;
             the light box gives way to the film, and Play and the rail are
             disabled until the frames are in. The reason goes to the
             console only.
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
import playIcon from '@phosphor-icons/core/assets/regular/play.svg?raw';
import pauseIcon from '@phosphor-icons/core/assets/regular/pause.svg?raw';
import { cssGradient } from '@/lib/colormaps';
import { formatDecimal, formatInt } from '@/lib/format';
import {
  acquiredPhases,
  baseOf,
  KPA_PER_MMHG,
  phaseNote,
  type ImageField,
  type ImageManifest,
} from './image/manifest';
import s from './image/scrubber.module.css';

export interface PhaseScrubberProps {
  manifestUrl: string;
  /** Build-time copy of the manifest at manifestUrl; skips the fetch and renders the plate server-side. */
  manifest?: ImageManifest;
  field?: ImageField;
  compact?: boolean;
  class?: string;
}

const FPS = 6;
/* The one sentence a failed plate prints (owner-approved wording, 2026-10-21). */
const FAILED = 'The CT frames did not load.'; /* Retry sits under it */
const FIELDS: ImageField[] = ['pressure', 'wss'];
/* The paper renders both fields on ParaView's cool-to-warm map; the site's diverging map is the same Moreland ramp. */
const RAMP = cssGradient('diverging', 16, 'to right');

type Loaded = Record<ImageField, boolean[]>;

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function emptyLoaded(n: number): Loaded {
  return { pressure: Array(n).fill(false), wss: Array(n).fill(false) };
}

export default function PhaseScrubber({
  manifestUrl,
  manifest: initialManifest,
  field: initialField = 'pressure',
  compact = false,
  class: className,
}: PhaseScrubberProps) {
  const [manifest, setManifest] = useState<ImageManifest | null>(initialManifest ?? null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  /* A field whose frames did not all load; `retry` refetches them. */
  const [failed, setFailed] = useState<Record<ImageField, boolean>>({ pressure: false, wss: false });
  const [retry, setRetry] = useState(0);
  const [field, setField] = useState<ImageField>(initialField);
  const [phase, setPhase] = useState(0);
  const [play, setPlay] = useState<'off' | 'loop' | 'once'>('off');
  const [dragging, setDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [wanted, setWanted] = useState<ImageField[]>([initialField]);
  const [loaded, setLoaded] = useState<Loaded>(() => emptyLoaded(initialManifest?.phases ?? 10));

  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);
  const interactedRef = useRef(false);
  const autoplayedRef = useRef(false);
  const shownRef = useRef<{ field: ImageField; phase: number }>({ field: initialField, phase: 0 });

  const base = baseOf(manifestUrl);
  const count = manifest?.phases ?? 10;
  const last = count - 1;
  const acquired = useMemo(() => (manifest ? acquiredPhases(manifest) : []), [manifest]);
  const acquiredAt = (k: number) => acquired.find((a) => a.phase === k) ?? null;

  useEffect(() => setMounted(true), []);

  /* Manifest: the build-time copy when given, otherwise fetched. */
  useEffect(() => {
    if (initialManifest) return;
    const controller = new AbortController();
    setError(false);
    fetch(manifestUrl, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json() as Promise<ImageManifest>;
      })
      .then((m) => {
        setManifest(m);
        setLoaded(emptyLoaded(m.phases));
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        console.error('PhaseScrubber: the manifest did not load.', e);
        setError(true);
      });
    return () => controller.abort();
  }, [initialManifest, manifestUrl, attempt]);

  /* Fetch and decode every frame of each wanted field; a frame is drawn only once it is decoded. */
  useEffect(() => {
    if (!manifest || !mounted) return;
    let alive = true;
    for (const f of wanted) {
      manifest.fields[f].frames.forEach((file, i) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = base + file;
        const done = () => {
          if (!alive) return;
          setLoaded((prev) => {
            if (prev[f][i]) return prev;
            const next = { ...prev, [f]: prev[f].slice() };
            next[f][i] = true;
            return next;
          });
        };
        const fail = () => {
          if (!alive) return;
          console.error(`PhaseScrubber: a ${f} frame did not load (${img.src}).`);
          setFailed((prev) => (prev[f] ? prev : { ...prev, [f]: true }));
        };
        img.decode().then(done, () => {
          // decode() rejects on some engines for cached images; onload still means it is drawable.
          if (img.complete && img.naturalWidth > 0) done();
          else if (img.complete) fail();
          else {
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', fail, { once: true });
          }
        });
      });
    }
    return () => {
      alive = false;
    };
  }, [manifest, mounted, wanted, base, retry]);

  const readyField = (f: ImageField) => loaded[f].every(Boolean);
  const ready = readyField(field);
  /* The shown field is missing frames: the sentence and Retry replace the light box; Play and the rail wait. */
  const missing = failed[field];
  const retryFrames = () => {
    setFailed((prev) => ({ ...prev, [field]: false }));
    setLoaded((prev) => ({ ...prev, [field]: prev[field].map(() => false) }));
    setRetry((n) => n + 1);
  };

  /* Full mode: once the shown field is in, fetch the other one while the page is idle. */
  useEffect(() => {
    if (compact || !ready) return;
    const other = FIELDS.find((f) => f !== field);
    if (!other || wanted.includes(other)) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const add = () => setWanted((prev) => (prev.includes(other) ? prev : [...prev, other]));
    if (w.requestIdleCallback) w.requestIdleCallback(add);
    else window.setTimeout(add, 400);
  }, [compact, ready, field, wanted]);

  /* Visibility: pause offscreen; the first time the frame is in view, play the cycle once. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      inViewRef.current = true;
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) inViewRef.current = e.isIntersecting;
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!ready || autoplayedRef.current || reducedMotion()) return;
    const id = window.setInterval(() => {
      if (autoplayedRef.current) return window.clearInterval(id);
      if (!inViewRef.current || document.hidden) return;
      autoplayedRef.current = true;
      window.clearInterval(id);
      if (interactedRef.current) return;
      setPhase(0);
      setPlay('once');
    }, 200);
    return () => window.clearInterval(id);
  }, [ready]);

  /* Playback at FPS: 'once' runs one cycle and comes back to Phase 0; 'loop' runs until paused. */
  useEffect(() => {
    if (play === 'off') return;
    let steps = 0;
    const id = window.setInterval(() => {
      if (document.hidden || !inViewRef.current) return;
      steps += 1;
      setPhase((p) => (p + 1) % count);
      if (play === 'once' && steps >= count) setPlay('off');
    }, 1000 / FPS);
    return () => window.clearInterval(id);
  }, [play, count]);

  const interact = useCallback(() => {
    interactedRef.current = true;
    autoplayedRef.current = true;
    setPlay((p) => (p === 'once' ? 'off' : p));
  }, []);

  const go = useCallback(
    (k: number) => {
      setPhase(Math.max(0, Math.min(last, k)));
    },
    [last],
  );

  const phaseAt = useCallback(
    (clientX: number) => {
      const rail = railRef.current;
      if (!rail) return 0;
      const r = rail.getBoundingClientRect();
      const t = (clientX - r.left) / Math.max(1, r.width);
      return Math.round(Math.max(0, Math.min(1, t)) * last);
    },
    [last],
  );

  const onRailDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || missing) return;
    e.preventDefault();
    interact();
    setPlay('off');
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    go(phaseAt(e.clientX));
    gripRef.current?.focus({ preventScroll: true });
  };
  const onRailMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    go(phaseAt(e.clientX));
  };
  const onRailUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (missing) return;
    const step: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 3, PageDown: -3 };
    let next: number | null = null;
    if (e.key in step) next = phase + step[e.key];
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    interact();
    setPlay('off');
    go(next);
  };

  const togglePlay = () => {
    interact();
    setPlay((p) => (p === 'loop' ? 'off' : 'loop'));
  };

  const chooseField = (f: ImageField) => {
    interact();
    setField(f);
    setWanted((prev) => (prev.includes(f) ? prev : [...prev, f]));
  };

  /* Which frame is on the light box: the asked-for one once decoded, else the last one drawn. */
  const drawable = (f: ImageField, k: number) => (f === initialField && k === 0) || loaded[f][k];
  if (manifest && drawable(field, phase)) shownRef.current = { field, phase };
  const shown = shownRef.current;
  const waiting = shown.field !== field || shown.phase !== phase;

  const spec = manifest ? manifest.fields[field] : null;
  const acq = acquiredAt(phase);
  const stateWord = acq ? 'acquired' : 'synthesized';
  const stateLong = acq ? `acquired CT${acq.name ? `, ${acq.name}` : ''}` : 'synthesized';
  const pct = (k: number) => `${((k / Math.max(1, last)) * 100).toFixed(4)}%`;

  /*
    One legend per field, all in the server HTML: the shown field's is
    visible, the others carry `hidden` until the toggle picks them (so the
    WSS 0–5 Pa scale is in the static markup beside the pressure scale).
  */
  const legends = useMemo(() => {
    if (!manifest) return null;
    return FIELDS.map((f) => {
      const fs = manifest.fields[f];
      const [lo, hi] = fs.range;
      const second =
        fs.unit === 'mmHg' ? `${formatDecimal(lo * KPA_PER_MMHG, 1)}–${formatDecimal(hi * KPA_PER_MMHG, 1)} kPa` : null;
      return { field: f, lo: formatInt(lo), hi: formatInt(hi), unit: fs.unit, label: fs.label, second };
    });
  }, [manifest]);
  const legend = legends?.find((l) => l.field === field) ?? null;

  const plateLabel = spec
    ? `${manifest?.case ?? ''}, phase ${phase} of ${last} (${stateLong}): ${spec.label.toLowerCase()} on the coronary tree, ${legend?.lo} to ${legend?.hi} ${spec.unit}, blue to red.`
    : 'Coronary 4D CT phase render, loading';

  const fieldsToDraw = mounted ? wanted : [initialField];
  const note = manifest && !compact ? phaseNote(manifest) : null;

  if (!manifest) {
    return (
      <div ref={rootRef} className={[s.root, s.status, className].filter(Boolean).join(' ')} data-compact={compact}>
        {error && (
          <div className={s.failure} role="alert">
            <p>{FAILED}</p>
            <button type="button" className={s.ghost} onClick={() => setAttempt((n) => n + 1)}>
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  const plate = (
    <div className={s.plate} data-waiting={waiting} data-failed={missing || undefined}>
      <span className={`${s.corner} ${s.cornerTl} ${s.caps}`}>{spec?.label}</span>
      <span className={`${s.corner} ${s.cornerBr}`} data-acquired={Boolean(acq)}>
        {stateLong}
      </span>
      <div className={s.stage} role="img" aria-label={plateLabel}>
        {fieldsToDraw.map((f) =>
          manifest.fields[f].frames.map((file, k) =>
            drawable(f, k) ? (
              <img
                key={`${f}-${k}-${retry}`}
                className={s.frame}
                src={base + file}
                width={manifest.width}
                height={manifest.height}
                alt=""
                decoding="async"
                loading={f === initialField && k === 0 ? 'eager' : 'lazy'}
                data-on={shown.field === f && shown.phase === k}
              />
            ) : null,
          ),
        )}
      </div>
      {missing && (
        <div className={s.failure} role="alert">
          <p>{FAILED}</p>
          <button type="button" className={s.ghost} onClick={retryFrames}>
            Retry
          </button>
        </div>
      )}
    </div>
  );

  const rail = (
    <div
      ref={railRef}
      className={s.rail}
      data-dragging={dragging}
      data-disabled={missing || undefined}
      onPointerDown={onRailDown}
      onPointerMove={onRailMove}
      onPointerUp={onRailUp}
      onPointerCancel={onRailUp}
    >
      <div className={s.track} aria-hidden="true" />
      <ol className={s.ticks} aria-hidden="true">
        {Array.from({ length: count }, (_, k) => (
          <li
            key={k}
            className={s.tick}
            style={{ left: pct(k) } as CSSProperties}
            data-acquired={Boolean(acquiredAt(k))}
            data-on={k === phase}
          >
            <span className={s.tickLabel}>P{k}</span>
            {acquiredAt(k) && <span className={s.tickCt}>CT</span>}
          </li>
        ))}
      </ol>
      <div
        ref={gripRef}
        className={s.grip}
        style={{ left: pct(phase) } as CSSProperties}
        role="slider"
        tabIndex={0}
        aria-label="Cardiac phase"
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={phase}
        aria-valuetext={`Phase ${phase} of ${last}, ${stateLong}`}
        aria-disabled={missing || undefined}
        onKeyDown={onKey}
      >
        P{phase}
      </div>
    </div>
  );

  const readout = (
    <p className={s.readout} aria-hidden="true">
      <span>
        Phase {phase} / {last}
      </span>
      <span className={s.sep}> · </span>
      <span className={s.state} data-acquired={Boolean(acq)}>
        {stateWord}
      </span>
    </p>
  );

  const legendStrip =
    legends &&
    legends.map((l) => (
      <p
        key={l.field}
        className={s.legend}
        data-field={l.field}
        hidden={l.field !== field}
        aria-label={`Colour scale: ${l.label}, ${l.lo} to ${l.hi} ${l.unit}`}
      >
        {!compact && <span className={s.legendName}>{l.label}</span>}
        <span className={s.legendScale}>
          <span>{l.lo}</span>
          <span className={s.ramp} style={{ backgroundImage: RAMP }} aria-hidden="true" />
          <span>{l.hi}</span>
          <span className={s.unit}>{l.unit}</span>
        </span>
        {l.second && !compact && <span className={s.second}>{l.second}</span>}
      </p>
    ));

  return (
    <div
      ref={rootRef}
      className={[s.root, className].filter(Boolean).join(' ')}
      data-island="PhaseScrubber"
      data-compact={compact}
      data-playing={play !== 'off'}
    >
      <div className={s.main}>
        {plate}
        {rail}
        {compact && (
          <div className={s.compactBar}>
            {readout}
            {legendStrip}
          </div>
        )}
      </div>
      {!compact && (
        <div className={s.side}>
          {readout}
          {note && <p className={s.note}>{note}</p>}
          <fieldset className={s.segment}>
            <legend className={s.srOnly}>Field</legend>
            {FIELDS.map((f) => (
              <button
                key={f}
                type="button"
                className={s.segBtn}
                aria-pressed={field === f}
                onClick={() => chooseField(f)}
              >
                {f === 'wss' ? 'WSS' : manifest.fields[f].label}
              </button>
            ))}
          </fieldset>
          {legendStrip}
          <button
            type="button"
            className={s.ghost}
            onClick={togglePlay}
            disabled={!ready || missing}
          >
            <span aria-hidden="true" className={s.icon} dangerouslySetInnerHTML={{ __html: play === 'loop' ? pauseIcon : playIcon }} />
            {play === 'loop' ? 'Pause' : 'Play'}
            <span className={s.srOnly}> the cardiac cycle at {FPS} frames per second</span>
          </button>
        </div>
      )}
    </div>
  );
}
