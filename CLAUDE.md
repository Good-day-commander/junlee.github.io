# hyeongjunlee.me: rules for agents and maintainers

Personal research site of Hyeong Jun Lee. Astro static site in `site/`, deployed to GitHub Pages.
Read `PRODUCT.md`, `DESIGN.md` and `.impeccable/surfaces/site-src-pages-index-astro.md` (Revisions 2, 2a, 2b) before changing anything visible.
Where those files and this one disagree, the owner rules below win. DESIGN.md still records a 240-word budget,
a 1280px container and a quiet plate without drift; all three are superseded.
The owner writes in Korean; the site stays English. Recipes for routine edits are in `MAINTENANCE.md`.

## Owner rules (bind every change)

- Add no new visible text unless the owner asks for it.
- No mono type in prose. Mono is for numbers, units, identifiers, DOIs, years, tables and link rows only.
- One left edge and one right edge: every block spans the centred column. Narrow text by measure (ch), never by a narrower box.
- No dataset identifiers in visible text (no case ids, no file or array names).
- The vessel's idle drift stays ON everywhere, home plate included (`--drift-period`, `VesselViewer.tsx`). Only reduced motion stops it.
- Home `<main>` holds at most 250 visible words (`scripts/budget.mjs` enforces it; a closed `<details>` counts only its `<summary>`).
- At most three `mailto:` per page: the nav's Email button, the address shown as text (home identity row, CV header) and the footer's address; redirect stubs carry none. The address is always `profile.email`.

## Where facts live

- `site/src/data/content.ts` is the single source of truth, derived from the October 2026 CV. The CV wins over older site copy.
- Never type a number, count, date, DOI or name in a component, page or twin. Import it from content.ts and format it with `src/lib/format.ts`; shared lines come from `src/lib/schema.ts`.
- `profile.email` is the only public address. `profile.tagline` is the owner's one sentence (swap it in one edit). `profile.nameKo` is the Korean name shown beside the English one in the lead (and in the agent files' headings); its glyphs ship as a Pretendard subset (recipe in MAINTENANCE.md). `profile.fields` holds the four fields in display order. `cfdReference` holds the CFD bound (up to 35 min on 64 CPU cores); `public/data/pino/manifest.json` mirrors it and schema.ts fails the build if they drift.
- Everything exported from content.ts ships in the JS bundle: export only public fields. Maintainer notes go in comments.
- Never export or render the phone number, the referee section, or anything patient-identifiable.

## Copy rules

- Full sentences. No telegraphic clauses, no fragments, no label stacks.
- First person, present tense, plain. English only.
- No marketing adjectives. No "consequence" sentences (what this means, why it matters). No decorative sentences.
- Organ-agnostic framing: computational hemodynamics, physics-informed AI, wearable biosignals, medical devices. Never frame him as a coronary or CT researcher; coronary appears only where a coronary result is named.
- Author-role honesty: J2 first, J4 co-first, C1 first, J1/J3/C2 co-author, M1 first author under revision. Never present co-authored work as led. Registered vs pending and presenter vs co-author stay explicit.
- Precision: kPa one decimal; FFR two decimals in captions and readouts, three in metrics tables and for CFD-PINO differences; seconds two decimals; mm one decimal.
- Fixed labels: PINO metrics read "current model, 85 cases, 10-fold CV", always. Manuscript status reads "manuscript under revision (EAAI)", printed once per entry (on /research it sits in the outputs line).
- Never state a speed-up above "about 1,000x", never convert the CFD bound to hours, never extrapolate it to fewer cores.
- Never fabricate testimonials, press, citation counts or download numbers.
- Join value and unit with U+202F; use a true minus; write ranges with an en dash and one trailing unit.

## Layout rules

