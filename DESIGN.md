---
name: hyeongjunlee.me
description: A light box with film plates on it; the research is the image on the film, read in one ink family with one clinical red. Revision 2b (2026-10-17).
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
  body:
    fontFamily: "STIX Two Text, Times New Roman, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  caption:
    fontFamily: "STIX Two Text, Times New Roman, Georgia, serif"
    fontSize: "0.95rem"
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
    height: "min(44vh, 30rem)"
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

Revision 2b (2026-10-17). This file describes what is built. The direction contract is `.impeccable/surfaces/site-src-pages-index-astro.md` (its Revision 2 block, as amended by Revisions 2a and 2b, governs); the machine-readable twin of this file is `.impeccable/design.json`.

## Overview

**Creative North Star: "The Light Box and the Film"**

The world is the cath-lab reading room: a light box with angiographic film clipped to it. The page is the light box, white and quiet, carrying who he is and the record in rows. The research is the film: every data artifact (the vessel viewer, the FFR curve, the spectrograms, the CT phase scrubber) is a dark film plate with a hairline and mono corner chrome, sitting on the box. Nothing decorative competes with the plates; UI chrome is thin and mono, so it reads as instrument marking rather than interface.

Three pages. `/` is a Read surface, identity first: name, role, the four fields, the owner's one sentence, three proof lines, a link row, then one quiet live plate inside the same 1440×900 viewport, then rows of work and three selected papers. `/research` is an Experience surface: every project newest first, three of them worked examples with data (PINO, 4D CT, fluid bolus) whose plates stay in view while the method and metrics fold into one row closed at every width, with no citation line (the outputs line links the CV). `/cv` is the whole record, dense: rows, not frames. `/publications` and `/record` are meta-refresh redirects to `/cv/#publications` and `/cv/#talks`.

The ground follows the system scheme. The light box is the default; `prefers-color-scheme: dark` turns the whole page to film. Plates are film in both schemes, so in dark mode a plate is film on film, separated by its hairline. There is no manual toggle and no per-page surface switch. Components read semantic aliases only (`--bg`, `--ink`, `--line` and their tiers), which the scheme resolves for the page and the `.plate` scope re-declares to film for a plate.

Rank is carried by border ink, never by weight, fill or color flooding. First-author work carries a primary-ink border on its role mark; co-first a secondary-ink border; co-authored a hairline. Signal never marks rank. Type weight stays even (one heading weight, 600), so the eye ranks by geometry.

