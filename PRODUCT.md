# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (owner's choice, 2026-10-08) with React islands only for the interactive data viewers; Tailwind v4; static output deployed to GitHub Pages by the existing Actions workflow (builds from `site/`, uploads `site/dist/public`). The current implementation in `site/` is React 19 + Vite (Manus-generated) and is to be replaced, not extended.

## Users

Primary: overseas researchers (PIs, faculty and postdoc search committees) and companies (medical-device and medical-AI R&D) evaluating Hyeong Jun Lee as a collaborator, hire, or research partner. Secondary: clinical and domestic collaborators. Not investors (owner, 2026-10-08).

Situation: they arrive from a paper, a conference, LinkedIn, or a cold email, usually on a laptop, and want to know within a minute what he works on, what he has actually produced (first-author papers, registered patents, funded projects), and how to reach him. Language: English only (confirmed).

## Product Purpose

Personal research site for Hyeong Jun Lee. The owner counts three outcomes as success, none ranked above the others: a qualified visitor emails him, downloads the CV, or opens a paper. The site must make his record legible and credible to someone with 60 seconds and reward someone with 10 minutes. The owner's stated bar: a visitor should react "who is this researcher?" from the site alone.

## Positioning

An engineer working inside medicine who turns clinical questions into engineering problems and brings back answers clinicians can act on, across four fields rather than one organ: computational hemodynamics (patient-specific CFD and lattice Boltzmann, from coronary CT-FFR to the tricuspid valve and anomalous coronary origin in children); physics-informed AI (neural operators that return CFD-grade fields in 1.78 s, diffusion-based 4D CT synthesis, DCNN surrogates, quantum ML for FFR); wearable and contactless biosignals (PPG for blood viscosity, blood pressure, glucose, fluid-bolus need, glaucoma screening); and devices and translation (point-of-care FFR simulator, tricuspid implant, negative-pressure tunnel, AI urodynamics; 16 patents, 7 funded projects; CARDIOS and EASYCHECK via The M.E.N.D. BioSimulator). Owner correction 2026-10-16: never frame him as a coronary or CT researcher; the coronary work is the best-evidenced example, not the definition. The three research chapters (Flow, Image, Pulse) stay coronary and PPG because those are the demos with public data.

## Operating Context

