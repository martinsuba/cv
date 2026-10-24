# Tests: cv

## How to run (Node 24, see .nvmrc)
- Install: `npm ci`, then once `npx playwright install chromium` (CI caches `~/.cache/ms-playwright` and installs the OS deps with `--with-deps`/`install-deps`).
- Lint: `npm run lint` (ESLint 9 flat config). Format check: `npm run format:check` (fix with `npm run format`). No typecheck (plain JS).
- Unit (Vitest + @testing-library/preact, `src/**/*.test.jsx`): `npm test`.
- Acceptance (Playwright, `tests/acceptance/`): `npm run build && npm run test:e2e`. Playwright starts `vite preview`
  (serves `dist/` under `http://localhost:4173/cv/`) itself. The tests read `dist/`, so build first; the PDF specs also
  need `dist/cv.pdf` (`npm run pdf`). One spec: `npx playwright test tests/acceptance/build.spec.js`.
- Screenshots (not a gate): `npm run build && npx playwright test tests/screenshots`, output in `screenshots/`.
- Mutation (milestone PRs and manual `workflow_dispatch` of `mutation.yml`; heavy, ~6.5 min locally): `npx stryker run`
  (`stryker.config.json`: pinned `@stryker-mutator/core` + `vitest-runner`, mutates `src/**` and `scripts/**` without test files,
  `coverageAnalysis: perTest`). Report in `reports/mutation/mutation.json`; `node scripts/mutation-summary.js` prints the score
  and counts as Markdown (CI appends it to the job summary). Under Stryker `vite.config.js` sets Vitest `reporters: ['dot']`
  (detected via `STRYKER_MUTATOR_WORKER`) so no per-run GitHub summary box is written; plain `npm test` is unchanged.
  Entry files and CLI guards that only run as processes (`scripts/pdf.js` makePdf, `validate.js` main block, `src/main.jsx`)
  show as NoCoverage: they are exercised only by the Playwright acceptance tests. Stryker >= 10.1.0 supports Vitest 5 (T-022); Stryker core, vitest-runner and Vitest are pinned exactly
  (10.1.1 / 5.0.5) so a bump is a deliberate change.
- CI (`.github/workflows/ci.yml`, job `ci`): npm ci, lint, format check, unit, build, acceptance. `npm run pdf` runs before acceptance and `dist/cv.pdf` is uploaded as artifact `cv-pdf` on every run.

## Contracts the not-yet-built features must satisfy (tests are written against them)
- `npm run validate` validates `data/cv.json`, or the file in env `CV_JSON` when set; field-level errors go to stdout/stderr
  (they must contain the offending field name, e.g. `title`); exit code non-zero on invalid data. `npm run build` runs
  `validate` first (`"build": "npm run validate && vite build"`), so extra args such as `--outDir` still reach vite.
- `npm run pdf` writes `dist/cv.pdf` from an existing `dist/` and starts/stops its own server. `npm run pdf -- --out <path>` writes to another file instead (the self-contained test uses a temp file so it never touches `dist/cv.pdf`).
- Fixture files with invalid data: `tests/fixtures/` (synthetic).
- Exact expected texts for REQ-018: `tests/acceptance/expected-content.js` (copied from `data/cv.json`, content v2).
- Tests marked `test.fixme` name the task that makes them pass; that task removes the `fixme` (it needs the
  acceptance-change label or a test-review, per the framework).

## REQ → tests
Status: passing = runs in CI now; fixme = `test.fixme` until the named task is done.

