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

## [x] M3: PDF polish and design proposals (plan v2)
### [x] T-008: Self-hosted web font for screen and PDF  (size S)  — #54
- Goal: add `@fontsource/inter` (static faces; Latin + Latin Extended), use it as the first family in the font stack for screen
  and print; keep the system stack as fallback. Check the PDF embeds only Inter.
- REQs: REQ-012
- Acceptance tests to make pass: new tests/acceptance/fonts.spec.js (this task explicitly may create it): PDF embedded
  fonts are Inter only; `document.fonts.check` true and computed body font is Inter; no external font requests;
  woff2 total ≤ 200 KB. Existing pdf/print specs keep passing.
- Areas/files: package.json, src/main.jsx or src/style.css, tests/acceptance/fonts.spec.js, tests/helpers.js (font
  listing helper), docs/TESTS.md
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review clean, docs updated if needed

### [x] T-009: PDF polish: spacing, margins, header  (size M)  — #55
- Goal: rework print CSS so the PDF reads like the website: consistent vertical rhythm between sections and entries,
  clearer heading scale, contact links on one line, photo size balanced, page margins ≥ 15 mm (A4), body ≥ 9.5 pt.
  Screen look unchanged. Attach before/after PDF page images and the website screenshot to the PR.
- REQs: REQ-013 (and REQ-005/006 keep passing)
- Acceptance tests to make pass: new tests/acceptance/print-layout.spec.js (this task explicitly may create it):
  contact links on one line in print media; PDF page margins ≥ 15 mm (text bounding boxes from the PDF) and body text
  ≥ 9.5 pt. pdf.spec.js and print.spec.js keep passing.
- Areas/files: src/style.css, src/*/*.css, scripts/pdf.js (margins), tests/acceptance/print-layout.spec.js, docs/TESTS.md
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review clean, docs updated if needed
- Notes: PDF images: render pages with pdfjs-dist in Playwright, or install poppler-utils in the task's own env if possible.

### [x] T-014: Replace the photo  (size S)  — #57
- Goal: replace data/photo.jpg with Martin's new portrait (source file provided by Martin, see STATUS). Crop to a
  square-ish head-and-shoulders frame that works in the round header crop, resize to 800 px on the long side, strip
  EXIF/GPS metadata, JPEG quality ~82 (target ≤ 150 KB). og-image.jpg follows automatically (built from data/photo.jpg).
  Update the header img width/height attributes to the new intrinsic size.
- REQs: REQ-001, REQ-008, REQ-010 (alt text unchanged)
- Acceptance tests to make pass: existing content/meta/a11y/pdf specs keep passing; unit test for the header
  width/height updated.
- Areas/files: data/photo.jpg, src/header/header.jsx, src/header/header.test.jsx
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review clean; before/after header
  screenshots (screen + print) in the PR; no metadata left in the JPEG (check with a script).

### [x] T-010: Design proposals  (size S, Lead-run, no code merged)  — direction A chosen, see M4
- Goal: research clean, minimal CV/profile designs suited to a technical engineering manager; build 3 directions as
  static mockups from the real `cv.json` and the new photo (screen desktop + mobile + A4 print), on top of T-008/T-009/T-014, and share them
  with Martin as one comparison page.
- REQs: REQ-011
- Output: Martin picks a direction (or mixes); a plan v3 PR adds the implementation tasks and REQ-011 criteria.

## [x] M4: Design refresh "Technical ledger" (plan v3)
Direction A from the T-010 canvas (https://claude.ai/artifact/AeMkfPFe6NVjtSg5Gx5pk4, boards "A · Technical ledger" web
and PDF). Builders read the board HTML in the PR description of T-016 / T-017 (Lead pastes the relevant markup) for exact
sizes and spacing; values below are the contract. All entries keep their full text (REQ-011).

### [x] T-015: Design tokens and JetBrains Mono  (size S)  — #58
- Goal: add `@fontsource/jetbrains-mono` (static 400, Latin subset only) and the colour/spacing tokens from D-007 as CSS
  custom properties; use the mono font for nothing visible yet except a `.mono` utility class. No layout change.
- REQs: REQ-012 (updated in plan v3)
- Acceptance tests to make pass: tests/acceptance/fonts.spec.js, updated by this task (explicitly allowed): embedded PDF
  fonts are Inter or JetBrains Mono (not Type3, no fallback); an Inter and a JetBrains Mono face are "loaded" after load
  (render one hidden-from-AT element with `.mono` if needed, or assert after T-016; builder's choice, documented);
  woff2 total ≤ 230,000 B. Remaining fonts specs keep passing.
- Areas/files: package.json, src/style.css, src/main.jsx, tests/acceptance/fonts.spec.js, docs/TESTS.md
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review + test-review clean

### [x] T-016: Ledger layout on screen  (size M)  — #59
- Goal: restyle the page as board "A · Technical ledger — website": header (round photo 104px left, name 44px/600,
  job title in mono uppercase accent, contacts stacked right in mono, rule below); sections as label/content grid with
  labels "01 / About", "02 / Experience", "03 / Skills", "04 / Education" (order as rendered; whatever sections exist);
  experience and education entries as dates/body grid (dates mono muted; title 19px/600; company · location muted;
  description 15px/1.65); skills as group name + tags (`ul > li`, mono 12px, 1px border, radius 4px). Max width 1040px.
  Below 640px: one column, label and dates above content, photo 80px. Download link restyled to fit (mono, accent).
  Print CSS untouched apart from what is needed to keep print tests green (T-017 does print).
- REQs: REQ-011, REQ-010, REQ-001
- Acceptance tests to make pass: new tests/acceptance/design.spec.js (this task explicitly may create it) for the
  screen criteria of REQ-011 (numbered mono labels left of content at 1280; mono dates left of titles; single column at
  375; accent colour on title/links; skills as li); content/a11y/meta/fonts specs keep passing.
- Areas/files: src/**/*.jsx, src/**/*.css, src/style.css, unit tests, tests/acceptance/design.spec.js, docs/TESTS.md
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review + test-review clean;
  1280px and 375px screenshots next to the canvas board in the PR.

