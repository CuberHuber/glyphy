# The Glyphy UI kit page

The design handoff, rebuilt in React from the published packages.

```bash
npm run dev      # from the repo root
```

Vite serves this against the packages' TypeScript **sources**, not their builds,
so a change in `packages/core` shows up here without a build step in between.
That also makes this the library's only end-to-end consumer: CI builds it on
every pull request, and a broken public API fails the build here even when the
unit tests are happy.

## What is on it

Nine sections, matching the design one for one — anatomy on its dot grid, the
scale ramp, fill and surface, the seven motion states with their timings, six
in-product placements, the do-and-don't rules, the prop table, the glyphs panel,
and the ten fill patterns tiling into a lattice.

Two things are not from the design:

- **The toolbar**, bottom right. The design tool this came from had its own
  tweaks panel wired to ink, fill and dot visibility; outside that tool those
  knobs belong to the page. It drives one `<GlyphProvider>`, which is also the
  shortest demonstration of what the provider is for.
- **Pause**, on that toolbar. A page of looping marks is hard to read still, and
  it shows the shared clock stopping.

Every mark on the page is a `<Glyph>` driving the public API. Nothing here
reaches past it — if a section of the kit could not be expressed in props, that
would be a gap in the library rather than something for the page to work around.
