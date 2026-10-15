---
name: hyeongjunlee.me
description: A cath-lab cine frame on film charcoal; the research is the image inside it, read in bone ink with one clinical red.
colors:
  film-0: "oklch(0.15 0.008 250)"
  film-1: "oklch(0.21 0.008 250)"
  film-2: "oklch(0.28 0.01 250)"
  film-line: "oklch(0.38 0.01 250)"
  bone: "oklch(0.94 0.006 85)"
  bone-2: "oklch(0.74 0.012 85)"
  bone-3: "oklch(0.6 0.012 85)"
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
  display:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5.4vw, 5.5rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.02em"
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
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0"
    fontFeature: "tabular-nums"
  label:
    fontFamily: "JetBrains Mono Variable, JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: "0.75rem"
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
  section-pad: "clamp(4rem, 9vw, 7rem)"
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
    textColor: "{colors.bone}"
    typography: "{typography.ui}"
    rounded: "{rounded.base}"
    padding: "0.6rem 1.1rem"
    height: "2.75rem"
  button-ghost-hover:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.film-0}"
  frame:
    backgroundColor: "{colors.film-0}"
    rounded: "{rounded.base}"
  frame-panel:
    backgroundColor: "{colors.film-1}"
    rounded: "{rounded.base}"
  frame-padded-body:
    padding: "2rem 1.5rem"
  frame-stack:
    padding: "1rem 1.5rem 1.75rem"
  corner-readout:
    textColor: "{colors.bone-3}"
    typography: "{typography.label}"
    padding: "0.1rem 0.25rem"
  nav:
    backgroundColor: "{colors.film-0}"
    height: "{spacing.nav-h}"
  nav-link:
    textColor: "{colors.bone-2}"
    typography: "{typography.ui}"
    padding: "0.9rem 0"
  nav-link-current:
    textColor: "{colors.bone}"
  rolemark:
    backgroundColor: "transparent"
    textColor: "{colors.bone-2}"
    rounded: "{rounded.base}"
    padding: "0 0.5rem"
    height: "1.5rem"
  rolemark-first:
    textColor: "{colors.bone}"
  rolemark-co-first:
    textColor: "{colors.bone}"
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.bone-2}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "0 0.4rem"
    height: "1.25rem"
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
  button-compact:
    typography: "{typography.ui}"
    rounded: "{rounded.base}"
    padding: "0.3rem 0.7rem"
    height: "2rem"
  nav-action-primary:
    backgroundColor: "{colors.signal-fill}"
    textColor: "{colors.bone}"
    rounded: "{rounded.base}"
    padding: "0.3rem 0.7rem"
    height: "2rem"
  nav-action-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    rounded: "{rounded.base}"
    padding: "0.3rem 0.7rem"
    height: "2rem"
  nav-menu-summary:
    textColor: "{colors.bone-2}"
    typography: "{typography.ui}"
    padding: "0.3rem 0.1rem 0.3rem 0.4rem"
    height: "2rem"
  close-line:
    typography: "{typography.body}"
    fontSize: "clamp(1.5rem, 1.2rem + 1.2vw, 2.125rem)"
    width: "30ch"
  about-portrait:
    rounded: "{rounded.base}"
    width: "10rem"
    height: "10rem"
  photo-plate:
    backgroundColor: "{colors.film-1}"
    rounded: "{rounded.base}"
  cv-action-bar:
    backgroundColor: "{colors.box}"
    height: "3.5rem"
  scrubber-plate:
    backgroundColor: "{colors.box}"
    rounded: "{rounded.base}"
  scrubber-grip:
    backgroundColor: "{colors.film-0}"
    textColor: "{colors.bone}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "0.3rem 0.55rem"
  scrubber-tick-acquired:
    backgroundColor: "{colors.bone}"
    height: "1rem"
  scrubber-tick:
    backgroundColor: "{colors.bone-3}"
    height: "0.5rem"
  legend-ramp:
    rounded: "{rounded.base}"
    width: "6rem"
    height: "0.5rem"
  section-heading:
    typography: "{typography.headline}"
    width: "28ch"
  skip-link:
    backgroundColor: "{colors.signal-fill}"
    textColor: "{colors.bone}"
    typography: "{typography.ui}"
    rounded: "{rounded.base}"
    padding: "0.5rem 0.75rem"
---

# Design System: hyeongjunlee.me

## Overview

**Creative North Star: "The Angiographic Reading Room"**