### [x] T-017: Ledger layout in print and PDF  (size M)  — #60
- Goal: print CSS per board "A · Technical ledger — PDF page 1": compact header (photo 68px, name 30px, mono title,
  contacts as a right-aligned mono column), label column ~108px, entry header line "title … dates" with company ·
  location below, body 10pt Inter; skills printed as group name + comma-separated text; no tags, no download link,
  no running footer. Target 2 A4 pages, no split entries.
- REQs: REQ-011 (PDF criteria), REQ-013 (updated contact criterion), REQ-005/006/012
- Acceptance tests to make pass: tests/acceptance/print-layout.spec.js, updated by this task (explicitly allowed):
  contact links all in the page-1 header block above the first section (one line or one right-aligned column); new
  PDF checks in design.spec.js: skills as comma-separated lines in the extracted text, ≤ 2 pages. pdf/print/fonts
  specs keep passing.
- Areas/files: src/style.css, src/**/*.css, scripts/pdf.js (only if margins need it), tests/acceptance/print-layout.spec.js,
  tests/acceptance/design.spec.js, docs/TESTS.md
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review + test-review clean; PDF page
  images next to the canvas board in the PR.
- Then: deploy (Martin approves).

## [x] M5: Maintenance (could; Martin may drop or reorder)
### [x] T-011: CI on the Playwright container image  (size S)  — #62
- Goal: run the `ci` and `screenshots` jobs in `mcr.microsoft.com/playwright:v<installed version>-noble`, drop the
  browser cache/install steps; deploy.yml the same. Keep the version in one place (check it matches package-lock).
- REQs: REQ-014. Areas/files: .github/workflows/ci.yml, screenshots.yml, deploy.yml (explicitly allowed).

### [x] T-012: Current major versions of workflow actions  (size S)  — #63
- Goal: bump checkout, setup-node, cache (and any other action) in all workflows to current majors; read release notes
  for breaking changes. acceptance-guard.yml is included, so this PR needs Martin's `acceptance-change` label.
