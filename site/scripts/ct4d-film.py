#!/usr/bin/env python
# Produces public/data/image/{pressure,wss}-p<k>.webp: the J1 phase renders with their white backdrop taken out, for the film plate.
# Run from site/: python -X utf8 scripts/ct4d-film.py [--deck "<path>/Figure for 4DCT.pptx"] (needs Pillow, numpy and scipy).
"""
ct4d-film: the 4D CT phase frames on film instead of paper.

    python -X utf8 scripts/ct4d-film.py
    python -X utf8 scripts/ct4d-film.py --deck "<path>/Figure for 4DCT.pptx"

Input   website_assets/ct4d-original/{pressure,wss}-p<k>.png (private, never
        committed): the twenty lossless 1036 x 782 renders of Fig. 8 as
        they sit in the authors' figure deck. --deck reads them straight out
        of the deck instead (DECK_MEDIA maps its media files to phases).
Output  public/data/image/{pressure,wss}-p<k>.webp, RGBA, same size and
        names, so manifest.json and the island are unchanged; a contact
        sheet of the result on the film ground goes to --sheet.

The renders were exported on a white backdrop: a translucent heart shell
over an opaque coronary tree and aortic root. Taking the white out is an
unmixing against a known backdrop, P = a * F + (1 - a) * white, done in two
parts:
  - The tree is opaque. Pressure and WSS at one phase are the same scene
    with the tree coloured by a different field, so the pixels that differ
    between the two frames are the tree; there alpha is 1 and the colour is
    the pixel as rendered (where the shell lies in front of the tree, the
    tint is already in it and involves no white).
  - Everything else (the shell over white, antialiased edges) gets the
    smallest alpha that explains the pixel over white, a = 1 - min(P) / 255,
    and the colour that alpha implies (premultiplied F = P - (1 - a) * 255).
    Composited back over white this returns the source pixel exactly.
"""
from __future__ import annotations

import argparse
import io
import os
import sys
import zipfile

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
ROOT = os.path.dirname(SITE)
SRC = os.path.join(ROOT, 'website_assets', 'ct4d-original')
OUT = os.path.join(SITE, 'public', 'data', 'image')
PHASES = 10
FIELDS = ('pressure', 'wss')
# Media files of "Figure for 4DCT.pptx" per phase 0-9, matched to the frames first shipped (pixel MSE about 2 against 25 or more for the next best).
DECK_MEDIA = {
    'pressure': ['image23', 'image24', 'image25', 'image26', 'image27', 'image34', 'image35', 'image36', 'image37', 'image38'],
    'wss': ['image18', 'image19', 'image20', 'image21', 'image22', 'image28', 'image29', 'image30', 'image31', 'image32'],
}
SIZE = (1036, 782)
# --film-0, oklch(0.15 0.008 250), in sRGB: the contact sheet's ground.
FILM = (9, 11, 14)
TREE_DIFF = 6  # a channel difference above WebP and PNG noise; the shell pixels of the two fields are identical
HOLE_MAX = 24  # px
NEAR = 6  # px
QUALITY, ALPHA_QUALITY = 70, 70  # about 24 KB a frame; the shipped white-ground frames were about 18 KB


def load_sources(deck: str | None) -> dict[str, list[np.ndarray]]:
    frames: dict[str, list[np.ndarray]] = {}
    if deck:
        z = zipfile.ZipFile(deck)
        read = lambda f, k: Image.open(io.BytesIO(z.read(f'ppt/media/{DECK_MEDIA[f][k]}.png')))
    else:
        if not os.path.isdir(SRC):
            sys.exit(f'ct4d-film: no {SRC}; pass --deck with the figure deck')
        read = lambda f, k: Image.open(os.path.join(SRC, f'{f}-p{k}.png'))
    for f in FIELDS:
        frames[f] = []
        for k in range(PHASES):
            im = read(f, k)
            if im.size != SIZE:
                sys.exit(f'ct4d-film: {f} phase {k} is {im.size}, expected {SIZE}')
            frames[f].append(np.asarray(im.convert('RGB')).astype(np.float64))
    return frames