- Content truth lives in `site/client/src/data/content.ts`, derived from the October 2026 CV; the public CV PDF is `site/client/public/uploads/resume.pdf`. Any rebuild must import or migrate this data rather than retype it.
- Hosting: GitHub Pages from `Good-day-commander/junlee.github.io` (branch `main`), custom domain hyeongjunlee.me via Cloudflare DNS. Deploy runs on every push to main.
- The owner edits the site through AI agents (previously Manus) and writes in Korean; the site stays English.
- Assets on hand: paper figures under `site/client/public/media/papers/extracted/`; DMD 2026 PINO figures (CFD vs prediction fields, R² 0.9646 scatter); conference photos (ACFM 2025 podium, DMD 2026, Yonsei symposium, CARDIOS discussion); posters and slides under `C:\Users\user\Desktop\junlee.github.io\학회\`; patent spreadsheets under `...\patent\`.
- Received 2026-10-13/15: the PINO demo case (`website_assets/pino`, converted to `site/public/data/pino`), fluid-bolus spectrograms (`website_assets/fluid_bolus` → `site/public/data/pulse`), 4D CT phase renders from the J1 figure deck (`site/public/data/image`). Still requested: an environmental portrait, CARDIOS/EASYCHECK screenshots with an approved description, permission to link conference posters, any reviewing/membership items missing from the CV.

## Capabilities and Constraints

- Static site, no backend, no accounts. Must remain deployable by the Actions workflow.
- Author-role honesty is non-negotiable: J2 first author, J4 co-first, C1 first, J1 co-author, J3 co-author, C2 co-author, M1 first author under revision. Co-authored work is never presented as led.
- No patient-identifiable imagery. 4D CT material appears only if IRB-cleared; PPG demos use the owner's own recordings.
- Decided by the owner on 2026-10-12/13: LinkedIn is https://www.linkedin.com/in/hyeongjunlee/; the 2022 BESCO entry is an award; the two patent applications the internal sheet marks withdrawn/abandoned stay listed as pending (CV is authoritative); the public CV PDF is a web copy with the mobile number and the referee contact removed (`site/public/uploads/resume.pdf`), the full CV stays private.
- Standing rule (owner, 2026-10-15): every surface must lead the visitor to his profile, CV, LinkedIn or email. Since round 3 (2026-10-17) it is met once per viewport: the sticky nav carries Research · CV · Email on every page, the footer row carries LinkedIn · Google Scholar · ORCID, and the PDF sits in the CV page's action bar. Peer review had found the same action shown two to five times per page.
- Round 3 decisions (owner, 2026-10-16): public email is hjunlee96@gmail.com (content.ts `profile.email`; the web CV PDF carries it and no trace of the old address); theme follows the system (light-box white by default, film under prefers-color-scheme: dark, data plates always film); three pages (/, /research/, /cv/) with /publications and /record redirecting into CV anchors; the owner's self-description is `profile.tagline`; CFD reference time is up to 35 min on 64 CPU cores (`cfdReference` in content.ts), never extrapolated to fewer cores and never shown as a factor above ≈1,000×; robots Content-Signal is search=yes, ai-input=yes with ai-train unstated; Cloudflare Markdown for Agents is skipped (Pro plan only).
- Agent layer (round 3): robots.txt with explicit AI user-agent groups, /llms.txt, /llms-full.txt, markdown twins of each page, /cv.json (JSON Resume), JSON-LD on every page; `site/scripts/budget.mjs` fails the build on word, mailto, h1, JSON-LD and agent-file breaches.
- Image chapter artifact: the 4D CT phase renders (Case 1, Fig. 8 of J1) under `site/public/data/image/`, shown as a phase scrubber; the methods diagram is secondary.
- Terminology to keep: FFR, CT-FFR, PINO, DeepONet, PPG, Carreau–Yasuda, LBM, SaMD. Lab: Multiscale Fluid Dynamics Lab (MFDL), School of Mechanical Engineering, Yonsei University; PI Prof. Joon Sang Lee. Concurrent: Project Researcher, Yonsei University Health System, 4D CT-FFR project (PI Prof. Jung-Sun Kim).

## Brand Commitments

- Name: Hyeong Jun Lee. No logo, no color system inherited. Affiliated product names: CARDIOS, EASYCHECK, The M.E.N.D. BioSimulator.
- Voice (direction agreed 2026-10-08): quiet authority. Editorial-scientific register; the energy lives in live research data, not in UI decoration. Not a startup or product-pitch tone.

## Evidence on Hand

- Publications, proceedings, patents, grants with identifiers (all in `content.ts`).
- Quantitative hooks: PINO R² 0.9646 against CFD (DMD 2026 figure); seconds-versus-hours inference; 16 patents with 2 registered; 7 funded projects 2020–2029.
- Photos: ACFM 2025 podium, DMD 2026, Yonsei symposium, CARDIOS discussion. Only an ID-style portrait exists today.
- Absent, do not fabricate: testimonials, press coverage, citation counts, download numbers.

## Product Principles

1. Lead with the artifact. Flow fields, CT, and PPG are the visuals; nothing decorative competes with them.
2. Legible in 60 seconds. Role, the three fronts, the first-author record, and a way to make contact sit above the fold or one scroll away.
3. Honest attribution everywhere: author role, registered versus pending, presenter versus co-author.
4. One source of truth. Every number on the page is computed from the content data, never typed twice.
5. Credibility over flash. Motion and color exist to make data understandable; nothing loops for its own sake.

## Accessibility & Inclusion

WCAG AA contrast throughout; every interactive viewer is keyboard-operable and has a static, text-equivalent fallback; `prefers-reduced-motion` disables autonomous motion.
