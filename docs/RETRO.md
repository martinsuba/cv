# Retrospective: cv

# Round 3: content rework (plan v5–v7, M7, deploy 7295df4)
Written by the Project Lead on 2026-10-25, after the deploy. Sources: docs/LOG.md, the docs/STATUS.md decisions log,
`gh pr list --state all`, `gh run list --status failure`, PR review comments, `git log`, `usage.py report --since 2026-10-24`.
Rounds 1–2 (M1–M5) are in the original retro below; M6 had no retro of its own.

## Timeline and numbers
- **Duration:** 2026-10-24 ~18:00 → 2026-10-25 07:32, in two sessions (a restart in between).
- **Flow:** CV review in chat (career notes, two job ads) → draft v1–v3 with Martin → backup → plan v5 (#75) → M7 T-023, T-024 →
  milestone PR #78 → Martin's text review → plan v6 (#79) → T-025 → todo + cosmetic fix → plan v7 (#81) → T-026, T-027 (built in
  parallel) → #78 merged → deploy 7295df4 (run 40172795768, green) → deploy record #84.
- **PRs:** #75–#84 = 10: 3 plan, 5 task, 1 milestone, 1 deploy record. All merged.
- **Fix rounds:** T-023 0, T-024 1 (a test regex had been loosened), T-025 0, T-026 0, T-027 0. 1 round in 5 tasks.
- **Models:** Lead Opus 5.5; builders Sonnet 5.5; reviewer and test-reviewer Opus 5.5.
- **Content outcome:** About rewritten 4 times (draft v1, v2, v3, v4/v4.1), EM bullets twice, skills 3 times; PDF stayed at 2 pages throughout.

## Martin's inputs (from docs/LOG.md and the chat): by gate, could an agent have done it?
| When | Input | Agent? |
|---|---|---|
| 10-24 review | asked for the CV review, pointed to notes and 2 job ads | n – the request |
| 10-24 draft | 9 answers to the review points (no numbers, keep entries separate, not tailored) | n – content preferences |
| 10-24 draft | 3 rounds of edits (drop delegation bullet and education in About, AI-native line, "fascinated" too strong, "Hands-on" better) | partly – see below |
| 10-24 plan v5 | chose location without "open to" after the Lead's challenge | n – but the Lead put "open to" into the draft first |
| 10-24 gates | merged #75, "go M7" | n – gate |
| 10-25 review | Python, years (13+ was counted from a 2012 part-time job), "shape/reshape" twice, overconfident tone | **y – a self-review checklist would have caught 3 of 4** |
| 10-25 review | AI-native SDLC must not read as production practice | **partly – the Lead wrote "Hands-on with AI-native…" without asking what was real** |
| 10-25 review | voice mix ("Grew…" vs "I focus…", "Owns" vs "Led") | **y – Martin found what the Lead should have** |
| 10-25 | todo: "AI-assisted development" skill | n – content |
| 10-25 | switched out of auto mode (classifier outage) | n – platform fault |
| 10-25 gates | merged #79, #81, #78, #84; "go" ×2, "deploy" | n – gates |

**Corrections Martin had to make to the Lead:** years of experience, overclaiming AI-native work, inconsistent voice, a
duplicated word. All were in text the Lead wrote. **Questions Martin had to ask:** "how do you mean temporary?" about the
classifier outage. The first answer had said "temporary" without saying where that came from.

## What the gates caught / what slipped through
- **Reviewer:** T-024 widened a removed-skills regex (`\b` → a custom lookaround), which is weaker; the reviewer caught it and it was reverted.
  It also flagged a 0.25 pt top-margin headroom that a browser bump could break; the Lead had it fixed in the same round.
- **Acceptance tests:** fonts.spec caught the "→" glyph falling back to LiberationSans (fontsource Inter has no U+2192). The
  builder added one-glyph Inter subsets (OFL, documented).
- **Builder foresight:** the T-023 builder found that v2 content would make the PDF 3 pages and that design.spec's unscoped
  `section li` would break. Both were handled in T-024 as planned.
- **Slipped to Martin:** the text-quality problems listed above. No content was wrong; it was wording and accuracy. The Lead's own
  milestone verdict said "meets REQ-017/018", which was true but did not cover voice or claims.
- **Slipped to the PDF:** hyphen line breaks ("F-"/"Secure", "AI-"/"orchestrated"). Seen by the Lead and the reviewer, but left
  for a later task. Fixed in T-027 with a regression test.

## Process failures (agents' side)
- **Lead wrote claims stronger than reality** ("Hands-on with AI-native…", "Technical enough to shape architecture") and counted
  years from the first part-time job. It should have asked before writing a claim, not after.