def tree_mask(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """True on the opaque tree: where the two fields' renders of one phase differ, with its pinholes closed."""
    m = np.abs(a - b).max(axis=2) > TREE_DIFF
    # Where the two maps agree the difference misses the tree; near it, a grey or blue pixel is tree too, since
    # the shell over white is always reddish (R above B).
    near = ndimage.binary_dilation(m, structure=np.ones((3, 3)), iterations=NEAR)
    for rgb in (a, b):
        m |= near & (rgb.min(axis=2) < 250) & (rgb[..., 2] >= rgb[..., 0] - 4)
    # Specks and thin seams where the two colour maps happen to agree are filled (closed by a pixel first, so a
    # seam that reaches the outline counts); a wide hole is shell over white seen between branches that close a
    # loop, and it keeps its translucency.
    closed = ndimage.binary_closing(m, structure=np.ones((3, 3)))
    holes = ndimage.binary_fill_holes(closed) & ~m
    lab, n = ndimage.label(holes, structure=np.ones((3, 3)))
    if n:
        sizes = ndimage.sum(holes, lab, range(1, n + 1))
        wide = ndimage.binary_erosion(holes, structure=np.ones((3, 3)), iterations=2)
        has_core = ndimage.maximum(wide, lab, range(1, n + 1)) > 0
        fill = np.isin(lab, 1 + np.flatnonzero((sizes <= HOLE_MAX) | ~has_core))
        m |= fill & (np.minimum(a.min(axis=2), b.min(axis=2)) < 245)  # a white sliver between crossing branches is backdrop
    lab, n = ndimage.label(m, structure=np.ones((3, 3)))
    if n:
        sizes = ndimage.sum(m, lab, range(1, n + 1))
        m = np.isin(lab, 1 + np.flatnonzero(sizes >= 40))
    # The outline pixels are part tree, part white; they take the unmixing like the shell does.
    return ndimage.binary_erosion(m, structure=np.ones((3, 3)))


def unmix(rgb: np.ndarray, opaque: np.ndarray) -> np.ndarray:
    """RGBA uint8 from a render on white: alpha 1 on `opaque`, the least alpha over white elsewhere."""
    alpha = 1.0 - rgb.min(axis=2) / 255.0
    alpha[opaque] = 1.0
    premul = rgb - (1.0 - alpha[..., None]) * 255.0
    colour = np.where(alpha[..., None] > 0, premul / np.maximum(alpha[..., None], 1e-6), 0.0)
    out = np.dstack([np.clip(colour, 0, 255), alpha * 255.0])
    return np.round(out).astype(np.uint8)


def over(rgba: np.ndarray, ground: tuple[int, int, int]) -> np.ndarray:
    a = rgba[..., 3:4] / 255.0
    return np.round(rgba[..., :3] * a + np.array(ground) * (1 - a)).astype(np.uint8)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--deck', help='read the renders from the figure deck (.pptx) instead of website_assets/ct4d-original')
    ap.add_argument('--out', default=OUT)
    ap.add_argument('--sheet', default=os.path.join(SRC, 'film-contact-sheet.png'))
    args = ap.parse_args()

    frames = load_sources(args.deck)
    os.makedirs(args.out, exist_ok=True)
    sheet_rows = {f: [] for f in FIELDS}
    total = 0
    for k in range(PHASES):
        opaque = tree_mask(frames['pressure'][k], frames['wss'][k])
        for f in FIELDS:
            src = frames[f][k]
            rgba = unmix(src, opaque)
            # Back over white must give the source: the unmixing is exact up to rounding.
            err = np.abs(over(rgba, (255, 255, 255)).astype(int) - src.astype(int)).max()
            if err > 2:
                sys.exit(f'ct4d-film: {f} phase {k} does not recomposite over white (max error {err})')
            path = os.path.join(args.out, f'{f}-p{k}.webp')
            Image.fromarray(rgba).save(path, quality=QUALITY, alpha_quality=ALPHA_QUALITY, method=6, exact=False)
            size = os.path.getsize(path)
            total += size
            print(f'{f}-p{k}.webp  {size:6d} B  tree {int(opaque.sum()):6d} px  over-white error {err}')
            sheet_rows[f].append(over(np.asarray(Image.open(path).convert('RGBA')), FILM))
    print(f'total {total} B')

    if args.sheet:
        os.makedirs(os.path.dirname(args.sheet), exist_ok=True)
        # The plate crop only (the tree sits in the middle of an empty frame), five phases a row, pressure rows then WSS rows.
        x0, y0, x1, y1 = 250, 90, 790, 710
        tiles = [Image.fromarray(t[y0:y1, x0:x1]) for f in FIELDS for t in sheet_rows[f]]
        w, h = x1 - x0, y1 - y0
        cols = 5
        rows = (len(tiles) + cols - 1) // cols
        contact = Image.new('RGB', (cols * w + (cols - 1) * 4, rows * h + (rows - 1) * 4), (60, 60, 60))
        for i, t in enumerate(tiles):
            contact.paste(t, ((i % cols) * (w + 4), (i // cols) * (h + 4)))
        contact.save(args.sheet)
        print('contact sheet:', args.sheet)


if __name__ == '__main__':
    main()
