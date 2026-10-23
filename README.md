# CV

Minimal CV (resume) site written with [Preact](https://preactjs.com/) and [Vite](https://vite.dev/). It renders the
content of `data/cv.json` and is published at https://martinsuba.github.io/cv/.

## Usage
Requires Node 24 (`nvm use`).

```
git clone https://github.com/martinsuba/cv
cd cv
npm ci
npm run dev          # dev server, http://localhost:5173/cv/
npm run build        # static site in dist/ (base path /cv/)
npm run pdf          # dist/cv.pdf from the build (run build first)
npm run preview      # serve dist/ at http://localhost:4173/cv/
```

Edit `data/cv.json` (and `data/photo.jpg`) to change the content. Checks: `npm run lint`, `npm run format:check`,
`npm test`, `npm run test:e2e` (build first). See docs/TESTS.md.

## Deploy
Merges to `master` never deploy automatically. To publish, open the Actions tab, choose the `deploy` workflow and
click "Run workflow" on `master`, or run `gh workflow run deploy --ref master`. The workflow validates the data, builds
the site, generates `cv.pdf` and publishes `dist/` to GitHub Pages.
