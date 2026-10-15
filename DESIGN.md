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
- **Box** (`box`): page ground on `/publications`, `/record`, `/cv`; also the ground of a paper plate (the 4D CT figure) when it sits inside a film frame.
- **Box 2 / Box 3** (`box-2`, `box-3`): the raised steps on light box, mirroring film-1 / film-2.
- **Box Ink / Box Ink 2 / Box Ink 3** (`box-ink`, `box-ink-2`, `box-ink-3`): the cool near-black ink family on light box, in the same three tiers as bone.
- **Box Line** (`box-line`): every hairline on light box; scrollbar thumb on light box.

### Data colormaps (not UI colors)
Field colors are never drawn from the UI palette. They are implemented once in `site/src/lib/colormaps.ts` and shared by every viewer and colorbar:
- **turbo** paints pressure (CFD and PINO on one shared range).
- **diverging** (Moreland cool-warm: blue, bone-gray, red) paints signed pressure error symmetric about zero; values past +absMax take a distinct above-range yellow (`rgb(255 214 0)`) so the throat reads as a different ink, not a saturated end.
- **viridis** paints near-wall speed and spectrograms.
Masked regions (vessel inlet/outlet caps) are painted in the bone-3 tint so they read as chrome, not data.

### Named Rules
**The Two-Ink Rule.** Each surface has exactly one ink family (bone on film, box-ink on light box) in three tiers, plus the one signal red. No other UI color exists; colormaps belong to the data, not the chrome.

**The Alias Rule.** Components read `--bg`, `--bg-1`, `--bg-2`, `--line`, `--line-soft`, `--ink`, `--ink-2`, `--ink-3` only. Raw `film-*` and `box-*` values are set once per surface in tokens.css and referenced directly only when an element must hold the opposite surface inside a frame (the paper plate).

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
- **Mono** (JetBrains Mono 400, 0.8rem, 1.4, tabular): result lines, citation lines, DOIs, status readouts, the develop readout, BibTeX.
- **Label** (JetBrains Mono, 0.75rem, 1.3, 0.08em, uppercase, ink-3): corner chrome, colorbar labels, tags, axis labels, method lines. Corner chrome is uppercase only for identifiers of 14 characters or fewer carrying no unit; anything with a unit (kPa, mm, s, Pd/Pa) keeps its case and tracks at 0.04em.

### Named Rules
**The Mono Number Rule.** Every number, unit, identifier, DOI, year and readout is set in JetBrains Mono with tabular numerals; `code`, `time` and `data` elements inherit it globally. A number in Archivo or STIX is a defect.

**The Even Weight Rule.** Headings carry one weight (600) and body one weight (400). Rank is carried by size, measure and border ink, never by bolding.

**The Unit Keeps Its Case Rule.** Uppercase is chrome for short identifiers (C1, 2026, FLOW, PINO-DEMO-01) and for tags; units and ratios are never uppercased and never tracked.

## Layout

Two width containers, both centered with a fluid gutter (`clamp(1rem, 3vw, 2.5rem)`): the frame column at 1280px for frames and viewers, and the text column at 72rem for prose, lists and tables. Reading measure inside the text column is 60ch. The page is a flex column (`min-height: 100dvh`) with a 3rem top chrome, a flexible `main`, and a ruled footer.

Vertical rhythm is on an 8px base (`space-1` 0.5rem through `space-6` 4rem). Sections carry their own top padding (`section-pad`, `clamp(4rem, 9vw, 7rem)`) on the heading so a heading binds to the content below it rather than the block above; consecutive sections therefore share one `section-pad`, and only the last section pads the page bottom. A section head is a grid with a 1rem gap and a 2rem margin below. Chapters on `/research` follow the same rhythm with the artifact at frame width above the reading column, a 3rem gap after the artifact, and a one-line ruled consequence closing each chapter.