**Key Characteristics:**
- Light box by default, film under the dark scheme; data plates are film in both. One ink family per ground, one clinical red on both.
- Identity first: the name is the h1; the plate is the one live proof in the first viewport, quiet (pressure only, the CFD | PINO wipe, the colorbar).
- Rows, not frames, for everything that is a record: capability rows and selected papers on home, dense CV rows on /cv.
- Three faces with fixed jobs: Archivo (width 92 for the name and page titles) for naming and UI, STIX Two Text for reading, JetBrains Mono for every number, unit, identifier and link row.
- Flat throughout; depth is a hairline or a one-step tonal lift, plus one static grain sheet on a film page.
- Signal red is reserved: probes, the PINO trace, active underlines, focus rings, selection, the hover state of icons and underlines, and the one primary action (the nav's Email).
- Motion is physical evidence: the PINO layer develops over the measured 1.78 s once, and everything stops under reduced motion.

## Colors

Two inks (a tinted near-black and a tinted bone) on two grounds, with one clinical red shared by both.

### Primary
- **Clinical Signal** (`signal`): the one red, used as a stroke and a state: the PINO curve, the probe markers, the current-page underline in the nav, link-underline and icon hover, the focus ring, the caret and form accent, the pressed segment underline. On about 1% of any screen.
- **Signal Fill** (`signal-fill`): the darker step under bone text. The nav's Email action and the skip link only; `signal` itself falls short of AA under bone text and is never a text ground.
- **Signal Hover** (`signal-hover`): primary-action hover.
- **Signal Soft** (`signal-soft`): 18% alpha; text selection on both grounds.

### Neutral: Light Box (the default page ground)
- **Box** (`box`): page ground in the light scheme; also the light box inside a film plate (the phase scrubber's sheet).
- **Box 2 / Box 3** (`box-2`, `box-3`): one and two tonal steps up (image placeholders, raised panels).
- **Box Ink / Box Ink 2 / Box Ink 3** (`box-ink`, `box-ink-2`, `box-ink-3`): primary, secondary and tertiary ink on the box.
- **Box Line** (`box-line`): every hairline on the box; its 60% alpha (`--line-soft`) draws row and table rules.

### Neutral: Film (the dark page ground, and every plate)
- **Film 0** (`film-0`): page ground under the dark scheme and the ground of every plate in both schemes. Cool, never pure black.
- **Film 1** (`film-1`): one raised step (the spectrogram stage, the BibTeX panel on a film page).
- **Film 2** (`film-2`): scrollbar thumb on film.
- **Film Line** (`film-line`): every hairline on film; its 55% alpha draws chart grids and row rules.
- **Bone** (`bone`): primary ink on film; the wipe seam, the CFD trace, the playhead.
- **Bone 2** (`bone-2`, 0.80): secondary ink on film: captions, nav links at rest, colorbar ticks, cite lines. Held at 0.80 or lighter (the round-2 0.74 read poorly in dark).
- **Bone 3** (`bone-3`, 0.64): tertiary ink on film: corner chrome, axis ticks, icons at rest, the colophon. 0.64 clears 4.5:1 on film-0 and film-1 (5.85:1 and 5.26:1); 0.60 gave 4.49:1 on film-1.

### Data colormaps (not UI colors)
Field colors are never drawn from the UI palette. They live once in `site/src/lib/colormaps.ts` and are shared by every viewer and colorbar:
- **turbo** paints pressure (CFD and PINO on one shared range).
- **diverging** (Moreland cool-warm: blue, bone-gray, red) paints the signed pressure error PINO − CFD on a fixed symmetric scale: ±(the 99th percentile of |p_err|, rounded up to 0.5 kPa). Values past +scale take the above-range yellow (`rgb(255 214 0)`), so the throat reads as a different ink, not a saturated end.
- **viridis** paints near-wall speed and the spectrograms.
Masked regions (inlet and outlet caps) are painted in a bone tint so they read as chrome; the viewer still holds the round-2 bone-3 value (sRGB 120 116 109, oklch 0.56) in `islands/vessel/colors.ts`, not the current 0.64 (recorded drift, see Revisions).

**Paper-native colormap (the phase scrubber).** The 4D CT frames are the authors' renders from J1 (Fig. 8, Case 1) in ParaView's cool-to-warm map. The site never recolors a paper raster; the scrubber's legend reproduces that ramp with the site's `diverging` map sampled at 16 stops, with the mmHg range and its kPa reading in mono.

### Named Rules
**The Two-Ink Rule.** Each ground has exactly one ink family in three tiers (box-ink on the light box, bone on film), plus the one signal red. No other UI color exists; colormaps belong to the data.

**The Alias Rule.** Components read `--bg`, `--bg-1`, `--bg-2`, `--line`, `--line-soft`, `--ink`, `--ink-2`, `--ink-3` only. `:root` resolves them to the light box; `@media (prefers-color-scheme: dark)` resolves them to film; `.plate` re-declares them to film (with `color-scheme: dark` and the film mono and label sizes) for a plate in either scheme. Raw `film-*` and `box-*` values are referenced directly only where an element must hold the other ground inside a plate (the scrubber's light-box sheet).

**The Plate Rule.** A plate is any Frame that holds a viewer, a chart, a spectrogram or a CT frame (`<Frame plate>`). It is film in both schemes: dark film on the light box, film on film (separated by its hairline) in dark. Nothing that is not data sits on film.

**The Light-Box Rule.** White inside a film plate is the light box of the world, never a bare rectangle: it carries a hairline and mono corner chrome or a caption, and holds only a raster from the paper or the data, composited with `mix-blend-mode: multiply` so the figure's own white becomes the box ground.

**The Signal-Is-A-Stroke Rule.** Signal red is a border, underline, ring, curve or icon state. It is a fill only on the nav's Email action and the skip link, and then as `signal-fill`.

## Theme

- `:root` holds the light-box aliases and `color-scheme: light`. `@media (prefers-color-scheme: dark)` swaps them for film, sets `color-scheme: dark` and raises mono and label type to 13px (`0.8125rem`). There is no toggle and no `data-surface` attribute.
- `.plate` (in `tokens.css`) carries the film aliases, `color-scheme: dark` and the 13px mono and label sizes in both schemes.
- `<meta name="color-scheme" content="light dark">` and two `theme-color` metas (`#f9f8f6` light, `#1a1b1f` dark).
- Selection, caret, focus ring, form accent and scrollbar are themed from the palette in both schemes.
- **The Dark Floor Rule.** On film, secondary ink is no darker than 0.80 lightness and mono and label type never fall below 13px. Every text and ground pair holds at least 4.5:1 in both schemes.
- **The One Grain Rule.** A film page (the dark scheme) carries exactly one grain layer, applied by `body::after`: a static feTurbulence sheet tiled at 256px at 5% opacity, never animated, removed in print. The light box carries none, and plates add none of their own.

## Typography

**Display Font:** Archivo Variable (with Archivo, system-ui, sans-serif)
**Body Font:** STIX Two Text (with Times New Roman, Georgia, serif)
**Label/Mono Font:** JetBrains Mono Variable (with JetBrains Mono, ui-monospace, Menlo, Consolas, monospace)

**Character:** a compressed grotesk for names and controls, a narrow scientific serif for reading, a mono for everything measured. The mono does the measuring, the serif does the arguing, the grotesk does the naming. All three are self-hosted. Archivo stays variable because the name and page titles use the `wdth` 92 axis; its latin subset ships instanced to the ranges the site sets (wght 400–600, wdth 92–100; `scripts/instance-archivo.py`, declared in `src/styles/fonts.css`). Only Archivo latin and STIX latin 400 are preloaded. Every face is `font-display: swap`; fonts are never inlined into CSS as data URLs.

### Hierarchy
- **Name** (Archivo 600, width 92, `clamp(2.25rem, 1.5rem + 2.6vw, 3.5rem)`, 1.0, -0.025em): the home h1, the owner's name.
- **Display (page)** (Archivo 600, width 92, `clamp(2.25rem, 1.6rem + 3vw, 4rem)`, 1.0, -0.025em): the h1 of /research. The CV's h1 (the name) holds `clamp(2rem, 1.5rem + 1.8vw, 2.75rem)`.
- **Headline** (600, `clamp(1.75rem, 1.35rem + 1.2vw, 2.25rem)`, 1.1, -0.015em): the chapter names on /research.
- **Title** (600, 1.25rem, 1.3, -0.01em): home section headings (Work, Selected) and CV section headings, each over a hairline.
- **Row title** (600, 0.975–1.0625rem, 1.35–1.4): capability names, selected-paper titles, CV entry titles.
- **Body** (STIX 400, 1.0625rem, 1.65): the tagline (1.125rem, 1.5), capability clauses (1.5), research paragraphs (60ch measure), the research lede.
- **Caption** (STIX italic, 0.95rem, 1.5, ink-2): figure and table captions, at most 18 words.
- **UI** (Archivo 500, 0.95rem, 1.3): nav, buttons, the identity role line. Compact controls hold 0.85rem; the nav drops to 0.875rem under 480px.
- **Mono** (JetBrains Mono 400, 0.8rem on the box, 0.8125rem on film, 1.4, tabular): the identity and footer link rows, the plate caption, the counts line, citation and DOI lines, years, venues, metrics tables, BibTeX.
- **Label** (JetBrains Mono, 0.75rem on the box, 0.8125rem on film, 0.08em, uppercase, ink-3): corner chrome, colorbar labels, tags, the wipe grip. Corner chrome is uppercase only for unit-free identifiers of 14 characters or fewer; anything with a unit keeps its case and tracks at 0.04em.

### Numbers, units and labels
Every figure is computed from `content.ts` or a data manifest through `site/src/lib/schema.ts` and `site/src/lib/format.ts`; none is typed in a component, and the markdown twins and `llms*.txt` read the same values.
- **Joins:** value and unit are joined by a narrow no-break space (U+202F), which also groups thousands (8 649 nodes); negatives take a true minus; ranges take an en dash and one trailing unit (10.7–13.0 kPa).
- **Pressure:** kPa at one decimal. Where the source unit is mmHg (the scrubber), the mmHg range leads and the kPa reading follows.
- **FFR (Pd/Pa):** two decimals in captions, readouts and the curve key (CFD 0.83 · PINO 0.82); three in the metrics table and for the CFD–PINO difference; the cohort MAE at four.
- **Time and length:** seconds at two decimals (1.78 s), millimetres at one.
- **CFD reference time:** "CFD up to 35 min on 64 CPU cores", a measured bound from the owner (content.ts `cfdReference`); never converted, extrapolated or turned into a speed-up factor above "≈1,000×".
- **PINO metrics label:** "current model, 85 cases, 10-fold CV", always.
- **Manuscript status:** one label, "under revision (EAAI)", printed once per entry.
- **DOI:** `doi:` lowercase with no space, then the identifier, in mono, linked to doi.org.

### Named Rules
**The Mono Number Rule.** Every measured number, unit, identifier, DOI, year and readout is set in JetBrains Mono with tabular numerals; `code`, `time` and `data` inherit it globally. A measured value in Archivo or STIX running text is wrapped in `.num`.

**The One Formatter Rule.** A precision is a property of the quantity, not of the page: kPa at one decimal, FFR at two (three in the metrics table), seconds at two, mm at one.

**The Even Weight Rule.** Headings carry one weight (600), UI 500, body 400. Rank is carried by size, measure and border ink, never by bolding.

**The Unit Keeps Its Case Rule.** Uppercase is chrome for short identifiers (C1, PINO-DEMO-01) and tags; units and ratios are never uppercased or tracked.

## Layout

One centred column, `clamp(50rem, 58vw, 64rem)` (CV `clamp(60rem, 66vw, 78rem)`) with a fluid root size `clamp(1rem, 0.75rem + 0.3125vw, 1.15rem)` and a fluid gutter (`clamp(1rem, 3vw, 2.5rem)`), for everything: nav, identity, plates, rows, chapters, tables and footer. Text narrows by measure, never by a narrower box: prose 60ch, captions 62ch, capability clauses 64ch, the tagline 68ch, citation lines 72ch. The page is a flex column (`min-height: 100dvh`): the 3rem sticky nav, a flexible `main`, the footer.

Vertical rhythm is on an 8px base (`space-1` 0.5rem to `space-6` 4rem). Home sections pad 2rem above a Title heading with a hairline under it; research chapters pad 4rem (3rem under 640px); CV sections pad 1.5rem (at most 40px between sections).

- **Home first viewport (1440×900):** nav, identity block, the plate (capped at `min(44vh, 30rem)`), its mono caption line and the STIX line all end above 900px. On phones the identity block comes first, then the plate in portrait (3/4, at most 64svh), then the rows.
- **Home budget:** at most 250 visible words in `<main>` and two screens at 1440×900 (the build's budget gate counts words).
- **Research:** the h1 and one line; per chapter a header row (an 8rem name column and the claim, with an optional mono line), the plate at frame width (PINO's viewer with its Pd/Pa curve under it), then one ruled Method and metrics row, closed at every width, holding the paragraph and the metrics table (no citation line; the outputs line links the CV). A plain-text closing row under the chapters. At most 750 words in `<main>` and 230 per chapter.
- **CV:** a sticky action bar under the nav (`top: var(--nav-h)`), `scroll-padding-top` grown by its height so anchors land clear of both; the header (an 80px portrait, the name as h1, the intro line, two role lines; the mono contact row in print only) over a primary-ink rule, then the `#interests` anchor (the intro line) and nine sections with anchors: `#education`, `#appointments`, `#publications`, `#talks`, `#patents`, `#projects`, `#awards`, `#teaching`, `#skills`.

### Named Rules
**The One Left Edge Rule.** Every column starts where the nav, plates and footer start. Measure is the only thing that narrows text; a centered narrower box, a centered plate or an indented caption breaks the rule.

**The One Target Rule.** A link target appears once per page in the human layer, and an action word once per viewport. Home links each capability row to its own target and nothing repeats one; the sticky nav carries Email and CV on every page, so no footer, identity block, closing row or proof line repeats them. A page carries at most three `mailto:` (the nav's button, the address written as text, the footer's address; Revision 2c), a redirect stub none; `scripts/budget.mjs` fails the build otherwise.

**The Two Things Rule.** The human layer is short and uneven: two big things (the identity block and the plate on home; the artifacts on research), everything else as rows and counts. The machine layer (markdown twins, `llms.txt`, `llms-full.txt`, `cv.json`, JSON-LD) is complete.

## Elevation & Depth

The system is flat: no drop shadows, glows, gradients (outside colorbars and legend ramps, which draw a colormap), blur or translucent panels. Depth is a 1px hairline in the ground's line color, a one-step tonal lift to `--bg-1`, or the film plate itself against the light box.

### Named Rules
**The Hairline-Not-Shadow Rule.** Separation is a 1px line or a tonal step. The only `box-shadow` in the build is the inset 2px signal underline on a pressed segmented button, an underline by another property.

## Shapes

Rectangles with a 2px radius (`rounded.base`) on everything with an edge: plates, buttons, role marks, tags, the wipe grip, the portrait, the focus ring. The colorbar strip takes 1px. Borders are 1px everywhere; a stronger edge is a change of ink (hairline, ink-2, ink, signal), never a thicker stroke. Charts use `shape-rendering: crispEdges` on grids and axes, 1.5px round-joined strokes for the CFD and PINO traces, and 2/3 dashed hairlines for probes. Icons are Phosphor regular SVGs inlined at 1em (links) or 1.125em (buttons): arrow-up-right on off-site links, file-pdf on Download PDF; never a glyph character or an icon font.

## Components

### Navigation (`components/Nav.astro`)
- A 3rem sticky ruled band on `--bg`, the same four items on every page and at every width: the name (home link, Archivo 500 0.95rem, -0.01em), **Research** and **CV** (ink-2, 1.5rem gap, 0.9rem vertical padding), and **Email** (compact primary, `mailto:` from `profile.email`), the page's one primary action.
- No menu disclosure and no hamburger: the row fits a 390px phone (gaps 1rem and type 0.875rem under 480px).
- States: hover raises to ink; the current page holds ink and a 2px signal underline on the band's bottom edge; 150ms ease-out.

### Footer (`components/Footer.astro`)
The ending every page shares. Above it a 3rem gap and a full-bleed hairline; inside the container: one STIX line in ink at 1.125rem ("Open to collaboration, positions and paper requests."), the mono link row, and a mono colophon in ink-3: `Updated <build date>` and the host. The link row starts with the address as text (Revision 2c), then LinkedIn · Google Scholar · ORCID, each link a 1px `--line` bottom border at 0.45rem block padding, turning signal on hover: no Email (the sticky nav's is on screen in the last viewport) and no CV (PDF) (the PDF is reached from the /cv/ action bar and linked from llms.txt, cv.md and cv.json). Two props keep the last viewport free of repeats: `omit` drops labels (`/cv/` passes `['LinkedIn']`, since its sticky action bar carries LinkedIn, so its row is Google Scholar · ORCID) and home passes `omit` for the three profile links, since its identity block carries them, so its footer row is the address alone. Pages pass them through the `footer` prop of `layouts/Base.astro`. Hidden in print.

### Identity block (`components/home/Identity.astro`)
The first thing on home. A two-column grid on the left edge (a 6rem portrait column, then the text; gap 1rem 2rem; 2rem above, 1.5rem below):
- **Portrait:** 96px square plate, 1px `--line` hairline, 2px radius, `object-position: 50% 28%`, `--bg-1` while loading; the ID photograph, never hero material.
- **Name:** the page's `<h1>`, Name type.
- **Role line:** Archivo 500 at UI size: role · lab, university in ink, then the four fields (computational hemodynamics · physics-informed AI · wearable biosignals · medical devices, `profile.fields`) in ink-2 on a second line.
- **Tagline:** `profile.tagline` in STIX 1.125rem / 1.5, ink, 68ch; swapped in one edit in content.ts.
- **Proof lines (Revisions 2a and 2b):** three mono lines in ink-2 (separators ink-3, line height 1.5, 0.15rem apart) between the tagline and the link row, from `lib/schema.ts` `proofLines` (the same helper `/index.md`, `/llms.txt` and the `llms-full.txt` In brief block print): first-author papers by short venue and year, newest first, plus the Merit Academic Paper Award; PINO, the cohort with its folds, the CFD bound (`CFD up to 35 min on 64 CPU cores`) and the GPU time (`1.78 s on one GPU`); the patent, project and award counts. All three lines are plain text (Revision 2b): the counts are read, not clicked, and the nav's CV reaches every section. Each item is a nowrap span carrying its trailing separator (a no-break space before the dot), so a line wraps only after a separator; under 640px the lines sit 0.45rem apart so each proof reads as its own group when it wraps. The machine layer prints the project count with its role ("7 funded projects (participating researcher)").
- **Link row:** mono, LinkedIn · Google Scholar · ORCID (`rel="me noopener"`), each with a 1px `--line` bottom border at 0.4rem block padding that turns signal on hover. The address as text leads the row (Revision 2c); no CV here, the nav carries it.
- **Phones (≤640px):** the portrait drops to 4rem beside the name; the role line, tagline (1.0625rem), proof lines and link row run the full width.

### Plate (`components/home/Plate.astro`, `components/home/HeroViewer.tsx`)
The one live proof on home, directly under the identity block.
- A `Frame plate` holding the VesselViewer in quiet mode, hydrated `client:visible` and preloading nothing; height `min(44vh, 30rem)`, at least 18rem. Under 900px it goes portrait (3/4, at most 64svh). Under the canvas sits the poster, a server-rendered still of the same plate (`scripts/vessel-still.mjs`; 2:1, and 3:4 upright on phones), so the plate is never a blank film before the vessel draws or without JS; it leaves once the viewer is past loading.
- **Quiet viewer:** the pressure field only, the CFD | PINO wipe handle centred (a two-state toggle on frames under 640px), the vertical colorbar with five ticks, the develop once (snapped under reduced motion); no field toggle, no orbit, no corner readouts, no FFR curve (the idle drift stays on); the vessel is cropped at the distal FFR probe plane and fitted to its bounding box.
- **Caption (Astro, so the numbers are in the server HTML):** one mono line in ink-2 from `plateCaptionItems`, `PINO-DEMO-01 · 8 649 nodes · FFR CFD 0.83 · PINO 0.82`, each value pair a nowrap item (Revision 2b: case id, node count and FFR only; the 1.78 s and the 35-minute CFD bound are in proof line 2 and the sentence below, so the plate carries no timing line; `timingItems` / `timingLine` feed the Flow chapter's mono header line and the agent files); then, 0.35rem below, one STIX line (1rem, ink-2, 62ch), `plateSentence`: "The same vessel solved twice. CFD took up to 35 minutes on 64 cores. The neural operator took 1.78 seconds. Slide or toggle to compare." (numbers interpolated). No link: the Simulation row links to the Flow chapter.
- **Data:** the quiet plate downloads the manifest and `vessel.bin.gz` only (geometry, indices, both pressure fields, region; the error field is derived); the speed arrays are a second file the home never requests.

### Home rows (`pages/index.astro`)
- **Work:** four capability rows (Simulation to `/research/#flow`, Physics-informed AI to `/research/#image`, Wearable biosignals to `/research/#pulse`, Devices and translation to `/cv/#patents`), organ-agnostic, one computed number each (since 2020; 1.78 s; the fluid-bolus AUC with its EAAI status; the patent count), kept short to fit the 240-word budget. A 15rem name column (Archivo 600, 1.0625rem; the underlined name is the row's link, no arrow) and one STIX clause in ink-2 (64ch); one column under 900px; rows ruled in `--line-soft`.
- **Selected:** three rows, newest first (the first-author DMD 2026 proceedings paper, the first-author journal paper, the co-first journal paper): a grid of mono year (3.5rem), title (Archivo 600, 1rem, 68ch), short venue (5.5rem), role mark (8.5rem) and `doi:` (15.5rem), so venue, mark and DOI align across rows; under 1100px they drop under the title.
- **Counts line:** retired from home in revision 2a; the patent, project and award counts are the identity block's third proof line (the full counts stay in llms.txt and the CV).

### Frame and corner chrome (`components/Frame.astro`)
- 1px `--line` border, 2px radius, ground `--bg` (`--bg-1` as a panel). `plate` adds the `.plate` scope.
- Corner chrome: up to four absolutely positioned mono labels inset by `--corner-inset` (0.5rem), label size, ink-3, 0.04em tracking, non-interactive; short unit-free identifiers take uppercase and 0.08em.
- The Frame is for plates (and the 404's no-signal frame). Records are never framed.

### Colorbar
- A 10px strip bordered in `--line` at the plate's right edge (0.75rem in), `min(56%, 320px)` tall (`min(60%, 280px)` in chapter plates), the field's colormap sampled at 24 stops.
- **Five ticks** on every bar, at 0, ¼, ½, ¾ and 1 of the main band, mono in ink-2 with 0.3rem ink-3 tick marks; an uppercase label above with the unit in its own case. The error bar is symmetric (−x, −x/2, 0, +x/2, +x), its label `error · PINO − CFD · ±x.x kPa` stacked on two lines, and an 8% above-range band with its own label when any node lies past +x.
- In a chapter plate under 640px the bar leaves the image and runs horizontally in a row under the canvas, ticks beneath, with the controls in a second row.

### Wipe handle and segmented control
- **Wipe handle:** a full-height 1px hairline at 38% ink over the vessel with a 16px hit zone; a grip (mono label type, 1px ink border, `--bg` ground, 0.3rem 0.55rem) labelled CFD | PINO with a 1px ink-3 bar between, riding at 88% of the height on the quiet plate. Border turns signal on hover and while dragging; focus draws the ring. A `role="slider"` with arrows, Shift+arrows, PageUp/Down, Home/End.
- **Segmented control:** adjoining 1px-bordered buttons on `--bg`, 2rem tall (2.75rem where it replaces the handle and on coarse pointers), Archivo 500 0.85rem, ink-2, radius on the group's outer corners only. Pressed: ink text, ink border, a 2px inset signal underline. Used for the field toggle (Pressure | Error | Speed) on /research and the two-state wipe on narrow frames. One mono line under the field toggle says what the Error or Speed field shows.

### Research project (`components/research/Project.astro`, `MetricsTable.astro`)
- **Header row:** the chapter name (Headline) in an 8rem column and one STIX claim (1.1875rem, 58ch) carrying its number; Flow adds the mono timing line.
- **Artifact:** the chapter's plates with STIX italic captions (at most 18 words).
- **Paragraph:** one, at most 70 words.
- **Metrics table:** an italic STIX caption above (the label convention or the manuscript status), a mono table ruled top and bottom in `--line`, row rules in `--line-soft`, no fills, header ink-3, row heads ink-2, values ink. Under 600px the metric labels and column heads wrap (about 18ch) and each value keeps its readings whole (a paired value breaks only at its middle dot), so every column fits a 390px phone without scrolling.
- **Method and metrics:** one native `<details>` per demo, closed at every width and a real control everywhere: a ruled row (UI face, ink-2) with an inline Phosphor caret at the right edge that turns over when open, its focus ring inside the row; it holds the paragraph, the bolus demo's CWT plate and the metrics table. There is no citation line: the outputs line links each paper's CV row and carries the manuscript status.
- **Closing row:** 4rem under the last chapter, a hairline and one STIX line in ink-2 (prose size, 72ch), `researchClosing`: "The valve, infection-control, urodynamics and glaucoma work has no public data yet." Plain text with no link (Revision 2b): the nav's CV shares that viewport. Only `research.md` adds "It is listed on the CV" with a link to `/cv/#patents`.
- **Captions in use:** the Flow viewer, "Surface pressure, CFD left and PINO right; slide or toggle to compare. Pressure R² …"; the FFR curve, "Pd/Pa along the vessel, 0 to <s max> mm from the inlet; at the probe planes CFD and PINO are <Δ> apart" (corner chrome `Pd / Pa along s` and the two probe positions).
- **Pulse:** the STFT plate stays in view and the CWT plate sits inside Method and metrics; they share one Replay (a compact ghost with the arrow-counter-clockwise icon, `aria-label="Replay both spectrograms"`) under the STFT plate; it is `hidden` until the islands hydrate and dispatches `spectrogram:replay` for `replayGroup="pulse"`, so neither plate carries its own button. Each plate takes `recordingS` from the pulse manifest for its accessible name ("STFT spectrogram of a <n> s smartwatch PPG recording, …").

### CV rows (`pages/cv.astro`, `components/record/*`)
Rows, not frames; one entry is about two lines; section gaps 1.5rem; one left edge; at most 5 screens at 1440×900. Short for people, complete for agents: the appointment bullets and the patent inventors are not printed on the page (each bullet restates a [J#]/[C#] row); cv.md, llms-full.txt and cv.json carry them.
- **Section:** a Title heading over a 1px primary-ink rule. In print the sections run on, a heading never ends a page and no row or publication splits; a dark-scheme print takes the light aliases (six A4 pages).
- **Period rows** (education, appointments, projects, awards, teaching): a 10.5rem mono period column and the row (Archivo 600 title with the institution inline in STIX ink-2 after a middle dot; meta lines in STIX ink-2, no measure cap, so a funded project is its title over one funder · program · grant line). One column under 760px.
- **Publications** (`PubEntry`): a 2.5rem mono id column, then the title (linked to the DOI), the author list, and one mono line: citation (the short venue, so the proceedings drop the conference location), role mark, `doi:` and the BibTeX disclosure (Copy action and the entry). Median row at most 64px.
- **Header:** an 80px portrait (hairline, 2px radius) beside the name (h1), the intro line (`interestsLine`, "I work across …", STIX 1.125rem / 1.45, ink, 68ch, `id="interests"`), the role line in ink and the concurrent appointment in ink-2. The mono contact row (email, LinkedIn, Google Scholar, ORCID, host) shows on screen and in print (Revision 2c).
- **Talks:** one table row each (2.5rem year, flexible title, 7.5rem venue, 15rem format · role), grouped International then Domestic under a mono counts line: mono year, the title (Archivo 600 0.975rem with no measure cap, so a long title wraps only at its column edge; the author line in STIX ink-3 only where it is not "H.J. Lee et al."), the short venue in mono (an `abbr` whose title carries the full venue and location), and format · role in mono. The three talk photographs sit in one 120px row (96px under 760px) at the top of the section, captions in mono.
- **Patents:** one row each: a mono id column, the title, then status (an ink-bordered REGISTERED tag with the registration number, or "pending, filed <year>") and the application number in mono, right-aligned (under the title under 760px). No inventor line.
- **Action bar:** sticky under the nav, on the left edge: Download PDF (compact ghost with the file-pdf icon) and LinkedIn (text link with the arrow-up-right icon); no label (the nav name and the h1 already say whose CV it is). It is the human layer's only link to the PDF. Hidden in print.

### Buttons (`components/Button.astro`)
- **Shape:** 2px radius, 1px border, min-height 2.75rem, padding 0.6rem 1.1rem, Archivo 500 0.95rem, 0.5rem gap to an optional 1.125em icon. Compact: 2rem, 0.3rem 0.7rem, 0.85rem.
- **Primary:** `signal-fill` ground and border, bone text; hover deepens to `signal-hover`. The nav's Email only.
- **Ghost:** transparent, border and text in the ground's ink; hover inverts. Download PDF, Copy BibTeX, Replay, Play/Pause.
- **States:** 150ms ease-out on background, border and color; `:active` drops 1px (not under reduced motion); disabled at 50% opacity; `:focus-visible` draws the 2px signal ring at 2px offset.

### Role mark and tag
- **RoleMark:** bordered, never filled; Archivo 500 0.75rem, 1.5rem tall. First author: primary-ink border, primary ink. Co-first: secondary-ink border, primary ink. Co-author: hairline, secondary ink. Never signal (revision 2a). The label comes from content data and is never inferred.
- **Tag:** mono uppercase label, 1.25rem tall, hairline border, ink-2; the ink tone (primary-ink border, primary ink) marks REGISTERED on a patent row.

**The One Anatomy Rule.** A paper reads the same everywhere (home Selected, the CV): title (linked to the DOI when one exists), venue in mono, role mark, `doi:`. A role mark, tag or label never sits directly above a heading; that is the eyebrow the craft floor bans.

### Phase scrubber (`islands/PhaseScrubber.tsx`)
The current frame of J1's Case 1 on a light-box sheet inside the film plate, with mono corner readouts (phase; acquired or synthesized). A ten-phase rail with taller primary-ink ticks and a CT mark on the two acquired phases; the shared grip as a `role="slider"`; a mono readout; the Pressure | WSS segmented control; a Play/Pause ghost; the diverging legend with the mmHg range and its kPa reading. Phase 0 is server-rendered; the cycle plays once on first visibility and never under reduced motion.

### Links
Inherit color, 1px underline in ink-3 offset 0.18em, turning signal on hover over 150ms. Link rows (identity, footer) use a 1px bottom border instead of an underline. No quiet in-page arrow links remain, and summary and closing lines (proof line 3, the research closing row) are plain text.

### Motion
Four durations and one curve: 150ms for state changes, 250ms for reveals, 400ms for the two-state wipe tween, 1780ms for the develop, all on `cubic-bezier(0.16, 1, 0.3, 1)`. The develop runs once, on first visibility. The chapter viewer's idle drift (one revolution per 60s) pauses offscreen, on `document.hidden` and during drags; the quiet plate drifts too. Reveals: a disclosure a reader toggles (the home Updates row, Method and metrics, the CV's phone folds) eases its height over 250ms, while one a script or the browser opens (on load, by an anchor, by find in page) snaps; the CV photo dialog opens at its final size and fades in over 250ms and out over 150ms with its flat dim; the viewer's canvas, wipe handle and segmented controls fade in over 250ms at ready, inside the develop's delay. Nothing scales, slides, blurs or staggers. Under `prefers-reduced-motion` the develop snaps (Replay included), the drift stops, folds snap, carets flip without turning and hover transforms are removed. Nothing loops for its own sake.

### Performance
- The quiet home plate loads `manifest.json` and `vessel.bin.gz` (uint16 quantized, zigzag delta, planar bytes, then gzip -9; `scripts/quantize-vessel.mjs`), inflated in the browser with `DecompressionStream` (the raw `vessel.bin` is the fallback). GitHub Pages sends `application/octet-stream` uncompressed, so the precompressed file is what keeps the plate near its gzip size on the wire. The speed arrays are `vessel-speed.bin(.gz)`, requested by /research the first time Speed or Error is chosen.
- Home first load (nav, identity, plate) at most 450 KB on the wire.
- Everything a plate shows as a number is also in the server-rendered HTML (captions, readouts, colorbar ticks).

### Machine layer (`lib/schema.ts`, `pages/*.ts`, `public/robots.txt`)
Not visual, but it reads the page's data and follows the same rules.
- Endpoints: `llms.txt`, `llms-full.txt`, `index.md`, `research.md`, `cv.md`, `cv.json` (JSON Resume with `meta.canonical`), each generated from content.ts through `lib/schema.ts`. `llms.txt` links Email, CV (PDF), LinkedIn, Google Scholar and ORCID, then the pages, the machine-readable files and notes for agents; `llms.txt` and `llms-full.txt` both carry an In brief block (the three proof lines, then `Record:` with `countsLine`).
- `index.md` prints the proof lines and the Selected rows with the short venue without its year (the year leads the row), as the page does.
- JSON-LD: a `@graph` with `Person` (`@id`), `WebSite`, `ProfilePage`, `ScholarlyArticle` and the research `WebPage`. Each article's author list resolves the owner's byline to `{ "@id": <Person @id> }` and every other author to a `Person` by name.
- `robots.txt`: a pointer to `/llms.txt`, then `Allow: /` with `Content-Signal: search=yes, ai-input=yes` for `*` and 19 named AI agents.

## Do's and Don'ts

### Do:
- **Do** lead home with who this is: the name as the h1, the role line, the four fields, the tagline, the three proof lines, the link row, then the quiet plate in the same 1440×900 viewport.
- **Do** put every data artifact on a film plate (`Frame plate`) with mono corner chrome, in both schemes.
- **Do** keep records as rows: capability rows and selected papers on home, dense rows on /cv.
- **Do** keep Email to the nav's one primary action and CV to the nav's page link on every page; the footer carries LinkedIn, Google Scholar and ORCID only, minus any link the page's last viewport already shows (`omit`, `links: false`).
- **Do** keep the home plate caption to one mono line (case id, node count, FFR CFD and PINO) and let proof line 2 and the sentence under the plate carry the 1.78 s and the CFD bound.
- **Do** read only the semantic aliases in components, so they work on the light box, on a film page and on a plate.
- **Do** set every number, unit, identifier and readout in JetBrains Mono, computed from content.ts or a manifest and formatted by `lib/format.ts`.
- **Do** carry rank by border ink: primary ink for first author, secondary ink for co-first, hairline for co-author; never signal.
- **Do** draw field colors from `lib/colormaps.ts` only, with five ticks on every bar and the error field on its fixed symmetric scale.
- **Do** honor `prefers-reduced-motion` on every autonomous motion.
- **Do** describe the work organ-agnostically (computational hemodynamics, physics-informed AI, wearable biosignals, medical devices); coronary appears only where a coronary result is named.
- **Do** write the owner's voice in the first person, present tense, plain.

### Don't:
- **Don't** switch a page's ground by attribute or add a theme toggle; the system scheme decides, and plates are always film.
- **Don't** print a contact or CV action twice in one place or one viewport: no Email or CV (PDF) in the identity block or the footer, no per-chapter mail links, no per-entry mail links, no closing contact block, no on-screen contact row on /cv.
- **Don't** link a home target twice, or turn a count or a closing line into a link.
- **Don't** stack labels over a result ("what / result / consequence") or write consequence sentences; a demo project is its plates in view and one closed Method and metrics row.
- **Don't** frame a record; frames are for data.
- **Don't** use drop shadows, glows, gradients outside colormaps, blur or translucent panels.
- **Don't** add kickers, eyebrows or section numbers above headings.
- **Don't** introduce a second accent or a fourth ink tier.
- **Don't** uppercase a unit or a ratio or track it.
- **Don't** fill a role mark or tag.
- **Don't** use icon fonts or glyph characters as icons (no "→"); icons are inline Phosphor SVGs sized to the text.
- **Don't** print a manuscript's status twice, as a tag, or in another wording.
- **Don't** set mono or label type below 13px on film, or secondary ink darker than 0.80 on film.
- **Don't** state a speed-up factor larger than "≈1,000×", or convert the CFD bound into hours.

## Revisions

The sections above describe the build as it stands. This record keeps what each round changed, so a later reader can tell a rule from a leftover.

### Round 1 (2026-10-15, commit 56ddc03): the cine frame
North Star "The Angiographic Reading Room". Astro rebuild as candidate 6 (seed 6687f113). Two surfaces switched per page by `<html data-surface>`: film charcoal on `/` and `/research`, light box on `/publications`, `/record`, `/cv`. A full-viewport cine frame on home with the thesis h1 and the name as corner chrome; frames carried a three-tier caption stack (what / result / consequence); rank by frame size as well as border ink; a Close block ended every page.

### Round 2 (2026-10-15, commit 2ec184d): scrubber and conversion path
Added the 4D CT phase scrubber (paper rasters on a light-box sheet inside a film plate) and a contact path (Email, CV, LinkedIn) on every page, printed in the hero, per chapter and in the Close block.

### Round 3 (2026-10-16, Revision 2 of the direction contract): short for people, complete for agents
- **Theme:** the system scheme decides the ground (light box by default, film under `prefers-color-scheme: dark`); `data-surface` removed; `.plate` keeps every data artifact on film in both schemes. Dark floor: bone-2 raised from 0.74 to 0.80, bone-3 from 0.60 to 0.64, mono and label 13px on film. `color-scheme` meta and two `theme-color` metas.
- **Structure:** three pages (`/`, `/research/`, `/cv/`); `/publications` and `/record` are meta-refresh redirects to `/cv/#publications` and `/cv/#talks`, excluded from the sitemap.
- **First viewport:** identity first (96px portrait, the name as h1, the role line and `profile.fields`, `profile.tagline`, the mono link row), then the quiet plate at `min(44vh, 30rem)` with two Astro-rendered mono caption lines (case and FFR; "CFD up to 35 min on 64 CPU cores · PINO 1.78 s on one L40S").
- **Contact:** the nav's Email (the one primary) plus the footer link row with `Updated <build date>`; at most two `mailto:` per page.
- **Records:** capability rows, three Selected rows and a counts line on home; dense CV rows (section pad 1.5rem, publications as title, authors and one mono line, talks and patents as table rows, the three talk photos in one 120px row).
- **Retired:** the what / result / consequence stack, consequence paragraphs, the Close block, per-chapter "Discuss this work" links, the home Led, About, Applied and Fronts sections, PatentList, ProjectList, PaperFrame, PageHead, rank by frame size, the thesis h1, the full-viewport home frame and its corner readouts.
- **Viewer:** `quiet` mode (pressure only, wipe, five-tick colorbar, develop once, no readouts, no FFR curve; idle drift stays on, as in the chapter viewer); the camera fitted to the mesh bounding box (vertical centre at 42% of the frame, 8%–92% of the width, height at most 72%, recomputed on resize); the error field on a fixed symmetric scale ±(p99 of |p_err| rounded up to 0.5 kPa) with the above-range yellow; `vessel.bin` repacked by `scripts/quantize-vessel.mjs` (uint16 with per-attribute offset and scale in `manifest.json`, schema `pino-viewer-manifest/2`; zigzag delta, planar bytes, gzip; normals computed in the viewer; speed arrays split into `vessel-speed.bin`): 115 883 bytes gzipped, from a 492 948-byte float32 source.
- **Agent layer:** `robots.txt` with explicit `Allow: /` groups for 19 named AI agents plus `*`, `Content-Signal: search=yes, ai-input=yes` and a pointer to `/llms.txt`; endpoints `llms.txt`, `llms-full.txt`, `index.md`, `research.md`, `cv.md` and `cv.json` (JSON Resume with `meta.canonical`), all built from content.ts; `<link rel="alternate">` to the page's markdown twin and to llms.txt in every head; a JSON-LD `@graph` (`Person`, `WebSite`, `ProfilePage`, `ScholarlyArticle`, `WebPage` with `CreativeWork` parts) from `lib/schema.ts` via `components/JsonLd.astro`.
- **Budget gate:** `pnpm build` runs `scripts/budget.mjs`, which fails on home main over 220 words, research main over 750 or any research section over 230, more than two `mailto:` on a page, a home h1 that is not the name, a missing or unparseable JSON-LD block or one without `Person`, a missing agent file, or a `cv.json` without `meta.canonical`; it warns on images without alt (`--soft` reports without failing).
- **Fonts:** Archivo stays variable (the name and page titles use `wdth` 92), shipped as a latin subset instanced to wght 400–600 and wdth 92–100 (`scripts/instance-archivo.py`); only Archivo latin and STIX latin 400 are preloaded.
- **Recorded drift, not repaired:** the cap mask in `islands/vessel/colors.ts` still uses the round-2 bone-3 (oklch 0.56) instead of 0.64; `--size-display` in `tokens.css` is no longer read by any page (each h1 sets its own clamp); the manifest's `timing.cfd.wall_time_s` stays null for this case's unlogged run; the 35-minute bound lives in content.ts `cfdReference` and is mirrored under `timing.cfd.reference_pipeline` (the build fails on a drift).

### Round 3a–3b (2026-10-16 to 2026-10-17, Revisions 2a and 2b of the direction contract): proofs in the identity block, one action word per viewport
Verified against the working tree on 2026-10-17. This replaces the separate round 3a and 3b notes, which recorded intermediate states (linked project and award counts, a two-line plate caption, a closing "the CV" link).
- **Identity:** three mono proof lines (`proofLines`) between the tagline and the link row, all plain text, 0.45rem apart under 640px. The link row is LinkedIn · Google Scholar · ORCID (CV (PDF) removed).
- **Footer:** LinkedIn · Google Scholar · ORCID only (Email and CV (PDF) removed); `omit` and `links` props: `/cv/` omits LinkedIn, home drops the row.
- **Contact:** one `mailto:` per page (the nav's), none in a redirect stub; `scripts/budget.mjs` sets `mailto: 1`, `mailtoRedirect: 0` and the home budget at 240 words (research 750, 230 per chapter).
- **Plate:** one mono caption line (`plateCaptionItems`: case id, nodes, FFR CFD and PINO); the timing line removed; the STIX line is `plateSentence` (the CFD bound, the 1.78 s, "slide or toggle"); "How it works" removed; caption pairs nowrap.
- **Home rows:** one target each (`/research/#flow`, `#image`, `#pulse`, `/cv/#patents`) and one computed number each; no home link repeats a target. The counts line under Selected removed; Selected sorted newest first with aligned venue (year stripped), role and DOI columns.
- **Research:** the closing row (`researchClosing`) is plain text; one Replay for the two spectrogram plates (`replayGroup`), hidden until hydration; `recordingS` gives each spectrogram's accessible name the recording length; the FFR caption gives the s range; the Flow caption says "slide or toggle".
- **CV:** the research-interests sentence (`interestsLine`) is the intro line under the h1 (`#interests`), no section heading; the contact row prints only; talk titles keep a 76ch measure (the detector flags longer lines).
- **Signal:** role marks and the REGISTERED tag moved to ink borders.
- **Type:** mono (`.num`, `.t-mono`, `.t-label`, `code`, `time`, `data`) stays upright inside italic captions.
- **Scrubber:** both field legends (pressure in mmHg and kPa, WSS 0–5 Pa) are server-rendered; the inactive one carries `hidden`.
- **Data and agent layer:** the PINO manifest mirrors `cfdReference` under `timing.cfd.reference_pipeline`; cv.json and cv.md write appointment notes as sentences; the funded projects carry `projectRole` ("participating researcher") in the CV heading (`projectsHeading`), cv.md, cv.json `roles`, llms.txt and index.md; `llms.txt` and `llms-full.txt` carry an In brief block; ScholarlyArticle authors reference the Person `@id`.
- **Fallback:** `vessel-static.png` regenerated from the quiet plate by `scripts/vessel-still.mjs` (2392 x 786, 68 KB palette PNG).
- **Viewer and gate:** the loading line prints only after hydration; the budget gate counts a `role="img"` element (a colorbar) as an image, not words.
- **Recorded drift, not repaired:** the header comments of `components/home/Identity.astro` and of `proofLines` in `lib/schema.ts` still say the project and award counts link to the CV (the rendered line is plain text); the `cv.astro` header comment says 32px section gaps where `CvSection` pads 1.5rem (24px); `SpectrogramDevelop` still declares the retired `what` / `result` / `consequence` props, which no caller passes; the cap mask still uses the round-2 bone-3 (oklch 0.56).
