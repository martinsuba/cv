# Deploy: cv
## Target
GitHub Pages, project site of `martinsuba/cv`: `https://martinsuba.github.io/cv/` (and `/cv/cv.pdf`).
The root repo `martinsuba.github.io` is not touched.

## Environments (staging? production)
Production only. A static site with no runtime: CI builds the exact same `dist/` and the acceptance tests run against it
served under `/cv/`, which is what Pages serves. No staging needed.

## How to deploy (exact steps / commands / workflow)
One-time setup (Lead, deploy phase, logged in docs/LOG.md):
`gh api -X POST repos/martinsuba/cv/pages -f build_type=workflow`
(if Pages already exists: `gh api -X PUT repos/martinsuba/cv/pages -f build_type=workflow`).

Every deploy (only after Martin approves, or Martin runs it himself):
- GitHub: Actions → `deploy` → "Run workflow" on `master`, or
- CLI: `gh workflow run deploy --ref master` then `gh run watch $(gh run list --workflow deploy -L 1 --json databaseId --jq '.[0].databaseId')`.

The workflow: npm ci → validate → build → pdf → upload-pages-artifact (dist/) → deploy-pages.

## Smoke checks after deploy
- `curl -sI https://martinsuba.github.io/cv/` → 200
- `curl -s https://martinsuba.github.io/cv/ | grep -q "Martin Šuba"` (name from cv.json)
- `curl -sI https://martinsuba.github.io/cv/cv.pdf` → 200, `content-type: application/pdf`
- Open the page once in Playwright: no console errors, photo loads.

## Rollback
The `github-pages` environment only accepts deploys from `master` by default, and `workflow_dispatch --ref` takes a
branch or tag, not a bare SHA. So the reliable rollback is:
1. Revert the bad change on `master` through a PR (`git revert <sha>` on a `fix/*` branch), merge it.
2. Run the deploy again: `gh workflow run deploy --ref master`.
Faster alternative (Martin decides): re-run an earlier successful `deploy` run from the Actions tab ("Re-run all jobs"),
which rebuilds that run's commit.
To take the site down: `gh api -X DELETE repos/martinsuba/cv/pages` (Martin decides).

## Secrets needed (names only; values set by Martin in GitHub/target)
None. Uses the built-in `GITHUB_TOKEN` (`pages: write`, `id-token: write`).

## History (date · commit · target · result)
2026-10-23 · b162a1c · GitHub Pages https://martinsuba.github.io/cv/ (first deploy, run 39936713633) · success: / 200 text/html with name + title, /cv.pdf 200 application/pdf, /og-image.jpg 200, no console errors or failed requests, photo 170x196
2026-10-23 · d01f760 (T-008 Inter + T-009 PDF polish) · GitHub Pages, run 39959117497 · success: / 200 with name, /cv.pdf 200 application/pdf (2 pages, Inter only, no Type3), no console errors or failed requests, photo loads, body font Inter
