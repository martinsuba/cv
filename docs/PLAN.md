# Plan: cv
Legend: [ ] todo · [~] in progress · [x] done

## [x] Harness (before M1, `harness` skill → test-architect; PR #41)
Besides CI and acceptance tests, the harness does the toolchain swap, because it is pure tooling with no visual change:
- Replace preact-cli with Vite + `@preact/preset-vite` (base `/cv/`), move the entry to `index.html` + `src/main.jsx`;
  components keep rendering the current `cv.json` as today. Remove `preact.config.js`, `manifest.json`, `if-env`, PWA/service worker.
- ESLint 9 flat config + Prettier, Vitest + @testing-library/preact, Playwright (+ @axe-core/playwright), pdf text reader.
- npm scripts: `dev`, `build` (runs `validate` first once it exists, see T-001), `preview`, `lint`, `format:check`, `test`, `test:e2e`, `pdf`.
- `.github/workflows/ci.yml` (job `ci`), `acceptance-guard.yml`, `screenshots.yml`; acceptance tests for REQ-001…REQ-010
  in `tests/acceptance/`, serving `dist/` under `/cv/`; failing/skipped until implemented. docs/TESTS.md, CLAUDE.md.
- REQ-004 acceptance tests should pass at the end of the harness.

## M1: Current content, PDF and print layout
### [x] T-001: Data schema and validation  (size S)
- Goal: `data/cv.schema.json` + `scripts/validate.js` (ajv); `npm run validate`; `build` runs it first.
- REQs: REQ-002
- Acceptance tests to make pass: tests/acceptance/validate.spec.* (REQ-002)
- Areas/files: data/cv.schema.json, scripts/validate.js, package.json, tests/fixtures/ (synthetic invalid files), unit tests
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review clean, docs updated if needed
- Notes: schema per docs/ARCHITECTURE.md "Data model"; skills is an object of string arrays, keys are display names.

### [x] T-002: Content from the current PDF + text skills  (size S)
- Goal: update `data/cv.json` with the exact text of Martin's current CV PDF and render skills as grouped comma-separated
  text (as in the PDF). The exact text is given below; copy it verbatim.
