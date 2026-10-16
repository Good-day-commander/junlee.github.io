#!/usr/bin/env python
# Produces src/assets/fonts/archivo-latin-wght400-600-wdth92-100.woff2 (Archivo latin, cut to wght 400-600, wdth 92-100).
# Run from site/: python -X utf8 scripts/instance-archivo.py (needs fontTools; node on PATH if brotli is missing).
"""
instance-archivo: the Archivo latin variable font, limited to the axis ranges
the site uses, so the first viewport downloads about 37 KB instead of 88 KB.

    python -X utf8 scripts/instance-archivo.py

Input   node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2
        (wght 100-900, wdth 62-125)
Output  src/assets/fonts/archivo-latin-wght400-600-wdth92-100.woff2
        (wght 400-600, wdth 92-100; every outline inside those ranges is
        unchanged: the display type is wdth 92 at 600, the UI wdth 100 at 500)

The font stays variable (the display type needs the wdth 92 axis), so this is
the same @fontsource-variable/archivo face with the unused axis ranges cut;
src/styles/fonts.css declares it with matching font-weight / font-stretch
ranges. The latin-ext and vietnamese subsets load from fontsource unchanged.

Needs fontTools. WOFF2 needs the brotli module; when it is missing, a shim
backed by Node's built-in zlib brotli is used instead (node must be on PATH).
"""
import os
import subprocess
import sys
import tempfile
import types

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
SRC = os.path.join(SITE, 'node_modules', '@fontsource-variable', 'archivo', 'files', 'archivo-latin-wdth-normal.woff2')
OUT = os.path.join(SITE, 'src', 'assets', 'fonts', 'archivo-latin-wght400-600-wdth92-100.woff2')
AXES = {'wght': (400, 600), 'wdth': (92, 100)}

try:
    import brotli  # noqa: F401
except ImportError:
    _JS = (
        "const fs=require('fs'),z=require('zlib');const [op,i,o,mode]=process.argv.slice(1);"
        "const d=fs.readFileSync(i);"
        "const r=op==='d'?z.brotliDecompressSync(d):z.brotliCompressSync(d,{params:{"
        "[z.constants.BROTLI_PARAM_QUALITY]:11,[z.constants.BROTLI_PARAM_MODE]:Number(mode),"
        "[z.constants.BROTLI_PARAM_SIZE_HINT]:d.length}});fs.writeFileSync(o,r);"
    )

    def _run(op, data, mode=0):
        with tempfile.TemporaryDirectory() as t:
            i, o = os.path.join(t, 'i'), os.path.join(t, 'o')
            with open(i, 'wb') as fh:
                fh.write(data)
            subprocess.run(['node', '-e', _JS, op, i, o, str(mode)], check=True)
            with open(o, 'rb') as fh:
                return fh.read()

    shim = types.ModuleType('brotli')
    shim.MODE_GENERIC, shim.MODE_TEXT, shim.MODE_FONT = 0, 1, 2
    shim.error = Exception
    shim.decompress = lambda data: _run('d', data)
    shim.compress = lambda data, mode=0, quality=11, lgwin=22, lgblock=0: _run('c', data, mode)
    sys.modules['brotli'] = shim

from fontTools.ttLib import TTFont  # noqa: E402
from fontTools.varLib import instancer  # noqa: E402

font = TTFont(SRC)
axes = {a.axisTag: (a.minValue, a.maxValue) for a in font['fvar'].axes}
for tag, (lo, hi) in AXES.items():
    if tag not in axes or lo < axes[tag][0] or hi > axes[tag][1]:
        sys.exit(f'instance-archivo: {tag} {lo}-{hi} is outside the source range {axes.get(tag)}')
out = instancer.instantiateVariableFont(font, AXES)
out.flavor = 'woff2'
os.makedirs(os.path.dirname(OUT), exist_ok=True)
out.save(OUT)
print(f'instance-archivo: {os.path.getsize(SRC)} B -> {os.path.relpath(OUT, SITE)} {os.path.getsize(OUT)} B ({AXES})')
