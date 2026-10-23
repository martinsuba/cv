# Status: cv
Phase: build
Current task: T-008 self-hosted Inter (PR #54, in review), M3
Open PRs: #54 T-008
Blockers: –
Next step: review + test-review T-008, merge; then T-009 PDF polish; T-014 photo once the file is on the server; T-010 proposals.

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
- 2026-10-23: Martin: root repo redirects to /cv/ (PR martinsuba.github.io#1 also removes the old service worker); PDF looks poor (font, paddings); wants design alternatives next.
- 2026-10-23: PDF font cause: CI runner has no Apple/Windows fonts, Chromium falls back to Liberation Sans. Plan v2: self-hosted Inter (D-006), print polish, 3 design proposals (M3); maintenance tasks as M4 (could).
- 2026-10-23: Martin wants the photo replaced (new portrait shared in chat; file not on the server yet). Added T-014 to plan v2; Martin to put the original at ~/HAL/ai-assistant/notes/career/cv/photo-new.jpg.
- 2026-10-23: plan v2 (#53), deploy record (#52) and root redirect (martinsuba.github.io#1) merged by Martin; "go M3". Root redirect verified live in a browser.
- 2026-10-23: T-008: static Inter (400/600/400-italic, latin + latin-ext, 182 KB), not the variable font: Chromium embeds variable fonts as Type3, which broke PDF text extraction (lost hyphens; bad for ATS). fonts.spec.js also asserts no Type3 and intact hyphenated words (refines REQ-012; PRD wording follows in the M3 milestone PR). h3 weight 500 → 400.
