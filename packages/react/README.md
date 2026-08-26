# @glyphy/react

[![npm](https://img.shields.io/npm/v/@glyphy/react.svg)](https://www.npmjs.com/package/@glyphy/react)
[![bundle](https://img.shields.io/bundlephobia/minzip/@glyphy/react?label=minzip)](https://bundlephobia.com/package/@glyphy/react)
[![ci](https://github.com/CuberHuber/glyphy/actions/workflows/ci.yml/badge.svg)](https://github.com/CuberHuber/glyphy/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial-orange.svg)](LICENSE.txt)

React bindings for the [Glyphy](https://github.com/CuberHuber/glyphy) nine-cell
glyph: a loading spinner, a thinking indicator, a progress mark and a background
texture, all the same nine cells under different instructions.

```bash
npm install @glyphy/react
```

```tsx
import { Glyph } from '@glyphy/react';

<Glyph variant="travel" size={96} label="Loading" />;
```

No stylesheet to import, no build step, no SVG. Rings are CSS borders.

## `<Glyph>`

| Prop                   | Type                                    | Default    |
| ---------------------- | --------------------------------------- | ---------- |
| `variant`              | one of twelve behaviours                | `'idle'`   |
| `size`                 | `number` — px, square                   | `120`      |
| `ink`                  | `string` — any CSS colour               | kit ink    |
| `fill`                 | `'stroke' \| 'tint'`                    | `'stroke'` |
| `dots`                 | `boolean \| 'auto'`                     | `true`     |
| `mask`                 | nine bits, or a pattern name            | —          |
| `maskMode`             | `'auto' \| 'gate'`                      | `'auto'`   |
| `phase`                | `number` — ticks to offset              | `0`        |
| `paused`               | `boolean`                               | `false`    |
| `tick`                 | `number` — drive it yourself            | —          |
| `tickMs`               | `number` — clock period                 | `70`       |
| `respectReducedMotion` | `boolean`                               | `true`     |
| `label`                | `string` — makes it an image, not decor | —          |
| `live`                 | `boolean` — announce label changes      | `false`    |

Everything else is passed to the underlying `<div>`.

`dots="auto"` follows the kit's scale ramp and drops the bare dots below 24px,
where they collapse into the ring stroke.

## Patterns

```tsx
<Glyph variant="mask" mask="cross" />
<Glyph variant="mask" mask="010111010" />        {/* the same thing */}
<Glyph variant="breathe-mask" mask="saltire" />  {/* a pattern that breathes */}

{/* Any motion, clipped to any pattern — the full cross product */}
<Glyph variant="travel" mask="spine" maskMode="gate" />
```

Ten patterns are named — `seed`, `cross`, `saltire`, `hollow`, `bars`, `spine`,
`quoin`, `fall`, `quarter`, `full` — and any of the 512 nine-bit strings works.

## Composition

```tsx
{
  /* One ring sweeping across five marks off a single shared clock */
}
<GlyphRow variant="travel" count={5} size={64} label="Syncing" />;

{
  /* Gutterless texture — neighbouring dots line up into one lattice */
}
<GlyphLattice
  masks={['cross', 'saltire', 'seed']}
  count={16}
  size={48}
  accentEvery={12}
  accentInk="#b5522f"
/>;
```

`<GlyphRow>` exists because a staggered row only works off one clock. Five
separate marks with five separate timers drift apart within seconds; these share
the page's counter and stay locked to each other.

## Theming

```tsx
<GlyphProvider theme={{ ink: '#b5522f', fill: 'tint', dots: 'auto' }}>
  <Glyph variant="accumulate" /> {/* inherits all three */}
  <Glyph variant="idle" ink="#1c1a17" /> {/* except this one */}
</GlyphProvider>
```

Providers nest, so an inner one only names what it changes. By default the
provider renders no element of its own; pass `cssVariables` and it emits the
kit's design tokens as `--glyphy-*` custom properties on a wrapper.

For Tailwind, see [`@glyphy/tailwind`](https://www.npmjs.com/package/@glyphy/tailwind).

## Headless

`<Glyph>` is a thin wrapper over a hook. Take the hook when you want a different
element tree, a canvas, or to hand the frames somewhere else.

```tsx
import { useGlyph } from '@glyphy/react';

function Mark() {
  const { style, frames, tick, still } = useGlyph({ variant: 'travel', size: 96 });
  return <div style={style.grid}>{/* your own markup */}</div>;
}
```

`useGlyphTick()` gives you the shared counter on its own, and
`useReducedMotion()` the media query.

## Accessibility

A mark with no `label` is `aria-hidden`. That is the right default: a spinner
sitting beside its own text label is decoration, and announcing it twice helps
nobody. Give it a `label` and it becomes `role="img"` with that name.

```tsx
<button>
  <Glyph variant="travel" size={18} dots={false} /> Processing
</button>

<Glyph variant="accumulate" size={88} label="Restoring your workspace" />
<Glyph variant="snap" size={24} label="Saved" live />
```

**Reduced motion** is respected by default. Each variant falls back to the still
that carries its meaning — `idle` to its centre ring, a pattern to its pattern,
everything else to the full mark — and the clock is never subscribed to at all,
so nothing is scheduled. Override with `respectReducedMotion={false}`.

**Server rendering** is safe: the first frame is always tick 0 and no timer
starts, so there is no hydration mismatch.

## Performance

Every mark on a page reads one shared counter rather than holding its own timer.
The clock starts on the first subscriber and stops on the last, so a page with no
marks mounted has nothing running.

The frames and the styles are each memoised on their inputs, so a paused mark, a
reduced-motion mark and a `variant="all"` mark all re-render only when a prop
actually changes.

## Licence

[PolyForm Noncommercial 1.0.0](LICENSE.txt) © 2026 CuberHuber.

Source-available, **not** open source: any noncommercial use is permitted, commercial use is not. For a commercial licence, open an issue.
