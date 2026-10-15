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

A researcher whose work makes the physics of coronary flow fast enough for clinical use, across three connected fronts: image-based coronary CFD and CT-FFR (gray-zone FFR, lattice Boltzmann pipelines); physics-informed neural operators that return CFD-grade pressure and velocity fields in seconds instead of hours; diffusion-based 4D coronary CT synthesis for dynamic FFR; and wearable PPG biomarkers (non-Newtonian viscosity, blood pressure, fluid status). What a neighbor could not truthfully copy: the ML is physics-constrained (Carreau–Yasuda priors, Navier–Stokes residuals) rather than black-box, and the same research line is already translated into products (CARDIOS, EASYCHECK via The M.E.N.D. BioSimulator) and 16 patent filings, 2 registered.

## Operating Context

- Content truth lives in `site/client/src/data/content.ts`, derived from the October 2026 CV; the public CV PDF is `site/client/public/uploads/resume.pdf`. Any rebuild must import or migrate this data rather than retype it.
- Hosting: GitHub Pages from `Good-day-commander/junlee.github.io` (branch `main`), custom domain hyeongjunlee.me via Cloudflare DNS. Deploy runs on every push to main.
- The owner edits the site through AI agents (previously Manus) and writes in Korean; the site stays English.
- Assets on hand: paper figures under `site/client/public/media/papers/extracted/`; DMD 2026 PINO figures (CFD vs prediction fields, R² 0.9646 scatter); conference photos (ACFM 2025 podium, DMD 2026, Yonsei symposium, CARDIOS discussion); posters and slides under `C:\Users\user\Desktop\junlee.github.io\학회\`; patent spreadsheets under `...\patent\`.
- Assets requested from the owner on 2026-10-08, not yet received: one PINO case (vessel mesh plus CFD and predicted pressure/velocity), an environmental portrait, a 30–60 s segment of his own Galaxy Watch PPG, synthesized 4D CT frames (only if IRB-cleared for public display), CARDIOS/EASYCHECK screenshots.

## Capabilities and Constraints

- Static site, no backend, no accounts. Must remain deployable by the Actions workflow.
- Author-role honesty is non-negotiable: J2 first author, J4 co-first, C1 first, J1 co-author, J3 co-author, C2 co-author, M1 first author under revision. Co-authored work is never presented as led.
- No patient-identifiable imagery. 4D CT material appears only if IRB-cleared; PPG demos use the owner's own recordings.
- Open owner decisions (recorded, not decided): which LinkedIn slug is live (`hyeongjunlee` per CV vs `hyeong-jun-lee-389435247` per site); whether the 2022 BESCO entry is an award or a nomination; whether two patent applications the internal sheet marks withdrawn/abandoned stay listed as pending; whether the public CV PDF should keep the mobile number and the PI's email.
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