The site is a cath-lab cine frame and the research is the image inside it. Every surface is read the way a cardiologist reads a run: a hairline-bordered frame, mono readouts pinned in the corners, the data filling the middle, and a fixed caption beneath it saying what it is, what it measured, and what follows. Nothing decorative competes with the vessel, the FFR curve or the spectrogram; UI chrome is thin, mono and tinted so it reads as instrument markings rather than interface.

Two surfaces share one ink and one accent. The data surfaces (`/`, `/research`) sit on film charcoal: a cool near-black that is never pure, under a single static grain sheet. The report surfaces (`/publications`, `/record`, `/cv`) sit on light-box white with the same bone-tinted ink family inverted and the same clinical red. Components never read the raw film or box values; they read semantic aliases (`--bg`, `--ink`, `--line`) that the `<html data-surface>` attribute resolves, so one component works unchanged on both surfaces.

Rank is carried by border ink and by frame size, never by weight, fill or color flooding. First-author work gets the larger frame and the signal-red border on its role mark; co-authored work gets a compact ruled row and a hairline. Type weight stays even across the hierarchy (one display weight, 600) so the eye ranks by geometry, not by shouting.

**Key Characteristics:**
- Film charcoal and light-box white as two surfaces of one world; identical ink roles and one red on both.
- Frame, not card: hairline border, 2px radius, mono corner chrome, three-tier caption stack (what / result / consequence).
- Three faces with fixed jobs: Archivo (width 92) for display and UI, STIX Two Text for reading, JetBrains Mono for every number, unit, identifier and readout.
- Flat throughout; depth is a hairline, a tonal step or a fixed grain, never a shadow or gradient.
- Signal red is reserved: probes, the PINO trace, active underlines, focus rings, selection and the one primary action per page.
- Motion is physical evidence: the PINO layer develops over the measured 1.78 s, the vessel drifts one revolution per 60 s, and both stop under reduced motion.

## Colors

A two-ink palette: a tinted near-black and a tinted bone, swapped between the two surfaces, with a single clinical red that both surfaces share.

### Primary
- **Clinical Signal** (`signal`): the one red. Used as a stroke and a state, not as a fill: the PINO curve, the probe markers, the active nav underline, the first-author role-mark border, link hover underlines, the focus ring, the caret and form accent, and the hero's counting readout. On ~1% of any screen.
- **Signal Fill** (`signal-fill`): the darker step of the same hue that sits under bone text. The primary button (Email) and the skip link only; `signal` itself falls short of AA under bone text and is never used as a text ground.
- **Signal Hover** (`signal-hover`): primary-button hover.
- **Signal Soft** (`signal-soft`): 18% alpha of the signal; text selection highlight on both surfaces.

### Neutral: Film (data surfaces)
- **Film 0** (`film-0`): page ground on `/` and `/research`, and the ground of every frame on film. Cool, never pure black.
- **Film 1** (`film-1`): one raised step. Panel frames, the spectrogram stage, the BibTeX block.
- **Film 2** (`film-2`): second step; scrollbar thumb.
- **Film Line** (`film-line`): every hairline on film: frame borders, rules, table rules, nav and footer edges. A 55% alpha of it (`--line-soft`) draws chart grids and table row rules.
- **Bone** (`bone`): primary ink on film, the wipe seam, the CFD trace, the playhead. Tinted warm, never gray.
- **Bone 2** (`bone-2`): secondary ink: ledes, captions, nav links at rest, colorbar ticks, cite lines.
- **Bone 3** (`bone-3`): tertiary ink: corner chrome, labels, axis ticks, icon glyphs at rest, colophon. Held at 0.60 lightness because 0.56 fell below 4.5:1 over the viewer ground.

### Neutral: Light Box (report surfaces)
- **Box** (`box`): page ground on `/publications`, `/record`, `/cv`; also the light box inside a film frame: the phase scrubber's plate and the Fig. 9 result plate on `/research#image`.
- **Box 2 / Box 3** (`box-2`, `box-3`): the raised steps on light box, mirroring film-1 / film-2.
- **Box Ink / Box Ink 2 / Box Ink 3** (`box-ink`, `box-ink-2`, `box-ink-3`): the cool near-black ink family on light box, in the same three tiers as bone.
- **Box Line** (`box-line`): every hairline on light box; scrollbar thumb on light box.

### Data colormaps (not UI colors)
Field colors are never drawn from the UI palette. They are implemented once in `site/src/lib/colormaps.ts` and shared by every viewer and colorbar:
- **turbo** paints pressure (CFD and PINO on one shared range).
- **diverging** (Moreland cool-warm: blue, bone-gray, red) paints signed pressure error symmetric about zero; values past +absMax take a distinct above-range yellow (`rgb(255 214 0)`) so the throat reads as a different ink, not a saturated end.
- **viridis** paints near-wall speed and spectrograms.
Masked regions (vessel inlet/outlet caps) are painted in the bone-3 tint so they read as chrome, not data.

