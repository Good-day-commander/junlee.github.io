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