- One centred fluid column: `--width-frame: clamp(50rem, 58vw, 64rem)`; the CV uses `--width-record: clamp(60rem, 66vw, 78rem)` (`src/styles/tokens.css`).
- Every block (nav, identity, plates, rows, tables, footer) spans that column edge to edge.
- Plates are 2:1 (3:4 portrait on narrow screens). The portrait sits on the right of the identity block.
- Phones (640px and under) are a disclosure layer, never a different site: the home Work rows are hidden (the fields line and the nav's Research carry them), Selected prints its DOI as the word "DOI", a research outputs line shows its first item and a caret that reveals the rest, the CV folds Talks, Patents, Funded projects, Awards, Teaching and Skills behind their headings (open on desktop, inert there) under a jump row of section links, and prose steps down one size. The server HTML keeps every word; `scripts/smoke.mjs` checks the layer at 390 and its absence at 1440.
- Research demos: each Method and metrics row ships closed at every width and is a real control everywhere. There is no citation line (the outputs line links the CV); PINO keeps its Pd/Pa curve in view under the viewer.
- Theme follows the system: light box by default, film under `prefers-color-scheme: dark`. Plates are film in both. No toggle, no per-page surface switch. Components read semantic aliases only (`--bg`, `--ink`, `--line` and their tiers).
- Keep dark and light consistent: same ink family, same red; on film secondary ink at least 0.80 L and mono at least 13px; AA contrast in both.
- No shadows, glows, gradients (outside colormaps), blur, kickers, eyebrows or section numbers. Icons are inline Phosphor SVG.

## Conversion rule

- Nav on every page: name, Research, CV, Email (the one primary action, `mailto:` from `profile.email`).
- Footer link row: LinkedIn, Google Scholar, ORCID only, minus whatever the last viewport already shows (`omit`, `links: false`).
- An action word appears once per viewport, a link target once per page. The CV PDF is linked from the /cv/ action bar, llms.txt, cv.md and cv.json.

## Agent layer

- `public/robots.txt` keeps explicit AI user-agent groups with `Content-Signal: search=yes, ai-input=yes` (ai-train unstated).
- Generated from content.ts via `lib/schema.ts`: `/llms.txt`, `/llms-full.txt`, markdown twins `/index.md`, `/research.md`, `/cv.md`, `/cv.json` (JSON Resume with `meta.canonical`), and JSON-LD (`Person` and friends) on every page.
- `updates` is derived in `schema.ts` from experience, education, awards, publications, registered patents and funded projects, newest first, capped at `UPDATES_MAX`, and printed on home (one closed `<details>` under the identity block), `index.md`, `llms.txt` and `llms-full.txt`. Never type an update by hand.
- Every visible number must also be in the server-rendered HTML (Astro markup, not only inside an island) and in the twins. Change a page, change its twin in the same edit.

## Build gate and checks

Run from `site/` (pnpm; Node 20.3 or newer):

- `pnpm check`: astro check; must report 0 errors.
- `pnpm build`: astro build, then `scripts/budget.mjs`. It fails on words, mailto count and targets, home h1, JSON-LD and agent files. `node scripts/budget.mjs --soft` reports without failing.
- `pnpm preview`: serves `dist/public` on 4321.
- `pnpm shots`: with preview running; writes light and dark, desktop and mobile captures to `.impeccable/review/`.
- `pnpm smoke`: after a build; starts its own preview, drives headless Chromium through /, /research/ and /cv/ at two widths and fails on console errors, a missing viewer or wipe control, a home Updates row that is missing, open on load or does not open on click, extra mailto links, broken redirects or missing agent files. CI runs it before deploying.
- Impeccable detector (from the repo root; user-level skill install):
  `~/.claude/skills/impeccable/scripts/impeccable detect --json site/src/styles site/src/components site/src/layouts site/src/islands site/src/pages site/src/lib`
- Wire size: home first load (HTML, CSS, JS, fonts, portrait, `manifest.json`, `vessel.bin.gz`) at most 450 KB. Per URL:
  `curl -sS --compressed -o /dev/null -w '%{size_download}\n' http://localhost:4321<path>`
- Before reporting done: check, build, shots in both schemes at 1440x900 and 390px, detector clean, wire size under budget.

## Git

- Never push. A push to `main` deploys the live site and is the owner's call.
- Commit only when asked. Short imperative subject in plain words, as in `git log`.
- End every commit message with a `Co-Authored-By: Claude <model> <noreply@anthropic.com>` line naming the model that did the work, as the history does.
- Never commit `website_assets/`, `assets-raw/`, `.claude/` or `REDESIGN_PLAN.md`. Edit `site/public/uploads/resume.pdf` only through the redaction recipe in MAINTENANCE.md.

## The owner has rejected these; do not reintroduce them

- Mono readout lines in human copy (corner readouts, `key value · key value` strings in place of a sentence).
- Fragments and telegraphic clauses.
- Identifiers in visible text (case ids, file names, internal codes).
- Decorative or "consequence" sentences.
- Text measures or boxes that stop short of the column, centred narrow boxes, indented captions.
- Inconsistent dark and light (a surface that switches ground, ink that changes family, a plate that is not film).
- Repeated actions: Email or CV twice in one viewport, per-section mail links, closing contact blocks.
- Turning the idle drift off.
