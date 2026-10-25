# PRD: cv
Status: v7 draft (plan PR v7) · Last update: 2026-10-25

## Problem & why
Martin's CV is a small Preact site that renders `data/cv.json` and exports `cv.pdf`. It stopped being maintainable:
- the toolchain (preact-cli 2, webpack 4, eslint 6) is dead and probably does not build on Node 24;
- the repo data is older than the CV Martin actually sends out (his newer PDF came from uncommitted laptop changes);
- making the PDF needs a dev server started by hand on a fixed port;
- deploying means copying `build/` into the separate `martinsuba.github.io` repo by hand;
- the PDF has 4 pages, the last one holds only the bachelor's degree.

Plan v5 (content rework): the CV read like a developer CV with a manager title on top: management work was invisible,
descriptions were dense paragraphs, and location and languages were missing. Martin approved a new text
(~/HAL/ai-assistant/notes/career/cv/cv-draft.md, v3 FINAL, 2026-10-24) aimed at Engineering Manager roles in general.
It needs a few small data model additions: bullet points per role, an optional intro line per role, a header location
and a Languages section.

Goal of this project: one JSON file is the only thing Martin edits; CI builds the site and the PDF from it, and a
deploy he triggers publishes both to `https://martinsuba.github.io/cv/`.

## Users
- Martin (only editor): edits `data/cv.json`, triggers a deploy, downloads/sends the PDF.
- Recruiters / hiring managers (readers): open the site on desktop or phone, download or print the PDF.

## Goals (measurable where possible)
- `npm ci && npm run build && npm run pdf` works on Node 24 with no flags or manually started servers.
- Site and PDF content match `data/cv.json` exactly; `data/cv.json` matches Martin's current PDF (2026-10-23).
- PDF: A4, at most 3 pages, no near-empty last page.
- Deploy is one manual GitHub Actions run; site + `cv.pdf` live under `/cv/`.
- M4: the "Technical ledger" design (direction A, chosen by Martin from the T-010 proposals) on screen and in the PDF.
- M7: site and PDF show the approved content v2 word for word, still on at most 2 A4 pages.

## Non-goals (explicitly out of scope)
- Tailored CV variants per company or job ad (Martin: one general EM CV).
- Writing new CV text in this repo: the text is decided in the career notes draft; tasks copy it verbatim.
- Updating LinkedIn (Martin, by hand).
- Changes to the `martinsuba.github.io` root repo (it stays as is; Martin may host other things there).
- Dark mode, multiple languages, a CMS or editing UI, analytics.
- A custom domain.

## Requirements

### REQ-001: Single data source
Everything shown on the site comes from `data/cv.json` (+ `data/photo.jpg`); no CV text is hard-coded in components.
Acceptance criteria:
- Given `data/cv.json`, When the built site is opened, Then the name, title, about text, every contact link, every
  experience entry (title, company, dates, location, description), every education entry and every skill group with
  all its items are visible on the page.
- (plan v5) Given `data/cv.json`, Then the header location, every experience `highlights` item, an entry's
  `description` only when present, and every language with its level are visible on the page.
- Given a contact of type `email`, When it is rendered, Then its link is `mailto:<address>`; other contacts link to their URL.
Priority: must

### REQ-002: Data validation
`data/cv.json` is checked against a JSON Schema (`data/cv.schema.json`).
Acceptance criteria:
- Given a valid `data/cv.json`, When `npm run validate` runs, Then it exits 0.
- Given a `cv.json` with a missing required field or wrong type (e.g. experience entry without `title`), When
  `npm run validate` runs, Then it exits non-zero and names the field.
- Given `npm run build`, When it runs, Then validation runs first and a broken `cv.json` fails the build.
Priority: must

### REQ-003: Current content
`data/cv.json` holds the exact text of Martin's current CV PDF (2026-10-23).
Superseded in plan v5 by REQ-018 (content v2); its tests are rewritten to REQ-018 in T-024.
Acceptance criteria (until T-024):
- Given the built site, When it is opened, Then it shows the PDF's About text, the "up to 80%" sentence in the F-Secure
  Engineering Manager entry, the full Technical Project Lead / Lead Frontend / Lookout / SaferPass descriptions from the PDF,
  and skill groups "Leadership & Delivery", "Engineering" and "AI" in that order.
- Given the built site, When it is opened, Then old skills no longer present in the PDF (Mocha, Jasmine, Travis,
  Photoshop, Sketch) and the "language" skill group do not appear.