- REQs: REQ-014. Areas/files: .github/workflows/* (explicitly allowed).

### [x] T-013: Meaningful mutation testing  (size S)  — #64
- Goal: Stryker as a pinned devDependency with `@stryker-mutator/vitest-runner`, mutate `src/**` and `scripts/**`,
  timeouts ≤ 10%; mutation.yml uses the local binary. Report the score and survivors in the PR.
- REQs: REQ-014. Areas/files: package.json, stryker.config.json, .github/workflows/mutation.yml (explicitly allowed).

## [x] M6: Quality follow-ups (plan v4)
From the retro (docs/RETRO.md) and the first meaningful mutation run. No visual change.

### [x] T-018: Mutation gate and workflow hardening  (size S)  — #69
- Goal: `scripts/mutation-summary.js` handles a missing report (clear message, exit 1), exits non-zero when timeouts
  exceed 10% of mutants, and lists surviving mutants with file:line and mutator (top 30). Stryker `thresholds`
  `{ high: 80, low: 70, break: 60 }` (raised to 75 in T-020). mutation.yml gets `permissions: contents: read`.
- REQs: REQ-014 (plan v4 criterion)
- Acceptance: unit tests for mutation-summary.js (missing report, timeout > 10%, survivor list); a workflow_dispatch run
  on the branch is not possible before merge, so the Lead runs it on master after merge and reports the result.
- Areas/files: scripts/mutation-summary.js (+ test), stryker.config.json, .github/workflows/mutation.yml (explicitly allowed)

### [x] T-019: Unit tests for the build scripts  (size M)  — #71
- Goal: tests for `validate.js` CLI path, `vite-plugin-cv-meta.js` `injectMeta` (and make a missing `</head>` a build
  error), and `pdf.js` `makePdf` with an injected fake browser. Small refactors for testability are fine (e.g. export
  `main()` returning an exit code; pass the Playwright `chromium` as a parameter). Behaviour stays the same.
- REQs: REQ-015
- Acceptance: unit tests only; all existing acceptance tests keep passing (PDF identical in page count and fonts).
- Areas/files: scripts/*.js, scripts/*.test.js, tests/fixtures/ (synthetic)

### [x] T-020: Unit tests for app branches; raise the mutation bar  (size S)  — #72
- Goal: tests for `src/app.jsx` empty sections and consecutive numbering, the header regex, and anything else left in
  the survivor list that is cheap; then set Stryker `break` to 75 and confirm the score ≥ 75% locally.
- REQs: REQ-015
- Areas/files: src/**/*.test.jsx, stryker.config.json

### [x] T-021: Dependency hygiene  (size S)  — #70
- Goal: triage the Dependabot alerts (`gh api repos/martinsuba/cv/dependabot/alerts`), fix real ones with non-breaking
  updates, list stale ones for Martin to dismiss; add `.github/dependabot.yml` (npm + github-actions, weekly, grouped).
- REQs: REQ-016
- Areas/files: package.json, package-lock.json, .github/dependabot.yml
- Note: the Playwright image tag must follow any @playwright/test bump (scripts/workflows.test.js enforces it); if a
  bump would need workflow edits, leave Playwright as is and note it.

