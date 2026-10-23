# cv
Follows Martin's framework: ~/.claude/FRAMEWORK.md (skills: plan, harness, next-task, deploy).
State: docs/STATUS.md (read it first). Plan: docs/PRD.md, docs/ARCHITECTURE.md, docs/PLAN.md. Tests: docs/TESTS.md.
Background notes (outside the repo): ~/HAL/ai-assistant/notes/career/cv/ (project notes, current CV text and PDF).
Default branch is `master`: wherever the framework says "main", use `master`.

## Stack
Preact 10 + Vite (after the harness), plain CSS, Playwright (tests + PDF), Vitest. See docs/ARCHITECTURE.md.

## Commands
(filled in by the harness)

## Conventions
- data/cv.json is the only place CV content lives; never hard-code CV text in components.
