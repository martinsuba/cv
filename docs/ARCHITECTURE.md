# Architecture: cv

## Overview
A static single-page site. Build time: validate `data/cv.json` → Vite builds the Preact app into `dist/` (base `/cv/`)
→ a Node script serves `dist/` locally and prints it to `dist/cv.pdf` with Playwright Chromium. The manual `deploy`
workflow uploads `dist/` to GitHub Pages.

```
data/cv.json ──validate (ajv)──▶ Vite + Preact ──▶ dist/ (index.html, assets)
data/photo.jpg ───────────────────┘                  │
                                                     ├─▶ scripts/pdf.js (static server + Playwright page.pdf) ─▶ dist/cv.pdf
                                                     └─▶ deploy workflow ─▶ GitHub Pages: martinsuba.github.io/cv/
```

## Stack (language, framework, DB, test tools) and why
- **Preact 10 + Vite** (`@preact/preset-vite`): keeps the existing components; Vite is the maintained, boring default
  for small static sites and builds on Node 24 without legacy flags. preact-cli is unmaintained.
- **Plain CSS** per component, as today. No CSS framework for a one-page site.
- **ajv** for JSON Schema validation of `data/cv.json` (`scripts/validate.js`, run before build and in tests).
- **Playwright** for acceptance tests and for PDF generation (one browser dependency instead of Playwright + Puppeteer).
- **Vitest + @testing-library/preact** for component unit tests.
- **pdfjs-dist** (or `pdf-parse`) in tests to read page count, page size and text per page of `dist/cv.pdf`.
- **ESLint 9** (flat config) + **Prettier** check. No TypeScript: the code is a few small components; JSON Schema covers the data.
- **@axe-core/playwright** for the accessibility check.
- **Node 24**, npm.

## Components and responsibilities
- `index.html`: Vite entry; meta tags (title, description, OG) filled at build time from `cv.json` (small Vite plugin or
  `transformIndexHtml`).
- `src/main.jsx` / `src/app.jsx`: renders sections from `cv.json`.
- `src/header`, `src/about`, `src/experience`, `src/education`, `src/skills`: one component + CSS each (kept from today).
- Header contact icons: three inline SVGs (LinkedIn, GitHub, npm) + text for email. The devicon font, `devicon.json`
  and `get-icon-class.js` are removed.
- `src/download-link`: "Download PDF" link to `cv.pdf`, hidden in print.
- `scripts/validate.js`: validates `data/cv.json` against `data/cv.schema.json`, prints field-level errors.
- `scripts/pdf.js`: serves `dist/` under `/cv/` on a free port, opens it in Playwright Chromium, `page.pdf()` A4 with
  1.5cm margins → `dist/cv.pdf`, stops the server. Replaced `generate-pdf.cjs` (T-004).
- `.github/workflows/ci.yml`: lint, format check, validate, unit, build, pdf, acceptance (built by the harness).
- `.github/workflows/deploy.yml`: `workflow_dispatch` only → validate, build, pdf, `actions/upload-pages-artifact`,
  `actions/deploy-pages`.

## Data model
`data/cv.json` (shape kept from today, skills keys become display names):
```json
{
  "name": "string", "title": "string", "about": "string",
  "contact": { "email": "string", "linkedin": "url", "github": "url", "npm": "url" },
  "experience": [ { "title": "string", "company": { "name": "string", "link": "url" },
                    "from": "string", "to": "string", "location": "string", "description": "string" } ],
  "education": [ { "institution": "string", "field": "string", "degree": "string", "from": "string", "to": "string" } ],
  "skills": { "<group display name>": ["string", "..."] }
}
```
Skill groups render in JSON key order (e.g. "Leadership & Delivery", "Engineering", "AI") as comma-separated text, as
in Martin's current PDF. `data/cv.schema.json` makes every field above required except `company.link` and contact entries.

## External services / APIs
- **GitHub Pages via Actions** (project site): served at `https://martinsuba.github.io/cv/`; `martinsuba.github.io` has
  no custom domain (checked 2026-10-23), so the `/cv/` path is stable. Pages source must be set to "GitHub Actions" once
  (`gh api -X POST repos/martinsuba/cv/pages -f build_type=workflow`), done by the Lead in the deploy phase. Well-known,
  documented behaviour; no spike needed.

## Security & privacy notes
- Public data only; no secrets. The deploy workflow uses the built-in `GITHUB_TOKEN` with `pages: write`,
  `id-token: write` (standard for `deploy-pages`).
- Links opening new tabs get `rel="noopener noreferrer"`.
- Tests and fixtures use the real `cv.json` (already public) for REQ-001/003/005; schema-failure tests use small
  synthetic fixtures under `tests/fixtures/`.

## Decisions
### D-001: Vite + Preact instead of preact-cli
Context: preact-cli 2 is unmaintained and webpack 4 needs legacy OpenSSL on Node 24. · Options: keep preact-cli with
`--openssl-legacy-provider`; Vite + Preact; plain HTML/JS generator. · Decision: Vite + Preact (Martin, 2026-10-23).
· Consequences: components move over almost unchanged; config is small; the harness does the migration as tooling.

### D-002: Project Pages site at /cv/, separate from the root repo
Context: the current live site is the root repo `martinsuba.github.io`, filled by hand. · Options: Action pushes into the
root repo (needs a cross-repo token); rename `cv` to `martinsuba.github.io`; Pages from `martinsuba/cv` at `/cv/`.
· Decision: `/cv/` (Martin, 2026-10-23) so the root stays free for other things. · Consequences: Vite `base: '/cv/'`;
tests serve `dist/` under `/cv/`; no secrets.

### D-003: Deploy is manual only
Context: the framework requires Martin's approval for production deploys, and task PRs are merged by the Lead.
· Options: deploy on every push to `master`; manual `workflow_dispatch`. · Decision: manual only; Martin (or the Lead
after Martin says "deploy") runs it from the Actions tab or `gh workflow run deploy`. · Consequences: merges never change
the live site; switching to push-triggered later is a one-line change.

### D-004: PDF built in CI, not committed
Context: the committed `cv.pdf` drifted from the data. · Decision: `cv.pdf` is removed from git, built by `npm run pdf`
into `dist/` and deployed with the site; CI also uploads it as an artifact on PRs. · Consequences: the download link always
matches the deployed data.

### D-005: Playwright for PDF and tests; drop Puppeteer and devicon
Context: two browser drivers would be redundant; devicon is a 5-file icon font used for 3 header icons after the skills
went text-only. · Decision: Playwright Chromium for both; inline SVG icons. · Consequences: smaller install and bundle,
no fuzzy icon-name matching.