### [x] T-022: Back to Vitest 5  (size S, could; blocked until Stryker releases the fix)  — #73
- Goal: when `@stryker-mutator/vitest-runner` > 10.0.0 ships the Vitest 5 fix (stryker-js #6210/#6262/#6263), bump
  Stryker and Vitest 5, confirm the mutation score is unchanged. Until then the Lead checks once per milestone.
- REQs: REQ-014

## [x] M7: Content v2 (plan v5)
Approved text: ~/HAL/ai-assistant/notes/career/cv/cv-draft.md (v3 FINAL, 2026-10-24). The exact target data is
`docs/content-v2.json` (committed with this plan); tasks copy it, never retype or reword it. Design A stays.

### [x] T-023: Data model and rendering for highlights, location and languages  (size M)  — #76
- Goal: schema + components for the D-008 fields, with the current `data/cv.json` unchanged (it stays valid: every
  entry still has a description). Experience: optional `description` (render the `p` only when present) and optional
  `highlights` → `ul.highlights > li` after it; schema `anyOf` needs one of them. Header: optional top-level `location`
  under the job title (Inter, muted, same size as the company meta line). New `src/languages` section after Education:
  heading "Languages", `ul > li` "<language> (<level>)"; tags-free plain list on screen, one line with " · " separators
  in print (same CSS technique as skills, D-007). Bullets in print: real list markers or "– ", 4–6 mm indent, keep
  REQ-013 spacing.
- REQs: REQ-017 (and REQ-001/REQ-006 plan v5 criteria)
- Acceptance tests to make pass: content.spec.js REQ-001 criteria extended (location, highlights, description only
  when present, languages); validate.spec.js + `tests/fixtures/` synthetic file with an entry that has neither field;
  print.spec.js split check uses the last highlight, else the description. Until T-024 the real data has no
  highlights/location/languages, so the acceptance tests for them also run against a synthetic fixture
  (`CV_JSON` build into a temp outDir, as validate.spec does) or are `test.fixme('T-024')` – builder's choice,
  state it in the PR. Touches tests/acceptance → test-review.
- Areas/files: data/cv.schema.json, src/experience/*, src/header/*, src/languages/* (new), src/app.jsx, src/style.css,
  unit tests with synthetic data, tests/acceptance/content.spec.js, validate.spec.js, print.spec.js, tests/fixtures/
- Definition of done: code + unit tests, listed acceptance tests pass, CI green, review clean, docs/ARCHITECTURE.md
  data model matches, docs/TESTS.md updated; the site and PDF look unchanged with today's data (PDF still 2 pages).

### [x] T-024: Content v2  (size M)  — #77
- Goal: replace `data/cv.json` with `docs/content-v2.json` byte for byte, delete `docs/content-v2.json`; rewrite
  `tests/acceptance/expected-content.js` and the REQ-003 tests as REQ-018 tests with texts copied from that file
  (About, the five EM highlights, highlights of the other recent roles, earlier-role descriptions, location, languages,
  skill group order Leadership/Delivery/AI/Engineering, absent: Git/Webpack/npm skills, the npm contact, "open to");
  remove `test.fixme('T-024')` markers if T-023 used them. Remove the now unused npm icon only if nothing references it.
- REQs: REQ-018, REQ-017, REQ-001
- Acceptance tests to make pass: content.spec.js (REQ-001, REQ-018), print.spec.js, pdf.spec.js, print-layout.spec.js,
  fonts.spec.js (hyphenated words: "Tier-1", "AI-native", "AI-orchestrated", "e-mail", "Front-end"), design.spec.js.
- PDF budget: at most 2 A4 pages. If the new content runs over, first tighten print spacing within REQ-013 limits
  (≥15 mm margins, ≥9.5 pt body); never shorten or reword the content: stop and report to the Lead instead.
- Areas/files: data/cv.json, docs/content-v2.json (deleted), tests/acceptance/expected-content.js, content.spec.js,
  src/header/icons.jsx (+ test) if the npm icon goes, print CSS only if needed for 2 pages
- Definition of done: code + tests, CI green, review + test-review clean; the Lead renders the PDF pages and checks them
  against the draft before the milestone PR. Deploy only after Martin approves (docs/DEPLOY.md).

### [x] T-025: About v4, EM bullets voice, Python  (size S, plan v6)  — #80
- Goal: Martin's review of the M7 milestone (2026-10-25, draft v4 in the career notes). In `data/cv.json` replace `about`
  with exactly:
  "Engineering Manager with 10+ years in web product engineering, leading a team that delivers security products to Tier-1 partners at F-Secure. Grew from developer to tech lead to manager on the same product through two acquisitions (SaferPass → Lookout → F-Secure). Focused on growing engineers and predictable delivery. Running AI-orchestrated workflows in my team and exploring how AI-native development reshapes the whole SDLC. Technical enough to guide architecture decisions and review solutions (JavaScript/TypeScript, React, Node.js, Python, web and native SDKs)."
  replace the `highlights` of the first experience entry (Engineering Manager, F-Secure) with exactly these five, in order
  (consistent voice: present participles for the current role, past tense for the finished result):
  1. "Managing the team: 1:1s, regular feedback, performance reviews and career development."
  2. "Hiring and onboarding new engineers."
  3. "Owning delivery and release readiness for partner releases: planning around real capacity, managing dependencies across teams and raising risks early."
  4. "Introduced AI-orchestrated workflows and agentic automations into delivery, reducing manual effort by up to 80% in selected workflows, and brought the team along in adopting AI tools."
  5. "Improving delivery processes and quality in a security-critical, partner-facing environment."
  and insert "Python" into `skills.Engineering` right after "Node.js". Nothing else in the data changes.
- REQs: REQ-018 (plan v6 criterion), REQ-001
- Acceptance tests to make pass: content.spec.js with `ABOUT` and the EM highlights in tests/acceptance/expected-content.js
  updated to the new text and a check that "Python" follows "Node.js" in the Engineering group; all PDF specs (still ≤2 pages).
- Areas/files: data/cv.json, tests/acceptance/expected-content.js, tests/acceptance/content.spec.js (explicitly allowed)
- Definition of done: CI green, review + test-review clean; the Lead checks the PDF pages before updating the milestone PR.

### [x] T-026: AI-assisted development skill  (size S, plan v7)  — #82
- Goal: Martin's todo (2026-10-25). In `data/cv.json` insert "AI-assisted development" into `skills.AI` right after
  "AI-orchestrated workflows and agentic automation" (so the group reads: AI adoption in engineering teams,
  AI-orchestrated workflows and agentic automation, AI-assisted development, AI-native SDLC (Claude Code / Anthropic
  ecosystem)). Nothing else in the data changes.
- REQs: REQ-018 (plan v7 criterion), REQ-001
- Acceptance tests to make pass: content.spec.js with a check for the exact AI group order; all PDF specs (≤2 pages).
- Areas/files: data/cv.json, tests/acceptance/expected-content.js, tests/acceptance/content.spec.js (explicitly allowed)
- Definition of done: CI green, review + test-review clean.

### [x] T-027: Keep hyphenated words on one line  (size S, plan v7)  — #83
- Goal: a small render helper (e.g. `src/no-break/no-break.jsx`) splits a text into tokens and wraps every word with an
  inner ASCII hyphen (regex like `[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+`, Unicode-aware for "VÚB"-style letters) in
  `<span class="nobr">` with `white-space: nowrap` (global CSS in src/style.css). Use it in About, experience
  description + highlights, education, skills items and languages. The text in the DOM stays identical (same
  characters, ASCII "-", no U+2011), so copy/paste, ATS parsing and the exact-text tests keep working.
- REQs: REQ-019, REQ-010, REQ-012
- Acceptance tests to make pass: a new acceptance check (e.g. in print.spec.js or a new nobr.spec.js): on the built page
  every hyphenated word from cv.json sits inside a `.nobr` element with computed `white-space: nowrap`; in dist/cv.pdf
  text, no line ends with a letter/digit followed by "-" where the next line continues the same cv.json word; plus all
  existing specs (content, fonts hyphenated words, ≤2 pages, a11y, 375px no-scroll). Unit tests for the helper
  (no hyphen, one/several hyphenated words, leading/trailing hyphens and " - " dashes not wrapped, "→" untouched).
- Areas/files: src/no-break/* (new), src/about, src/experience, src/education, src/skills, src/languages, src/style.css,
  unit tests, tests/acceptance/ (new or extended spec; explicitly allowed)
- Definition of done: CI green, review + test-review clean; the Lead renders the PDF pages and checks that
  "F-Secure" and "AI-orchestrated" no longer break, and the PDF is still 2 pages.

## Screens (web UI projects)
- CV page, desktop 1280px: full page.
- CV page, mobile 375px: full page.
- CV page, print media (A4 emulation): full page; plus PDF pages rendered as images (from T-009).
- From M4: compare each screen with its canvas board (A · Technical ledger, web and PDF).
- From M7: header with location, an entry with intro + bullets, an entry with bullets only, the Languages section.