- **Draft put "open to remote or hybrid" on a public site.** The Lead caught this at plan time; it should have been caught at draft time.
- **Milestone PR reopened 3 times.** The Lead opened #78 before Martin had reviewed the text, so two follow-up plans (v6, v7) and three
  screenshot refreshes followed. A text-review gate before the milestone would have saved two plan PRs.
- **Test-reviewer switched the main checkout** to the task branch once (T-024). From then on the prompts said "use a worktree".
- **Parallel builders shared port 4173** (T-026 and T-027 in separate worktrees): spurious local e2e failures (14 in one run). CI was unaffected.
- **Test-reviewer claimed `acceptance-change` was required** for the third time (also on 2026-10-23). The guard accepts a
  `test-review` success; the Lead re-ran it.
- **`rm -rf` denied** twice (stale `.stryker-tmp/`, a scratch directory). `npm run lint` still fails locally until Martin deletes it.
- **Auto-mode classifier outage:** about 8 Bash calls got "no verdict". The Lead stopped after 3 per turn, as the error advised;
  Martin switched to accept-edits mode.
- **Screenshot workflow** produces identical `-dark`/`-light` PNGs and no PDF page images. The Lead renders PDF pages with an
  ad-hoc scratch script (`render-pdf.mjs`) each milestone.

## Test quality (unit, acceptance, screenshots, mutation, spike/staging)
- **Unit tests:** 107 (M6) → 121 (T-023) → 130 (T-027).
- **Acceptance tests:** 60 (M6) → 67 (T-024) → 72 (T-027), 0 skipped. The location and languages `fixme` tests switched on by themselves in T-024, as designed.
- **New checks:**
  - exact content texts (REQ-018), AI and Engineering skill order;
  - schema `anyOf` (description or highlights);
  - hyphenated words in `.nobr` with nowrap, no U+2011, no PDF line ending inside a cv.json word (REQ-019).
- **Mutation testing:** 82.33% at the first M7 head, 83.47% at the final head (break 75). The new components have no survivors.
  The 55 survivors are the old build-tooling ones (`mutation-summary.js`, `pdf.js`, `validate.js`).
- **Spike / staging:** none needed. There are no new external services, and Pages has no staging.

## Cost and model fit
`usage.py report --since 2026-10-24` (includes M6 on the morning of 10-24): ≈ **$23.70**, 329 min, cache hit 97%.

| agent | runs | $ | min | max ctx |
|---|---:|---:|---:|---:|
| lead (Opus) | 14 | 14.92 | 146 | 329k |
| builder (Sonnet) | 10 | 3.73 | 123 | 71k |
| reviewer (Opus) | 11 | 3.57 | 47 | 57k |
| test-reviewer (Opus) | 7 | 1.48 | 13 | 27k |

M7 tasks: T-024 $3.02, T-023 $1.97, T-027 $1.11, T-025 $0.92, T-026 $0.49 (≈ $7.5). The two most expensive single runs
were the Lead: "Lead on master" $6.05, which includes the CV review and drafting chat, and "Lead on chore/milestone-M7" $4.52
(three milestone refreshes).
- **Lead context grew to ~330k,** because the content discussion (career notes, job ads, 6 draft rounds) ran in the same
  session as the orchestration. Every later Lead call paid for that context.
  **Idea:** draft content in a separate notes chat, then start the Lead fresh with only the approved draft. Estimated saving ≈ $3–5 per content milestone.
- **Data-only tasks (T-025, T-026):** Opus review plus Opus test-review cost ≈ $0.4–0.6 per task for a one-line JSON change.
  Sonnet would have done. Saving ≈ $0.5 per milestone; low priority.
- **Text-review gate before the milestone PR:** would have avoided plan v6/v7 overhead (two plan PRs, two milestone refreshes),
  ≈ $3 and two Martin gates.
- **Opus reviewers were worth it** on T-023, T-024 and T-027: real findings, flaky-suite analysis, mutation-style checks.

## Proposals for the framework (ranked, with file to change; mark permission needs)
1. **Content self-review checklist before showing Martin any CV or prose draft.** One voice, consistent tense, every
   claim backed by what Martin told us, counts and years from the agreed start, no repeated words, nothing public that
   signals a job search. *Saves ~10 Martin-minutes and one plan round per content change; risk none.* File: a new section in
   `~/.claude/skills/plan/SKILL.md` ("content drafts"), or a small `content-review` skill. No permission needed.