Priority: must

### REQ-004: Modern build
Vite + Preact replaces preact-cli; the site is a static build under base path `/cv/`.
Acceptance criteria:
- Given Node 24 and a clean checkout, When `npm ci && npm run build` runs, Then it succeeds without
  `--openssl-legacy-provider` and writes `dist/`.
- Given `dist/` served under `/cv/`, When the page loads, Then every requested asset (JS, CSS, image) returns 200 and the
  browser console has no errors.
- Given the build, When `dist/` is listed, Then it contains no service worker and no web app manifest.
Priority: must

### REQ-005: PDF generation
`npm run pdf` creates `dist/cv.pdf` from the production build by itself.
Acceptance criteria:
- Given a finished `npm run build`, When `npm run pdf` runs with no server running, Then it starts and stops its own
  static server and writes `dist/cv.pdf`.
- Given `dist/cv.pdf`, When it is inspected, Then it is A4 and has at most 3 pages.
- Given `dist/cv.pdf`, When it is inspected, Then the last page holds at least 25% as much text as the average of the
  other pages (no near-empty last page).
- Given `dist/cv.pdf`, When its text is extracted, Then it contains the name, every experience title and every
  education entry from `cv.json`.
Priority: must

### REQ-006: Print layout
Print output is clean and readable.
Acceptance criteria:
- Given `dist/cv.pdf`, When its text is extracted per page, Then no experience entry is split across two pages (its title
  and the end of its description are on the same page).
- Given print media, When the page is printed, Then interactive-only elements (the PDF download link) are hidden.
Priority: should

### REQ-007: PDF download link
Acceptance criteria:
- Given the site, When it is opened, Then a visible "Download PDF" link points to `cv.pdf` relative to the page (i.e.
  `/cv/cv.pdf` when deployed), and that file is served.
Priority: must

### REQ-008: Meta and SEO basics
Acceptance criteria:
- Given the built `index.html`, Then `<html lang="en">`, `<title>` is "<name> – <title>" from `cv.json`, and a meta
  description is set from the about text.
- Given the built `index.html`, Then `og:title`, `og:description`, `og:type` and `og:image` (the photo, absolute URL) are set.
Priority: should

### REQ-009: Manual deploy to GitHub Pages
A GitHub Actions workflow `deploy` (manual trigger only, `workflow_dispatch`) publishes the site and PDF.
Acceptance criteria:
- Given the `deploy` workflow is run on `master`, When it finishes, Then it has validated the data, built the site,
  generated `cv.pdf`, and deployed both to GitHub Pages.
- Given a finished deploy, When `https://martinsuba.github.io/cv/` is fetched, Then it returns 200 and contains the name
  from `cv.json`; `https://martinsuba.github.io/cv/cv.pdf` returns 200 with `application/pdf`.
- Given a push or merge to `master`, Then no deploy runs automatically.
Priority: must

### REQ-010: Responsive and accessible
Acceptance criteria:
- Given a 375px wide viewport, When the page is opened, Then there is no horizontal scrolling.
- Given the page, When axe-core runs, Then there are no serious or critical violations.
- Given links that open a new tab, Then they have `rel="noopener"`; the photo has alt text (the name).
Priority: should

