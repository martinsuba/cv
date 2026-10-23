# Status: cv
Phase: plan review
Current task: –
Open PRs: #40 Plan v1 (https://github.com/martinsuba/cv/pull/40)
Blockers: –
Next step: Martin reviews and merges the plan PR; then the `harness` skill (test-architect: Vite migration, CI, acceptance tests).

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