2. **Text gate before the milestone PR for content projects.** The Lead sends Martin the final rendered text/PDF, and his
   OK comes first. *Saves 1–2 plan PRs and screenshot refreshes.* File: `~/.claude/skills/next-task/SKILL.md` ("End of milestone").
3. **Fix the test-reviewer's label rule** (3rd occurrence). State that `acceptance-guard` passes on `test-review: success` and
   the label is only for acceptance-guard.yml changes or exhausted rounds. Also: always work in its own worktree and never switch the
   main checkout. File: `~/.claude/agents/test-reviewer.md`.
4. **Parallel builders need distinct ports.** Make the preview port configurable (`PW_PORT`) in `playwright.config.js` (repo
   task), and have the Lead pass a different port per worktree builder. Files: this repo's `playwright.config.js` (task) and
   `~/.claude/skills/next-task/SKILL.md` (parallel-build note).
5. **Render PDF pages in the screenshots workflow** and drop the duplicate dark PNGs (no dark mode). *Removes the Lead's
   scratch script.* Repo task: `tests/screenshots/` and `.github/workflows/screenshots.yml`. **Needs Martin's
   `acceptance-change` label** (workflow change).
6. **Ignore `.stryker-tmp/` in ESLint** (repo task, `eslint.config.js`). Alternatively allow `rm -rf .stryker-tmp` for agents.
   **The allowlist entry needs a settings change by Martin** (`~/.claude/settings.json` or the project `.claude/settings.json`).
7. **Classifier outages:** add a line to the Lead's guidance. After 3 "no verdict" errors, stop and offer to switch out of
   auto mode, and say where "temporary" comes from. File: `~/.claude/FRAMEWORK.md` (Rules). Low value, no risk.
8. **Cheaper reviews for data-only tasks:** reviewer and test-reviewer on Sonnet when the diff is only `data/*.json` plus
   expected-content. File: `~/.claude/skills/next-task/SKILL.md`. Small saving; keep Opus for code.

Items 1–3 and 7–8 belong to the ops session (`~/.claude`). Items 4–6 are repo tasks for a future plan here.

---

# Rounds 1–2 (M1–M5)Written by the Project Lead on 2026-10-24, after M5 and the post-M5 deploy. Sources: docs/LOG.md, the docs/STATUS.md
decisions log, `gh pr list --state all`, `gh run list --status failure`, PR review comments, `git log`.

