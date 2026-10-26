---
name: hyeongjunlee.me
description: A light box with film plates on it; the research is the image on the film, read in one ink family with one clinical red. Revision 2g (2026-10-21).
colors:
  film-0: "oklch(0.15 0.008 250)"
  film-1: "oklch(0.21 0.008 250)"
  film-2: "oklch(0.28 0.01 250)"
  film-line: "oklch(0.38 0.01 250)"
  bone: "oklch(0.94 0.006 85)"
  bone-2: "oklch(0.8 0.012 85)"
  bone-3: "oklch(0.64 0.012 85)"
  box: "oklch(0.975 0.004 85)"
  box-2: "oklch(0.94 0.006 85)"
  box-3: "oklch(0.9 0.008 85)"
  box-ink: "oklch(0.18 0.012 250)"
  box-ink-2: "oklch(0.4 0.02 250)"
  box-ink-3: "oklch(0.52 0.02 250)"
  box-line: "oklch(0.86 0.012 250)"
  signal: "oklch(0.62 0.21 27)"
  signal-fill: "oklch(0.52 0.2 27)"
  signal-hover: "oklch(0.46 0.19 27)"
  signal-soft: "oklch(0.62 0.21 27 / 0.18)"
typography:
  name:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.5rem + 2.6vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 92"
  name-ko:
    fontFamily: "Pretendard Name, Apple SD Gothic Neo, Malgun Gothic, Noto Sans KR, sans-serif"
    fontSize: "clamp(1.125rem, 0.8rem + 1.1vw, 1.5rem)"
    fontWeight: 500
    lineHeight: 1
  display-page:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.6rem + 3vw, 4rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 92"
  headline:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.35rem + 1.2vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  row-title:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.975rem"
    fontWeight: 600
    lineHeight: 1.35
  summary:
    fontFamily: "STIX Two Text, Times New Roman, Georgia, serif"
    fontSize: "1.1875rem (1rem at 640px and under)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "STIX Two Text, Times New Roman, Georgia, serif"
    fontSize: "1.0625rem (1rem at 640px and under)"
    fontWeight: 400
    lineHeight: 1.65
  caption:
    fontFamily: "STIX Two Text, Times New Roman, Georgia, serif"
    fontSize: "0.95rem (0.9rem at 640px and under)"
    fontWeight: 400
    lineHeight: 1.5
    fontStyle: "italic"
  ui:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 500
    lineHeight: 1.3
  mono:
    fontFamily: "JetBrains Mono Variable, JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: "0.8rem (light box), 0.8125rem (film)"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0"
    fontFeature: "tabular-nums"
  label:
    fontFamily: "JetBrains Mono Variable, JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: "0.75rem (light box), 0.8125rem (film)"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.08em"
    fontFeature: "tabular-nums"
rounded:
  base: "2px"
spacing:
  space-1: "0.5rem"
  space-2: "1rem"
  space-3: "1.5rem"
  space-4: "2rem"
  space-5: "3rem"
  space-6: "4rem"
  gutter: "clamp(1rem, 3vw, 2.5rem)"
  width-frame: "clamp(50rem, 58vw, 64rem)"
  width-record: "clamp(60rem, 66vw, 78rem)"
  width-label: "11rem"
  corner-inset: "0.5rem"
  nav-h: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.signal-fill}"
    textColor: "{colors.bone}"
    typography: "{typography.ui}"
    rounded: "{rounded.base}"
    padding: "0.6rem 1.1rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.signal-hover}"
    textColor: "{colors.bone}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.box-ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.base}"
    padding: "0.6rem 1.1rem"
    height: "2.75rem"
  button-ghost-hover:
    backgroundColor: "{colors.box-ink}"
    textColor: "{colors.box}"
  button-compact:
    typography: "{typography.ui}"
    rounded: "{rounded.base}"
    padding: "0.3rem 0.7rem"
    height: "2rem"
  nav:
    backgroundColor: "{colors.box}"
    height: "{spacing.nav-h}"
  nav-link:
    textColor: "{colors.box-ink-2}"
    typography: "{typography.ui}"
    padding: "0.9rem 0"
  nav-link-current:
    textColor: "{colors.box-ink}"
  nav-email:
    backgroundColor: "{colors.signal-fill}"
    textColor: "{colors.bone}"
    rounded: "{rounded.base}"
    padding: "0.3rem 0.7rem"
    height: "2rem"
  identity-portrait:
    rounded: "{rounded.base}"
    width: "6rem"
    height: "6rem"
  identity-link:
    textColor: "{colors.box-ink}"
    typography: "{typography.mono}"
    padding: "0.4rem 0"
  updates-row:
    textColor: "{colors.box-ink}"
    typography: "{typography.body}"
    padding: "0.6rem 0"
  disclosure-row:
    textColor: "{colors.box-ink-2}"
    typography: "{typography.ui}"
    padding: "0.6rem 0"
  footer:
    backgroundColor: "{colors.box}"
    padding: "1.5rem 0 2rem"
  footer-link:
    textColor: "{colors.box-ink}"
    typography: "{typography.mono}"
    padding: "0.45rem 0"
  plate:
    backgroundColor: "{colors.film-0}"
    textColor: "{colors.bone}"
    rounded: "{rounded.base}"
  home-plate:
    backgroundColor: "{colors.film-0}"
    rounded: "{rounded.base}"
    width: "{spacing.width-frame}"
  corner-readout:
    textColor: "{colors.bone-3}"
    typography: "{typography.label}"
    padding: "0.1rem 0.25rem"
  colorbar-strip:
    width: "10px"
    height: "min(56%, 320px)"
  colorbar-tick:
    textColor: "{colors.bone-2}"
    typography: "{typography.label}"
  segment-button:
    backgroundColor: "{colors.film-0}"
    textColor: "{colors.bone-2}"
    padding: "0.4rem 0.75rem"
    height: "2rem"
  segment-button-pressed:
    textColor: "{colors.bone}"
  wipe-grip:
    backgroundColor: "{colors.film-0}"
    textColor: "{colors.bone}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "0.3rem 0.55rem"
  case-select:
    backgroundColor: "{colors.film-0}"
    textColor: "{colors.bone}"
    typography: "{typography.mono}"
    rounded: "{rounded.base}"
    padding: "0.25rem 2.25rem 0.25rem 0.75rem"
    height: "2.5rem"
  rolemark:
    backgroundColor: "transparent"
    textColor: "{colors.box-ink-2}"
    rounded: "{rounded.base}"
    padding: "0 0.5rem"
    height: "1.5rem"
  rolemark-first:
    textColor: "{colors.box-ink}"
  rolemark-co-first:
    textColor: "{colors.box-ink}"
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.box-ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "0 0.4rem"
    height: "1.25rem"
  cv-row:
    typography: "{typography.row-title}"
    padding: "0.3rem 0"
  cv-action-bar:
    backgroundColor: "{colors.box}"
    height: "2.75rem"
  lightbox:
    backgroundColor: "{colors.film-0}"
    textColor: "{colors.bone}"
    rounded: "{rounded.base}"
  metrics-table:
    typography: "{typography.mono}"
    padding: "0.45rem 1.5rem 0.45rem 0"
  scrubber-plate:
    backgroundColor: "{colors.box}"
    rounded: "{rounded.base}"
  skip-link:
    backgroundColor: "{colors.signal-fill}"
    textColor: "{colors.bone}"
    typography: "{typography.ui}"
    rounded: "{rounded.base}"
    padding: "0.5rem 0.75rem"
