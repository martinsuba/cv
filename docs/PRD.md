# PRD: cv
Status: v2 draft (plan PR v2) · Last update: 2026-10-23

## Problem & why
Martin's CV is a small Preact site that renders `data/cv.json` and exports `cv.pdf`. It stopped being maintainable:
- the toolchain (preact-cli 2, webpack 4, eslint 6) is dead and probably does not build on Node 24;
- the repo data is older than the CV Martin actually sends out (his newer PDF came from uncommitted laptop changes);
- making the PDF needs a dev server started by hand on a fixed port;
- deploying means copying `build/` into the separate `martinsuba.github.io` repo by hand;
- the PDF has 4 pages, the last one holds only the bachelor's degree.

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
- Later (M3): a clean, minimal design that fits a technical engineering manager.

## Non-goals (explicitly out of scope)
- Rewriting or tailoring CV content for specific roles (separate effort, later).
- Changes to the `martinsuba.github.io` root repo (it stays as is; Martin may host other things there).
- New photo, dark mode, multiple languages, a CMS or editing UI, analytics.
- A custom domain.

## Requirements

### REQ-001: Single data source
Everything shown on the site comes from `data/cv.json` (+ `data/photo.jpg`); no CV text is hard-coded in components.
Acceptance criteria:
- Given `data/cv.json`, When the built site is opened, Then the name, title, about text, every contact link, every
  experience entry (title, company, dates, location, description), every education entry and every skill group with
  all its items are visible on the page.
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
Acceptance criteria:
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

### REQ-011: Design refresh (M3)
A clean, minimal design that fits a technical engineering manager, chosen by Martin from 2–3 proposals (T-010). Detailed
criteria are added in a plan v3 PR once a direction is chosen; REQ-001…REQ-010 and REQ-012 must keep passing.
Priority: should

### REQ-012: Same typography on screen and in the PDF
The site and the PDF use one self-hosted web font, so they look the same on every machine (the CI runner has no
Apple/Windows system fonts and currently falls back to Liberation Sans).
Acceptance criteria:
- Given dist/cv.pdf, When its embedded fonts are listed, Then every font belongs to the chosen web font family; none is a
  system fallback (Liberation, DejaVu, Arial, Helvetica, Noto).
- Given the built site in Chromium, When the page has loaded, Then `document.fonts.check()` is true for the web font and
  body text computes to it.
- Given the build, Then the font files are served from /cv/ (no third-party font CDN request) and the woff2 files
  total at most 200 KB.
Priority: must

### REQ-013: Polished print layout
The PDF has comfortable, consistent spacing and reads like the website.
Acceptance criteria:
- Given print media, When the header is rendered, Then all contact links sit on one line.
- Given dist/cv.pdf, Then REQ-005 and REQ-006 still hold (≤3 A4 pages, last page ≥25%, no split entries).
- Given dist/cv.pdf, Then the page margins are at least 15 mm on every side and body text is at least 9.5 pt.
- Visual check: the Lead compares PDF pages with the website screenshot and attaches both to the PR; Martin judges on
  the milestone PR.
Priority: must

### REQ-014: Maintenance (M4)
Acceptance criteria:
- Given the `ci` workflow, When it runs, Then Playwright and its OS dependencies come from the official Playwright
  container image (no apt install step), and the job finishes in under 3 minutes on a normal run.
- Given all workflows, Then checkout, setup-node, cache and the Pages actions use their current major versions.
- Given the mutation workflow on a milestone PR, Then Stryker uses the Vitest runner, mutates `src/**` and `scripts/**`,
  at most 10% of mutants end as timeouts, and Stryker is a pinned devDependency.
Priority: could

## Constraints (budget, privacy, data, platforms)
- Public repo and public site; all CV data is already public (email, photo, history). No secrets in the build.
- Free tier only: GitHub Actions + GitHub Pages.
- Node 24 (server and CI). Default branch is `master` (framework docs say "main"; read it as `master` here).

## Open questions
- (answered 2026-10-23) The root `martinsuba.github.io` redirects to `/cv/` (Martin; PR in that repo).
