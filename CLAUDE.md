# cv
Follows Martin's framework: ~/.claude/FRAMEWORK.md (skills: plan, harness, next-task, deploy).
State: docs/STATUS.md (read it first). Plan: docs/PRD.md, docs/ARCHITECTURE.md, docs/PLAN.md. Tests: docs/TESTS.md.
Background notes (outside the repo): ~/HAL/ai-assistant/notes/career/cv/ (project notes, current CV text and PDF).
Default branch is `master`: wherever the framework says "main", use `master`.

## Stack
Preact 10 + Vite (`@preact/preset-vite`, base `/cv/`), plain CSS, ESLint 9 + Prettier, Vitest + @testing-library/preact,
Playwright (acceptance tests; PDF later), Node 24 (`.nvmrc`). JS only, no TypeScript. See docs/ARCHITECTURE.md.
Entry: `index.html` + `src/main.jsx` -> `src/app.jsx`. Legacy until its task: `generate-pdf.cjs`/puppeteer (T-004).

## Commands
- Install: `npm ci` (then once `npx playwright install chromium`)
- Run (dev server): `npm run dev` (http://localhost:5173/cv/); preview the build: `npm run build && npm run preview` (http://localhost:4173/cv/)
- Lint / format check: `npm run lint`, `npm run format:check` (`npm run format` fixes). No typecheck.
- Unit tests: `npm test`
- Acceptance / e2e: `npm run build && npm run test:e2e` (Playwright, serves `dist/` with `vite preview`)
- PDF: `npm run pdf` (still the old script until T-004). Details and REQ map: docs/TESTS.md.

## Conventions
- data/cv.json is the only place CV content lives; never hard-code CV text in components.