The first viewport on `/` is one grid cell shared by a full-height frame (`100dvh` minus nav and padding) and the headline block pinned to its bottom-left corner (max 44rem, padded by corner-inset plus 1.5rem). Corner readouts are capped at 46% of the frame width. The signature wipe hairline starts at 56% so it never overprints the display type. Below 900px the frame goes portrait (3/4, max 72dvh) and the headline moves below it; the wipe becomes a two-state toggle. The Three Fronts strip is a two-column grid with a 1rem gap in which Flow spans both columns as a 21/9 cine frame and Image and Pulse share the second row; below 1024px it collapses to one column and Flow becomes 4/3. Publication plates split 5fr/7fr and stack under 760px. The nav never collapses to a hamburger: links stay a compact row and wrap under the name.

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
- **Primary:** `signal-fill` ground and border, bone text; hover deepens to `signal-hover`. Used for Email only.
- **Ghost:** transparent ground, border and text in the surface ink; hover inverts to ink ground with background-colored text. Used for CV (PDF), Copy BibTeX, Replay. A compact ghost (min-height 2rem, 0.3rem 0.7rem, 0.85rem) serves inline actions; the Copy BibTeX ghost borrows the signal border for two seconds in its copied state.
- **States:** 150ms ease-out transitions on background, border and color; `:active` drops 1px (disabled under reduced motion); disabled at 50% opacity; `:focus-visible` draws the global 2px signal ring at 2px offset.

### Frame
The signature container; the world's replacement for the card.
- **Border:** 1px in `--line`, 2px radius, ground `--bg` (or `--bg-1` as a panel).
- **Corner chrome:** up to four absolutely positioned mono labels inset by `--corner-inset` (0.5rem by default, 0.6rem on lead publications, 0.875rem on the hero), 0.75rem, ink-3, 0.04em tracking, non-interactive. Short unit-free identifiers take uppercase and 0.08em. Readouts that need two lines (hero name and fronts, case line, FFR and inference lines) reuse the same corner classes with a 0.2rem row gap and read in ink-2, with the live counting numeral in signal.
- **Body:** optional aspect ratio (16/9, 4/3, 21/9, 3/4 on the portrait hero); `padded` bodies clear the corners with `calc(corner-inset + 1.5rem)` top and bottom and 1.5rem sides.
- **Stack:** the fixed three-tier caption under a 1px top rule, 0.35rem row gap, padded 1rem 1.5rem and corner-inset plus 1.25rem at the bottom: **what** (Title, Archivo 600 1.25rem), **result** (Mono 0.8rem, primary ink, every figure from the manifest or content data), **consequence** (STIX 1rem / 1.5, ink-2). On the wide Flow frame the stack runs as three columns.
- **Rank:** first and co-first work gets a lead frame with a plate; co-authored work gets no frame, only a ruled row with a 3.5rem mono id column.

### Corner readouts and colorbar
- **Colorbar:** a 10px vertical strip bordered in `--line` at the frame's right edge (0.75rem in), `min(56%, 320px)` tall (60% / 280px in chapter frames), gradient sampled from the field's colormap at 16 stops; mono ticks in ink-2 at 0.75rem to its left with 0.3rem ink-3 tick marks; an uppercase label above with the unit in its own case and ink-2. The diverging bar appends an 8% above-range band.
- **Readouts:** mono, tabular, inset 0.75-1rem; loading and error states are mono 0.8rem in ink-3 with emphasis in ink-2 at normal weight.

### Wipe handle and segmented control
- **Wipe handle:** a full-height 1px hairline at 38% ink over the vessel with a 16px hit zone; a grip at mid-height (18% on the hero) in mono uppercase label type, 1px ink border, `--bg` ground, 0.3rem 0.55rem padding, labelled CFD | PINO with a 1px ink-3 bar between. Border turns signal on hover and while dragging; focus draws the ring.
- **Segmented control:** adjoining 1px-bordered buttons on `--bg`, 2rem tall, Archivo 500 0.85rem, ink-2 text, radius only on the group's outer corners, overlapping by 1px. Hover raises to ink text and ink-3 border; pressed takes ink text, ink border and a 2px signal underline (inset). Used for the field toggle (pressure | error | speed) and the narrow-screen two-state wipe.

