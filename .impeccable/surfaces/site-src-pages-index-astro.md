---
version: 1
slug: "site-src-pages-index-astro"
primary_target: "site/src/pages/index.astro"
related_targets: ["site/src/pages/research.astro","site/src/pages/publications.astro","site/src/pages/record.astro","site/src/pages/cv.astro"]
---

# Surface brief: hyeongjunlee.me home (and the research, publications, record, cv surfaces that inherit its world)

Scope: whole-site rebuild in Astro. Visitor mode: Experience on `/` and `/research` (the research artifact leads); Read on `/publications`, `/record`, `/cv`.

Audience and job: overseas researchers (PIs, search committees) and medical-device / medical-AI companies deciding whether to write to Hyeong Jun Lee; clinical collaborators second. Job: in 60 seconds, learn what he does, what he has led, and reach him. Actions that count as success (owner, equal weight): email, CV download, open a paper.

Proof on hand: a real patient-specific coronary vessel with CFD and PINO pressure/velocity fields (website_assets/pino, case PINO-DEMO-01, current GINO-backbone model, 85-patient 10-fold CV, unpublished); FFR readouts CFD 0.83 / PINO 0.824; inference 1.78 s on one L40S for ~80k nodes; STFT and CWT spectrograms from the fluid-bolus pipeline (website_assets/fluid_bolus) with aggregate metrics from the EAAI manuscript under revision; DMD 2026 proceedings DOI (first author); CMPB 2025 first-author paper; 16 patents (2 registered); 7 funded projects. Paper figures and conference photos in site/client/public/media.

Constraints: English only; author-role honesty (J2 first, J4 co-first, C1 first, J1/J3/C2 co-author, M1 first under revision); PINO metrics are labelled "current model, 85 cases, 10-fold CV", never the DMD paper's; the demo case is a well-predicted case (pressure R² 0.963, rank 13/85) and the cohort median (0.898) is shown beside it; CFD wall time is unknown, so no "hours to seconds" claim, only the measured 1.78 s; no patient identifiers; no testimonials, press or citation counts; static site on GitHub Pages from `site/` with output in `site/dist/public`.

Grounded candidates considered (ordered by resonance): 1 the CFD post-processing viewport; 2 the cath-lab pressure-wire monitor; 3 the typeset journal article; 4 the anatomical flow atlas plate; 5 the PIV laboratory photograph; 6 the coronary angiogram light box / cine frame; 7 the ECG strip chart. Assigned by seed 6687f113: candidate 6.

Challenger verdicts (fused with product facts, judged on audience identification and product clarity): darkroom safelight declined (raise kept: timed emergence, the PINO layer develops on the real 1.78 s readout); risograph declined (raise kept: two-ink commitment, film gray and one clinical red carry every surface); Miura sheet declined (raise kept: one control propagates, the CFD/PINO wipe drives vessel, FFR curve and readouts together); tensegrity column competitive on identification for mechanical engineers (raise kept: annotations pinned to the geometry on leader lines, layout follows the vessel not a grid); pulp rack declined (raise kept: fixed three-tier label stack on every frame: what, result, consequence); star atlas competitive on identification for scientists (raise kept: mark size carries rank, first-author work gets the larger frame, type weight stays even).

Unresolved: web CV PDF without the phone number (owner undecided); environmental portrait not yet supplied (the ID-style portrait is used small, never as hero material).

## Direction contract

THESIS: The site is the cath-lab reading room's angiographic frame, and the research is the image inside it: a real coronary vessel, pressure-painted, read the way a cardiologist reads a cine run. It refuses the researcher-portfolio default of a headline beside a portrait over a row of equal cards.

OWN-WORLD: Film charcoal ground (cool near-black, never pure, with a fixed fine grain), bone-white ink, one clinical signal red for probes, active states and the primary action; data surfaces dark, report surfaces (publications, record, cv) on light-box white with the same ink and the same red. Archivo (variable width) for display and UI, STIX Two Text for reading, JetBrains Mono for every number, identifier and corner readout. Frames have hairline bone borders and mono corner chrome; no cards, no kickers, no gradients, no glow. Colormaps: turbo for pressure, diverging for error, viridis for spectrograms. Buttons are rectangular, bordered, filled on hover; focus, selection, caret and scrollbar are themed from the palette.

STORY: A visitor lands inside a running frame: a vessel they could believe came from a patient, with a pressure field on it and FFR numbers in the corners. Within one scroll they learn he is a postdoc who makes coronary physics fast enough for clinical use, see three fronts (Flow, Image, Pulse) as further frames, see what he has led and filed, and write to him.

FIRST VIEWPORT: Full-viewport cine frame on film charcoal. The vessel (WebGL, real mesh, pressure-colored, slow C-arm drift) fills the frame from left-center to right edge; a vertical colorbar on the right edge with Pa ticks. Mono corner readouts: top-left name and "Coronary hemodynamics · Physics-informed AI · Wearable PPG"; top-right "PINO-DEMO-01 · 8,649 nodes · 10.7–13.0 kPa"; bottom-right "FFR Pd/Pa 0.83 CFD · 0.82 PINO" and "inference 1.78 s · L40S"; bottom-left is the headline block: display "Coronary physics, fast enough for the clinic." (Archivo, ≤5.5rem), one STIX line naming the postdoc role, MFDL Yonsei and the YUHS 4D CT-FFR project, then two rectangular actions: "Email" (signal fill, primary) and "CV (PDF)" (bordered). A thin top chrome holds the name and Research / Publications / Record / CV. On load the PINO layer develops over the CFD field while the readout counts to 1.78 s; a draggable vertical wipe handle (labelled CFD | PINO) sits mid-frame and is the signature interaction, also driving the FFR curve and readouts. Mobile: the frame is portrait, headline below it, wipe becomes a two-state toggle.