| REQ | Acceptance test(s) | Status |
|---|---|---|
| REQ-001 | `content.spec.js`: name/title/about; contact links (mailto vs URL); every experience entry; every education entry; every skill group + items | passing |
| REQ-002 | `validate.spec.js`: valid exits 0; missing title; wrong type; malformed JSON; build fails on broken data | passing |
| REQ-003 | superseded by REQ-018 (T-024): the old current-content tests were replaced | superseded |
| REQ-004 | `build.spec.js`: build without legacy flags; all assets 200 and no console errors under /cv/; no service worker/manifest in dist | passing |
| REQ-005 | `pdf.spec.js`: `npm run pdf` self-contained; A4; text content | passing (T-004, T-005): self-contained run writes a temp file via `--out`; at most 3 pages; last page >= 25% |
| REQ-006 | `print.spec.js`: no experience entry split across PDF pages; download link hidden in print | passing (T-005) |
| REQ-007 | `download.spec.js`: visible "Download PDF" link to relative `cv.pdf`, file served as application/pdf | passing (T-005) |
| REQ-008 | `meta.spec.js` (JS disabled): `lang="en"`, title `<name> – <title>`, meta description, og tags with absolute og:image. Unit tests: `scripts/vite-plugin-cv-meta.test.js` (generation, escaping) | passing (T-006) |
| REQ-009 | `deploy-workflow.spec.js`: static checks of `.github/workflows/deploy.yml` (workflow_dispatch only, steps, permissions, concurrency); live checks belong to the deploy phase (docs/DEPLOY.md) | passing (T-007); live checks in the deploy phase |
| REQ-010 | `a11y.spec.js`: no horizontal scroll at 375px; axe (no serious/critical); `rel="noopener"` on `_blank` links; photo alt = name. Unit tests: header icons (linkedin/github/npm only, aria-hidden), rel, alt | passing (T-003, T-006) |
| REQ-011 | `design.spec.js` (screen part, T-016): numbered `nn / Name` mono section labels left of content (1280px boxes), mono dates left of titles, single column at 375px with no horizontal scroll, accent colour (computed), 104/80px photo, skills as `li`; every date range on one line (1280px); PDF (T-017): each skill group printed as `Group: a, b, c` in cv.json order, ≤ 2 pages | passing (T-016, T-017) |
| REQ-012 | `fonts.spec.js`: every font in `dist/cv.pdf` is Inter or JetBrains Mono (helper `pdfFontNames`); no Type3 font; extracted text keeps every hyphenated word of cv.json; `document.fonts.check()` true and body computes to Inter; no non-localhost request on load; woff2 total <= 230 KB (230,000 B); JetBrains Mono face reaches status `loaded` after `document.fonts.load()` (nothing uses it before T-016, so the browser would not fetch it otherwise); the Type3 detector is checked against a PDF generated at test time from the variable Inter font (`@fontsource-variable/inter`, devDependency) | passing (T-008); extended to JetBrains Mono and 230 KB (T-015) |
| REQ-013 | `print-layout.spec.js`: all contact links sit in the page-1 header: every link's text box above the first section label (`01`) and either one shared baseline or right edges within 2 pt (right-aligned column), from `readPdfTextBoxes`; dominant body size 10.0 ± 0.1 pt (catches shrink-to-fit); text in `dist/cv.pdf` keeps >= 15 mm (42.5 pt) from every page edge (helper `readPdfTextBoxes`); most common font size >= 9.5 pt (helper `dominantFontSize`). Page count / last page / split entries via REQ-005/006 | passing (T-009, T-017) |

Unit tests (`src/**/*.test.jsx`) cover the header, about, experience, education, skills components and the App.

## Plan v4 (M6)
| REQ | tests | status |
| --- | --- | --- |
| REQ-015 | unit tests: `scripts/validate-cli.test.js` (CLI exit codes), `scripts/inject-meta.test.js` (injectMeta, missing `</head>` throws), `scripts/make-pdf.test.js` (makePdf with fake browser); `src/app-sections.test.jsx` (app.jsx empty sections, consecutive numbering), header link-text regex and icon attributes in `header.test.jsx`; Stryker `break` 75 (score 80.2%) | done (T-019, T-020) |
| REQ-014 (v4) | unit tests for scripts/mutation-summary.js (missing report, timeout share, survivor list); mutation job fails on break threshold | done (T-018); break threshold raised to 75 (T-020) |
| REQ-016 | PR report of alert triage; `npm audit --omit=dev` no high/critical; dependabot.yml present | planned (T-021) |
| REQ-017 | `content.spec.js` (location, highlights, optional description, languages), `validate.spec.js` (entry without description and highlights), `print.spec.js` (no split entries via last highlight) | done (T-023, T-024): `content.spec.js` highlight/description, location and Languages tests run on the content v2 data (the `test.fixme` markers are gone); rendering is also covered by unit tests with synthetic data (`experience`, `header`, `languages`, `app-sections`, `scripts/validate.test.js`); fixture `tests/fixtures/invalid-no-description-or-highlights.json` |
| REQ-018 | `content.spec.js` + `expected-content.js` (content v2 texts, skill order, absent npm/Git/Webpack/"open to"), PDF specs (≤2 pages) | done (T-024); replaces the REQ-003 tests; PDF is 2 pages |

