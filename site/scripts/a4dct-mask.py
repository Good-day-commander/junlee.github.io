#!/usr/bin/env python
# Produces public/media/a4dct/calcium-*.webp and .mp4 from the deck's renders with their baked captions removed.
# Run from site/: python -X utf8 scripts/a4dct-mask.py (needs Pillow, numpy, scipy and imageio-ffmpeg's ffmpeg binary).
"""
a4dct-mask: the A⁺4DCT posters and videos without the deck's baked captions.

    python -X utf8 scripts/a4dct-mask.py

Input   website_assets/a4dct-original/calcium-<score>.webp and .mp4
        (the renders as exported from the owner's deck; private, never committed)
Output  public/media/a4dct/calcium-<score>.webp and .mp4

The exported renders carry a white "FFR x.xx" caption with a leader line.
Each caption names one value that is not the value the page prints for that
case (the page's table comes from the deck's native charts), and it says FFR
while the frames show Pd(t)/Pa(t). The caption is an overlay, not data, so
it goes: the script finds its glyphs and leader line (near-white pixels, which
the colormap never produces; the colorbar's small tick labels are below the
size threshold and stay), fills them with the ground colour, and re-encodes
each video with the same mask on every frame. A contact sheet of the result
is written next to the originals for a look.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
ROOT = os.path.dirname(SITE)
SRC = os.path.join(ROOT, 'website_assets', 'a4dct-original')
OUT = os.path.join(SITE, 'public', 'media', 'a4dct')

try:
    import imageio_ffmpeg

    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:  # pragma: no cover
    FFMPEG = shutil.which('ffmpeg')
if not FFMPEG:
    sys.exit('a4dct-mask: no ffmpeg (pip install imageio-ffmpeg)')

stems = sorted(f[:-5] for f in os.listdir(SRC) if f.startswith('calcium-') and f.endswith('.webp'))
if not stems:
    sys.exit(f'a4dct-mask: no calcium-*.webp in {SRC}')


def caption_mask(rgb: np.ndarray) -> tuple[np.ndarray, dict]:
    """True where the caption glyphs and leader lines are (dilated), plus what was found."""
    strong = rgb.min(axis=2) > 150  # caption glyphs
    faint = rgb.min(axis=2) > 90  # a one-pixel leader line is antialiased, so it reads much darker than the glyphs
    mask = np.zeros(strong.shape, dtype=bool)
    glyph_boxes, leaders = [], 0
    lab, _ = ndimage.label(strong, structure=np.ones((3, 3)))
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        h = sl[0].stop - sl[0].start
        w = sl[1].stop - sl[1].start
        if 9 <= h <= 60 and w <= 60:  # a caption glyph (the colorbar's tick labels are under 9 px tall)
            glyph_boxes.append((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop))
    lab, _ = ndimage.label(faint, structure=np.ones((3, 3)))
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        h = sl[0].stop - sl[0].start
        w = sl[1].stop - sl[1].start
        comp = lab[sl] == i
        px = int(comp.sum())
        if h >= 8 and max(h, w) >= 12 and px <= 0.35 * h * w:  # a thin leader line (glyphs and tick labels are denser)
            mask[sl] |= ndimage.binary_dilation(comp, iterations=2)
            leaders += 1
    if glyph_boxes:
        x0 = min(b[0] for b in glyph_boxes) - 3
        y0 = min(b[1] for b in glyph_boxes) - 3
        x1 = max(b[2] for b in glyph_boxes) + 3
        y1 = max(b[3] for b in glyph_boxes) + 3
        mask[max(0, y0):y1, max(0, x0):x1] = True
    return mask, {'glyphs': len(glyph_boxes), 'leaders': leaders}


def run(cmd: list[str]) -> str:
    p = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if p.returncode != 0:
        sys.exit(f'a4dct-mask: {" ".join(cmd[:3])} failed\n{p.stderr[-800:]}')
    return p.stderr


os.makedirs(OUT, exist_ok=True)
report = {}
sheet = []
for stem in stems:
    poster = np.asarray(Image.open(os.path.join(SRC, f'{stem}.webp')).convert('RGB')).copy()
    mask, found = caption_mask(poster)
    poster[mask] = 0
    Image.fromarray(poster).save(os.path.join(OUT, f'{stem}.webp'), quality=82, method=6)
    sheet.append(Image.fromarray(poster))

    src_mp4 = os.path.join(SRC, f'{stem}.mp4')
    # a bare probe exits non-zero ("at least one output file"); its stderr still carries the stream line
    info = subprocess.run([FFMPEG, '-hide_banner', '-i', src_mp4], capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
    fps = re.search(r'(\d+(?:\.\d+)?) fps', info)
    fps = fps.group(1) if fps else '10'
    with tempfile.TemporaryDirectory() as tmp:
        run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-i', src_mp4, os.path.join(tmp, 'f-%03d.png')])
        frames = sorted(f for f in os.listdir(tmp) if f.endswith('.png'))
        for f in frames:
            path = os.path.join(tmp, f)
            fr = np.asarray(Image.open(path).convert('RGB')).copy()
            m = mask
            if m.shape != fr.shape[:2]:
                m = np.asarray(Image.fromarray(mask.astype(np.uint8) * 255).resize((fr.shape[1], fr.shape[0]), Image.NEAREST)) > 127
            fr[m] = 0
            Image.fromarray(fr).save(path)
        run([
            FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-framerate', fps, '-i', os.path.join(tmp, 'f-%03d.png'),
            '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', '-preset', 'slow',
            '-movflags', '+faststart', '-an', os.path.join(OUT, f'{stem}.mp4'),
        ])
        found['frames'] = len(frames)
    found['mp4_bytes'] = os.path.getsize(os.path.join(OUT, f'{stem}.mp4'))
    found['webp_bytes'] = os.path.getsize(os.path.join(OUT, f'{stem}.webp'))
    report[stem] = found

h = max(im.height for im in sheet)
contact = Image.new('RGB', (sum(im.width for im in sheet) + 8 * (len(sheet) - 1), h), (40, 40, 40))
x = 0
for im in sheet:
    contact.paste(im, (x, 0))
    x += im.width + 8
contact.save(os.path.join(SRC, 'masked-contact-sheet.png'))
print(json.dumps(report, indent=1))
print('contact sheet:', os.path.join(SRC, 'masked-contact-sheet.png'))
