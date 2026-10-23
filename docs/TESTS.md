# Tests: cv

## How to run (Node 24, see .nvmrc)
- Install: `npm ci`, then once `npx playwright install chromium` (CI uses `--with-deps`).
- Lint: `npm run lint` (ESLint 9 flat config). Format check: `npm run format:check` (fix with `npm run format`). No typecheck (plain JS).
- Unit (Vitest + @testing-library/preact, `src/**/*.test.jsx`): `npm test`.
- Acceptance (Playwright, `tests/acceptance/`): `npm run build && npm run test:e2e`. Playwright starts `vite preview`
  (serves `dist/` under `http://localhost:4173/cv/`) itself. The tests read `dist/`, so build first; the PDF specs also
  need `dist/cv.pdf` (`npm run pdf`, available from T-004). One spec: `npx playwright test tests/acceptance/build.spec.js`.
- Screenshots (not a gate): `npm run build && npx playwright test tests/screenshots`, output in `screenshots/`.
- Mutation (milestone PRs only, heavy): `npx @stryker-mutator/core@8 run`, report in `reports/mutation/`.
- CI (`.github/workflows/ci.yml`, job `ci`): npm ci, lint, format check, unit, build, acceptance. T-004 adds `pdf` before acceptance.

## Contracts the not-yet-built features must satisfy (tests are written against them)
- `npm run validate` validates `data/cv.json`, or the file in env `CV_JSON` when set; field-level errors go to stdout/stderr
  (they must contain the offending field name, e.g. `title`); exit code non-zero on invalid data. `npm run build` runs
  `validate` first (`"build": "npm run validate && vite build"`), so extra args such as `--outDir` still reach vite.
- `npm run pdf` writes `dist/cv.pdf` from an existing `dist/` and starts/stops its own server.
- Fixture files with invalid data: `tests/fixtures/` (synthetic).
- Exact expected texts for REQ-003: `tests/acceptance/expected-content.js` (copied from docs/PLAN.md T-002).
- Tests marked `test.fixme` name the task that makes them pass; that task removes the `fixme` (it needs the
  acceptance-change label or a test-review, per the framework).

## REQ → tests
Status: passing = runs in CI now; fixme = `test.fixme` until the named task is done.

| REQ | Acceptance test(s) | Status |
|---|---|---|
| REQ-001 | `content.spec.js`: name/title/about; contact links (mailto vs URL); every experience entry; every education entry; every skill group + items | passing |
| REQ-002 | `validate.spec.js`: valid exits 0; missing title; wrong type; malformed JSON; build fails on broken data | fixme (T-001) |
| REQ-003 | `content.spec.js`: About text; "up to 80%" sentence; full descriptions; skill group order; removed skills/language group | fixme (T-002) |
| REQ-004 | `build.spec.js`: build without legacy flags; all assets 200 and no console errors under /cv/; no service worker/manifest in dist | passing |
| REQ-005 | `pdf.spec.js`: `npm run pdf` self-contained; A4; text content | fixme (T-004). At most 3 pages, last page >= 25%: fixme (T-005) |
| REQ-006 | `print.spec.js`: no experience entry split across PDF pages; download link hidden in print | fixme (T-005) |
| REQ-007 | `download.spec.js`: visible "Download PDF" link to relative `cv.pdf`, file served as application/pdf | fixme (T-005) |
| REQ-008 | `meta.spec.js`: `lang="en"` passing; title, meta description, og tags fixme (T-006) | partly passing |
| REQ-009 | `deploy-workflow.spec.js`: static checks of `.github/workflows/deploy.yml` (workflow_dispatch only, steps, permissions, concurrency); live checks belong to the deploy phase (docs/DEPLOY.md) | fixme (T-007) |
| REQ-010 | `a11y.spec.js`: no horizontal scroll at 375px passing; axe, `rel="noopener"`, photo alt fixme (axe and noopener/alt: T-003, T-006) | partly passing |
| REQ-011 | none yet (criteria come with the M3 plan) | n/a |

Unit tests (`src/**/*.test.jsx`) cover the header, about, experience, education, skills components and the App.
