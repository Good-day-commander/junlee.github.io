# Maintenance recipes

Rules are in `CLAUDE.md`. Every recipe ends with "Validate" (the last section). Commands run from `site/` unless noted.
Facts live only in `site/src/data/content.ts`; pages, twins (`*.md.ts`, `llms*.txt.ts`, `cv.json.ts`) and JSON-LD read it through `src/lib/schema.ts`.

## Add a publication

1. Add an entry to `publications` in `content.ts`: `id` (J5, C3, M2: next free in its series), `type` (`journal`, `proceedings`, `under-review`), `authors` and `title` exactly as the CV prints them, `venue`, optional `venueShort`, `volume`, `article`, `pages`, `year`, `doi` (identifier only, no `https://doi.org/`), `myRole` (`first`, `co-first`, `co-author`), `status`.
2. Set `myRole` from the byline, never from importance. For a manuscript use `type: 'under-review'` with a `venueShort`; `schema.ts` prints the one status label, "manuscript under revision (EAAI)", once per entry.
3. If the paper should appear in the home Selected rows, edit the id list `SELECTED` in `src/lib/schema.ts` (three rows; the home budget is 250 words, so swap rather than add).
4. An award for the paper: add it to `awards` with `forPublication: '<id>'`.
5. Counts, proof lines, cv.md, cv.json and JSON-LD update themselves. Do not edit them by hand.
6. Update the CV PDF if the CV changed (next recipe). Validate.

## Update the CV facts and regenerate the web PDF

1. Edit the matching arrays in `content.ts` (`education`, `experience`, `publications`, `talks`, `patents`, `projects`, `awards`, `fellowships`, `teaching`, `skills`). Record any CV-vs-site disagreement as a comment line in the maintainer notes at the top; the CV wins.
2. Export the full CV to PDF from the owner's source. Keep it private.
3. Produce the web copy with PyMuPDF (`pip install pymupdf`), working in a scratch folder, never in the repo:

   ```python
   import fitz  # PyMuPDF
   SRC, OUT = "CV_full.pdf", "resume.pdf"
   REMOVE = ["<mobile number as printed>", "<referee name>", "<referee e-mail>"]  # every printed form
   doc = fitz.open(SRC)
   for page in doc:
       for term in REMOVE:
           for rect in page.search_for(term):
               page.add_redact_annot(rect, fill=(1, 1, 1))
       for link in page.get_links():                # drop clickable links to removed contacts
           uri = link.get("uri", "")
           if uri.startswith(("mailto:", "tel:")) and uri != "mailto:hjunlee96@gmail.com":
               page.delete_link(link)
       page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
   doc.save(OUT, garbage=4, deflate=True, clean=True)  # garbage=4 drops orphaned objects
   ```

   Redact the whole referee block, not only the address. Use the exact email in `profile.email`.
4. Check the result before copying it in:
   - `python -X utf8 -c "import fitz;t=''.join(p.get_text() for p in fitz.open('resume.pdf'));print('hjunlee96@gmail.com' in t, t.count('@'))"`: the owner address is present and is the only `@` you expect.
   - Search the raw and inflated bytes for every retired address and the phone digits (with and without dashes); the count must be 0. `node scripts/budget.mjs` after a build does this for addresses: any address other than `profile.email` shows as a `warn  email:` line, and a clickable `mailto:` to another address fails the build.
5. Copy it to `site/public/uploads/resume.pdf`. Validate.

## Change the public email

1. Set `profile.email` in `content.ts`. The nav `mailto:`, llms files, twins, cv.json and JSON-LD follow.
2. Regenerate the web CV PDF with the new address (recipe above). The budget gate reads `cv.json basics.email` and fails on any `mailto:` elsewhere in dist that points to a different address, including on-page PDF links.
3. Run `pnpm build` and confirm the report line `E-mail addresses: only <new address>` and no `warn  email:` lines. Validate.

## Swap the portrait