**Paper-native colormap (the phase scrubber).** The 4D CT frames on the Image front are the authors' own renders from J1 (Fig. 8, Case 1), painted in ParaView's cool-to-warm map: pressure 70–130 mmHg and wall shear stress 0–5 Pa, both blue to red. The site never recolors a paper raster, so the scrubber is the one place pressure is not turbo. Its legend reproduces the paper's ramp with the site's `diverging` map (the same Moreland cool-warm), sampled at 16 stops as a CSS gradient, with the unit and range in mono (a second kPa reading, one decimal, follows the mmHg range). The above-range yellow is not used there: the renders have no above-range band.

### Named Rules
**The Two-Ink Rule.** Each surface has exactly one ink family (bone on film, box-ink on light box) in three tiers, plus the one signal red. No other UI color exists; colormaps belong to the data, not the chrome.

**The Alias Rule.** Components read `--bg`, `--bg-1`, `--bg-2`, `--line`, `--line-soft`, `--ink`, `--ink-2`, `--ink-3` only. Raw `film-*` and `box-*` values are set once per surface in tokens.css and referenced directly only when an element must hold the opposite surface inside a frame (the paper plate).

**The Light-Box Rule.** White inside a film frame is the light box of the world, never a bare rectangle: it carries a 1px hairline and mono corner chrome or a caption, and holds only a raster that came from the paper or the data. Paper rasters on the light box are composited with `mix-blend-mode: multiply`, so the figure's own white becomes the box ground instead of a second rectangle.

**The Signal-Is-A-Stroke Rule.** Signal red is a border, underline, ring, curve or counting numeral. It is a fill only on the primary button and skip link, and then as `signal-fill`, never as `signal`.

## Typography

**Display Font:** Archivo Variable at width 92 (with Archivo, system-ui, sans-serif)
**Body Font:** STIX Two Text (with Times New Roman, Georgia, serif)
**Label/Mono Font:** JetBrains Mono Variable (with JetBrains Mono, ui-monospace, Menlo, Consolas, monospace)

**Character:** A compressed grotesk for headings and controls, a narrow scientific serif for reading, and a mono for everything numeric. The pairing reads as a journal article clipped to an instrument panel: the mono does the measuring, the serif does the arguing, the grotesk does the naming. All three faces are self-hosted through fontsource and imported in `Base.astro`.

### Hierarchy
- **Display** (600, `clamp(2.4rem, 5.4vw, 5.5rem)`, 0.98, -0.02em, width 92): the hero headline only, capped at 15ch.
- **Display (page)** (600, `clamp(2.25rem, 1.6rem + 3vw, 4rem)`, 1.0, -0.025em, width 92): the h1 of each report surface, capped at 20ch.
- **Headline** (600, `clamp(1.75rem, 1.35rem + 1.2vw, 2.25rem)`, 1.1, -0.015em): section and chapter headings, capped at 28ch.
- **Title** (600, 1.25rem, 1.3, -0.01em): the "what" line of a frame stack; subheadings. Lead publication titles step to `clamp(1.375rem, 1.1rem + 1vw, 1.75rem)`; row titles hold 1.125rem.
- **Body** (STIX 400, 1.0625rem, 1.65): ledes, reading column, the hero role line, frame consequences (at 1rem / 1.5). Measure 60ch, which STIX renders as roughly 72-78 characters.
- **Caption** (STIX italic, 0.95rem, 1.5, ink-2): figure captions, table captions, viewer notes, publication status lines.
- **UI** (Archivo 500, 0.95rem, 1.3): nav, buttons, footer links, anchors, details summaries. Compact variants hold 0.85rem (segmented controls, Copy BibTeX) and 0.875rem (nav under 480px).
- **Mono** (JetBrains Mono 400, 0.8rem, 1.4, tabular): result lines, citation lines, DOIs, status readouts, the develop readout, the scrubber readout and legend, BibTeX.
- **Label** (JetBrains Mono, 0.75rem, 1.3, 0.08em, uppercase, ink-3): corner chrome, colorbar labels, tags, axis labels, method lines. Corner chrome is uppercase only for identifiers of 14 characters or fewer carrying no unit; anything with a unit (kPa, mm, s, Pd/Pa) keeps its case and tracks at 0.04em.

