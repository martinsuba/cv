# Status: cv
Phase: build
Current task: T-001 data schema and validation (PR #43, in review)
Open PRs: #43 T-001; #42 seeded-bug check (throw-away, not to be merged)
Blockers: seeded-bug check needs Martin's decision (auto mode blocked making the #42 description neutral); first test-review waits for it
Next step: review T-001; after the seeded-bug decision, test-review T-001 and merge; then T-002.

## Decisions log
- 2026-10-23: project onboarded to the framework (was a legacy repo without docs). Context: ~/HAL/ai-assistant/notes/career/cv/cv-project-notes.md
- 2026-10-23: scope = technical modernisation; content tailoring is out of scope (Martin).
- 2026-10-23: keep `martinsuba/cv`, deploy as Pages project site at martinsuba.github.io/cv/; root repo stays free (Martin).
- 2026-10-23: Vite + Preact replaces preact-cli (Martin).
- 2026-10-23: data/cv.json is the single source; content taken now from martin-suba-cv.pdf (Martin).
- 2026-10-23: deploy workflow is manual (workflow_dispatch) only; PDF built in CI, not committed (Lead, Martin delegated).
- 2026-10-23: inline SVG icons, devicon removed; Playwright for PDF + tests (Lead).
- 2026-10-23: design refresh as M3, proposals first (Martin: clean, minimal, technical/managerial).
- 2026-10-23: closed 17 stale Dependabot PRs (#13–#39) as obsolete (Martin: "you run it").
- 2026-10-23: default branch stays `master`; framework "main" means `master` in this repo.
- 2026-10-23: plan v1 merged (#40); Actions enabled, label `acceptance-change` created, auto-merge on (Lead).
- 2026-10-23: harness PR #41: Vite 8 + Preact 10, ESLint/Prettier, Vitest, Playwright; 10 acceptance tests pass, 27 fixme tagged T-001…T-007. Follow-up nit: pin Stryker in devDependencies (mutation.yml uses npx @8).
- 2026-10-23: harness merged (#41) with `acceptance-change`; branch protection on master (ci + acceptance-guard) set by Lead.
- 2026-10-23: M1 started (Martin: "go m1").