FORM: Coronary angiogram light box / cine frame, candidate 6 of 7 on the ordered list, seed key 6687f113, code-led (build path delegated by the owner; code-led chosen because the artifact is live WebGL data).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Revision 2 (2026-10-16): read mode, light box default, dense record

Trigger: peer review (verbose, duplicated actions, unclear identity, inconsistent theme, dark readability, agent-readability).

VISITOR MODE: / becomes Read (identity first); /research stays Experience; /cv is Read.

FIRST VIEWPORT (replaces the earlier clause): Light-box ground. Thin top chrome: name, Research, CV, and a single Email action in signal. Identity block first: portrait plate (small, hairline), h1 = the name, one Archivo line (postdoc · Multiscale Fluid Dynamics Lab, Yonsei University · computational hemodynamics · physics-informed AI · wearable biosignals · medical devices), one STIX sentence in the owner's voice (profile.tagline), one mono link row (CV (PDF) · LinkedIn · Google Scholar · ORCID). Below it, inside the same viewport at 1440×900, the cine frame: the real vessel on film, pressure-painted, with the CFD | PINO wipe handle and the vertical colorbar; no corner readouts; one mono caption under the frame carrying case id, FFR CFD/PINO and the 1.78 s. On phones: identity block, then the frame in portrait, then the rows.

OWN-WORLD (theme clause added): the page ground follows the system scheme (light box by default, film under prefers-color-scheme: dark); plates are always film. Ink, line and signal tokens are the same family in both. In dark, secondary ink is no lighter than 0.80 and mono never below 13 px.

DENSITY: report surfaces (CV) are dense: rows, not frames; one entry ≈ two lines; section gaps halved. Home is two screens at most. Research chapters carry one artifact, one paragraph, one table, one citation line each.

RETIRED: the three-tier "what / result / consequence" label stack; the Close block; per-chapter mail links; the Led, About, Applied and Fronts sections of the home page.

UNCHANGED: cine-frame world (seed 6687f113, candidate 6), hairline frames with mono corner chrome on plates, the colormaps, the type trio, the single left edge, rectangular bordered buttons, signal red reserved for probes, active states and the one primary action.

## Revision 2a (2026-10-16): proofs in the identity block

The identity block carries three mono proof lines (first-author papers and award; PINO cohort and CFD-vs-PINO time; patents, projects, awards counts) between the tagline and the link row, so the first viewport answers who, where, what, three proofs and contact. The link row is LinkedIn · Google Scholar · ORCID; Email and CV live in the nav only. The footer link row has no Email.

## Revision 2b (2026-10-17): one action word per viewport

Peer verification measured every scroll position: the sticky nav meets the footer in the last viewport of every page, so the footer row is LinkedIn · Google Scholar · ORCID only (no Email, no CV (PDF)); the PDF is reached from the CV page's action bar and is linked from llms.txt, cv.md and cv.json. The home plate caption is one mono line (case id, node count, FFR CFD and PINO); the 1.78 s and the 35-minute CFD bound live in proof line 2 and in the sentence under the plate. Proof line 3 is plain text. The research closing row is plain text. The CV page's contact row prints only; on screen the nav and footer carry those links. No home link repeats a target.

## Revision 2c (2026-10-18): the address in plain text

The owner wants the e-mail address readable, not only behind the Email button. It appears as text in the home identity row (first item), in the CV header's contact row, and first in every footer link row; the home footer shows only the address, since the identity row carries LinkedIn, Google Scholar and ORCID. The one-action-per-viewport rule now counts the button and the written address as different things: an action and a fact.

## Revision 2d (2026-10-19): the lead and the Updates row

Owner decision after reviewing hyewon.me, a design researcher's site: two of its ideas come into this engineering site, quietly. Nothing else from that site is wanted (no pixel portrait, no sidebar, no emoji, no greeting).

THE LEAD: the name stays the page's h1 at its display size (`profile.name`, Archivo 600, wdth 92); the Korean name (`profile.nameKo`, `lang="ko"`) sits beside it on the same baseline, smaller and in ink-2, set in Pretendard Medium (a subset of just those glyphs, preloaded) because Archivo has no Hangul; the system Gothic fallback looked cheap beside Archivo, the owner said so, and it was replaced the same day. Two inks on one line is the whole borrowing; the tagline stays its STIX line under the role line. A first cut ran name, Korean name and tagline together at one headline size; the owner read it as a drop in quality (the first screen lost its hierarchy and became a grey paragraph) and it was withdrawn the same day. The agent files' headings print the English name with the Korean one in parentheses, the JSON-LD Person carries it as `alternateName`, and cv.json keeps the English name.

THE UPDATES ROW: one native `<details>` directly under the identity block, shipped closed at every width. Closed, it is one ruled row: the newest update's date in mono and its sentence in STIX, with the research page's chevron at the right edge (down when closed, up when open). Open, the remaining updates follow as ruled rows in the same columns. No heading, no label word, no links (the nav's CV is the way into the record), no script. The date column is sized to the date (5rem at every width; nothing stacks on phones), and every rule spans the column. The items are derived from the record in `lib/schema.ts` (`updates`: the current appointment, the completed Ph.D., publications with a year, awards, registered patents and funded projects, newest first, at most `UPDATES_MAX`); talks and pending patents are not updates. `/index.md` and `/llms-full.txt` print them under "Recent", `/llms.txt` as a "Recent" bullet. The budget gate counts only the summary of a closed `<details>`.