### Numbers, units and labels
Every figure on a page is computed from `content.ts` or a data manifest and formatted by `site/src/lib/format.ts`; none is typed twice.
- **Joins:** value and unit are joined by a narrow no-break space (U+202F), which also groups thousands (8 649 nodes); negatives take a true minus (−); ranges take an en dash and one trailing unit (10.7–13.0 kPa).
- **Pressure:** kPa at one decimal (13.0 kPa). Where the source unit is mmHg (the phase scrubber), the mmHg range leads and the kPa reading follows at one decimal in ink-3.
- **FFR (Pd/Pa):** two decimals in readouts, the FFR curve key and prose (CFD 0.83 · PINO 0.82); three decimals in the metrics table's case column and for the CFD–PINO difference; the cohort MAE at four.
- **Time and length:** seconds at two decimals (1.78 s), millimetres at one.
- **Manuscript status:** one label site-wide, lowercase with the venue's short form, "under revision (EAAI)", printed once per entry: in the year corner on the home Led frames and on /publications, and as the venue line of the /research PaperFrame (the short form wrapped in an `abbr` carrying the full venue). Never a tag, never repeated in the same entry.
- **DOI:** `doi:` lowercase with no space, then the identifier (doi:10.1115/DMD2026-1091), in mono, linked to doi.org; on the PaperFrame row it is trailed by the arrow-up-right icon.
- **Counts in prose:** spelled as words by `numberWord` in ledes ("sixteen patent filings", "seven funded projects"); numerals stay for readouts, tables, corners and lists.

### Named Rules
**The Mono Number Rule.** Every measured number, unit, identifier, DOI, list year and readout is set in JetBrains Mono with tabular numerals; `code`, `time` and `data` elements inherit it globally. Two exceptions keep a sentence whole: counts in running prose are spelled as words, and a date inside a STIX sentence (the Ph.D. date in About) keeps the sentence's serif. A measured value in Archivo or STIX is a defect.

**The One Formatter Rule.** A precision is a property of the quantity, not of the page: kPa at one decimal, FFR at two (three in the metrics table), seconds at two, mm at one, all through `lib/format.ts`. Two renderings of one value at different precisions on the same surface are a defect.

**The Even Weight Rule.** Headings carry one weight (600) and body one weight (400). Rank is carried by size, measure and border ink, never by bolding.

**The Unit Keeps Its Case Rule.** Uppercase is chrome for short identifiers (C1, 2026, FLOW, PINO-DEMO-01) and for tags; units and ratios are never uppercased and never tracked.

## Layout

One container, centered at 1280px with a fluid gutter (`clamp(1rem, 3vw, 2.5rem)`), for everything: frames, viewers, nav, footer, page heads, section headings, prose, lists and tables. The text width variant keeps the same 1280px box; text narrows by measure, not by container: prose holds 60ch, plate captions and the "my part" lines 62ch, rows and tables their own ch caps. (`--width-text: 72rem` is still declared in tokens.css but no container reads it.) The page is a flex column (`min-height: 100dvh`) with a 3rem top chrome, a flexible `main`, and a ruled footer.

Vertical rhythm is on an 8px base (`space-1` 0.5rem through `space-6` 4rem). Sections carry their own top padding (`section-pad`, `clamp(4rem, 9vw, 7rem)`) on the heading so a heading binds to the content below it rather than the block above; consecutive sections therefore share one `section-pad`, and only the last section pads the page bottom. A section head is a grid with a 1rem gap and a 2rem margin below. Chapters on `/research` follow the same rhythm with the artifact at frame width above the reading column, a 3rem gap after the artifact, and a one-line ruled consequence closing each chapter.

The first viewport on `/` is one grid cell shared by a full-height frame (`100dvh` minus nav and padding) and the headline block pinned to its bottom-left corner (max 44rem, padded by corner-inset plus 1.5rem). Corner readouts are capped at 46% of the frame width. The signature wipe hairline starts at 56% so it never overprints the display type. Below 900px the frame goes portrait (3/4, max 72dvh) and the headline moves below it; the wipe becomes a two-state toggle. The /cv page adds a sticky action bar directly under the nav (top: nav-h), and `scroll-padding-top` grows by its height so anchors land clear of both. The Three Fronts strip is a two-column grid with a 1rem gap in which Flow spans both columns as a 21/9 cine frame and Image and Pulse share the second row; below 1024px it collapses to one column and Flow becomes 4/3. Publication plates split 5fr/7fr and stack under 760px. The nav never collapses to a hamburger: from 760px down the four page links fold into an inline "Menu" disclosure while Email and CV (PDF) stay in the 3rem row.