- REQs: REQ-001, REQ-003
- Acceptance tests to make pass: tests/acceptance/content.spec.* (REQ-001, REQ-003)
- Areas/files: data/cv.json, src/skills/*
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review clean, docs updated if needed
- Notes (source text, from martin-suba-cv.pdf 2026-10-23; fields not listed stay as they are in cv.json):
  - title: "Engineering Manager"
  - about: "Engineering Manager with a strong background in web product development across JavaScript / TypeScript, React, and Node.js. Combines hands-on engineering experience with team leadership, technical ownership, and close product collaboration. Strongest in leading product engineering teams in web-based environments, shaping technical solutions, improving execution, and delivering user-facing products in changing environments."
  - Engineering Manager (F-Secure): "Leading the Solution Implementation team responsible for configuring, releasing, and delivering cybersecurity solutions to partners, while overseeing internal automation and delivery tooling development. In this role, I focus on improving delivery tooling, automating internal processes, and developing internal tools that improve workflows, reduce manual effort, and make delivery more efficient and reliable, including AI-orchestrated workflows and agentic automations. Current automation initiatives are reducing manual effort by up to 80% in selected internal workflows."
  - Technical Project Lead (F-Secure): "In addition to my Engineering Manager responsibilities, took on a side role as Technical Project Lead, managing Tier-1 partner deliveries end-to-end, coordinating cross-team execution, and improving delivery processes in a dynamic environment. Worked across engineering and stakeholder groups to keep delivery aligned, unblock execution, and drive complex customer-facing releases."
  - Lead Frontend engineer (F-Secure): "Led frontend development of password manager clients, including browser extensions and SDKs for TypeScript, iOS, and Android. Worked closely with Product and engineering stakeholders on integrating SaferPass technology into F-Secure products and apps, discussing technical feasibility, feature integration, and UX coherence to ensure the combined experience made sense for users. Led the technical solution for delivering SaferPass technology as a component in the F-Secure SDK, including integration across web and native technologies. Owned architectural direction in this area, coordinated cross-team execution, and helped deliver a successful SDK release for a Tier-1 customer, enabling launch of a new product offering."
  - Lead Frontend engineer at SaferPass (acquired by F-Secure) (Lookout): "Started taking on team lead responsibilities while continuing hands-on frontend development of the SaferPass web product and browser extension. Worked across product and engineering during the acquisition period, helping maintain delivery continuity, support the team through change, and contribute to the transition of the product into a larger organization."
  - title "JavaScript Developer (acquired by Lookout)" (SaferPass): "Worked as a JavaScript developer in a small, product-focused startup environment, building the frontend of the SaferPass web-based password manager and browser extension. Worked across JavaScript / TypeScript, AngularJS, React, Web Extension APIs, Web APIs, and Node.js to deliver new features, refactor legacy code, and improve test coverage."
  - WEZEO: "Built responsive cross-browser web and mobile applications using HTML, SASS, JavaScript, jQuery, AngularJS, Angular, and Ionic."
  - Elite Solutions: "Built websites and user interfaces using HTML, CSS, and JavaScript, collaborating with designers and back-end developers on client projects for O2, Sberbank, SLSP, VÚB, and Hyundai."
  - pelicantravel.com: "Built web pages, e-mail newsletters, and customized WordPress templates, while also supporting related online marketing activities."
  - webikon: "Built WordPress themes using HTML and CSS."
  - skills (in this order):
    - "Leadership & Delivery": engineering leadership, team leadership, delivery ownership, product collaboration, cross-functional collaboration, process improvement, agile delivery
    - "Engineering": JavaScript/TypeScript, React, Node.js, frontend architecture, browser extensions, web and native integration, CI/CD, testing, Angular, Git, Webpack, npm
    - "AI": AI-assisted development, LLM prototyping and automation, Anthropic / Claude ecosystem

### [x] T-003: Inline SVG contact icons, remove devicon  (size S)
- Goal: replace devicon font icons in the header with three inline SVGs (LinkedIn, GitHub, npm; email text only);
  delete assets/fonts/devicon.*, src/devicon/, src/get-icon-class.js. Add `rel="noopener noreferrer"` and photo alt text.
- REQs: REQ-001, REQ-010
- Acceptance tests to make pass: tests/acceptance/content.spec.* (contact links), tests/acceptance/a11y.spec.* (REQ-010)
- Areas/files: src/header/*, src/experience/*, src/style.css, assets/, src/devicon/
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review clean, docs updated if needed

### [x] T-004: PDF script from the production build  (size M)
- Goal: `scripts/pdf.js` serves `dist/` under `/cv/` on a free port, prints A4 with 1.5cm margins via Playwright to
  `dist/cv.pdf`, stops the server; `npm run pdf`. Remove `generate-pdf.cjs` (was generate-pdf.js before the harness), the committed `cv.pdf` and `puppeteer`.
  CI uploads `dist/cv.pdf` as an artifact.
- REQs: REQ-005 (generation, A4, content)
- Acceptance tests to make pass: tests/acceptance/pdf.spec.* (generation, A4, content cases)
- Areas/files: scripts/pdf.js, package.json, cv.pdf (delete), generate-pdf.cjs (delete), .github/workflows/ci.yml
  (this task may edit ci.yml to add the pdf step and artifact upload)
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review clean, docs updated if needed

### [x] T-005: Print layout: max 3 pages, no split entries, download link  (size M)
- Goal: print CSS so the PDF fits ≤3 A4 pages with no near-empty last page and no experience entry split across pages
  (tune spacing/font sizes for print only; screen look unchanged); add the "Download PDF" link (hidden in print).
- REQs: REQ-005 (page count, last page), REQ-006, REQ-007
- Acceptance tests to make pass: tests/acceptance/pdf.spec.* (pages, last page), tests/acceptance/print.spec.*, tests/acceptance/download.spec.*
- Areas/files: src/style.css, src/*/**.css, src/download-link/*, src/app.jsx
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review clean, docs updated if needed

### [x] T-006: Meta, SEO and responsive check  (size S)
- Goal: `lang="en"`, title and meta description from `cv.json` at build time, OG tags with absolute photo URL
  (`https://martinsuba.github.io/cv/…`); fix anything that scrolls horizontally at 375px.
- REQs: REQ-008, REQ-010
- Acceptance tests to make pass: tests/acceptance/meta.spec.*, tests/acceptance/a11y.spec.* (viewport case)
- Areas/files: index.html, vite.config.js, src/style.css
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review clean, docs updated if needed

## M2: Deploy
### [x] T-007: Manual deploy workflow  (size S)
- Goal: `.github/workflows/deploy.yml`, `workflow_dispatch` only, on `master`: npm ci → validate → build → pdf →
  `actions/upload-pages-artifact` (dist/) → `actions/deploy-pages`; permissions `pages: write`, `id-token: write`;
  concurrency group `pages`. README: how to edit `cv.json`, run locally, deploy.
- REQs: REQ-009
- Acceptance tests to make pass: tests/acceptance/deploy-workflow.spec.* (static check of the workflow file: trigger
  is only workflow_dispatch, steps present); live smoke checks run in the deploy phase (docs/DEPLOY.md).
- Areas/files: .github/workflows/deploy.yml (this task explicitly may create it), README.md
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review clean, docs updated if needed
- Then: `deploy` skill (Lead enables Pages with build_type=workflow, Martin approves, first run, smoke checks).

## M3: Design refresh (detailed in a later plan PR)
### [ ] T-008: Design proposals  (size S, Lead-run, no code merged)
- Goal: research clean, minimal CV/profile designs suited to a technical engineering manager; build 2–3 directions
  as static mockups from the real `cv.json` (screen + print), share them with Martin as a page with screenshots.
- REQs: REQ-011
- Output: Martin picks a direction (or the Lead picks if Martin delegates); a plan v2 PR adds the implementation
  tasks and REQ-011 acceptance criteria.

## Screens (web UI projects)
- CV page, desktop 1280px: full page.
- CV page, mobile 375px: full page.
- CV page, print media (A4 emulation): full page; plus PDF pages rendered as images if cheap.