---

# Design System: hyeongjunlee.me

Revision 2g (2026-10-21), verified against `main` at d98ead9 on 2026-10-26. This file describes what is built. The direction contract is `.impeccable/surfaces/site-src-pages-index-astro.md` (its Revision 2 block, as amended by Revisions 2a to 2g, governs); where the contract and `CLAUDE.md` disagree, the owner rules in `CLAUDE.md` win. The machine-readable twin of this file is `.impeccable/design.json`.

## Overview

**Creative North Star: "The Light Box and the Film"**

The world is the cath-lab reading room: a light box with angiographic film clipped to it. The page is the light box, white and quiet, carrying who he is and the record in rows. The research is the film: every data artifact (the vessel viewer, the FFR curve, the spectrograms, the CT phase scrubber, the A⁺4DCT results chart) is a dark film plate with a hairline, sitting on the box. Nothing decorative competes with the plates; UI chrome is thin and mono, so it reads as instrument marking rather than interface.

Three pages. `/` is a Read surface, identity first: the name with the Korean name beside it, the role line with the four fields, the owner's one sentence, the address and the profile links, then one closed Updates row, then one quiet live plate and the sentence under it, then the Work rows and three selected papers. `/research` is an Experience surface: every research project in one flat list, newest first, each a title with its years, one sentence and an outputs line that links into the CV; three of them carry live demos (PINO, 4D CT, fluid bolus) whose plates stay in view while the method and metrics fold into one row closed at every width, one carries the A⁺4DCT results plate and two carry a paper figure. There is no citation line: the outputs line links each paper's CV row. `/cv` is the whole record, dense: rows, not frames. `/publications` and `/record` are meta-refresh redirects to `/cv/#publications` and `/cv/#talks`.

The ground follows the system scheme. The light box is the default; `prefers-color-scheme: dark` turns the whole page to film. Plates are film in both schemes, so in dark mode a plate is film on film, separated by its hairline. There is no manual toggle and no per-page surface switch. Components read semantic aliases only (`--bg`, `--ink`, `--line` and their tiers), which the scheme resolves for the page and the `.plate` scope re-declares to film for a plate. Print is ink on white paper in either scheme.

Rank is carried by border ink, never by weight, fill or color flooding. First-author work carries a primary-ink border on its role mark; co-first a secondary-ink border; co-authored a hairline. Signal never marks rank. Type weight stays even (one heading weight, 600), so the eye ranks by geometry.