### REQ-011: Design refresh: "Technical ledger" (M4)
(plan v5: "full description" below now means all of an entry's content: intro line and every bullet; old roles keep
their own entries.)
Martin chose direction A from the T-010 proposals (canvas: https://claude.ai/artifact/AeMkfPFe6NVjtSg5Gx5pk4, boards
"A · Technical ledger"): Inter for text, JetBrains Mono for labels, dates and contacts, one blue accent (#1D4ED8),
numbered section labels in a left column, dates in their own column, skills as tags on screen. All content stays: every
entry keeps its full description on screen and in the PDF (the mockup's condensed "Earlier" list is not adopted, because
content tailoring is out of scope and REQ-001 requires every description).
Acceptance criteria:
- Given the built site at 1280px, When it is opened, Then every section heading reads "<nn> / <Name>" numbered 01, 02, …
  in page order, is set in JetBrains Mono, and sits left of the section content (its box ends before the content starts).
- Given the built site at 1280px, Then every experience and education entry shows its dates in JetBrains Mono, left of
  the entry title.
- Given the built site at 375px, Then labels and dates sit above their content (single column), with no horizontal scroll.
- Given the built site, Then the job title under the name and the links use the accent colour, and each skill item is
  its own list item (`li`) inside its group.
- Given dist/cv.pdf, Then the extracted text contains every skill group as one comma-separated line
  ("<item>, <item>, …"), i.e. print shows skills as text, not tags (ATS-friendly).
- Given dist/cv.pdf, Then it has at most 2 A4 pages and REQ-005/006/012/013 still hold.
- Visual check: the PR attaches 1280px, 375px and PDF page screenshots next to the matching canvas boards; Martin
  judges on the milestone PR.
Priority: should

### REQ-012: Same typography on screen and in the PDF
The site and the PDF use the same self-hosted web fonts, so they look the same on every machine (the CI runner has no
Apple/Windows system fonts and falls back to Liberation Sans). Since plan v3: Inter for text, JetBrains Mono for labels
(REQ-011). Both are static (non-variable) fonts: Chromium embeds variable fonts in PDFs as Type3, which breaks text
extraction (lost hyphens) and ATS parsing.
Acceptance criteria:
- Given dist/cv.pdf, When its embedded fonts are listed, Then every font is Inter or JetBrains Mono; none is a system
  fallback (Liberation, DejaVu, Arial, Helvetica, Noto) and none is Type3.
- Given dist/cv.pdf, When its text is extracted, Then every hyphenated word in cv.json is intact.
- Given the built site in Chromium, When the page has loaded, Then an Inter and a JetBrains Mono @font-face have status
  "loaded", body text computes to Inter and section labels to JetBrains Mono.
- Given the build, Then the font files are served from /cv/ (no third-party font CDN request) and the woff2 files
  total at most 230 KB (230,000 B).
Priority: must

### REQ-013: Polished print layout
The PDF has comfortable, consistent spacing and reads like the website.
Acceptance criteria:
- Given print media, When the header is rendered, Then all contact links sit in the header block on page 1 (one line,
  or since plan v3 one right-aligned column), above the first section.
- Given dist/cv.pdf, Then REQ-005 and REQ-006 still hold (≤3 A4 pages, last page ≥25%, no split entries).
- Given dist/cv.pdf, Then the page margins are at least 15 mm on every side and body text is at least 9.5 pt.
- Visual check: the Lead compares PDF pages with the website screenshot and attaches both to the PR; Martin judges on
  the milestone PR.
Priority: must

### REQ-014: Maintenance (M5)
Acceptance criteria:
- Given the `ci` workflow, When it runs, Then Playwright and its OS dependencies come from the official Playwright
  container image (no apt install step), and the job finishes in under 3 minutes on a normal run.
- Given all workflows, Then checkout, setup-node, cache and the Pages actions use their current major versions.
- Given the mutation workflow on a milestone PR, Then Stryker uses the Vitest runner, mutates `src/**` and `scripts/**`,
  at most 10% of mutants end as timeouts, and Stryker is a pinned devDependency.
- (plan v4) Given the mutation workflow, When timeouts exceed 10% of mutants, the report is missing, or the score falls
  below the break threshold in stryker.config.json, Then the job fails; the job summary lists the surviving mutants
  with file and line. The workflow declares `permissions: contents: read`.
Priority: could

### REQ-015: Unit tests where mutation testing found gaps (M6)
The first meaningful mutation run (62.91%, run 40068998427) showed untested logic in the build scripts and in the
app's empty-section branches. These scripts produce the PDF and the meta tags and guard the data, so they deserve tests.
Acceptance criteria:
- Given `scripts/validate.js`, Then its CLI path (exit code 1 and an error list for invalid data, 0 for valid data) is
  covered by unit tests with synthetic files.
- Given `scripts/vite-plugin-cv-meta.js`, Then `injectMeta` is unit-tested (tags filled from cv.json, HTML escaping,
  and a build error, not a silent no-op, when `</head>` is missing).
- Given `scripts/pdf.js`, Then `makePdf` is unit-tested with an injected fake browser/page: A4, 16 mm margins,
  `printBackground`, waits for fonts and images, and the server is always stopped (also on error).
- Given `src/app.jsx`, Then sections without content render no heading and numbering stays consecutive.
- Given the mutation workflow, Then the overall score is at least 75% and the break threshold is raised to 75.
Priority: should

### REQ-016: Dependency hygiene (M6)
Acceptance criteria:
- Given the open Dependabot security alerts on master, Then each one is classified (real and fixed / real and not
  fixable yet / stale, no longer in package-lock.json) in a short report in the PR; real fixable ones are fixed with
  non-breaking updates; stale ones are listed for Martin to dismiss (the Lead does not dismiss alerts).
- Given `.github/dependabot.yml`, Then npm and github-actions updates are checked weekly and grouped into one PR per
  ecosystem.
- Given `npm audit --omit=dev`, Then it reports no high or critical vulnerabilities.
Priority: could

### REQ-017: Data model for bullets, location and languages (M7)
Acceptance criteria:
- Given an experience entry, Then it may have a `description` (one short paragraph or intro line), a `highlights` array
  of non-empty strings, or both, and `npm run validate` fails (naming the entry) when it has neither.
- Given an entry with `highlights`, When the page renders, Then they are one `ul` with one `li` per highlight, after the
  description if there is one; on screen and in the PDF each highlight reads as its own bullet line.
- Given a top-level `location` string, Then it is shown in the header under the job title; without it, nothing is shown.
- Given a top-level `languages` array of `{ language, level }`, Then a "Languages" section after Education lists each as
  "<language> (<level>)", numbered like the other sections; without it, no section and no heading.
- Given dist/cv.pdf, Then the bullets, location and languages are in the extracted text, and no entry is split across
  pages (REQ-006 now checks the last highlight, or the description when there are no highlights).
Priority: must

### REQ-018: Content v2 (M7)
`data/cv.json` holds the approved draft (~/HAL/ai-assistant/notes/career/cv/cv-draft.md, v3 FINAL, 2026-10-24) word for
word, as given in docs/PLAN.md T-024; plan v6 (draft v4, 2026-10-25) changes the About text and the Engineering Manager
bullets (one consistent voice, no "I") and adds Python to the Engineering skills, as given in docs/PLAN.md T-025.
Acceptance criteria:
- Given the built site, Then it shows the new About text, the five Engineering Manager highlights (incl. "up to 80%"),
  every highlight of the Technical Project Lead, Lead Frontend (F-Secure, Lookout) and SaferPass entries, the one-line
  descriptions of the four earlier roles, the location "Bratislava, Slovakia" and the four languages.
- Given the built site, Then skill groups are "Leadership", "Delivery", "AI", "Engineering" in that order, and Git,
  Webpack and npm are not skill items.
- (plan v6) Given the built site, Then the About text and the five Engineering Manager highlights are the v4 texts
  from T-025, and "Python" is an Engineering skill item
  right after "Node.js".
- (plan v7) Given the built site, Then "AI-assisted development" is an AI skill item right after
  "AI-orchestrated workflows and agentic automation" and before "AI-native SDLC (Claude Code / Anthropic ecosystem)".
- Given the built site, Then the header has no npm link and the page contains no "open to" phrase (public site,
  Martin 2026-10-24).
- Given dist/cv.pdf, Then it has at most 2 A4 pages and REQ-005/006/011/012/013 still hold.
- Visual check: the milestone PR attaches 1280px, 375px and PDF page screenshots; Martin judges.
Priority: must

### REQ-019: Hyphenated words stay on one line (M7, plan v7)
In the PDF, "F-Secure" broke as "F-" / "Secure" and "AI-orchestrated" as "AI-" / "orchestrated". Chromium always allows a
break after an ASCII hyphen, so CSS on the running text cannot prevent it.
Acceptance criteria:
- Given any CV text rendered by the components (about, experience descriptions and highlights, education, skills,
  languages), When a word contains a hyphen between two letters or digits (e.g. "F-Secure", "Tier-1", "AI-native"),
  Then it is wrapped in an element with `white-space: nowrap`, and the visible text is unchanged.
- Given dist/cv.pdf, When its text is extracted, Then no hyphenated word from cv.json is split across two lines, every
  hyphen is still the ASCII "-" (no U+2011), and REQ-005/006/011/012/013 still hold (≤2 pages).
- Given a 375px viewport, Then there is still no horizontal scrolling (REQ-010).
Priority: should

## Constraints (budget, privacy, data, platforms)
- Public repo and public site; all CV data is already public (email, photo, history). No secrets in the build.
- No team sizes, project counts or other sensitive or fast-changing numbers in the content (Martin, 2026-10-24).
- Nothing on the public site that signals a job search (no "open to …"); the current employer can see it.
- Free tier only: GitHub Actions + GitHub Pages.
- Node 24 (server and CI). Default branch is `master` (framework docs say "main"; read it as `master` here).

## Open questions
- (answered 2026-10-23) The root `martinsuba.github.io` redirects to `/cv/` (Martin; PR in that repo).