### Named Rules
**The One Left Edge Rule.** Every column starts where the frames, nav and footer start. Headings, prose, plates, captions and the Close all sit on that edge; a centered narrower text box, a centered plate or an indented caption breaks it. Measure is the only thing that narrows text.

## Elevation & Depth

The system is flat. There are no drop shadows, no glows, no gradients, no blur and no translucency on any surface. Depth is conveyed three ways: a 1px hairline in the surface's line color (frames, rules, tables, nav and footer edges), a one-step tonal lift to `--bg-1` for a panel or a stage inside a frame, and a single static feTurbulence grain sheet at 5% opacity fixed over film surfaces (never animated, removed in print). The hero frame isolates its own stacking context so the headline block and the viewer chrome layer by z-index, not by shadow.

### Named Rules
**The Hairline-Not-Shadow Rule.** Separation is a 1px line or a tonal step. A `box-shadow` that leaves a surface is a defect; the only `box-shadow` in the build is an inset 2px underline on a pressed segmented button, which is an underline by another property, not an elevation.

**The One Grain Rule.** Film surfaces carry exactly one grain layer, applied by `body::after` at 256px tiling and 5% opacity. Nothing else textures a surface.

## Shapes

Rectangles with a 2px radius (`rounded.base`) on everything that has an edge: frames, buttons, role marks, tags, the wipe grip, the BibTeX block, the focus ring. The colorbar strip takes 1px; segmented controls round only their outer corners so the group reads as one instrument. Borders are 1px everywhere; a stronger edge is a change of ink (hairline to ink-2 to ink to signal), never a thicker stroke. Charts use `shape-rendering: crispEdges` on grids and axes, 1.5px round-joined strokes for the CFD and PINO traces, and 2/3 dashed hairlines for probes. The details disclosure caret is a 0.4rem bordered square rotated 45 degrees, not a glyph. External-link, email and PDF icons are Phosphor regular SVGs inlined at 1em (footer) or 1.125em (buttons) and sized to the text.

## Components

### Buttons
Rectangular actions, bordered, filled on hover, with a visible ring on focus. One primary per page.
- **Shape:** 2px radius, 1px border, min-height 2.75rem, padding 0.6rem 1.1rem, Archivo 500 at 0.95rem, 0.5rem gap to an optional 1.125em icon.
- **Primary:** `signal-fill` ground and border, bone text; hover deepens to `signal-hover`. Used for Email only, everywhere it appears (nav, hero, Close, /cv bar).
- **Ghost:** transparent ground, border and text in the surface ink; hover inverts to ink ground with background-colored text. Used for CV (PDF), Copy BibTeX, Replay, Play/Pause. "CV (PDF)" is the one label for the PDF action on every surface.
- **Compact** (`size="compact"`, min-height 2rem, 0.3rem 0.7rem, 0.85rem): the nav actions, the /cv action bar and Copy BibTeX; the Copy BibTeX ghost borrows the signal border for two seconds in its copied state.
- **States:** 150ms ease-out transitions on background, border and color; `:active` drops 1px (disabled under reduced motion); disabled at 50% opacity; `:focus-visible` draws the global 2px signal ring at 2px offset.

### Frame
The signature container; the world's replacement for the card.
- **Border:** 1px in `--line`, 2px radius, ground `--bg` (or `--bg-1` as a panel).
- **Corner chrome:** up to four absolutely positioned mono labels inset by `--corner-inset` (0.5rem by default, 0.6rem on lead publications, 0.875rem on the hero), 0.75rem, ink-3, 0.04em tracking, non-interactive. Short unit-free identifiers take uppercase and 0.08em. Readouts that need two lines (hero name and fronts, case line, FFR and inference lines) reuse the same corner classes with a 0.2rem row gap and read in ink-2, with the live counting numeral in signal.
- **Body:** optional aspect ratio (16/9, 4/3, 21/9, 3/4 on the portrait hero); `padded` bodies clear the corners with `calc(corner-inset + 1.5rem)` top and bottom and 1.5rem sides.
- **Stack:** the fixed three-tier caption under a 1px top rule, 0.35rem row gap, padded 1rem 1.5rem and corner-inset plus 1.25rem at the bottom: **what** (Title, Archivo 600 1.25rem), **result** (Mono 0.8rem, primary ink, every figure from the manifest or content data), **consequence** (STIX 1rem / 1.5, ink-2). On the wide Flow frame the stack runs as three columns. A result that carries more than one measurement is two or three short stacked lines (`.frame__result .rl`, display block), never a chain of middle dots; a line holds at most one `·`.
- **Rank:** first and co-first work gets a lead frame with a plate; co-authored work gets no frame, only a ruled row with a 3.5rem mono id column.
- **My part:** each home Led frame ends on one first-person sentence of what was mine, pinned to the frame's foot under a 1px top rule (62ch) so paired frames end on one line; a co-authored /research PaperFrame carries the same sentence as its note ("My part was the hemodynamic side...").