1. Replace `site/src/assets/photos/profile-main.jpg` (same file name; square or near-square, face in the upper third, at least 400 px). It feeds the home identity block, the CV header and the JSON-LD `Person.image`.
2. If the face sits differently, adjust `object-position` (now `50% 28%`) in `src/components/home/Identity.astro` and the CV header style in `src/pages/cv.astro`.
3. No identifiable patients or third parties in the frame. Validate, then regenerate the OG images (below).

## Add a talk or a patent

- Talk: add to `talks` with `id`, `year`, `category` (`International` or `Domestic`), `title`, `venue`, `location`, `format`, `role` (`presenter` or `co-author`), `note`. The role is the CV's; never mark a co-authored talk as presented.
- Patent: add to `patents` with `id` (next P-number), `title`, `jurisdiction` (`KR`, `US`, `PCT`), `applicationNo`, `year`, `status` (`registered` or `pending`), `inventors`; for registered add `registrationNo` and `registrationDate`. `withdrawn` keeps a row on record but hides it from every list and count.
- Counts (patents, registered, projects, awards) are computed. Validate.

## Updates and the Korean name

- The home Updates row and the "Recent" lists in `/index.md`, `/llms.txt` and `/llms-full.txt` need no editing. `updates` in `src/lib/schema.ts` derives them from the record in `content.ts` (the current appointment, the completed Ph.D., publications with a year, awards, registered patents, funded projects), newest first. Add the fact to `content.ts` and the lists follow; talks and pending patents never appear.
- Change how many are kept with `UPDATES_MAX` in `src/lib/schema.ts`. The home row shows the newest one closed and the rest when opened; only the closed row counts toward the 250 words.
- The Korean name beside the English one in the lead (and in the agent files' headings) is `profile.nameKo` in `content.ts`. Its glyphs ship as a Pretendard Medium subset: after changing the name, run `python -X utf8 scripts/subset-name-ko.py <path to Pretendard-Medium.woff2>` (from the npm package `pretendard`; `npm pack pretendard` in a temp folder gives it) and paste the `unicode-range` the script prints into the `Pretendard Name` face in `src/styles/fonts.css`. Validate.

## Regenerate the OG images and the no-WebGL still

Both are screenshots of the built site, so build first.

1. `pnpm build`, then `pnpm preview` in a second shell (port 4321).
2. `pnpm og`: writes `public/og.png` (home, dark), `public/og/research.png` (dark), `public/og/cv.png` (light). `ROUTES=/,/cv pnpm og` limits the run.
3. Still for browsers without WebGL: `pnpm exec astro preview --port 4371`, then `BASE_URL=http://localhost:4371 node scripts/vessel-still.mjs`. It writes `public/data/pino/vessel-static.png` (palette PNG, budget 120 KB).
4. `pnpm build` again so `dist` carries the new files. Look at each PNG: no case id, no corner readouts.
5. First time on a machine: `pnpm exec playwright install chromium`.

## Requantize the vessel mesh

Only when the PINO export changes (`website_assets/web/pino`, float32 `vessel.bin` and its manifest from `convert.py`).

1. `node scripts/quantize-vessel.mjs` (defaults: `--in ../website_assets/web/pino --out public/data/pino`). It refuses an already packed v2 input, never modifies the input, and writes `vessel.bin`, `vessel.bin.gz`, `vessel-speed.bin`, `vessel-speed.bin.gz` and `manifest.json`.
2. Read its output: raw and gzip sizes and the largest dequantization error per array. Pressure error should stay far below 0.05 kPa (the display precision is 0.1 kPa).
3. Check that `manifest.json` `timing.cfd.reference_pipeline` still matches `cfdReference`; the build fails if not.
4. Regenerate the no-WebGL still (above). Validate, including the wire size.

## Run the full validation

From `site/`:

1. `pnpm install --frozen-lockfile` (first run, or after a lockfile change).
2. `pnpm check`: 0 errors.
3. `pnpm build`: ends with `budget: all checks passed.`
3a. `pnpm smoke`: 42 checks, exit 0 (the same test CI runs before deploying).
4. `pnpm preview`, then in another shell `pnpm shots` (`SCHEMES=light` or `ROUTES=/,/research` to narrow). Inspect `.impeccable/review/` at desktop and mobile, light and dark: one left and one right edge, plates 2:1, drift running, no mono prose, no identifiers.
5. From the repo root: `~/.claude/skills/impeccable/scripts/impeccable detect --json site/src/styles site/src/components site/src/layouts site/src/islands site/src/pages site/src/lib`. Fix every finding or record why it stays.
6. Wire size of the home first load, against preview, each URL the home requests (DevTools Network lists them):
   `curl -sS --compressed -o /dev/null -w '%{size_download}\n' http://localhost:4321/`
   Sum them; the limit is 450 KB. Use `vessel.bin.gz`, not `vessel.bin` (Pages serves the binary uncompressed).
7. Spot-check the twins: `curl -s http://localhost:4321/index.md`, `/llms.txt`, `/cv.json`. Every number on the page is there too.

## The budget gate (`scripts/budget.mjs`)

Runs after `astro build` inside `pnpm build`; reads `dist/public` only. `node scripts/budget.mjs --soft` prints the same report and exits 0.

It fails (exit 1) on:
- `words:` home `<main>` over 250 visible words, research over 1000, any research `article[id]` (one project) over 260. Scripts, styles, SVG, `hidden` and `role="img"` elements do not count, nor anything in a closed `<details>` but its `<summary>`. CV is measured, not budgeted.
- `mailto:` more than one `mailto:` on a page, any on a redirect stub, or any `mailto:` in dist (HTML, text, JSON, scripts, on-page PDF links) that is not `cv.json basics.email`.
- `h1:` the home h1 is not the owner's name.
- `json-ld:` a page without an `application/ld+json` block, a block that does not parse, or no `Person` node.
- `agents:` a missing or empty `/llms.txt`, `/llms-full.txt`, `/index.md`, `/research.md`, `/cv.md`, `/cv.json`; cv.json not parsing, missing `meta.canonical` or a JSON Resume section.

It warns (no failure) on: `<img>` without `alt`; any e-mail address other than the owner's anywhere in dist (shown redacted as `x***@domain`); an orphaned PDF link object to another address.

Reading the output: tables for words per page, research sections, mailto per page, JSON-LD types, agent file sizes, then `Warnings (n)` with `warn` lines and `Failed (n)` with `FAIL` lines. Each FAIL names the page and the overrun ("over by 12"). Fix the content, never the budget.

## Deploy (GitHub Pages)

- `.github/workflows/deploy.yml` runs on every push to `main` (and by hand via workflow_dispatch). It calls `.github/workflows/build.yml`, which installs with pnpm in `site/`, runs `pnpm build` (so a budget failure blocks the deploy) and uploads `site/dist/public`; then `actions/deploy-pages` publishes it. Pull requests to `main` run the build only.
- The custom domain comes from `site/public/CNAME` (hyeongjunlee.me, DNS at Cloudflare).
- Pushing is the owner's decision. Agents do not push.

Confirm a deploy:
1. GitHub, repository Actions tab: the "Deploy website to GitHub Pages" run for the commit is green in all three jobs (config, build, deploy).
2. `curl -sI https://hyeongjunlee.me/` returns 200 with a fresh `last-modified`.
3. The footer colophon reads `Updated <build date>` with the deploy date: `curl -s https://hyeongjunlee.me/ | grep -o 'Updated [0-9-]*'`.
4. `curl -s https://hyeongjunlee.me/cv.json | head -c 300` and `curl -s https://hyeongjunlee.me/llms.txt | head` show the new facts.
5. Cloudflare may cache briefly; purge there if the old page persists.
