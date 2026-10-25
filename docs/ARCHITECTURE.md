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
- `src/header` (shows the optional top-level `location` under the job title), `src/about`, `src/experience`, `src/education`, `src/skills`: one component + CSS each (kept from today).
- Header contact icons: three inline SVGs (LinkedIn, GitHub, npm) + text for email. The devicon font, `devicon.json`
  and `get-icon-class.js` are removed.
- `src/languages` (plan v5): "Languages" section after Education, one `li` per language "<language> (<level>)".
- `src/no-break` (plan v7, D-009): `splitHyphenated(text)` + `<NoBreak text>` wrap words with an inner ASCII hyphen in `span.nobr`; used by about, experience (description, highlights), education, skills and languages.
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
Plan v5 additions (D-008), all optional so older data stays valid:
```json
{
  "location": "string",
  "experience": [ { "...": "as above", "description": "string (optional)", "highlights": ["string", "..."] } ],
  "languages": [ { "language": "string", "level": "string" } ]
}
```
An experience entry needs `description`, `highlights` or both (schema `anyOf`). `contact.npm` stays allowed in the schema
but is removed from the data.
Skill groups render in JSON key order (e.g. "Leadership & Delivery", "Engineering", "AI") as comma-separated text, as
in Martin's current PDF. `data/cv.schema.json` makes every field above required except `company.link`, contact entries and the plan v5
additions (`location`, `languages`, and per experience entry `description`/`highlights`, of which one is required).
`highlights` is a non-empty array of non-empty strings; an empty `languages` array renders no section.

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

### D-006: Self-hosted Inter for screen and PDF
Context: the CSS font stack (-apple-system, Segoe UI, Helvetica, Arial) resolves to San Francisco on Martin's Mac but to
Liberation Sans on the Linux CI runner that prints the PDF, so the PDF looks different and worse. · Options: keep the
system stack and install fonts on the runner; a Google Fonts link; a self-hosted web font via Fontsource. · Decision:
self-host **Inter** (SIL OFL, neutral and technical, close to the San Francisco look Martin's own PDF had) with
`@fontsource/inter` (static faces 400/600/400-italic; the variable package embeds as Type3 in Chromium PDFs, see T-008),
Latin + Latin Extended subsets (Š, Ú, ...). · Consequences: identical rendering everywhere; no third-party requests; `scripts/pdf.js` already waits for
`document.fonts.ready`. · T-024 addition: fontsource Inter has no U+2192 (the arrow in the About text), so two one-glyph
Inter subsets (400, 600; from inter-ui 3.19.3, see `src/fonts/README.md`) are declared with `unicode-range: U+2192`. They are
under 4 KB, so Vite inlines them as base64; the real font total is about 205 KB, under the 230 KB budget.

### D-007: "Technical ledger" design (direction A)
Context: Martin picked direction A of three T-010 proposals (canvas https://claude.ai/artifact/AeMkfPFe6NVjtSg5Gx5pk4). ·
Decision: Inter stays the text font; **JetBrains Mono** (SIL OFL, `@fontsource/jetbrains-mono`, static 400, Latin
subset only: labels, dates and contacts are ASCII) for section labels, dates, the job title and contacts. Colours as CSS
custom properties in `src/style.css`: `--text #111827`, `--muted #5B6470` (6.3:1 on white), `--accent #1D4ED8`,
`--rule #E5E7EB`, `--rule-soft #F0F1F3`, `--tag-border #D7DBE0`. Layout: each section is a two-column grid (label column
200px, content); entries are a second grid (dates 230px, 12px mono, one line, body) from 900px up, dates above the title below 900px;
sections go to one column below 640px. In print: title left, dates right on one line, label column ~108px. Section numbers come from render
order, section names are UI strings (not CV content). Skills render as `ul > li` per group: tags on screen, inline
comma-separated text in print (CSS generated separators), so the PDF stays ATS-friendly. No running PDF footer: Chromium
header/footer templates cannot use the page's web fonts and would embed a system font (breaks REQ-012). ·
Consequences: font budget rises to 230 KB; fonts.spec and print-layout.spec change (test-review needed); everything
else (data, scripts, deploy) stays.

### D-008: Content v2 data model: highlights, location, languages (plan v5)
Context: the approved content v2 has bullet points per role, an optional intro line, a header location and a Languages
section; the schema only had one `description` string per entry. · Options: (a) keep one string and put "• " bullets
inside it (no schema change, but bullets become text, wrap badly and can't be styled or tested); (b) Markdown in
`description` (needs a parser, more markup in a JSON file); (c) explicit fields: optional `description` + `highlights`
string array, top-level `location` and `languages`. · Decision: (c) (Lead). · Consequences: real `ul/li` markup on screen
and in the PDF (ATS reads bullets as separate lines); schema and REQ-001/006 tests learn the new fields; old data without
them still validates. Languages render as text with a " · " separator in print, like skills (D-007).

### D-009: Hyphenated words on one line (plan v7)
Context: Chromium always allows a line break after an ASCII hyphen, so the PDF broke "F-Secure" and "AI-orchestrated"; CSS on the running text cannot stop it. · Options: (a) U+2011 non-breaking hyphen (changes the text: copy/paste, ATS parsing and exact-text tests break); (b) `<wbr>`/CSS tricks (no effect on hyphen breaks). · Decision: (c) wrap each hyphenated word in `<span class="nobr">` (`white-space: nowrap`) at render time (`src/no-break`); the DOM text is unchanged. · Consequences: a very long hyphenated word can no longer wrap inside itself (none in the CV); titles, company and dates are not wrapped.