### Corner readouts and colorbar
- **Colorbar:** a 10px vertical strip bordered in `--line` at the frame's right edge (0.75rem in), `min(56%, 320px)` tall (60% / 280px in chapter frames), gradient sampled from the field's colormap at 16 stops; mono ticks in ink-2 at 0.75rem to its left with 0.3rem ink-3 tick marks; an uppercase label above with the unit in its own case and ink-2. The diverging bar appends an 8% above-range band.
- **Readouts:** mono, tabular, inset 0.75-1rem; loading and error states are mono 0.8rem in ink-3 with emphasis in ink-2 at normal weight.

### Wipe handle and segmented control
- **Wipe handle:** a full-height 1px hairline at 38% ink over the vessel with a 16px hit zone; a grip at mid-height (18% on the hero) in mono uppercase label type, 1px ink border, `--bg` ground, 0.3rem 0.55rem padding, labelled CFD | PINO with a 1px ink-3 bar between. Border turns signal on hover and while dragging; focus draws the ring.
- **Segmented control:** adjoining 1px-bordered buttons on `--bg`, 2rem tall, Archivo 500 0.85rem, ink-2 text, radius only on the group's outer corners, overlapping by 1px. Hover raises to ink text and ink-3 border; pressed takes ink text, ink border and a 2px signal underline (inset). Used for the field toggle (pressure | error | speed) and the narrow-screen two-state wipe.

### Role mark and tag
- **RoleMark:** bordered, never filled; Archivo 500 at 0.75rem, 1.5rem tall, 0 0.5rem padding, 2px radius. Rank by border ink: first author takes a signal border and primary ink, co-first an ink border and primary ink, co-author a hairline and secondary ink. The label comes from content data and is never inferred.
- **Tag:** mono uppercase label at 0.75rem with 0.08em tracking, 1.25rem tall, hairline border, ink-2; `ink` tone (ink-2 border, primary ink) for firm neutral states and `signal` tone (signal border, primary ink) for the state the reader is looking for (REGISTERED, on the registration-number row of a patent frame). This is the only uppercase permitted outside frame corners. Talks are grouped Presented / Co-authored, so no presenter tag is needed; the INTL / DOMESTIC tag follows the venue line.

**The One Anatomy Rule.** A paper reads the same on every page (home Led, /research PaperFrame, /publications PubEntry): title (linked to the DOI when one exists), authors, venue line in mono, then the DOI and the role mark on one row. A role mark, tag or corner label never sits directly above a heading at any width; that is the eyebrow the craft floor bans. The same holds for patents (REGISTERED sits beside "Registered No.") and talk rows (tags after the venue, on mobile too). Each /publications entry has one BibTeX control, a disclosure whose panel holds the Copy action and the entry; "Email for a copy" (mailto, subject naming the paper id) sits on the DOI row.

### Navigation
- **Style:** a 3rem sticky ruled band on `--bg`; name at left in Archivo 500 0.95rem with -0.01em tracking, four links (Research / Publications / Record / CV) in ink-2 with a 1.5rem gap and 0.9rem vertical padding, then the two actions after a 1px line divider: **Email** (compact primary, mailto) and **CV (PDF)** (compact ghost, opens the PDF). The actions are omitted on /cv only, where the action bar carries them.
- **Menu disclosure (760px and below):** the four links fold into a `<details>` "Menu" (Archivo 500 0.85rem, ink-2, the rotated-square caret) placed after the actions; open, the links run as an inline strip positioned under the band with its own bottom hairline. Escape or a click outside closes it. Under 360px the ghost CV action drops and Email stays. No hamburger icon, no modal, no focus trap.
- **States:** hover raises to ink; the current page holds ink and a 2px signal underline on the band's bottom edge; 150ms ease-out.
- **Page heads and anchors:** report surfaces open with the page display, a STIX lede in ink-2 and an optional row of in-page anchors (Archivo 500, ink-2, 1px line underline turning signal on hover) above a 1px rule.

