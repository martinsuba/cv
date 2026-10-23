# Status: cv
Phase: deploy (live)
Current task: –
Open PRs: deploy record (chore/deploy-2026-10-23)
Blockers: –
Next step: retro (offered); then plan v2 with Martin: M3 design proposals, mutation-testing fix, CI container image, workflow action bumps.

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
- 2026-10-23: T-005 done (PR #47 merged, review + test-review clean, 0 fix rounds).
- 2026-10-23: T-006 done (PR #48 merged; 1 fix round: photo width/height attributes had the aspect ratio inverted, caught by the reviewer; review + test-review clean after fix).
- 2026-10-23: M1 complete: T-001…T-006 merged, 0/0/0/0/0/1 fix rounds, master CI green. Opus milestone review: no blocking findings. Open follow-ups: pin Stryker in devDependencies; injectMeta silently no-ops without </head>; consider Playwright container image if apt slowness returns.
- 2026-10-23: M1 milestone PR #49 merged by Martin; "go M2". Mutation report on #49 not meaningful (44/47 timeouts, scripts/ not mutated): follow-up task via plan update (vitest runner, mutate scripts/**, pin Stryker).
- 2026-10-23: T-007: Pages actions on v5 (upload-pages-artifact, deploy-pages); checkout/setup-node/cache still v4 in all workflows (latest: v7/v7/v6). Proposed chore: bump all workflows together (acceptance-guard.yml change needs Martin's label).
- 2026-10-23: T-007 done (PR #50 merged; 2 fix rounds: Pages actions bumped to v5, Pages permissions moved to the deploy job). M2 complete.
- 2026-10-23: DEPLOY.md rollback corrected (workflow_dispatch needs a branch/tag; github-pages env deploys from master only).
- 2026-10-23: Pages enabled (build_type=workflow) after Martin extended the PAT with Pages permission; first deploy of b162a1c to https://martinsuba.github.io/cv/ succeeded, smoke checks green.
- 2026-10-23: Note for Martin: the root repo martinsuba.github.io still serves the old preact-cli PWA with sw.js at scope "/"; returning visitors with that worker installed may get cached content for /cv/. Fix (in the root repo, Martin's call): replace sw.js with a self-unregistering worker.
