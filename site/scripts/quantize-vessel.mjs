#!/usr/bin/env node
/*
  quantize-vessel: float32 PINO vessel (pino-viewer-manifest/1) → the packed
  uint16 vessel the site ships (pino-viewer-manifest/2).

    node scripts/quantize-vessel.mjs [--in <dir>] [--out <dir>]

  --in   directory holding the float32 vessel.bin and its manifest.json
         (default: ../website_assets/web/pino, the convert.py output)
  --out  where vessel.bin and manifest.json are written
         (default: public/data/pino)

  The input is never modified, and a v2 (already packed) input is refused, so
  the script always starts from the float32 export and is repeatable.

  What it does, per array (the decoder is loadVessel in
  src/islands/vessel/data.ts):
    order      triangles are sorted by centroid position along the
               inlet → outlet chord and vertices renumbered in first-use
               order, so neighbouring indices and values sit next to each
               other. The surface, its triangles and every per-vertex value
               are unchanged; only their order is.
    quantize   positions (per axis) and p_cfd, p_pino, vmag_cfd, vmag_pino
               to uint16 with value = offset + q · scale, scale = (max − min)
               / 65535. Indices are uint16 as they are (8 649 vertices).
    p_err      not stored: the viewer derives it as p_pino − p_cfd, which is
               its definition (the stored float32 differs from that by
               < 0.001 Pa). Its min / max stay in the manifest.
    delta      each uint16 stream holds the zigzag-coded difference from the
               previous value of the same component (mod 2^16).
    planar     each stream is written as all low bytes, then all high bytes,
               which is what lets gzip find the long zero runs.
    region     uint8, unchanged apart from the vertex order.
    chunks     two files: vessel.bin (positions, indices, p_cfd, p_pino,
               region: everything the pressure and error fields need) and
               vessel-speed.bin (vmag_cfd, vmag_pino), recorded in the
               manifest as buffers.chunks.speed; each speed array carries
               chunk: "speed" and its byteOffset is inside that file. The
               home plate (quiet, pressure only) never requests the speed
               chunk; /research requests it when Speed or Error is chosen.
    gzip       each file is also written gzip -9 (vessel.bin.gz,
               vessel-speed.bin.gz), recorded as buffers.gzip and
               chunks.speed.gzip. GitHub Pages compresses text types on the
               fly but sends application/octet-stream as it is, so the raw
               .bin would cost its full size on the wire; the viewer fetches
               the .gz and inflates it with DecompressionStream, and falls
               back to the raw .bin where that API is missing.
  Normals are not stored; the viewer computes them from the positions.

  It prints the raw and gzip sizes and the largest dequantization error of
  every quantized array.
*/
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(here, '..');

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i > 0 && process.argv[i + 1] ? path.resolve(process.argv[i + 1]) : fallback;
}
const inDir = arg('--in', path.resolve(siteDir, '..', 'website_assets', 'web', 'pino'));
const outDir = arg('--out', path.resolve(siteDir, 'public', 'data', 'pino'));

function fail(msg) {
  console.error(`quantize-vessel: ${msg}`);
  process.exit(1);
}

const manifestPath = path.join(inDir, 'manifest.json');
if (!existsSync(manifestPath)) fail(`no manifest.json in ${inDir} (pass --in <dir with the float32 export>)`);
const src = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (src.schema !== 'pino-viewer-manifest/1') {
  fail(`${manifestPath} is ${src.schema}; the input must be the float32 export (pino-viewer-manifest/1)`);
}
const binPath = path.join(inDir, src.buffers.file);
const bin = readFileSync(binPath);
if (bin.length !== src.buffers.byteLength) fail(`${binPath} is ${bin.length} B, its manifest says ${src.buffers.byteLength}`);
const ab = bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength);
const A = src.buffers.arrays;
const N = src.vertexCount;
const T = src.triangleCount;
if (N > 65535) fail(`${N} vertices do not fit uint16 indices`);

const f32 = (spec) => new Float32Array(ab, spec.byteOffset, spec.count * spec.components);
const positions = f32(A.positions);
const indices = new Uint32Array(ab, A.indices.byteOffset, T * 3);
const region = new Uint8Array(ab, A.region.byteOffset, N);

/* Order: triangles along the chord, vertices in first-use order. */
const inlet = src.geometry.inlet_center;
const outlet = src.geometry.outlet_center;
const axis = outlet.map((v, i) => v - inlet[i]);
const len = Math.hypot(...axis);
const along = (v) =>
  ((positions[v * 3] - inlet[0]) * axis[0] +
    (positions[v * 3 + 1] - inlet[1]) * axis[1] +
    (positions[v * 3 + 2] - inlet[2]) * axis[2]) /
  len;
