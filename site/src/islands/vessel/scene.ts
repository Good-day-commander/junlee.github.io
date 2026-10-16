/*
  The vessel scene: one mesh, one MeshStandardMaterial, three soft lights,
  a transparent clear so the film ground and its grain show through.

  Wipe and develop live in the shader (onBeforeCompile on the standard
  material, no post-processing):
    attributes  colorA, colorB   per-vertex linear RGB (left / right of the wipe)
    uniforms    uWipePx          wipe position in device pixels (gl_FragCoord.x)
                uWipeOn          1 = split at uWipePx, 0 = paint colorB everywhere
                uDevelop         0..1, colorB resolves from colorA to itself
                uSeamHalfPx      half-width of the bone seam in device pixels
                uSeam            seam color (linear)
  Fragment color = (x < wipe ? colorA : mix(colorA, colorB, uDevelop)); the
  seam overwrites the lit color in the last chunk so it reads as chrome, not
  as a lit surface.

  Orientation: the `aligned` group rotates the vessel so its inlet→outlet
  chord lies on screen X with the plane of its curvature facing the camera
  (landscape frames), or on screen Y with the inlet at the top (portrait
  frames, width / height < 0.85). The `pivot` group adds the idle drift (one
  revolution per 60 s about that chord, through the vessel's bounding-box
  centre) and the pointer orbit; a quiet viewer turns both off.

  Framing (every mode): the camera is fitted to the vessel's projected
  bounding box at rest (no drift, no orbit), not set at a fixed distance:
  the box is centred at FRAME_CY of the frame height from the top and spans
  FRAME_LEFT..FRAME_RIGHT of the width, or FRAME_SPAN_Y of the height if
  that binds first. A right inset (the colorbar's column, from setInsets)
  pulls the right bound in so the vessel never runs under the bar. The fit
  is solved on the perspective projection of every vertex (a few
  fixed-point steps), so the near half of the vessel cannot overshoot, and
  it is recomputed on every resize and orientation change. The camera never
  moves otherwise.

  Distal clip (setClipDistal, the quiet home plate only): triangles past the
  distal FFR probe plane (manifest geometry.ffr_probes.distal, 5 mm inside
  the outlet cap; the plane faces the outlet centre) are left out of the
  index, and the framing fits what remains. The distal stretch sits on the
  floor of the shared pressure range (CFD and PINO both; vertices under 5 %
  of the range span the last ~11 % of the chord), where turbo is
  near-black, so it read as a grey stub rather than as data: a data
  artefact, not a framing one. The cut removes the part past the probe
  (~6 % of the chord, cap included); a short dark tip before the plane
  stays, because the FFR is read on that plane and nothing the plate
  reports is cut. The research viewer keeps the whole mesh.

  Rendering is on demand: the rAF loop runs only while something animates
  (drift, develop, wipe tween) and stops otherwise; setActive(false) halts
  it entirely (offscreen, document.hidden).
*/
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  NoToneMapping,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type WebGLProgramParametersWithUniforms,
} from 'three';
import { BONE_SRGB } from './colors';
import type { VesselData } from './data';

export type SceneMode = 'hero' | 'chapter';

export interface SceneEvents {
  onDevelop?: (t: number, elapsedMs: number) => void;
  onDevelopDone?: () => void;
  onWipe?: (wipe: number) => void;
  onFrame?: (dtMs: number) => void;
  onContextLost?: () => void;
}