**Key Characteristics:**
- Light box by default, film under the dark scheme; data plates are film in both. One ink family per ground, one clinical red on both.
- Identity first: the name is the h1; the plate is the one live proof near the top of home, quiet (pressure only, the CFD | PINO wipe, the colorbar, the idle drift).
- Rows, not frames, for everything that is a record: the Updates row, the Work rows and selected papers on home, the outputs lines on /research, dense CV rows on /cv.
- One centred fluid column for every block; text narrows by measure, never by a narrower box.
- Three faces with fixed jobs: Archivo (width 92 for the name and page titles) for naming and UI, STIX Two Text for reading, JetBrains Mono for numbers, units, identifiers, DOIs, years, tables and link rows; a Pretendard subset only for the Korean name.
- Phones (640px and under) are a disclosure layer over the same HTML, never a different site.
- Flat throughout; depth is a hairline or a one-step tonal lift, plus one static grain sheet on a film page.
- Signal red is reserved: probes, the PINO trace and the A⁺4DCT marks, active underlines, focus rings, selection, the hover state of icons and underlines, and the one primary action (the nav's Email).
- Motion is physical evidence and quiet state: the PINO layer develops over the measured 1.78 s once, the vessel drifts, folds ease their height; reduced motion stops all of it.

## Colors

Two inks (a tinted near-black and a tinted bone) on two grounds, with one clinical red shared by both.

### Primary
- **Clinical Signal** (`signal`): the one red, used as a stroke, a state or a data mark: the PINO curve, the probe markers, the A⁺4DCT dots and the underline under the enhanced reading, the current-page underline in the nav, link-underline and icon hover, the focus ring, the caret and form accent, the pressed segment underline, the copied state of Copy BibTeX. On about 1% of any screen.
- **Signal Fill** (`signal-fill`): the darker step under bone text. The nav's Email action and the skip link only; `signal` itself falls short of AA under bone text and is never a text ground.
- **Signal Hover** (`signal-hover`): primary-action hover.
- **Signal Soft** (`signal-soft`): 18% alpha; text selection on both grounds.

### Neutral: Light Box (the default page ground)
- **Box** (`box`): page ground in the light scheme and in print; also the light box inside a film plate (the phase scrubber's sheet).
- **Box 2 / Box 3** (`box-2`, `box-3`): one and two tonal steps up (image placeholders, the BibTeX panel, the selected row on the A⁺4DCT chart).
- **Box Ink / Box Ink 2 / Box Ink 3** (`box-ink`, `box-ink-2`, `box-ink-3`): primary, secondary and tertiary ink on the box.
- **Box Line** (`box-line`): every hairline on the box; its 60% alpha (`--line-soft`) draws row and table rules.

### Neutral: Film (the dark page ground, and every plate)
- **Film 0** (`film-0`): page ground under the dark scheme and the ground of every plate in both schemes. Cool, never pure black.
- **Film 1** (`film-1`): one raised step (the spectrogram stage, the BibTeX panel on a film page).
- **Film 2** (`film-2`): scrollbar thumb on film; the selected row on the A⁺4DCT chart.
- **Film Line** (`film-line`): every hairline on film; its 55% alpha draws chart grids and row rules.
- **Bone** (`bone`): primary ink on film; the wipe seam, the CFD trace, the playhead.
- **Bone 2** (`bone-2`, 0.80): secondary ink on film: captions, nav links at rest, colorbar ticks. Held at 0.80 or lighter (the round-2 0.74 read poorly in dark).
- **Bone 3** (`bone-3`, 0.64): tertiary ink on film: corner chrome, axis ticks, icons and carets at rest, the colophon. 0.64 clears 4.5:1 on film-0 and film-1 (5.85:1 and 5.26:1); 0.60 gave 4.49:1 on film-1.
- **Dim** (`oklch(0.1 0.008 250 / 0.82)`): the flat backdrop behind the CV photo lightbox; the one translucent layer, and it is a dim, not a panel.

### Data colormaps (not UI colors)
Field colors are never drawn from the UI palette. They live once in `site/src/lib/colormaps.ts` and are shared by every viewer and colorbar:
- **turbo** paints pressure (CFD and PINO on one shared range).
- **diverging** (Moreland cool-warm: blue, bone-gray, red) paints the signed pressure error PINO − CFD on a fixed symmetric scale: ±(the 99th percentile of |p_err|, rounded up to 0.5 kPa). Values past +scale take the above-range yellow (`rgb(255 214 0)`), so the throat reads as a different ink, not a saturated end.
- **viridis** paints near-wall speed and the spectrograms.
Masked regions (inlet and outlet caps) are painted in a bone tint so they read as chrome; the viewer still holds the round-2 bone-3 value (sRGB 120 116 109, oklch 0.56) in `islands/vessel/colors.ts`, not the current 0.64 (recorded drift, see Revisions).

**Paper-native colormap (the phase scrubber).** The 4D CT frames are the authors' renders from J1 (Fig. 8, Case 1) in ParaView's cool-to-warm map. The site never recolors a paper raster; the scrubber's legend reproduces that ramp with the site's `diverging` map sampled at 16 stops, with the mmHg range and its kPa reading in mono.

### Named Rules
**The Two-Ink Rule.** Each ground has exactly one ink family in three tiers (box-ink on the light box, bone on film), plus the one signal red. No other UI color exists; colormaps belong to the data.

**The Alias Rule.** Components read `--bg`, `--bg-1`, `--bg-2`, `--line`, `--line-soft`, `--ink`, `--ink-2`, `--ink-3` only. `:root` resolves them to the light box; `@media (prefers-color-scheme: dark)` resolves them to film; `@media print` forces the light set back on `:root`; `.plate` re-declares them to film (with `color-scheme: dark` and the film mono and label sizes) for a plate in either scheme and in print. Raw `film-*` and `box-*` values are referenced directly only where an element must hold the other ground inside a plate (the scrubber's light-box sheet).

**The Plate Rule.** A plate is any element in the `.plate` scope that holds a viewer, a chart, a spectrogram, a CT frame, a paper figure or an enlarged photograph (`<Frame plate>`, the paper-figure image, the CV lightbox dialog). It is film in both schemes: dark film on the light box, film on film (separated by its hairline) in dark. Nothing that is not data or an image sits on film.

**The Light-Box Rule.** White inside a film plate is the light box of the world, never a bare rectangle: it carries a hairline and mono corner chrome or a caption, and holds only a raster from the paper or the data, composited with `mix-blend-mode: multiply` so the figure's own white becomes the box ground (normal blending under forced colors).

**The Signal-Is-A-Stroke Rule.** Signal red is a border, underline, ring, curve, data mark or icon state. Under text it is a fill only on the nav's Email action and the skip link, and then as `signal-fill`.

## Theme

- `:root` holds the light-box aliases and `color-scheme: light`. `@media (prefers-color-scheme: dark)` swaps them for film, sets `color-scheme: dark` and raises mono and label type to 13px (`0.8125rem`). There is no toggle and no `data-surface` attribute.
- `.plate` (in `tokens.css`) carries the film aliases, `color-scheme: dark` and the 13px mono and label sizes in both schemes.
- `@media print` forces the light aliases and the light mono and label sizes on `:root` in either scheme, so a dark-scheme print is ink on white; plates keep their film.
- `<meta name="color-scheme" content="light dark">` and two `theme-color` metas (`#f9f8f6` light, `#1a1b1f` dark).
- Selection, caret, focus ring, form accent and scrollbar are themed from the palette in both schemes.
- Forced colors (Windows high contrast): every colormap strip keeps its ramp (`forced-color-adjust: none` on the viewer colorbars, the spectrogram scale, the scrubber ramp and the FFR key swatches), the pressed segment is outlined in `Highlight`, the CFD trace takes `CanvasText`, and the scrubber's CT frame drops its multiply blend.
- **The Dark Floor Rule.** On film, secondary ink is no darker than 0.80 lightness and mono and label type never fall below 13px. Every text and ground pair holds at least 4.5:1 in both schemes.
- **The One Grain Rule.** A film page (the dark scheme) carries exactly one grain layer, applied by `body::after`: a static feTurbulence sheet tiled at 256px at 5% opacity, never animated, removed in print. The light box carries none, and plates add none of their own.

## Typography

**Display Font:** Archivo Variable (with Archivo, system-ui, sans-serif)
**Body Font:** STIX Two Text (with Times New Roman, Georgia, serif)
**Label/Mono Font:** JetBrains Mono Variable (with JetBrains Mono, ui-monospace, Menlo, Consolas, monospace)
**Korean name:** Pretendard Name, a Pretendard Medium subset of only the glyphs of `profile.nameKo` (with Apple SD Gothic Neo, Malgun Gothic, Noto Sans KR)

**Character:** a compressed grotesk for names and controls, a narrow scientific serif for reading, a mono for everything measured. The mono does the measuring, the serif does the arguing, the grotesk does the naming. All faces are self-hosted and `font-display: swap`; fonts are never inlined into CSS as data URLs. Archivo stays variable because the name and page titles use the `wdth` 92 axis; its latin subset ships instanced to the ranges the site sets (wght 400–600, wdth 92–100; `scripts/instance-archivo.py`, declared in `src/styles/fonts.css`). Archivo has no Hangul, so the Korean name is set in a Pretendard Medium subset cut by `scripts/subset-name-ko.py` (its `unicode-range` pasted into `fonts.css`). Preloaded on every page: Archivo latin, STIX latin 400 and the Korean-name subset; the CV also preloads the JetBrains Mono latin face, since its first screen is mostly mono.

### Hierarchy
- **Name** (Archivo 600, width 92, `clamp(2.25rem, 1.5rem + 2.6vw, 3.5rem)`, 1.0, -0.025em): the home h1, the owner's name.
- **Korean name** (Pretendard Name 500, `clamp(1.125rem, 0.8rem + 1.1vw, 1.5rem)`, 1.0, ink-2, `lang="ko"`): beside the h1 on the same baseline, 0.6rem after it.
- **Display (page)** (Archivo 600, width 92, `clamp(2.25rem, 1.6rem + 3vw, 4rem)`, 1.0, -0.025em): the h1 of /research. The CV's h1 (the name) holds `clamp(2rem, 1.5rem + 1.8vw, 2.75rem)`.
- **Headline** (600, `clamp(1.75rem, 1.35rem + 1.2vw, 2.25rem)`, 1.1, -0.015em): the project titles on /research.
- **Title** (600, 1.25rem, 1.3, -0.01em): home section headings (Work, Selected) over a hairline and CV section headings over a primary-ink rule.
- **Row title** (600, 0.975–1.0625rem, 1.35–1.4): Work names, selected-paper titles, CV entry titles.
- **Summary** (STIX 400, 1.1875rem, 1.45): the one sentence under a research project's title.
- **Body** (STIX 400, 1.0625rem, 1.65): research paragraphs (60ch measure), the Updates sentences (1.5), Work clauses (1.5). The tagline and the CV intro hold 1.125rem.
- **Caption** (STIX italic, 0.95rem, 1.5, ink-2): figure and table captions.
- **UI** (Archivo 500, 0.95rem, 1.3): nav, buttons, the identity role line, the Method and metrics rows. Compact controls hold 0.85rem; the nav drops to 0.875rem under 480px.
- **Mono** (JetBrains Mono 400, 0.8rem on the box, 0.8125rem on film, 1.4, tabular): the identity and footer link rows, the Updates dates, project years and outputs lines, years, venues, DOIs, CV period columns and count lines, the CV contact and jump rows, metrics tables, BibTeX, the colophon.
- **Label** (JetBrains Mono, 0.75rem on the box, 0.8125rem on film, 0.08em, uppercase, ink-3): corner chrome, colorbar labels, tags, the wipe grip. Corner chrome is uppercase only for unit-free identifiers of 14 characters or fewer; anything with a unit keeps its case and tracks at 0.04em.

At 640px and under, prose, the research summaries and captions step down one size (1rem, 1rem, 0.9rem) from one rule in `tokens.css`.

### Numbers, units and labels
Every figure is computed from `content.ts` or a data manifest through `site/src/lib/schema.ts` and `site/src/lib/format.ts`; none is typed in a component, and the markdown twins and `llms*.txt` read the same values.
- **Joins:** value and unit are joined by a narrow no-break space (U+202F), which also groups thousands (8 649 nodes); negatives take a true minus; ranges take an en dash and one trailing unit (10.7–13.0 kPa).
- **Pressure:** kPa at one decimal. Where the source unit is mmHg (the scrubber), the mmHg range leads and the kPa reading follows.
- **FFR (Pd/Pa):** two decimals in captions, readouts, the curve key and on the A⁺4DCT chart; three in metrics tables (the PINO table's case column and its FFR MAE, the A⁺4DCT no-script table) and for the CFD–PINO difference.
- **Time and length:** seconds at two decimals (1.78 s), millimetres at one.
- **CFD reference time:** "CFD up to 35 min on 64 CPU cores", a measured bound from the owner (content.ts `cfdReference`); never converted, extrapolated or turned into a speed-up factor above "about 1,000x".
- **PINO metrics label:** "current model, 85 cases, 10-fold CV", always.
- **Manuscript status:** one label, "manuscript under revision (EAAI)", printed once per entry (on /research inside the outputs line).
- **DOI:** `doi:` lowercase with no space, then the identifier, in mono, linked to doi.org; on phones the word "DOI".
- **Short venues:** a printed short venue over 14 characters fails the build (`schema.ts`, `VENUE_MAX`).

### Named Rules
**The Mono Number Rule.** Numbers, units, identifiers, DOIs, years, tables and link rows are set in JetBrains Mono with tabular numerals; `code`, `time` and `data` inherit it globally. Prose is never mono: a measured value inside a STIX caption is wrapped in `.num` but reads in the caption's own face.

**The One Formatter Rule.** A precision is a property of the quantity, not of the page: kPa at one decimal, FFR at two (three in metrics tables), seconds at two, mm at one.

**The Even Weight Rule.** Headings carry one weight (600), UI 500, body 400. Rank is carried by size, measure and border ink, never by bolding (the owner's name in an author list is the one bold).

**The Unit Keeps Its Case Rule.** Uppercase is chrome for short identifiers (C1, J2) and tags; units and ratios are never uppercased or tracked.

## Layout

One centred fluid column, `--width-frame: clamp(50rem, 58vw, 64rem)`, which the CV widens to `--width-record: clamp(60rem, 66vw, 78rem)` (`<html data-width="record">`), with a fluid root size `clamp(1rem, 0.75rem + 0.3125vw, 1.15rem)` and a fluid gutter (`clamp(1rem, 3vw, 2.5rem)`), for everything: nav, identity, the Updates row, plates, rows, projects, tables and footer. Every block spans the column edge to edge. Text narrows by measure, never by a narrower box. The page is a flex column (`min-height: 100dvh`): the 3rem sticky nav, a flexible `main`, the footer.

Vertical rhythm is on an 8px base (`space-1` 0.5rem to `space-6` 4rem). Home sections pad 2rem above a Title heading with a hairline under it; research projects pad 4rem (3rem at 640px and under); CV sections pad 1.5rem.

- **Home:** the identity block (2rem above, 1.5rem below), the Updates row (1.5rem below), the plate (2:1, at most 60vh, at least 16rem; 3:4 at the full column width under 900px) with one STIX line 1rem under it, then Work and Selected.
- **Home budget:** at most 250 visible words in `<main>`; a closed `<details>` counts only its `<summary>` (`scripts/budget.mjs`).
- **Research:** the h1 alone, then every project as a header row (title and the years at the right), the summary, the outputs line, and for a demo the plates and one ruled Method and metrics row closed at every width. At most 1000 visible words in `<main>` and 260 per project.
- **CV:** a sticky action bar under the nav (`top: var(--nav-h)`), `scroll-padding-top` grown by its height so anchors land clear of both; the header (an 80px portrait, the name as h1, the intro line, two role lines, the mono contact row) over a primary-ink rule, the phone jump row, then up to nine sections with anchors: `#education`, `#appointments`, `#publications`, `#talks`, `#patents`, `#projects`, `#awards`, `#teaching`, `#skills`. An empty list drops its section and its jump link.

### The phone layer (640px and under)
Progressive disclosure over the same server HTML; `scripts/smoke.mjs` checks the layer at 390px and its absence at 1440px.
- **Identity:** the portrait (4rem) sits beside the lead; the role line drops the lab clause (role · university); the address takes the link row's first line.
- **Updates:** the date stacks over the sentence, the caret on the date's line.
- **Home:** the Work rows are hidden (the fields line and the nav's Research carry them); Selected prints its DOI as the word "DOI".
- **Research:** a project's outputs line shows its first item and a Phosphor caret (`aria-label="More outputs, N"`) that shows or hides the rest in place; the "CFD left, PINO right" clause hides; the header row stacks.
- **CV:** a mono jump row of the section headings under the header; Talks, Patents, Funded projects, Awards, Teaching and Skills fold behind their headings (native `<details>` shipped open, closed by an inline script on phones, opened by any anchor into them; inert and out of the tab order above 640px); the publication id column hides, and under 600px the citation uses the venue code and the DOI the word "DOI".
- **Type:** prose, summaries and captions step down one size.

Other steps: 480px (nav gaps 1rem, type 0.875rem), 600px (metrics tables stack each metric as a block), 760px (CV period rows, skills, talks and patents to fewer columns; CV portrait 4rem; talk photos 96px), 900px (Work rows to one column; the home plate to 3:4), and a 640px container query inside the viewer (the wipe handle gives way to the two-state toggle; in chapter plates the colorbar and controls move into rows under the canvas). Under 21.98rem (a phone at 200% zoom) the nav row wraps, the home portrait moves under the lead, figures, Method and metrics rows and projects take the column as one track, outputs and talk formats may break inside themselves, the viewer's field toggle wraps and the colour scale and spectrogram time axes name every other tick, the dB scale halves, a metric's value takes the line under its label, and the CV header stacks.

### Named Rules
**The One Column Rule.** Every block (nav, identity, Updates, plates, rows, tables, footer) starts and ends where the column does. Measure is the only thing that narrows text; a centred narrower box, a centred plate or an indented caption breaks the rule.

**The One Target Rule.** A link target appears once per page in the human layer, and an action word once per viewport. Each Work row links its own research project (`#lbm-ctffr`, `#pino`, `#viscosity`, `#ffr-simulator`) and nothing repeats one; the sticky nav carries Email and CV on every page. A page carries at most three `mailto:`: the nav's Email, the address written as text (home identity row) and the footer's address; a redirect stub carries none; every target is `profile.email`; `scripts/budget.mjs` fails the build otherwise.

**The Two Things Rule.** The human layer is short and uneven: two big things (the identity block and the plate on home; the artifacts on research), everything else as rows. The machine layer (markdown twins, `llms.txt`, `llms-full.txt`, `cv.json`, JSON-LD) is complete.

## Elevation & Depth

The system is flat: no drop shadows, glows, gradients (outside colorbars and legend ramps, which draw a colormap), blur or translucent panels. Depth is a 1px hairline in the ground's line color, a one-step tonal lift to `--bg-1`, or the film plate itself against the light box. The CV lightbox opens over a flat dim, not a blur.

### Named Rules
**The Hairline-Not-Shadow Rule.** Separation is a 1px line or a tonal step. The only `box-shadow` in the build is the inset 2px signal underline on a pressed segmented button (viewer and scrubber), an underline by another property.

## Shapes

Rectangles with a 2px radius (`rounded.base`) on everything with an edge: plates, buttons, role marks, tags, the wipe grip, the case select, portraits, photos, the lightbox, the focus ring. The colorbar strip takes 1px. Borders are 1px everywhere; a stronger edge is a change of ink (hairline, ink-2, ink, signal), never a thicker stroke. Charts use `shape-rendering: crispEdges` on grids and axes, 1.5px round-joined strokes for the CFD and PINO traces, and 2/3 dashed hairlines for probes; the A⁺4DCT chart marks 4DCT as an open circle, A⁺4DCT as a signal dot and invasive FFR as an open diamond. Icons are Phosphor regular SVGs inlined at 1em (links, carets) or 1.125em (buttons): caret-down on every disclosure and the case select, arrow-up-right on LinkedIn in the CV bar, file-pdf on Download PDF, arrow-counter-clockwise on Replay; never a glyph character or an icon font.

## Components

### Navigation (`components/Nav.astro`)
- A 3rem sticky ruled band on `--bg`, the same four items on every page and at every width: the name (home link, Archivo 500 0.95rem, -0.01em), **Research** and **CV** (ink-2, 1.5rem gap, 0.9rem vertical padding), and **Email** (compact primary, `mailto:` from `profile.email`), the page's one primary action.
- No menu disclosure and no hamburger: the row fits a 390px phone (gaps 1rem and type 0.875rem under 480px) and wraps under 21.98rem.
- States: hover raises to ink; the current page holds ink and a 2px signal underline on the band's bottom edge; 150ms on the site ease.

### Footer (`components/Footer.astro`)
The ending every page shares. Above it a 3rem gap and a full-bleed hairline; inside the column: one STIX line in ink at 1.125rem ("Open to collaboration, positions and paper requests."), the mono link row, and a mono colophon in ink-3: `Updated <build date>` and the host. The link row is the address (a `mailto:`), then LinkedIn · Google Scholar · ORCID, each link a 1px `--line` bottom border at 0.45rem block padding, turning signal on hover; no Email button and no CV (PDF). The `omit` prop drops labels so the last viewport repeats nothing: home omits all three profile links (its identity row carries them), so its footer row is the address alone; `/cv/` omits LinkedIn (its sticky bar carries it). A `links: false` prop drops the row; no page passes it today. Pages pass both through the `footer` prop of `layouts/Base.astro`. Hidden in print.

### Identity block (`components/home/Identity.astro`)
The first thing on home. A two-column grid: the text column, then a 6rem portrait column at the right (gap 1rem 2rem; 2rem above, 1.5rem below), so every text block starts at the column's left edge.
- **Portrait:** 96px square, 1px `--line` hairline, 2px radius, `object-position: 50% 28%`, `--bg-1` while loading; the ID photograph, never hero material.
- **Lead:** the name as the page's `<h1>` (Name type) with the Korean name beside it on the same baseline (Korean name type, ink-2). Two inks on one line; the lead is not a run-in with the tagline.
- **Role line:** Archivo 500 at UI size: role · lab, university in ink, then the four fields (`profile.fields`) in ink-2 on a second line, each field nowrap so lines break only at separators.
- **Tagline:** `profile.tagline` in STIX 1.125rem / 1.5, ink; swapped in one edit in content.ts.
- **Link row:** mono: the address as text (a `mailto:`), then LinkedIn · Google Scholar · ORCID (`rel="me noopener"`), each with a 1px `--line` bottom border at 0.4rem block padding that turns signal on hover. No Email button and no CV here; the nav carries both.

### Updates row (`components/home/Updates.astro`)
- One native `<details class="updates">` directly under the identity block, shipped closed at every width, no script of its own. Closed it is one ruled row: the newest update's date (mono, ink-2, in a 5rem column), its sentence (STIX at prose size, ink) and an inline Phosphor caret-down at the right edge (ink-3, ink on hover) that turns over when open. Open, the remaining updates follow as rows in the same two columns.
- Rules span the column: the summary carries the rule under itself and the list carries the closing one. Focus draws the 2px signal ring 2px outside the row.
- No heading, no label word, no links. The items are `updates` from `lib/schema.ts` (the current appointment, the completed Ph.D., publications with a year, awards, registered patents, funded projects; newest first, at most `UPDATES_MAX`); never typed by hand.

### Home plate (`components/home/Plate.astro`, `components/home/HeroViewer.tsx`)
- A `Frame plate` with no corner chrome, 2:1 at the column width (at most 60vh, at least 16rem), 3:4 at the full column width under 900px, holding the VesselViewer in quiet mode, hydrated `client:visible`.
- **Poster:** a server-rendered `<picture>` under the canvas, the plate's own still from `scripts/vessel-still.mjs` (2:1, and 3:4 upright under 900px; WebP, at most 4.5 KB each), so the plate is never a blank film before the vessel draws or without JavaScript. Once the viewer leaves its loading state the poster fades out over 250ms after a 250ms delay (no transition under reduced motion).
- **Quiet viewer:** the pressure field only, the CFD | PINO wipe handle (a two-state toggle on frames under 640px), the vertical colorbar with five ticks, the develop once (snapped under reduced motion), and the idle drift; no field toggle, no orbit, no corner readouts, no FFR curve. The vessel is cropped at the distal FFR probe plane and fitted to its bounding box.
- **Sentence:** one STIX line under the plate (1rem, ink-2), `plateSentence`, carrying the CFD and PINO FFR readings, the CFD bound and the PINO time, numbers interpolated. There is no mono caption line and no link.
- **Data:** the quiet plate downloads the manifest and `vessel.bin.gz` only; the speed arrays are a second file home never requests.

### Home rows (`pages/index.astro`)
- **Work:** four capability rows (Simulation, Physics-informed AI, Wearable biosignals, Devices and translation), each linking one research project, organ-agnostic, one computed number each. An 11rem name column (`--width-label`; Archivo 600, 1.0625rem; the underlined name is the row's link) and one STIX clause in ink-2; one column under 900px; rows ruled in `--line-soft`; hidden at 640px and under.
- **Selected:** three rows, newest first: a 3rem mono year column, then the title (Archivo 600, 1rem) with one line under it carrying the short venue in mono, the role mark and `doi:` (the word "DOI" on phones).

### Frame and corner chrome (`components/Frame.astro`)
- 1px `--line` border, 2px radius, ground `--bg` (`--bg-1` as a panel). `plate` adds the `.plate` scope.
- Corner chrome: up to four absolutely positioned mono labels inset by `--corner-inset` (0.5rem), label size, ink-3, 0.04em tracking, non-interactive; short unit-free identifiers take uppercase and 0.08em.
- The Frame is for plates (and the 404's no-signal frame). Records are never framed.

### Colorbar
- A 10px strip bordered in `--line` at the plate's right edge (0.75rem in), `min(56%, 320px)` tall (`min(60%, 280px)` in chapter plates), the field's colormap sampled at 24 stops; server-rendered, so it holds the plate while the data loads.
- **Five ticks** on every bar, at 0, ¼, ½, ¾ and 1 of the main band, mono in ink-2 with 0.3rem ink-3 tick marks; an uppercase label above with the unit in its own case. The error bar is symmetric (−x, −x/2, 0, +x/2, +x), with an 8% above-range band and its own label when any node lies past +x.
- In a chapter plate under 640px the bar leaves the image and runs horizontally in a row under the canvas, ticks beneath, with the controls in a second row.

### Wipe handle and segmented control
- **Wipe handle:** a full-height 1px hairline at 38% ink over the vessel with a 16px hit zone; a grip (mono label type, 1px ink border, `--bg` ground, 0.3rem 0.55rem) labelled CFD | PINO with a 1px ink-3 bar between, riding at 88% of the height on the quiet plate and sliding along its hairline so it stays inside the frame at both ends. Border turns signal on hover and while dragging; focus draws the ring. A `role="slider"` with arrows, Shift+arrows, PageUp/Down, Home/End.
- **Segmented control:** adjoining 1px-bordered buttons on `--bg`, 2rem tall (2.75rem where it replaces the handle and on coarse pointers), Archivo 500 0.85rem, ink-2, radius on the group's outer corners only. Pressed: ink text, ink border, a 2px inset signal underline (a `Highlight` outline under forced colors). Used for the field toggle (Pressure | Error | Speed) on /research, the scrubber's Pressure | WSS, and the two-state wipe on narrow frames. The viewer marks its control on its root (`data-control`), and the "CFD left, PINO right" caption clause follows it.

### Research project (`components/research/Project.astro`, `MetricsTable.astro`)
- **Header row:** the title (Headline) and the years in mono ink-2 at the right; one column at 640px and under.
- **Summary:** one STIX sentence (Summary type, ink).
- **Outputs line:** mono ink-2, every item a link to its CV row (papers with short venue, year and role, the manuscript as "manuscript under revision (EAAI)", registered patents, pending patents as one item, funded projects, up to two talks and a count of the rest), separated by ink-3 middle dots that keep to the item before them; an item breaks only after its comma. On phones the first item and the caret control.
- **Demo plates:** PINO keeps two plates in view, the viewer (2:1) and the Pd/Pa curve under it; 4D CT keeps the phase scrubber; fluid bolus keeps the STFT plate, with one Replay under it (compact ghost, arrow-counter-clockwise, `aria-label="Replay both spectrograms"`, hidden until the islands hydrate) that restarts both spectrograms through `spectrogram:replay`. Captions are STIX italic, ink-2: "CFD left, PINO right. Pressure R² …" (the clause hides beside the toggle, on the error field and on phones), "CFD and PINO differ by … at the distal probe.", the scrubber's cycle sentence, the STFT's recording sentence.
- **Method and metrics:** one native `<details class="more">` per demo, closed at every width and a real control everywhere: a ruled row (UI face, ink-2, ink on hover) with an inline caret at the right edge that turns over when open, its focus ring 2px outside the row. Inside: the paragraph, for the bolus demo the CWT plate (hydrated `client:idle` and painted finished while the row is closed, so opening it shows the whole strip), then the metrics table. There is no citation line.
- **Metrics table:** an italic STIX caption above (for PINO the label convention and the case's rank), a mono table ruled top and bottom in `--line`, row rules in `--line-soft`, no fills, header ink-3, row heads ink-2, values ink; a paired value breaks only at its middle dot. Under 600px each metric is a block: its name, then one "label value" line per column.
- **A⁺4DCT results (`A4dctResults.astro`):** one film plate: a head row (UI title and a case select drawn flat with the site's caret, shown by script only), a legend, an SVG chart (one row per calcium score: 4DCT open circle, A⁺4DCT signal dot joined by an ink-2 line, invasive FFR open diamond; the selected row lifted to `--bg-2`), beside the selected case's video (muted, inline, looped, `preload="none"`, never autoplay) and a three-value table with the A⁺4DCT reading underlined in signal. A STIX italic caption with the case count and the status sentence under the plate; without JavaScript a metrics table at three decimals stands in. One column at 640px and under.
- **Paper figures:** two older projects show the paper's figure as an image in the `.plate` scope (hairline, at most 32rem tall, contained), the whole figure a link that opens it full size in a new tab, with a STIX italic caption ending in an underlined "View full figure".

### CV rows (`pages/cv.astro`, `components/record/*`)
Rows, not frames; one entry is about two lines; section gaps 1.5rem; one left edge. Short for people, complete for agents: the appointment bullets and the patent inventors are not printed on the page; cv.md, llms-full.txt and cv.json carry them.
- **Section (`CvSection`):** a Title heading over a 1px primary-ink rule. `fold` wraps heading and body in a `<details class="cv-fold">` (the phone fold, caret at the heading's right). In print the sections run on, a heading never ends a page and no row or publication splits.
- **Period rows** (education, appointments, projects, awards, teaching): a 10.5rem mono period column and the row: an Archivo 600 1rem title with the place on its own STIX ink-2 line under it; meta lines in STIX ink-2 (appointment notes italic); a funded project is its title over its funder line with the grant number in mono on its own line. One column under 760px.
- **Publications (`PubEntry`):** a 2.5rem mono id column, then the title (linked to the DOI), the author list (the owner bold), and one mono line: citation (the short venue), role mark, `doi:`, an optional figure link and the BibTeX disclosure (Copy BibTeX, which confirms "Copied" for two seconds with a signal border, and the selectable entry on `--bg-1`). A manuscript prints "manuscript under revision (EAAI)" in place of its venue.
- **Header:** an 80px portrait (hairline, 2px radius; 4rem under 760px) beside the name (h1), the intro line (`interestsLine`, STIX 1.125rem / 1.45, ink, `id="interests"`), the role line in ink and the concurrent appointment in ink-2, then the mono contact row on screen and in print: the address as plain text (no `mailto:`), Google Scholar, ORCID and the host.
- **Talks:** first the photo row: five of the owner's conference photographs, 120px tall (96px under 760px), each with a hairline that darkens to ink-3 on hover and a mono caption (venue, year, format) linking its talk row; a click opens the lightbox. Then a mono counts line and the International and Domestic groups, one grid row per talk: 2.5rem year, the title (Archivo 600 0.975rem, 76ch; the author line in STIX ink-3 only where it is not "H.J. Lee et al."), a 7rem short venue (an `abbr` with a dotted underline whose title carries the full venue and location) and a 15rem format · role column, right-aligned. Under 760px the title takes the row and venue and format sit under it; in print three columns.
- **Lightbox:** a native `<dialog>` in the `.plate` scope (film, hairline, 2px radius) over the flat dim; the image box is sized from the photo's own aspect before the file arrives, so it opens at its final size; it fades in over 250ms and out over 150ms on opacity alone; a mono caption and a mono Close button (border turns signal on hover) in a ruled bar; Escape, Close or the backdrop closes it. Without JavaScript the link opens the image.
- **Patents:** a counts line, then one grid row each: a 2.5rem mono id, the title, and a right-aligned mono meta block: status (an ink-bordered REGISTERED tag with the registration number and date, or "pending, filed <year>") and the application number (at least 10rem, so every status ends on the same x). Under 760px the meta goes under the title. No inventor line.
- **Skills:** a definition list on the period grid (10.5rem UI label, STIX ink-2 items).
- **Jump row:** phones only, one mono line of section links in ink-2 with ink-3 dots and a hairline under it.
- **Action bar:** sticky under the nav, on the left edge: Download PDF (compact ghost with the file-pdf icon) and LinkedIn (UI text link with the arrow-up-right icon, ink-3 turning signal on hover). It is the human layer's only link to the PDF. Hidden in print.
- **Print:** nav, footer, skip link, action bar, jump row, portrait, photos and BibTeX panels are hidden; type is set in points (name 22pt, titles 10.5pt, meta 10pt); A4 margins 16mm 18mm.

### Buttons (`components/Button.astro`)
- **Shape:** 2px radius, 1px border, min-height 2.75rem, padding 0.6rem 1.1rem, Archivo 500 0.95rem, 0.5rem gap to an optional 1.125em icon. Compact: 2rem, 0.3rem 0.7rem, 0.85rem.
- **Primary:** `signal-fill` ground and border, bone text; hover deepens to `signal-hover`. The nav's Email only.
- **Ghost:** transparent, border and text in the ground's ink; hover inverts. Download PDF, Copy BibTeX, Replay, Play/Pause, Retry.
- **States:** 150ms on background, border and color; `:active` drops 1px (not under reduced motion); disabled at 50% opacity; `:focus-visible` draws the 2px signal ring at 2px offset.

### Role mark and tag
- **RoleMark:** bordered, never filled; Archivo 500 0.75rem, 1.5rem tall. First author: primary-ink border, primary ink. Co-first: secondary-ink border, primary ink. Co-author: hairline, secondary ink. Never signal. The label comes from content data and is never inferred.
- **Tag:** mono uppercase label, 1.25rem tall, hairline border, ink-2; the ink tone (primary-ink border, primary ink) marks REGISTERED on a patent row.

**The One Anatomy Rule.** A paper reads the same everywhere (home Selected, the CV): title (linked to the DOI when one exists), venue in mono, role mark, `doi:`. A role mark, tag or label never sits directly above a heading.

### Phase scrubber (`islands/PhaseScrubber.tsx`)
The current frame of J1's Case 1 on a light-box sheet inside the film plate, with mono corner readouts (phase; acquired or synthesized). A ten-phase rail with taller primary-ink ticks and a CT mark on the two acquired phases; the shared grip as a `role="slider"`; a mono readout; the Pressure | WSS segmented control; a Play/Pause ghost; the diverging legend with the mmHg range and its kPa reading (both legends server-rendered, the inactive one `hidden`). Phase 0 is server-rendered; the cycle plays once on first visibility and never under reduced motion. While the shown field is missing frames, Play and the rail are disabled.

### Plate states: loading, failure, no WebGL
- A plate prints nothing while it loads; the server-rendered colorbar, axes, ticks and the home poster hold it.
- A plate that fails prints one sentence in STIX, centred on the film, and sends the reason to the console only: "The vessel did not load. Reload the page to try again." (the viewer and an A⁺4DCT video), "The pressure curve did not load. Reload the page to try again." (the Pd/Pa curve), "The recording did not load." and "The CT frames did not load." (each with a Retry ghost under it). Never a file name, URL or status code.
- Without WebGL the viewer shows `public/data/pino/vessel-static.png`, the same render as the home poster, with the same DOM colorbar.

### Links
Inherit color, 1px underline in ink-3 offset 0.18em, turning signal on hover over 150ms. Link rows (identity, footer) use a 1px bottom border instead of an underline. Disclosure summaries are rows with a caret, not links.

### Motion
Tokens in `tokens.css`: `--duration-quick` 150ms for hovers and state changes (and the caret turns), `--duration-base` 250ms for reveals, `--duration-slow` 400ms for the two-state wipe tween, `--duration-develop` 1780ms for the develop, all on `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`.
- **Develop:** the PINO layer develops over the CFD field once, on first visibility, for the measured 1.78 s; the spectrograms paint left to right once in view (a closed fold's strip is painted finished).
- **Drift:** the vessel turns one revolution per 60 seconds on every viewer, home plate included; it pauses offscreen, on `document.hidden` and during drags, and stops only under reduced motion.
- **Folds:** a disclosure a reader clicks (the Updates row, Method and metrics, the CV phone folds) eases its height over 250ms via `::details-content` and `interpolate-size`, gated by `data-motion` from the click handler in `Base.astro`; one a script, an anchor or find in page opens snaps, and so do browsers without that support. No fade, slide or stagger.
- **Viewer at ready:** the canvas, the wipe handle and the segmented controls fade in over 250ms inside the develop's delay; the colorbar stays put.
- **Lightbox:** opacity only, 250ms in, 150ms out, over the flat dim.
- Under `prefers-reduced-motion` the develop snaps (Replay included), the drift stops, folds snap, carets flip without turning, the poster swaps without a fade and the button press does not move. Nothing loops for its own sake, nothing scales, slides or blurs, and there are no page transitions or smooth scrolling.

### Performance
- The home plate loads `manifest.json` and `vessel.bin.gz` (uint16 quantized, zigzag delta, planar bytes, then gzip -9; `scripts/quantize-vessel.mjs`), inflated in the browser with `DecompressionStream` (the raw `vessel.bin` is the fallback). The speed arrays are `vessel-speed.bin(.gz)`, requested by /research the first time Speed or Error is chosen.
- Home first load (HTML, CSS, JS, fonts, portrait, poster, manifest, `vessel.bin.gz`) at most 450 KB on the wire.
- Everything a plate shows as a number is also in the server-rendered HTML (captions, readouts, colorbar ticks, axes, legends).

### Machine layer (`lib/schema.ts`, `pages/*.ts`, `public/robots.txt`)
Not visual, but it reads the page's data and follows the same rules.
- Endpoints: `llms.txt`, `llms-full.txt`, `index.md`, `research.md`, `cv.md`, `cv.json` (JSON Resume with `meta.canonical`), each generated from content.ts through `lib/schema.ts`; `<link rel="alternate">` to the page's twin and to `llms.txt` in every head. The agent files' headings print the English name with the Korean one in parentheses; `index.md`, `llms.txt` and `llms-full.txt` print the updates under "Recent".
- JSON-LD: a `@graph` with `Person` (`@id`, `alternateName` the Korean name), `WebSite`, `ProfilePage`, `ScholarlyArticle` and the research `WebPage` on every page.
- `robots.txt`: a pointer to `/llms.txt`, then explicit AI user-agent groups with `Content-Signal: search=yes, ai-input=yes`.

## Do's and Don'ts

### Do:
- **Do** lead home with who this is: the name as the h1 with the Korean name beside it, the role line, the four fields, the tagline, the address and profile links, then the closed Updates row and the quiet plate.
- **Do** span every block across the one centred column and narrow text by measure (ch) only.
- **Do** put every data artifact on a film plate (`Frame plate`), in both schemes.
- **Do** keep records as rows: Updates, Work and Selected on home, outputs lines on /research, dense rows on /cv.
- **Do** keep Email to the nav's one primary action and CV to the nav's page link on every page; the footer carries the address and LinkedIn, Google Scholar and ORCID minus whatever the last viewport already shows (`omit`).
- **Do** ship every disclosure closed (Updates, Method and metrics) or open-and-folded-by-script (the CV phone folds) as a native `<details>` with the Phosphor caret, and keep the server HTML whole.
- **Do** keep the idle drift on everywhere, home plate included; only reduced motion stops it.
- **Do** read only the semantic aliases in components, so they work on the light box, on a film page, on a plate and in print.
- **Do** set numbers, units, identifiers, DOIs, years, tables and link rows in JetBrains Mono, computed from content.ts or a manifest and formatted by `lib/format.ts`.
- **Do** carry rank by border ink: primary ink for first author, secondary ink for co-first, hairline for co-author; never signal.
- **Do** draw field colors from `lib/colormaps.ts` only, with five ticks on every bar and the error field on its fixed symmetric scale.
- **Do** print nothing while a plate loads, and only its approved sentence when it fails.
- **Do** honor `prefers-reduced-motion` on every autonomous motion.
- **Do** describe the work organ-agnostically (computational hemodynamics, physics-informed AI, wearable biosignals, medical devices); coronary appears only where a coronary result is named.

### Don't:
- **Don't** switch a page's ground by attribute or add a theme toggle; the system scheme decides, and plates are always film.
- **Don't** print a contact or CV action twice in one viewport: no Email button or CV (PDF) in the identity block or the footer, no per-project or per-entry mail links, no closing contact block.
- **Don't** link a home target twice, or turn a count into a link.
- **Don't** put mono type in prose, or a `key value · key value` readout string where a sentence belongs.
- **Don't** print a case id, file name, array name or other dataset identifier in visible text, a caption or a failed plate.
- **Don't** stack labels over a result ("what / result / consequence") or write consequence sentences; a demo project is its plates in view and one closed Method and metrics row.
- **Don't** frame a record; frames are for data.
- **Don't** use drop shadows, glows, gradients outside colormaps, blur or translucent panels.
- **Don't** add kickers, eyebrows or section numbers above headings.
- **Don't** introduce a second accent or a fourth ink tier.
- **Don't** uppercase a unit or a ratio or track it.
- **Don't** fill a role mark or tag.
- **Don't** use icon fonts or glyph characters as icons; icons are inline Phosphor SVGs sized to the text.
- **Don't** print a manuscript's status twice, as a tag, or in another wording.
- **Don't** set mono or label type below 13px on film, or secondary ink darker than 0.80 on film.
- **Don't** state a speed-up factor larger than "about 1,000x", convert the CFD bound into hours, or extrapolate it to fewer cores.

## Revisions

The sections above describe the build as it stands. This record keeps what each round changed, so a later reader can tell a rule from a leftover.

### Round 1 (2026-10-15, commit 56ddc03): the cine frame
North Star "The Angiographic Reading Room". Astro rebuild as candidate 6 (seed 6687f113). Two surfaces switched per page by `<html data-surface>`: film charcoal on `/` and `/research`, light box on `/publications`, `/record`, `/cv`. A full-viewport cine frame on home with the thesis h1 and the name as corner chrome; frames carried a three-tier caption stack (what / result / consequence); rank by frame size as well as border ink; a Close block ended every page.

### Round 2 (2026-10-15, commit 2ec184d): scrubber and conversion path
Added the 4D CT phase scrubber (paper rasters on a light-box sheet inside a film plate) and a contact path (Email, CV, LinkedIn) on every page, printed in the hero, per chapter and in the Close block.

### Round 3 (2026-10-16, Revision 2 of the direction contract): short for people, complete for agents
- **Theme:** the system scheme decides the ground (light box by default, film under `prefers-color-scheme: dark`); `data-surface` removed; `.plate` keeps every data artifact on film in both schemes. Dark floor: bone-2 raised from 0.74 to 0.80, bone-3 from 0.60 to 0.64, mono and label 13px on film. `color-scheme` meta and two `theme-color` metas.
- **Structure:** three pages (`/`, `/research/`, `/cv/`); `/publications` and `/record` are meta-refresh redirects to `/cv/#publications` and `/cv/#talks`, excluded from the sitemap.
- **First viewport:** identity first, then the quiet plate with two mono caption lines (both retired since).
- **Contact:** the nav's Email (the one primary) plus the footer link row with `Updated <build date>`.
- **Records:** capability rows, three Selected rows and a counts line on home; dense CV rows.
- **Retired:** the what / result / consequence stack, consequence paragraphs, the Close block, per-chapter "Discuss this work" links, the home Led, About, Applied and Fronts sections, PatentList, ProjectList, PaperFrame, PageHead, rank by frame size, the thesis h1, the full-viewport home frame and its corner readouts.
- **Viewer:** `quiet` mode; the camera fitted to the mesh bounding box; the error field on a fixed symmetric scale with the above-range yellow; `vessel.bin` repacked by `scripts/quantize-vessel.mjs`.
- **Agent layer:** `robots.txt` AI groups with `Content-Signal`, the six agent endpoints, the JSON-LD `@graph`.
- **Budget gate:** `pnpm build` runs `scripts/budget.mjs` (limits since raised; see Round 4).
- **Fonts:** Archivo stays variable, shipped as an instanced latin subset.

### Round 3a–3b (2026-10-16 to 2026-10-17, Revisions 2a and 2b): proofs in the identity block, one action word per viewport
- Three mono proof lines in the identity block (retired from the page in Round 4; `proofLines` still feeds the agent files' In brief block).
- Footer row LinkedIn · Google Scholar · ORCID only; `omit` and `links` props.
- One `mailto:` per page (raised to three in Round 4).
- The plate caption cut to one mono line (retired in Round 4) with `plateSentence` under it.
- Research closing row as plain text (retired in Round 4); one Replay for both spectrograms.
- Role marks and the REGISTERED tag moved to ink borders; mono stays upright inside italic captions.

### Round 4 (2026-10-18 to 2026-10-21, Revisions 2c to 2g): the address, the lead, the phone layer, research A+, motion and hardening
Verified against `main` at d98ead9 on 2026-10-26.
- **Column:** one fluid centred column, `clamp(50rem, 58vw, 64rem)`, the CV `clamp(60rem, 66vw, 78rem)`, with a fluid root size; the fixed container is gone.
- **Contact (2c):** the address is printed as text in the home identity row, the CV contact row and the footer; at most three `mailto:` per page.
- **Lead and Updates (2d):** the Korean name in a Pretendard Medium subset beside the h1; the proof lines leave the page; the portrait moves to the right; one closed Updates row under the identity block, derived in `schema.ts`. Home budget 250 words, a closed `<details>` counting only its summary.
- **Phone layer (2e):** the 640px disclosure layer described under Layout.
- **Research (2f, and the flat list):** every project in one newest-first list with an outputs line into the CV; the demos keep their plates in view with the PINO Pd/Pa curve under the viewer and fold Method and metrics into one row closed at every width; the citation line, the chapter headers and the closing row are gone; the A⁺4DCT results plate and two paper-figure entries join. Budget 1000 words, 260 per project.
- **Plate:** the mono caption line is gone; one STIX sentence remains; the poster and the no-WebGL still come from one render; the idle drift runs on the home plate.
- **Motion and hardening (2g):** the motion rules, the four failure sentences, print forcing the light aliases, forced-colors rules, the CV photo lightbox, the CV mono preload, the 21.98rem rules and the 14-character short-venue gate.
- **Recorded drift, not repaired:**
  - The `VesselViewer.tsx` header comment still says quiet mode has no idle drift; the code keeps the drift on.
  - `--drift-period` is declared in `tokens.css` (and set to 0s under reduced motion in `global.css`) but nothing reads it; `scene.ts` uses its own 60 000 ms constant and reduced-motion flag.
  - The `Identity.astro` header comment still describes the withdrawn run-in lead (name, Korean name and tagline at one size, the tagline in ink-2).
  - `Frame.astro` and `SpectrogramDevelop.tsx` still carry the retired what / result / consequence stack (slots, props and the `.frame__stack` styles in `global.css`); no caller uses them.
  - Unused leftovers: `components/Section.astro`, `.wrap--text`, `.link-icon` (its comment names the retired "How it works" link), `--section-pad`, `--width-text` and `--size-display`; the `tokens.css` column comment says "up to 68rem" where the value is 64rem; the `Base.astro` width prop doc gives fixed 50rem and 60rem; the `Nav.astro` and `Footer.astro` header comments predate the address in the footer row; the `cv.astro` header comment counts three talk photographs where five ship.
  - `plateCaptionItems` and `plateCaption` are still exported from `schema.ts`; `cv.json` carries that caption under the PINO demo, and the `llms-full.txt` artifact line names the case, so the demo's dataset identifier still reaches the agent files.
  - The vessel cap mask still uses the round-2 bone-3 (oklch 0.56).