## Timeline and numbers
- **Duration:** 2026-10-23 → 2026-10-24, about 1.5 working days in two sessions (one pause for the Claude usage limit).
- **Phases:** onboarding → plan v1 (#40) → harness (#41) → M1 (T-001…T-006) → M2 (T-007) → first deploy → plan v2 (#53) →
  M3 (T-008, T-009, T-014, T-010 design proposals) → plan v3 (#56) → M4 (T-015…T-017) → M5 (T-011…T-013) → 4 deploys.
- **PRs:** #40–#66, 27 in total.
  - 17 task PRs, all merged.
  - 5 milestone PRs; plan v3 shares #56 with the M3 close-out.
  - 3 plan PRs, 1 harness PR, 2 docs PRs (#52 deploy record, #65 status pause point), 1 seeded-bug PR (#42, closed on purpose).
  - 17 stale Dependabot PRs closed (#13–#39), plus one root-repo PR (martinsuba.github.io#1, redirect).
- **Fix rounds per task:**
  - T-001…T-005: 0.
  - T-006: 1 (photo aspect ratio).
  - T-007: 2 (Pages actions v5, permissions moved to the job).
  - **T-008: 4** (over the limit; Martin approved the 4th).
  - T-009: 0 after review.
  - T-014, T-015: 0.
  - T-016: 1 (tests checked only the first element).
  - T-017, T-011, T-012, T-013: 0.
  - Total: 8 rounds over 17 tasks; 13 tasks needed none.
- **Deploys:** 4, all green, none rolled back.
  - b162a1c (first)
  - d01f760 (Inter + PDF polish)
  - 71ea171 (design A + new photo)
  - 166cb04 (first deploy with the container build: build 40 s, deploy 12 s)
- **Models:**
  - The Lead ran on Opus 5.5 throughout.
  - Builders, reviewers and test-reviewers used their agent-definition defaults (no override). Their per-agent model is not visible from this session.
  - Visible subagent cost, examples: T-013 builder 79k tokens / 46 min; T-016 builder 77k (incl. fix round); reviews 16–50k each.

## Martin's inputs (from docs/LOG.md): by gate, could an agent have done it?
26 logged inputs in total.
- **Gates (merges, "go M<n>", deploy approvals, `acceptance-change` labels): 14.** These are by design and none should go away.
- **Product and design decisions: 6 — n, his to make.**
  - JSON as source of truth
  - /cv/ URL
  - Vite
  - manual deploy
  - root redirect + PDF feedback + design request
  - design direction A
- **Avoidable or cheaper: 6 — y.**
  1. **Pointed the Lead to the career notes.** A pointer in CLAUDE.md now fixes this.
  2. **Asked "why /cv/ and not root?"** The Lead should have explained the Pages URL options up front.
  3. **Seeded-bug PR blocked by auto mode, Martin had to choose.** A blind setup (neutral body from the start) or a pre-approved permission would avoid it.
  4. **Extended the PAT with Pages permission after a 403.** It belongs in the harness setup checklist.
  5. **Approved a 4th fix round on T-008.** The root cause was a missing spike on how Chromium embeds web fonts in PDFs (variable fonts → Type3).
  6. **"you copy it" (photo).** The Lead asked for scp instead of saving the image pasted in chat from the session transcript; it could do that from the start.
- **Questions Martin had to ask (Lead communication gaps):**
  - "these failures are ok? explain this mutation": the milestone PR did not explain the mutation job summary.
  - "I can not see screenshots in the PR": the Lead used relative image paths in the PR body (#61).
- **Correction to the Lead:** the screenshots (fixed within minutes, memory note written).

## What the gates caught / what slipped through
**Caught:**
- **Reviewer:**
  - T-006 photo width/height inverted (distortion).
  - T-007 Pages action versions and permission scope.
  - T-008 font budget and Type3-detector gaps.
- **Test-reviewer:**
  - Seeded bug on #42 (weakened assertion) → CHANGES NEEDED, as intended.
  - T-008 `document.fonts.check()` cannot fail.
  - T-009 contacts-on-one-line test ran at a 1280px viewport and could not fail.
  - T-016 design.spec checked only `.first()` element (proved with CSS mutations).
- **CI:** T-004 PDF file race between parallel tests.
- **Lead visual checks:**
  - PDF before/after (T-005, T-009, T-017).
  - Header photo (T-014, the builder skipped the screenshots).
  - Design boards vs implementation (T-016/T-017).
- **Opus milestone reviews:** no blocking findings; they confirmed REQ coverage.

**Slipped through, or found late:**
- Variable font → Type3 in PDF (hyphens lost in extracted text) reached a PR before anyone checked how Chromium embeds fonts.
- PR image links (M4) were broken until Martin noticed.
- The 153 Dependabot alerts on master were noted but never triaged. They are probably stale entries from the old lockfile; to be confirmed.
- The REQ-014 "≤ 10% timeouts" criterion is reported, not enforced. Nothing fails CI if it is exceeded.

## Process failures (agents' side)
- **Lead:**
  - `git add -A` in the main checkout committed a builder's worktree as a gitlink into plan/3. Fixed with a follow-up commit; `.claude/worktrees/` is now in .gitignore.
  - Relative screenshot paths in a milestone PR.
  - Asked Martin for an scp the Lead did not need.
  - A merge-commit for a conflict resolution went out without the attribution lines.
- **Shared-file conflicts:** docs/STATUS.md was edited in task PRs, plan PRs and a status PR at the same time → #64 conflicted with #65 and needed a merge from master plus a re-review.
- **Test-reviewer (twice) and the builder (several times)** claimed the `acceptance-change` label was required for any protected-path change. It is only required when acceptance-guard.yml changes; a successful `test-review` status is enough otherwise. The Lead corrected this each time; it wasted no Martin time, but it could have.
- **Builders skipped definition-of-done items:**
  - T-014 had no before/after screenshots.
  - Screenshots generally cannot be attached via `gh`, so they were left in the scratchpad.
- **Merge-condition tension:** the T-013 builder flagged the Vitest 5 → 4.1.12 pin as needing a decision. Merge condition (e) says "builder reported nothing questionable"; the Lead decided within delegated authority and merged. The rule needs a clear path for such cases.
- **Permissions:**
  - Downloading the mutation-report artifact into the scratchpad was denied, so the M4 milestone PR had no score.
  - The seeded-bug body rewrite was blocked by auto mode.
- **CI speed** before T-011: `playwright install --with-deps` hit a slow apt mirror, 8–9 min per run.

## Test quality (unit, acceptance, screenshots, mutation, spike/staging)
- **Now:** 71 unit tests (12 files), 60 acceptance tests (12 specs), 5 screenshots per CI run, axe a11y, PDF checks.
  - The PDF checks cover page count, margins, fonts, no Type3, hyphen integrity, skills text and contact layout.
- **Mutation:**
  - **M1–M4:** not meaningful (command runner, about 94% timeouts, scripts/ not mutated).
  - **After T-013:** 62.91%, with 250 killed, 82 survived, 1 timeout (0.3%), 66 no coverage, out of 399 mutants (run 40068998427).
  - Weakest: `scripts/pdf.js` (`makePdf` only e2e-covered), `scripts/validate.js` CLI path, `scripts/vite-plugin-cv-meta.js` `injectMeta`, `src/app.jsx` empty-section branches.
- **Spikes and staging:**
  - No staging (static site; CI serves the same `dist/` under /cv/).
  - No spike was planned for font embedding in Chromium PDFs; that would have saved T-008's extra rounds.
  - Seeded-bug check passed.

## Cost and model fit
- **Fine on a cheaper model:**
  - Doc-only and mechanical tasks: T-012 action bumps, T-014 photo, status/deploy records.
  - First-pass reviews of tiny diffs (e.g. a re-review of a docs-only merge).
- **Needed a strong model:**
  - T-008 (font/PDF internals).
  - T-013 (diagnosing the Stryker/Vitest 5 incompatibility).
  - Test reviews: every real test gap was found by the test-reviewer with mutation-style probing.
- **Lead on Opus:** worth it for planning, design proposals and visual judgement. Waiting on long builder runs could have been cheaper; time was mostly spent waiting, not reasoning.

## Proposals for the framework (ranked, with file to change; mark permission needs)
Ranked by Martin-minutes saved vs. risk. The Lead does not edit these files; take this list to the ops session.

1. **Say exactly when the label is needed.** Tell test-reviewer and builder that `acceptance-change` is only needed when acceptance-guard.yml changes, and that a successful `test-review` passes the guard otherwise. Files: `~/.claude/agents/test-reviewer.md`, `~/.claude/agents/builder.md`. Risk: none.
2. **Put PAT scopes in the harness setup checklist** (Pages write, workflows, admin for branch protection), checked before M1. File: `~/.claude/skills/harness/SKILL.md`. Saves a deploy-time round with Martin. Needs Martin to grant the scopes once.
3. **Spike rule in the plan skill:** extend "spike for every external API" to rendering/tooling behaviour that tests depend on (fonts in PDF, browser print engines, test runners). File: `~/.claude/skills/plan/SKILL.md`. Would have avoided T-008's 4th round.
4. **STATUS.md ownership:** builders never edit docs/STATUS.md or LOG.md; the Lead updates them only in plan, milestone or status PRs. Files: `~/.claude/agents/builder.md`, `~/.claude/skills/next-task/SKILL.md` (step 8). Removes the recurring merge conflicts.
5. **Milestone PR template:**
   - absolute image URLs (`https://github.com/<repo>/blob/<branch>/...?raw=true`) plus a check of the rendered `body_html`;
   - a short "how to read the mutation summary" line.

   File: `~/.claude/skills/next-task/SKILL.md` (end of milestone), or a new template in `~/.claude/framework/templates/`.
6. **Builder-flagged decisions:** amend merge condition (e). If the builder flags a technical decision within what Martin delegated, the Lead may decide, log it in STATUS with the reason, and say so in the merge line. Product, scope or security questions still stop. File: `~/.claude/skills/next-task/SKILL.md`. Needs Martin's OK, because it changes a merge rule.
7. **Permission allowlist** for `gh run download <id> -n mutation-report -D <scratchpad>` and `gh run view --log`. File: project `.claude/settings.json` or `~/.claude/settings.json`. Needs a settings change by Martin.
8. **Seeded-bug check, blind by default:** create the PR with a neutral title and body from the start, so no rewrite is needed. File: `~/.claude/skills/next-task/SKILL.md` (step 6b).
9. **Screenshots in the definition of done:** builders save them to `<scratchpad>/<task>/` with fixed names; the Lead views them and comments on the PR. File: `~/.claude/agents/builder.md`.
10. **Pasted images:** the Lead may save an image Martin pasted in chat from the session transcript instead of asking for a file copy. File: `~/.claude/FRAMEWORK.md`.
11. **Fix-round limit:** allow one extra round without asking when the fix is test-only and under ~10 lines, logged. File: `~/.claude/skills/next-task/SKILL.md`. Needs Martin's decision; it weakens a guardrail slightly.
12. **Harness .gitignore template:** include `.claude/worktrees/`. File: `~/.claude/framework/templates/` (harness gitignore) or `~/.claude/agents/test-architect.md`.
