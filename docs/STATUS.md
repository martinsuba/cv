# Status: cv
Phase: build
Current task: T-005 print layout + download link (PR #47, in review)
Open PRs: #47 T-005
Blockers: –
Next step: review + test-review T-005, merge; then T-006 (+ nits: no target=_blank on mailto, explicit photo width/height). PLAN.md ticks go into the milestone PR.

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
- 2026-10-23: seeded-bug check passed: test-reviewer said CHANGES NEEDED on #42 (weakened description assertion); #42 closed unmerged.
- 2026-10-23: T-001 done (PR #43 merged, review + test-review clean, 0 fix rounds).
- 2026-10-23: T-002 done (PR #44 merged, review + test-review clean, 0 fix rounds). cv.json verified word for word against martin-suba-cv.pdf.
- 2026-10-23: T-003 also adds the SaferPass description to tests/acceptance/expected-content.js (test gap from the T-002 test review; explicit in the task text).
- 2026-10-23: T-003 done (PR #45 merged, review + test-review clean, 0 fix rounds); axe check passes already. Review nits for T-006: no target=_blank on mailto link, explicit photo width/height.
- 2026-10-23: T-004 CI run took 9 min: `playwright install --with-deps` on the runner (8m42s), not the code. Cache browsers if it repeats.
- 2026-10-23: T-004 done (PR #46 merged, review + test-review clean, 0 fix rounds).
- 2026-10-23: T-005 PDF checked visually by the Lead: 3 pages, no split entries, last page ~2/3 full. Slow CI was apt mirror speed in `playwright install --with-deps`; browser cache added, container image is the next option if it repeats.