const key = new Float64Array(T);
for (let t = 0; t < T; t += 1) key[t] = along(indices[t * 3]) + along(indices[t * 3 + 1]) + along(indices[t * 3 + 2]);
const triOrder = Array.from({ length: T }, (_, i) => i).sort((a, b) => key[a] - key[b] || a - b);
const remap = new Int32Array(N).fill(-1);
let next = 0;
const newIndices = new Uint16Array(T * 3);
triOrder.forEach((tri, k) => {
  for (let j = 0; j < 3; j += 1) {
    const v = indices[tri * 3 + j];
    if (remap[v] < 0) remap[v] = next++;
    newIndices[k * 3 + j] = remap[v];
  }
});
for (let v = 0; v < N; v += 1) if (remap[v] < 0) remap[v] = next++;
const oldOf = new Int32Array(N);
for (let v = 0; v < N; v += 1) oldOf[remap[v]] = v;

function reorder(arr, comps) {
  const out = new arr.constructor(arr.length);
  for (let k = 0; k < N; k += 1) for (let c = 0; c < comps; c += 1) out[k * comps + c] = arr[oldOf[k] * comps + c];
  return out;
}

/* Quantize per component; returns the codes and the dequantization record. */
function quantize(values, comps) {
  const q = new Uint16Array(values.length);
  const offset = [];
  const scale = [];
  let maxErr = 0;
  for (let c = 0; c < comps; c += 1) {
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = c; i < values.length; i += comps) {
      if (values[i] < lo) lo = values[i];
      if (values[i] > hi) hi = values[i];
    }
    // JSON keeps these as float64; the decoder computes offset + q * scale in float64 and stores float32.
    const s = hi > lo ? (hi - lo) / 65535 : 1;
    offset.push(lo);
    scale.push(s);
    for (let i = c; i < values.length; i += comps) {
      const code = Math.min(65535, Math.max(0, Math.round((values[i] - lo) / s)));
      q[i] = code;
      const back = Math.fround(lo + code * s);
      maxErr = Math.max(maxErr, Math.abs(back - values[i]));
    }
  }
  return { q, offset: comps === 1 ? offset[0] : offset, scale: comps === 1 ? scale[0] : scale, maxErr };
}

/* zigzag delta per component, then planar bytes (all low bytes, then all high bytes). */
function pack(u16, comps) {
  const n = u16.length;
  const out = new Uint8Array(n * 2);
  for (let i = 0; i < n; i += 1) {
    const prev = i >= comps ? u16[i - comps] : 0;
    const d = ((u16[i] - prev) << 16) >> 16; // signed 16-bit difference
    const z = ((d << 1) ^ (d >> 31)) & 0xffff;
    out[i] = z & 0xff;
    out[n + i] = z >> 8;
  }
  return out;
}

/* One growing file per chunk; every section starts 4-byte aligned inside its own file. */
const chunks = { main: { sections: [], offset: 0 }, speed: { sections: [], offset: 0 } };
const arrays = {};
const align4 = (n) => (n + 3) & ~3;
function add(name, bytes, spec, chunk = 'main') {
  const c = chunks[chunk];
  const byteOffset = c.offset;
  c.sections.push({ byteOffset, bytes });
  c.offset = align4(byteOffset + bytes.length);
  arrays[name] = { ...spec, ...(chunk === 'main' ? {} : { chunk }), byteOffset, byteLength: bytes.length };
}
function assemble(c) {
  const out = new Uint8Array(c.offset);
  for (const sec of c.sections) out.set(sec.bytes, sec.byteOffset);
  return out;
}

const report = [];
const ENC = { delta: 'zigzag', layout: 'planar-bytes' };
const strip = ({ byteOffset: _o, byteLength: _l, dtype: _d, ...rest }) => rest;

const pos = quantize(reorder(positions, 3), 3);
add('positions', pack(pos.q, 3), {
  ...strip(A.positions),
  dtype: 'uint16',
  quantization: { offset: pos.offset, scale: pos.scale, max_abs_error: Number(pos.maxErr.toPrecision(3)) },
  encoding: ENC,
});
report.push(['positions', pos.maxErr, A.positions.units]);

add('indices', pack(newIndices, 1), {
  ...strip(A.indices),
  dtype: 'uint16',
  encoding: { ...ENC, stride: 1 },
});

