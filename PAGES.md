# The kit page, on GitHub Pages

The site at **https://cuberhuber.github.io/glyphy/** is the kit page from
[`examples/kit`](examples/kit), built to static files. It is the same code the
library ships: every mark on it is a `<Glyph>`, driven through the public API,
so a page that renders correctly is evidence the packages work.

## How it is served

The built site is committed to [`docs/`](docs) and GitHub serves that folder
directly. Turn it on once:

**Settings → Pages → Build and deployment → Source: _Deploy from a branch_ →
Branch: `main`, folder: `/docs` → Save.**

Nothing else is needed. No Actions minutes, no deploy key, no environment.

## Rebuilding it

```bash
npm ci
npm run build:pages
```

That writes `docs/` from `examples/kit`, then adds the two files a bundler has
no reason to produce:

- `.nojekyll`, so Pages serves the output as-is instead of running it through
  Jekyll, which drops paths beginning with an underscore.
- `404.html`, a copy of the page, so a mistyped URL lands somewhere useful.

`docs/preview.png` is the screenshot the README opens with. It lives in
`examples/kit/public/`, so the build puts it back on every run and the README
link keeps working.

Commit `docs/` with the change that caused it. A pull request that alters the
page and not the built output will show the difference, which is the point:
the deployed site is reviewable in the diff rather than being a side effect of
a job nobody reads.

The site's `base` is `./`, so it works under `/glyphy/`, at a domain root, and
from `file://` — there is no path baked in to get wrong.

## The other way, if you would rather build in CI

Committing build output is a trade: the diff is honest, but it is noise in the
history. The alternative is to build on push and publish the artefact, which
needs a workflow. Save this as `.github/workflows/pages.yml` and switch
**Settings → Pages → Source** to _GitHub Actions_:

```yaml
name: pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

# One deployment at a time, and let a newer commit win rather than queueing.
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build:pages
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```

If you take that route, add `docs/` to `.gitignore` and drop it from
`.prettierignore` and the ESLint ignore list, or the two mechanisms will fight
over the same folder.

> This file carries the workflow as text rather than as
> `.github/workflows/pages.yml` because the automation that wrote it authenticates
> without the `workflow` scope, and GitHub refuses such a push outright. Copying
> the block above into that path is the whole of the remaining work.