const TWO_PI = Math.PI * 2;
const DRIFT_PERIOD_MS = 60_000;
const FOV_DEG = 26;
/* Framing targets, as fractions of the frame (see the header). */
const FRAME_LEFT = 0.08;
const FRAME_RIGHT = 0.92;
/** Vertical centre of the vessel's box, from the top. */
const FRAME_CY = 0.42;
/** Largest share of the frame height the box may take (0.42 ± 0.36 → 6 %–78 %). */
const FRAME_SPAN_Y = 0.72;
const X = new Vector3(1, 0, 0);
const Y = new Vector3(0, 1, 0);
const Z = new Vector3(0, 0, 1);

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export class VesselScene {
  readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FOV_DEG, 1, 1, 1000);
  private readonly pivot = new Group();
  private readonly aligned = new Group();
  private readonly material: MeshStandardMaterial;
  private mesh: Mesh | null = null;
  private geometry: BufferGeometry | null = null;

  private readonly uniforms = {
    uWipePx: { value: 0 },
    uWipeOn: { value: 1 },
    uDevelop: { value: 0 },
    uSeamHalfPx: { value: 0.75 },
    uSeam: { value: new Color(BONE_SRGB[0] / 255, BONE_SRGB[1] / 255, BONE_SRGB[2] / 255).convertSRGBToLinear() },
  };

  private qLandscape = new Quaternion();
  /** Mesh positions, kept to re-derive the on-screen extents when the orientation changes. */
  private positions: Float32Array | null = null;
  private meshOffset = new Vector3();
  /** Bounding size of the vessel as shown, in pivot space: x across the frame, y up, z depth. */
  private extent = new Vector3(1, 1, 1);
  /** Centre of that box in pivot space. */
  private center = new Vector3();
  /** Every vertex in pivot space at rest (the framing solves on these). */
  private rest: Float32Array | null = null;
  /** Largest distance of a vertex from the pivot origin (near / far planes). */
  private radius = 1;
  /** CSS px kept clear at the right edge (the colorbar column). */
  private insetRight = 0;
  private clipDistal = false;
  private data: VesselData | null = null;
  private portrait = false;

  private width = 1;
  private height = 1;
  private dpr = 1;
  private wipe = 0.5;
  private theta = 0;
  private yaw = 0;
  private pitch = 0;
  private drift = true;
  private reduced = false;
  private dragging = false;
  private active = true;
  private disposed = false;

  private develop: { running: boolean; elapsed: number; duration: number } = {
    running: false,
    elapsed: 0,
    duration: 1780,
  };
  private tween: { from: number; to: number; elapsed: number; duration: number } | null = null;

  private raf = 0;
  private last = 0;
  private running = false;
  private needsRender = true;

  private readonly qDrift = new Quaternion();
  private readonly qYaw = new Quaternion();
  private readonly qPitch = new Quaternion();
  private readonly chordInPivot = new Vector3(1, 0, 0);

  private readonly onLost = (e: Event) => {
    e.preventDefault();
    this.setActive(false);
    this.events.onContextLost?.();
  };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private mode: SceneMode,
    private readonly events: SceneEvents = {},
  ) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = NoToneMapping;
    this.renderer.outputColorSpace = SRGBColorSpace;
    canvas.addEventListener('webglcontextlost', this.onLost, false);

    this.material = new MeshStandardMaterial({ roughness: 0.62, metalness: 0 });
    this.material.customProgramCacheKey = () => 'vessel-wipe-v1';
    this.material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nattribute vec3 colorA;\nattribute vec3 colorB;\nvarying vec3 vColorA;\nvarying vec3 vColorB;',
        )
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvColorA = colorA;\nvColorB = colorB;');
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          [
            '#include <common>',
            'uniform float uWipePx;',
            'uniform float uWipeOn;',
            'uniform float uDevelop;',
            'uniform float uSeamHalfPx;',
            'uniform vec3 uSeam;',
            'varying vec3 vColorA;',
            'varying vec3 vColorB;',
          ].join('\n'),
        )
        .replace(
          '#include <color_fragment>',
          [
            '#include <color_fragment>',
            '{',
            '  float wipeD = gl_FragCoord.x - uWipePx;',
            '  vec3 right = mix(vColorA, vColorB, uDevelop);',
            '  vec3 field = (uWipeOn > 0.5 && wipeD < 0.0) ? vColorA : right;',
            '  diffuseColor.rgb *= field;',
            '}',
          ].join('\n'),
        )
        .replace(
          '#include <dithering_fragment>',
          [
            '#include <dithering_fragment>',
            'if (uWipeOn > 0.5 && abs(gl_FragCoord.x - uWipePx) < uSeamHalfPx) {',
            '  gl_FragColor.rgb = linearToOutputTexel(vec4(uSeam, 1.0)).rgb;',
            '}',
          ].join('\n'),
        );
    };

    // Three soft lights fixed to the display, like a reading-room monitor:
    // key upper left, fill lower right, rim from behind, a low hemisphere.
    const key = new DirectionalLight(0xffffff, 1.45);
    key.position.set(-0.55, 0.75, 1).multiplyScalar(100);
    const fill = new DirectionalLight(0xffffff, 0.5);
    fill.position.set(0.8, -0.35, 0.6).multiplyScalar(100);
    const rim = new DirectionalLight(0xffffff, 0.55);
    rim.position.set(0.2, 0.45, -1).multiplyScalar(100);
    const hemi = new HemisphereLight(0xffffff, 0x8f98a6, 0.4);
    this.scene.add(key, fill, rim, hemi);

    this.pivot.add(this.aligned);
    this.scene.add(this.pivot);
    this.camera.position.set(0, 0, 200);
    this.camera.lookAt(0, 0, 0);
  }

  /* Build the mesh and the alignment from the loaded buffers. */
  setGeometry(data: VesselData): void {
    this.clearMesh();
    this.data = data;
    const g = data.manifest.geometry;
    const n = data.manifest.vertexCount;

    // Optional distal clip: keep the vertices on the inlet side of the distal probe plane.
    let shown = data.positions;
    let index: Uint16Array | Uint32Array = data.indices;
    if (this.clipDistal && g.ffr_probes?.distal?.center_mm) {
      const probe = new Vector3().fromArray(g.ffr_probes.distal.center_mm);
      const toOutlet = new Vector3().fromArray(g.outlet_center).sub(probe).normalize();
      const keep = new Uint8Array(n);
      const q = new Vector3();
      let kept = 0;
      for (let i = 0; i < n; i += 1) {
        q.fromArray(data.positions, i * 3).sub(probe);
        if (q.dot(toOutlet) <= 0) {
          keep[i] = 1;
          kept += 1;
        }
      }
      const src = data.indices;
      const out = new (src instanceof Uint16Array ? Uint16Array : Uint32Array)(src.length);
      let m = 0;
      for (let t = 0; t < src.length; t += 3) {
        if (keep[src[t]] && keep[src[t + 1]] && keep[src[t + 2]]) {
          out[m] = src[t];
          out[m + 1] = src[t + 1];
          out[m + 2] = src[t + 2];
          m += 3;
        }
      }
      index = out.slice(0, m);
      shown = new Float32Array(kept * 3);
      for (let i = 0, k = 0; i < n; i += 1) {
        if (!keep[i]) continue;
        shown[k] = data.positions[i * 3];
        shown[k + 1] = data.positions[i * 3 + 1];
        shown[k + 2] = data.positions[i * 3 + 2];
        k += 3;
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(data.positions, 3));
    geometry.setIndex(new BufferAttribute(index, 1));
    geometry.computeVertexNormals();
    geometry.setAttribute('colorA', new BufferAttribute(new Float32Array(n * 3), 3));
    geometry.setAttribute('colorB', new BufferAttribute(new Float32Array(n * 3), 3));

    // Chord from inlet to outlet → +X; the vessel is nearly planar, so the
    // plane normal (world Z, orthogonalised against the chord) → +Z.
    const inlet = new Vector3().fromArray(g.inlet_center);
    const outlet = new Vector3().fromArray(g.outlet_center);
    const a = outlet.clone().sub(inlet).normalize();
    const nrm = Z.clone().sub(a.clone().multiplyScalar(Z.dot(a))).normalize();
    const b = new Vector3().crossVectors(nrm, a).normalize();
    const basis = new Matrix4().makeBasis(a, b, nrm);
    this.qLandscape.setFromRotationMatrix(basis).invert();

    // Pivot origin: the landscape bounding-box centre, so the drift turns
    // the vessel about its own middle (the chord through the box centre)
    // and the fitted framing holds through the revolution.
    const { min, max } = this.bounds(shown, this.qLandscape);
    const center = min.clone().add(max).multiplyScalar(0.5);
    this.meshOffset.copy(center).negate().applyQuaternion(this.qLandscape.clone().invert());
    // The framing (bounds, rest points) reads only the vertices that are drawn.
    this.positions = shown;

    const mesh = new Mesh(geometry, this.material);
    mesh.position.copy(this.meshOffset);
    mesh.frustumCulled = false;
    this.aligned.add(mesh);
    this.mesh = mesh;
    this.geometry = geometry;
    this.applyOrientation();
    this.frame();
    this.requestRender();
  }

  setColors(a: Float32Array, b: Float32Array, wipeOn: boolean): void {
    if (!this.geometry) return;
    const ca = this.geometry.getAttribute('colorA') as BufferAttribute;
    const cb = this.geometry.getAttribute('colorB') as BufferAttribute;
    (ca.array as Float32Array).set(a);
    (cb.array as Float32Array).set(b);
    ca.needsUpdate = true;
    cb.needsUpdate = true;
    this.uniforms.uWipeOn.value = wipeOn ? 1 : 0;
    this.requestRender();
  }

  setMode(mode: SceneMode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.applyOrientation();
    this.frame();
    this.requestRender();
  }

  /** Leave out the stretch past the distal FFR probe plane (see the header). Rebuilds the mesh if loaded. */
  setClipDistal(on: boolean): void {
    if (on === this.clipDistal) return;
    this.clipDistal = on;
    if (!this.data || !this.geometry) return;
    const colorA = (this.geometry.getAttribute('colorA') as BufferAttribute).array as Float32Array;
    const colorB = (this.geometry.getAttribute('colorB') as BufferAttribute).array as Float32Array;
    const wipeOn = this.uniforms.uWipeOn.value > 0.5;
    const a = colorA.slice();
    const b = colorB.slice();
    this.setGeometry(this.data);
    this.setColors(a, b, wipeOn);
  }

  /** CSS px to keep clear at the right edge (the colorbar column); 0 when the bar sits under the image. */
  setInsets(rightPx: number): void {
    const r = Math.max(0, Math.round(rightPx));
    if (r === this.insetRight) return;
    this.insetRight = r;
    this.frame();
    this.requestRender();
  }

  setSize(width: number, height: number, dpr: number): void {
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    const d = Math.min(2, Math.max(1, dpr || 1));
    if (w === this.width && h === this.height && d === this.dpr) return;
    this.width = w;
    this.height = h;
    this.dpr = d;
    this.renderer.setPixelRatio(d);
    this.renderer.setSize(w, h, false);
    this.uniforms.uSeamHalfPx.value = 0.75 * d; // one device column at dpr 1, one CSS px at dpr 2 (fragment centres sit at .5)
    this.uniforms.uWipePx.value = this.wipe * w * d;
    const portrait = w / h < 0.85;
    if (portrait !== this.portrait) {
      this.portrait = portrait;
      this.applyOrientation();
    }
    this.frame();
    this.requestRender();
  }

  setWipe(wipe: number): void {
    const v = wipe < 0 ? 0 : wipe > 1 ? 1 : wipe;
    this.tween = null;
    this.wipe = v;
    this.uniforms.uWipePx.value = v * this.width * this.dpr;
    this.requestRender();
  }

  getWipe(): number {
    return this.wipe;
  }

  /** Animate the wipe (the two-state toggle on narrow frames); 0 ms snaps. */
  tweenWipe(to: number, durationMs: number): void {
    if (durationMs <= 0 || this.reduced) {
      this.setWipe(to);
      this.events.onWipe?.(this.wipe);
      return;
    }
    this.tween = { from: this.wipe, to, elapsed: 0, duration: durationMs };
    this.kick();
  }

  /** Run the develop: colorB resolves from colorA over durationMs. 0 ms snaps. */
  startDevelop(durationMs: number): void {
    if (durationMs <= 0 || this.reduced) {
      this.develop = { running: false, elapsed: durationMs, duration: durationMs };
      this.uniforms.uDevelop.value = 1;
      this.events.onDevelop?.(1, durationMs);
      this.events.onDevelopDone?.();
      this.requestRender();
      return;
    }
    this.develop = { running: true, elapsed: 0, duration: durationMs };
    this.uniforms.uDevelop.value = 0;
    this.events.onDevelop?.(0, 0);
    this.kick();
  }

  setDevelop(t: number): void {
    this.develop.running = false;
    this.uniforms.uDevelop.value = t < 0 ? 0 : t > 1 ? 1 : t;
    this.requestRender();
  }

  setDrift(on: boolean): void {
    this.drift = on;
    if (on) this.kick();
  }

  setReducedMotion(reduced: boolean): void {
    this.reduced = reduced;
    if (reduced) {
      if (this.develop.running) {
        this.develop.running = false;
        this.uniforms.uDevelop.value = 1;
        this.events.onDevelop?.(1, this.develop.duration);
        this.events.onDevelopDone?.();
      }
      if (this.tween) {
        this.setWipe(this.tween.to);
        this.events.onWipe?.(this.wipe);
      }
      this.requestRender();
    } else {
      this.kick();
    }
  }

  setDragging(dragging: boolean): void {
    this.dragging = dragging;
    if (!dragging) this.kick();
  }

  /** Pointer orbit: add yaw/pitch in radians. */
  orbitBy(dYaw: number, dPitch: number): void {
    this.yaw += dYaw;
    const lim = Math.PI * 0.42;
    this.pitch = Math.max(-lim, Math.min(lim, this.pitch + dPitch));
    this.requestRender();
  }

  /** Offscreen / hidden: halt the loop. Visible again: resume where it paused. */
  setActive(active: boolean): void {
    if (this.active === active) return;
    this.active = active;
    if (active) {
      this.needsRender = true;
      this.kick();
    } else if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.running = false;
      this.last = 0;
    }
  }

  requestRender(): void {
    this.needsRender = true;
    this.kick();
  }

  /** Synchronous render, for captures. */
  renderNow(): void {
    this.updatePivot();
    this.renderer.render(this.scene, this.camera);
    this.needsRender = false;
  }

  dispose(): void {
    this.disposed = true;
    this.setActive(false);
    this.canvas.removeEventListener('webglcontextlost', this.onLost, false);
    this.clearMesh();
    this.material.dispose();
    this.renderer.dispose();
  }

  private clearMesh(): void {
    // (this.data is kept: setClipDistal rebuilds from it.)
    if (this.mesh) {
      this.aligned.remove(this.mesh);
      this.mesh = null;
    }
    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }
  }

  /** Axis-aligned bounds of the positions after rotation by q. */
  private bounds(positions: Float32Array, q: Quaternion): { min: Vector3; max: Vector3 } {
    const p = new Vector3();
    const min = new Vector3(Infinity, Infinity, Infinity);
    const max = new Vector3(-Infinity, -Infinity, -Infinity);
    for (let i = 0; i < positions.length; i += 3) {
      p.fromArray(positions, i).applyQuaternion(q);
      min.min(p);
      max.max(p);
    }
    return { min, max };
  }

  /** Screen-space rotation applied on top of the landscape alignment for the current frame. */
  private frameRotation(): Quaternion {
    if (this.portrait) return new Quaternion().setFromAxisAngle(Z, -Math.PI / 2);
    return new Quaternion();
  }

  private applyOrientation(): void {
    if (this.mesh) this.mesh.position.copy(this.meshOffset);
    const rot = this.frameRotation();
    this.aligned.quaternion.copy(rot).multiply(this.qLandscape);
    // The chord in pivot space: +X in landscape, −Y in portrait (inlet at the top).
    this.chordInPivot.copy(X).applyQuaternion(rot);
    // The vessel at rest in pivot space, so the framing fits the silhouette as shown.
    if (this.positions) {
      const q = this.aligned.quaternion;
      const off = this.meshOffset.clone().applyQuaternion(q);
      const n = this.positions.length;
      const rest = this.rest && this.rest.length === n ? this.rest : new Float32Array(n);
      const p = new Vector3();
      const min = new Vector3(Infinity, Infinity, Infinity);
      const max = new Vector3(-Infinity, -Infinity, -Infinity);
      let r2 = 0;
      for (let i = 0; i < n; i += 3) {
        p.fromArray(this.positions, i).applyQuaternion(q).add(off);
        p.toArray(rest, i);
        min.min(p);
        max.max(p);
        r2 = Math.max(r2, p.lengthSq());
      }
      this.rest = rest;
      this.radius = Math.sqrt(r2) || 1;
      this.extent.subVectors(max, min);
      this.center.copy(min).add(max).multiplyScalar(0.5);
    }
  }

  /*
    Fit the camera to the vessel's projected bounding box (see the header).
    The camera looks down −Z from (tx, ty, d), so a vertex (x, y, z) lands at
    NDC ((x − tx) / ((d − z) · tan · aspect), (y − ty) / ((d − z) · tan)).
    Start from the orthographic estimate, then correct the target by the
    measured centre and the distance by the measured span; four steps settle
    to well under a pixel.
  */
  private frame(): void {
    const aspect = this.width / this.height;
    const tanHalf = Math.tan((FOV_DEG * Math.PI) / 360);
    const rightFrac = Math.max(FRAME_LEFT + 0.2, Math.min(FRAME_RIGHT, 1 - this.insetRight / this.width));
    const spanX = rightFrac - FRAME_LEFT; // share of the width
    const cxFrac = (FRAME_LEFT + rightFrac) / 2; // from the left
    // Targets in NDC (−1..1, y up).
    const spanXN = spanX * 2;
    const spanYN = FRAME_SPAN_Y * 2;
    const cxN = cxFrac * 2 - 1;
    const cyN = 1 - FRAME_CY * 2;

    const visibleH = Math.max(this.extent.y / FRAME_SPAN_Y, this.extent.x / (spanX * aspect));
    let d = visibleH / (2 * tanHalf);
    let tx = this.center.x - (cxN / 2) * visibleH * aspect;
    let ty = this.center.y - (cyN / 2) * visibleH;

    const rest = this.rest;
    if (rest) {
      for (let step = 0; step < 4; step += 1) {
        let x0 = Infinity;
        let x1 = -Infinity;
        let y0 = Infinity;
        let y1 = -Infinity;
        for (let i = 0; i < rest.length; i += 3) {
          const w = (d - rest[i + 2]) * tanHalf;
          if (w <= 0) continue;
          const nx = (rest[i] - tx) / (w * aspect);
          const ny = (rest[i + 1] - ty) / w;
          if (nx < x0) x0 = nx;
          if (nx > x1) x1 = nx;
          if (ny < y0) y0 = ny;
          if (ny > y1) y1 = ny;
        }
        // Shift so the measured centre lands on the target (world units at the box's depth)…
        tx += ((x0 + x1) / 2 - cxN) * d * tanHalf * aspect;
        ty += ((y0 + y1) / 2 - cyN) * d * tanHalf;
        // …then scale the distance by the overshoot, keeping the target's offset from the box centre in proportion.
        const k = Math.max((x1 - x0) / spanXN, (y1 - y0) / spanYN);
        tx = this.center.x + (tx - this.center.x) * k;
        ty = this.center.y + (ty - this.center.y) * k;
        d *= k;
      }
    }

    this.camera.aspect = aspect;
    this.camera.position.set(tx, ty, d);
    this.camera.lookAt(tx, ty, 0);
    const r = this.radius * 1.2;
    this.camera.near = Math.max(0.5, d - r);
    this.camera.far = d + r;
    this.camera.updateProjectionMatrix();
  }

  private updatePivot(): void {
    this.qDrift.setFromAxisAngle(this.chordInPivot, this.theta);
    this.qYaw.setFromAxisAngle(Y, this.yaw);
    this.qPitch.setFromAxisAngle(X, this.pitch);
    this.pivot.quaternion.copy(this.qYaw).multiply(this.qPitch).multiply(this.qDrift);
  }

  private kick(): void {
    if (this.disposed || this.running || !this.active) return;
    this.running = true;
    this.last = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  private readonly loop = (now: number): void => {
    this.raf = 0;
    if (this.disposed || !this.active) {
      this.running = false;
      return;
    }
    const dt = this.last ? Math.min(100, now - this.last) : 16.7;
    this.last = now;
    let animating = false;

    if (this.drift && !this.dragging && !this.reduced) {
      this.theta = (this.theta + (dt / DRIFT_PERIOD_MS) * TWO_PI) % TWO_PI;
      this.needsRender = true;
      animating = true;
    }

    if (this.develop.running) {
      const dv = this.develop;
      dv.elapsed = Math.min(dv.duration, dv.elapsed + dt);
      const t = dv.elapsed / dv.duration;
      this.uniforms.uDevelop.value = t;
      this.events.onDevelop?.(t, dv.elapsed);
      this.needsRender = true;
      if (t >= 1) {
        dv.running = false;
        this.events.onDevelopDone?.();
      } else {
        animating = true;
      }
    }

    if (this.tween) {
      const tw = this.tween;
      tw.elapsed = Math.min(tw.duration, tw.elapsed + dt);
      const t = easeOutExpo(tw.elapsed / tw.duration);
      this.wipe = tw.from + (tw.to - tw.from) * t;
      this.uniforms.uWipePx.value = this.wipe * this.width * this.dpr;
      this.events.onWipe?.(this.wipe);
      this.needsRender = true;
      if (tw.elapsed >= tw.duration) {
        this.wipe = tw.to;
        this.tween = null;
      } else {
        animating = true;
      }
    }

    if (this.needsRender) {
      this.renderNow();
      this.events.onFrame?.(dt);
    }

    if (animating) {
      this.raf = requestAnimationFrame(this.loop);
    } else {
      this.running = false;
      this.last = 0;
    }
  };
}

export function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