for (const k of ['p_cfd', 'p_pino', 'vmag_cfd', 'vmag_pino']) {
  const r = quantize(reorder(f32(A[k]), 1), 1);
  add(
    k,
    pack(r.q, 1),
    {
      ...strip(A[k]),
      dtype: 'uint16',
      quantization: { offset: r.offset, scale: r.scale, max_abs_error: Number(r.maxErr.toPrecision(3)) },
      encoding: ENC,
    },
    k.startsWith('vmag') ? 'speed' : 'main',
  );
  report.push([k, r.maxErr, A[k].units]);
}

add('region', reorder(region, 1), { ...strip(A.region), dtype: 'uint8' });

const out = assemble(chunks.main);
const outSpeed = assemble(chunks.speed);
const total = out.length;
const speedFile = src.buffers.file.replace(/(\.bin)?$/, '-speed.bin');
const gzOf = (bytes) => zlib.gzipSync(bytes, { level: 9 });
const outGz = gzOf(out);
const outSpeedGz = gzOf(outSpeed);

arrays.p_err = {
  ...strip(A.p_err),
  derived: 'p_pino - p_cfd',
  note: 'not stored; the viewer computes it from the two decoded pressure arrays',
};

const md5 = createHash('md5').update(bin).digest('hex');
const manifest = { ...src };
manifest.schema = 'pino-viewer-manifest/2';
manifest.generator = `${src.generator}; packed by site/scripts/quantize-vessel.mjs`;
manifest.buffers = {
  file: src.buffers.file,
  byteLength: total,
  gzip: { file: `${src.buffers.file}.gz`, byteLength: outGz.length },
  packing: {
    note: 'uint16 quantized (value = offset + q * scale, per axis for positions), zigzag delta per component, planar bytes (low bytes then high bytes); vertices and triangles reordered along the inlet-outlet chord for locality, the surface itself is unchanged; normals are computed by the viewer; the speed arrays live in a second file (chunks.speed) fetched only when a speed-dependent field is chosen',
    source: { schema: src.schema, file: src.buffers.file, byteLength: src.buffers.byteLength, md5 },
  },
  chunks: {
    speed: {
      file: speedFile,
      byteLength: outSpeed.length,
      gzip: { file: `${speedFile}.gz`, byteLength: outSpeedGz.length },
      arrays: ['vmag_cfd', 'vmag_pino'],
    },
  },
  arrays,
};
/*
  The CFD reference bound (owner, 2026-10-16) lives in content.ts
  cfdReference and is mirrored by hand under timing.cfd.reference_pipeline
  of the shipped manifest (lib/schema.ts fails the build on a drift). The
  float32 export does not carry it, so a re-run keeps the shipped mirror
  and its note instead of dropping them.
*/
const shippedPath = path.join(outDir, 'manifest.json');
if (existsSync(shippedPath)) {
  const shippedCfd = JSON.parse(readFileSync(shippedPath, 'utf8'))?.timing?.cfd;
  if (shippedCfd?.reference_pipeline && manifest.timing?.cfd) {
    manifest.timing = {
      ...manifest.timing,
      cfd: { ...manifest.timing.cfd, reference_pipeline: shippedCfd.reference_pipeline, note: shippedCfd.note },
    };
  }
}
const ordered = {};
for (const k of Object.keys(src)) ordered[k] = manifest[k];

mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, src.buffers.file), out);
writeFileSync(path.join(outDir, speedFile), outSpeed);
writeFileSync(path.join(outDir, `${src.buffers.file}.gz`), outGz);
writeFileSync(path.join(outDir, `${speedFile}.gz`), outSpeedGz);
writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(ordered, null, 1) + '\n');

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(`quantize-vessel: ${path.relative(siteDir, binPath)} (${bin.length} B, md5 ${md5})`);
for (const [file, bytes] of [
  [src.buffers.file, out],
  [speedFile, outSpeed],
]) {
  const gz6 = zlib.gzipSync(bytes, { level: 6 }).length;
  const gz9 = zlib.gzipSync(bytes, { level: 9 }).length;
  console.log(
    `  -> ${path.relative(siteDir, path.join(outDir, file))}: ${bytes.length} B raw (${kb(bytes.length)}), gzip -6 ${gz6} B (${kb(gz6)}), gzip -9 ${gz9} B (${kb(gz9)})`,
  );
}
for (const [k, e, u] of report) console.log(`  ${k.padEnd(10)} max |dequantized - float32| ${e.toPrecision(3)} ${u ?? ''}`);