### Close (the ending of every page)
- **Placement:** `components/Close.astro`, rendered by `Base.astro` at the end of `<main>` on every page, so no surface ends on a list. A page passes its own line, an optional note and one optional note link (`close` prop), or `false` to omit it.
- **Anatomy:** a hairline on the content edge (the footer owns the full-bleed rule), then from 900px a two-column grid (the text and a 32rem action column, bottom-aligned). Left: one STIX line at `clamp(1.5rem, 1.2rem + 1.2vw, 2.125rem)`, line-height 1.3, capped at 30ch (an `h2` at weight 400) and a STIX note in ink-2, both in the first person ("Write to me about a collaboration, a position, or a copy of a paper." / "Email is the fastest route; I reply from Seoul (UTC+9)."). Right: the Email primary (envelope icon) and CV (PDF) ghost (file-pdf icon) buttons, then the address and Google Scholar / LinkedIn / ORCID as mono links, each profile link trailed by the Phosphor arrow-up-right icon at 0.95em in ink-3 that turns signal on hover. LinkedIn always reads `profile.links.linkedin`. Padding: section-pad above, space-6 below. Hidden in print.
- **Footer:** below the Close, a slim ruled colophon row (year, name, lab and university; the four pages; Top), so the contact routes are never printed twice.
- **Chapter links:** each /research chapter's consequence line ends in a quiet "Discuss this work" mailto whose subject names the chapter.

### About and photo plates
- **About (home, between Led work and Applied):** a three-column grid on the left edge (a 10rem portrait, a reading column up to 40rem, a 15rem photo column; two columns under 1024px with the photo under the text, one under 600px). The ID portrait is a 160px (10rem) square plate with a hairline and 2px radius, cropped to keep the face near the top third (8rem under 1024px, 7rem under 600px), never hero material. Beside it, first-person STIX sentences built from content.ts (role, lab and PI; the hospital project; the Ph.D. with the dissertation title in italic and its date in the serif; the B.Eng.), then one mono line of the five routes (Email, CV (PDF), LinkedIn, Google Scholar, ORCID). The ACFM 2025 podium photograph sits as a 3/4 plate with a mono label-size caption read from that talk record, linking to its row on /record.
- **Photo plate:** a photograph rendered with `astro:assets` `<Image>` from `src/assets/photos` (webp, explicit width and a `widths` list, `sizes` per layout), 1px `--line` border, 2px radius, `--bg-1` ground while loading, and a mono caption in ink-2 under it. On `/record#talks` three plates share one row height by flexing in proportion to their aspect ratio (`--a`), never cropped; a caption links to its talk row when the CV has one.

### CV action bar
- **Style:** `position: sticky; top: var(--nav-h)` on `/cv`, `--bg` ground, a bottom hairline, layered under the nav. Left, a label ("Name, CV") in Archivo 500; right, Email (compact primary), CV (PDF) (compact ghost) and a LinkedIn text link trailed by the arrow-up-right icon, so the actions stay on screen across a four-page CV. Hidden in print, where the page is the CV itself.

### Phase scrubber (`islands/PhaseScrubber.tsx`)
- **Plate:** the current 1036×782 frame of J1's Case 1 on the light box (`box` ground) inside the film frame, with a hairline and mono corner readouts on the plate (phase top-left; acquired or synthesized bottom-right, the acquired state in primary ink). Phase 0 is server-rendered as a plain `<img>`, so nothing is blank before hydration.
- **Rail:** a 1px `--line` track with ten ticks (0–9) and mono labels under them; the two acquired phases (0 and 5, parsed from the manifest note) get a taller 1rem tick in primary ink, a primary-ink label and a "CT" mark above. The grip is the wipe handle's grip (mono label type, 1px ink border, `--bg` ground, signal border on hover and drag) and is a `role="slider"` with arrows, Home/End and PageUp/Down; a click or drag snaps to the nearest phase.
- **Readout:** "Phase k / 9 · acquired | synthesized" in mono, ink-2, the state in primary ink when acquired; 1.125rem in the full mode's side column.
- **Legend:** field name in uppercase label type, low value, a 6rem × 0.5rem `diverging` ramp with a hairline, high value, unit in its own case, then the kPa reading in ink-3. Pressure 70–130 mmHg and WSS 0–5 Pa, both read from the manifest.
- **Full mode** (`/research#image`): the plate beside a side column with the readout, the Pressure | WSS segmented control (the Flow field toggle), a Play/Pause ghost that loops at 6 fps, the legend and the phase note in STIX italic. **Compact mode** (home Image front): plate, rail, readout and legend only; no toggle, no play button.
- **Motion:** the cycle plays once on first visibility and stops at Phase 0; nothing plays under reduced motion, offscreen or on `document.hidden`.