### Role mark and tag
- **RoleMark:** bordered, never filled; Archivo 500 at 0.75rem, 1.5rem tall, 0 0.5rem padding, 2px radius. Rank by border ink: first author takes a signal border and primary ink, co-first an ink border and primary ink, co-author a hairline and secondary ink. The label comes from content data and is never inferred.
- **Tag:** mono uppercase label at 0.75rem with 0.08em tracking, 1.25rem tall, hairline border, ink-2; `ink` tone (ink-2 border, primary ink) for firm neutral states and `signal` tone (signal border, primary ink) for the state the reader is looking for (REGISTERED, PRESENTER). This is the only uppercase permitted outside frame corners.

### Navigation
- **Style:** a 3rem ruled band on `--bg`; name at left in Archivo 500 0.95rem with -0.01em tracking, four links at right (Research / Publications / Record / CV) in ink-2 with a 1.5rem gap and 0.9rem vertical padding.
- **States:** hover raises to ink; the current page holds ink and a 2px signal underline on the band's bottom edge; 150ms ease-out. Under 480px the gap drops to 1rem and type to 0.875rem. No hamburger, no modal.
- **Page heads and anchors:** report surfaces open with the page display, a STIX lede in ink-2 and an optional row of in-page anchors (Archivo 500, ink-2, 1px line underline turning signal on hover) above a 1px rule.

### Tables and links
- **Tables:** ruled top and bottom in `--line`, header rule in `--line`, row rules in `--line-soft`; 0.55rem row padding, no fills, header text ink-3, row heads ink-2, values in primary ink with tabular numerals; italic STIX caption above.
- **Links:** inherit color, 1px underline in ink-3 offset 0.18em, underline turning signal on hover over 150ms. Footer and anchor links drop the underline for a 1px bottom border that turns signal.

### Motion
Four durations and one curve: 150ms for state changes (`--duration-quick`), 250ms for reveals such as the playhead fade (`--duration-base`), 400ms reserved (`--duration-slow`), and 1780ms for the develop (`--duration-develop`), all on `cubic-bezier(0.16, 1, 0.3, 1)`. The vessel's idle drift completes one revolution in 60s (`--drift-period`), pauses offscreen and on `document.hidden`, and collapses to 0s under `prefers-reduced-motion`; the develop snaps to its finished state and every hover transform is removed under the same query. Nothing loops for its own sake.

## Do's and Don'ts

### Do:
- **Do** put every data artifact inside a Frame with mono corner chrome and the three-tier stack (what / result / consequence); the frame is the unit of the page.
- **Do** read only the semantic aliases (`--bg`, `--ink`, `--line`, and their tiers) in components so they sit on film and light box unchanged.
- **Do** set every number, unit, identifier and readout in JetBrains Mono with tabular numerals, and compute it from the manifest or content data.
- **Do** carry rank by border ink and frame size: signal border for first-author, ink for co-first, hairline for co-author; the larger frame for led work.
- **Do** keep signal red a stroke (border, underline, ring, curve, counting numeral) and reserve `signal-fill` for the single primary action and the skip link.
- **Do** draw field colors from `lib/colormaps.ts` only: turbo for pressure, diverging for signed error with the above-range yellow, viridis for speed and spectrograms.
- **Do** honor `prefers-reduced-motion` on every autonomous motion: drift to 0s, develop snapped, transforms removed.

### Don't:
- **Don't** use drop shadows, glows, gradients, blur or translucent panels on any surface; separation is a hairline or a one-step tonal lift.
- **Don't** add kickers, eyebrows or section numbers above headings; the heading carries itself.
- **Don't** introduce a second accent or a fourth ink tier; the palette is one ink family per surface plus one red.
- **Don't** uppercase a unit or a ratio (kPa, mm, s, Pd/Pa) or track it; uppercase is for short identifiers in corners and tags only.
- **Don't** fill a role mark or tag; rank is border ink, never a colored chip.
- **Don't** animate the grain, loop the vessel for decoration, or run any motion that is not evidence of a measured quantity.
- **Don't** use icon fonts or glyph characters; icons are inline Phosphor SVGs sized to the text.
