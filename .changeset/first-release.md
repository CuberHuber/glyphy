---
'@glyphy/core': minor
'@glyphy/react': minor
'@glyphy/motion': minor
'@glyphy/tailwind': minor
---

First release of the Glyphy nine-cell glyph kit.

`@glyphy/core` is the engine: geometry, twelve motion variants, 512 fill
patterns and a shared clock, all as pure functions of `(variant, tick, cell)`
with no dependencies. `@glyphy/react` adds `<Glyph>`, `<GlyphRow>`,
`<GlyphLattice>`, `<GlyphProvider>` and headless hooks, with reduced-motion
stills and SSR-safe first frames. `@glyphy/tailwind` ships the design tokens as
a Tailwind v3 preset and a v4 stylesheet. `@glyphy/motion` hands the same frames
to Motion instead of to CSS transitions.