### Plates (paper figures)
**The Result-Plate Rule.** A paper figure earns a plate only when it shows a result (fields, curves, measured errors), never a method flowchart or an architecture diagram: those break the Two-Ink Rule and read as slides. Every plate is captioned in STIX italic naming the figure and the paper (id, journal initials, volume, year), sits on the shared left edge (never centered) as a light-box sheet padded 1rem with a hairline, is capped at 35rem (560px; a wide chart gets 50rem), links to its full-size file with a zoom-in cursor, keeps its caption under the plate's left edge at 62ch, and ships with provenance (a `<file>.json` sidecar or the manifest's `source`). Current plates: the phase-scrubber frames and Fig. 9 (J1) on `/research#image`, and the C1 CFD-against-PINO panel on `/publications`. Dropped by this rule: the J2 viscosity flowchart and the J4 workflow figure (on /publications and /research), and the 4D CT Fig. 1 architecture in both its white and black-ground versions (the black-ground file also loses its labels and arrows, which are black on black). A J2 visual returns only as its viscosity result panel (predicted against measured), cropped from the paper with provenance.

### Tables and links
- **Tables:** ruled top and bottom in `--line`, header rule in `--line`, row rules in `--line-soft`; 0.55rem row padding, no fills, header text ink-3, row heads ink-2, values in primary ink with tabular numerals; italic STIX caption above.
- **Links:** inherit color, 1px underline in ink-3 offset 0.18em, underline turning signal on hover over 150ms. Footer and anchor links drop the underline for a 1px bottom border that turns signal.

### Motion
Four durations and one curve: 150ms for state changes (`--duration-quick`), 250ms for reveals such as the playhead fade (`--duration-base`), 400ms reserved (`--duration-slow`), and 1780ms for the develop (`--duration-develop`), all on `cubic-bezier(0.16, 1, 0.3, 1)`. The vessel's idle drift completes one revolution in 60s (`--drift-period`), pauses offscreen and on `document.hidden`, and collapses to 0s under `prefers-reduced-motion`; the develop snaps to its finished state and every hover transform is removed under the same query. Nothing loops for its own sake.

## Do's and Don'ts

### Do:
- **Do** put every data artifact inside a Frame with mono corner chrome and the three-tier stack (what / result / consequence); the frame is the unit of the page.
- **Do** end every page with the shared Close, and keep Email (primary) and CV (PDF) (ghost) one click away in the nav on every page.
- **Do** give a paper the one anatomy everywhere: title, authors, venue, then DOI and role mark on one row.
- **Do** read only the semantic aliases (`--bg`, `--ink`, `--line`, and their tiers) in components so they sit on film and light box unchanged.
- **Do** set every number, unit, identifier and readout in JetBrains Mono with tabular numerals, and compute it from the manifest or content data.
- **Do** carry rank by border ink and frame size: signal border for first-author, ink for co-first, hairline for co-author; the larger frame for led work.
- **Do** keep signal red a stroke (border, underline, ring, curve, counting numeral) and reserve `signal-fill` for the single primary action and the skip link.
- **Do** draw field colors from `lib/colormaps.ts` only: turbo for pressure, diverging for signed error with the above-range yellow, viridis for speed and spectrograms.
- **Do** honor `prefers-reduced-motion` on every autonomous motion: drift to 0s, develop snapped, transforms removed.
- **Do** format every value through `lib/format.ts`: kPa at one decimal, FFR at two (three in the metrics table), seconds at two, a narrow no-break space before the unit, `doi:` lowercase with no space, and one manuscript label, "under revision (EAAI)".
- **Do** start every column on the one left edge and narrow text by measure (60ch prose, 62ch captions), never by a narrower centered box.
- **Do** write the copy that speaks for the owner in the first person (About, the Close, the "my part" lines); third person belongs to author lists and to collaborators' work.

### Don't:
- **Don't** use drop shadows, glows, gradients, blur or translucent panels on any surface; separation is a hairline or a one-step tonal lift.
- **Don't** add kickers, eyebrows or section numbers above headings, including a role mark, tag or label printed directly over a title; the heading carries itself.
- **Don't** plate a method flowchart or architecture figure from a paper; plates are results only, captioned, with provenance.
- **Don't** introduce a second accent or a fourth ink tier; the palette is one ink family per surface plus one red.
- **Don't** uppercase a unit or a ratio (kPa, mm, s, Pd/Pa) or track it; uppercase is for short identifiers in corners and tags only.
- **Don't** fill a role mark or tag; rank is border ink, never a colored chip.
- **Don't** animate the grain, loop the vessel for decoration, or run any motion that is not evidence of a measured quantity.
- **Don't** use icon fonts or glyph characters; icons are inline Phosphor SVGs sized to the text.
- **Don't** print a manuscript's status twice, as a tag, or in another wording; it is one label in one place per entry.
