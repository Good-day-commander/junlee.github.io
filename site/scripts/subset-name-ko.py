#!/usr/bin/env python
# Produces src/assets/fonts/pretendard-500-name-ko.woff2: Pretendard Medium cut to the glyphs of profile.nameKo.
# Run from site/: python -X utf8 scripts/subset-name-ko.py <path to Pretendard-Medium.woff2> (needs fontTools; node on PATH if brotli is missing).
"""
subset-name-ko: the Korean name in the identity block is the only Hangul on
the site, and Archivo has none. Rather than a system fallback, the three
glyphs ship as a Pretendard Medium subset of about 1 KB, preloaded with the
other first-viewport faces.

    python -X utf8 scripts/subset-name-ko.py <Pretendard-Medium.woff2>

Input   Pretendard-Medium.woff2 from the npm package `pretendard`
        (SIL Open Font License 1.1, github.com/orioncactus/pretendard;
        `npm pack pretendard` in a temporary folder gives
        package/dist/web/static/woff2/Pretendard-Medium.woff2)
Output  src/assets/fonts/pretendard-500-name-ko.woff2
        (only the glyphs of profile.nameKo, read from src/data/content.ts)

The script prints the unicode-range for src/styles/fonts.css; paste it into
the `Pretendard Name` face there whenever the name changes. The OFL permits
subsetting and bundling; the licence notice stays in the font's name table.

Needs fontTools. WOFF2 needs the brotli module; when it is missing, a shim
backed by Node's built-in zlib brotli is used instead (node must be on PATH).
"""
import os
import re
import subprocess
import sys
import tempfile
import types

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
OUT = os.path.join(SITE, 'src', 'assets', 'fonts', 'pretendard-500-name-ko.woff2')

if len(sys.argv) != 2 or not os.path.isfile(sys.argv[1]):
    sys.exit('subset-name-ko: pass the path to Pretendard-Medium.woff2')
SRC = sys.argv[1]

content = open(os.path.join(SITE, 'src', 'data', 'content.ts'), encoding='utf-8').read()
m = re.search(r'nameKo:\s*"([^"]+)"', content)
if not m:
    sys.exit('subset-name-ko: profile.nameKo not found in src/data/content.ts')
NAME = m.group(1)

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

from fontTools import subset  # noqa: E402
from fontTools.ttLib import TTFont  # noqa: E402

font = TTFont(SRC)
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['kern', 'ccmp']
options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]  # family, style, ids, version, licence
options.hinting = False
options.desubroutinize = True
subsetter = subset.Subsetter(options)
subsetter.populate(text=NAME)
subsetter.subset(font)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
font.save(OUT)

uranges = ', '.join(f'U+{ord(ch):04X}' for ch in dict.fromkeys(NAME))
print(f'subset-name-ko: {os.path.getsize(SRC)} B -> {os.path.relpath(OUT, SITE)} {os.path.getsize(OUT)} B for "{NAME}"')
print(f'unicode-range: {uranges};')
