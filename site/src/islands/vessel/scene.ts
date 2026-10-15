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
  (chapter mode), on screen Y with the inlet at the top (portrait frames),
  or, in the landscape hero, rolled by HERO_ROLL_DEG like an angulated C-arm
  view so the chord runs from upper left to lower right and the nearly
  planar vessel opens up the frame's height instead of lying as a thread
  along its middle. The `pivot` group adds the idle drift (one revolution
  per 60 s about that chord) and the pointer orbit. The camera never moves
  except to re-frame on resize.

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
/** Landscape hero: roll of the chord below screen X (inlet upper left, outlet lower right). */
const HERO_ROLL_DEG = 38;
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
  /** Centre of that box in pivot space (the drift axis passes through the origin, not this). */
  private center = new Vector3();
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
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(data.positions, 3));
    geometry.setIndex(new BufferAttribute(data.indices, 1));
    geometry.computeVertexNormals();
    const n = data.manifest.vertexCount;
    geometry.setAttribute('colorA', new BufferAttribute(new Float32Array(n * 3), 3));
    geometry.setAttribute('colorB', new BufferAttribute(new Float32Array(n * 3), 3));

    // Chord from inlet to outlet → +X; the vessel is nearly planar, so the
    // plane normal (world Z, orthogonalised against the chord) → +Z.
    const g = data.manifest.geometry;
    const inlet = new Vector3().fromArray(g.inlet_center);
    const outlet = new Vector3().fromArray(g.outlet_center);
    const a = outlet.clone().sub(inlet).normalize();
    const nrm = Z.clone().sub(a.clone().multiplyScalar(Z.dot(a))).normalize();
    const b = new Vector3().crossVectors(nrm, a).normalize();
    const basis = new Matrix4().makeBasis(a, b, nrm);
    this.qLandscape.setFromRotationMatrix(basis).invert();

    // Landscape bounding box: its centre goes on the pivot origin so the
    // drift axis (the chord) runs through the middle of the vessel.
    const { min, max } = this.bounds(data.positions, this.qLandscape);
    const center = min.clone().add(max).multiplyScalar(0.5);
    const offset = center.clone().negate().applyQuaternion(this.qLandscape.clone().invert());
    this.positions = data.positions;
    this.meshOffset.copy(offset);

    const mesh = new Mesh(geometry, this.material);
    mesh.position.copy(offset);
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
    if (this.mode === 'hero') return new Quaternion().setFromAxisAngle(Z, (-HERO_ROLL_DEG * Math.PI) / 180);
    return new Quaternion();
  }

  private applyOrientation(): void {
    const rot = this.frameRotation();
    this.aligned.quaternion.copy(rot).multiply(this.qLandscape);
    // The chord in pivot space: +X in landscape, −Y in portrait (inlet at the top), rolled in the hero.
    this.chordInPivot.copy(X).applyQuaternion(rot);
    // Extents of the vessel as shown, so framing fits the rolled or portrait silhouette.
    if (this.positions) {
      const { min, max } = this.bounds(this.positions, this.aligned.quaternion);
      const off = this.meshOffset.clone().applyQuaternion(this.aligned.quaternion);
      this.extent.subVectors(max, min);
      this.center.copy(min).add(max).multiplyScalar(0.5).add(off);
    }
  }

  /*
    Camera framing from the on-screen extents.
      hero, landscape  rolled vessel spans ~55 % of the width from left-centre to the
                       right edge and over half of the height; the lower left stays
                       clear for the headline block
      hero, portrait   centred, spans most of the width
      chapter          centred, spans most of the frame
  */
  private frame(): void {
    const aspect = this.width / this.height;
    const ext = { w: this.extent.x, h: this.extent.y };
    let fracW: number;
    let fracH: number;
    let cx: number;
    let cy = 0.5;
    if (this.mode === 'hero' && !this.portrait) {
      fracW = 0.58;
      fracH = 0.76;
      cx = 0.65;
      cy = 0.52;
    } else if (this.mode === 'hero') {
      // Portrait: leave the right edge to the colorbar.
      fracW = 0.74;
      fracH = 0.72;
      cx = 0.46;
    } else {
      fracW = 0.84;
      fracH = 0.8;
      cx = 0.5;
    }
    // Perspective enlarges the near half of a rotating vessel; keep a margin.
    const margin = 0.95;
    const tanHalf = Math.tan((FOV_DEG * Math.PI) / 360);
    const needW = ext.w / (fracW * margin);
    const needH = ext.h / (fracH * margin);
    const visibleW = Math.max(needW, needH * aspect);
    const visibleH = visibleW / aspect;
    const d = visibleW / (2 * tanHalf * aspect);
    // Camera target: the vessel's centre pushed so the box lands at (cx, cy) of the frame.
    const tx = this.center.x - (cx - 0.5) * visibleW;
    const ty = this.center.y + (cy - 0.5) * visibleH;
    this.camera.aspect = aspect;
    this.camera.position.set(tx, ty, d);
    this.camera.lookAt(tx, ty, 0);
    const depth = Math.max(this.extent.x, this.extent.y, this.extent.z);
    this.camera.near = Math.max(0.5, d - depth);
    this.camera.far = d + depth;
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
