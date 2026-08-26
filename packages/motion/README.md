# @glyphy/motion

[![npm](https://img.shields.io/npm/v/@glyphy/motion.svg)](https://www.npmjs.com/package/@glyphy/motion)
[![ci](https://github.com/CuberHuber/glyphy/actions/workflows/ci.yml/badge.svg)](https://github.com/CuberHuber/glyphy/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.txt)

A [Motion](https://motion.dev) adapter for the
[Glyphy](https://github.com/CuberHuber/glyphy) glyph. The same nine frames as
`@glyphy/react`, handed to Motion instead of to CSS transitions.

```bash
npm install @glyphy/motion motion
```

## Do you need this?

Probably not. `@glyphy/react` is smaller, has no peer dependency beyond React,
and reproduces the kit exactly. Take this package when:

- the surrounding interface is already Motion-driven and you want the mark on
  the same scheduler, so it pauses, batches and interrupts with everything else;
- you want the rings to spring rather than tween;
- you are composing the mark with `layout` or `AnimatePresence`.

Otherwise use `@glyphy/react` and save yourself a dependency.

## Use

```tsx
import { MotionGlyph } from '@glyphy/motion';

<MotionGlyph variant="travel" size={96} label="Loading" />;
```

Same props as `<Glyph>`, plus `preset`.

## The two presets

**`faithful`** (the default) reproduces the kit's CSS to the millisecond.
Opacity gets 300ms, transform gets 340ms, both on `cubic-bezier(.4, 0, .2, 1)`.
Motion takes per-property transitions, so that 40ms difference — the slight lag
of the ring behind its own fade — survives the port rather than being averaged
away.

**`spring`** swaps the eased tween for a spring, tuned to settle in roughly the
same 340ms so surrounding layout timing does not change when you switch.

```tsx
<MotionGlyph variant="accumulate" preset="spring" />
```

Both cut hard on a snapping frame. A snap that springs is no longer a snap, and
the hard cut is the entire payoff of the success state — so the preset does not
get a say in it.

The mapping is exported on its own if you are driving Motion yourself:

```ts
import { transitionFor, faithfulTransition, springTransition } from '@glyphy/motion';
import { glyphFrame } from '@glyphy/core';

const frames = glyphFrame('travel', 12);
transitionFor(frames[0], 'spring');
```

## How it works, and the one risk

`useGlyph()` from `@glyphy/react` resolves theme, clock, pattern and reduced
motion exactly as it does for `<Glyph>`. The difference is the last step: the
core-computed ring style has its `opacity`, `transform` and `transition`
stripped out before it is applied, and those three are handed to Motion instead.

That stripping is the whole correctness risk of this package. Leave them in and
CSS and Motion animate the same two properties against each other, which reads
as a stutter at every frame boundary. There is a test asserting the rendered
ring carries no CSS `transition`.

Everything else is identical to `<Glyph>`: the same DOM, the same
`data-glyphy-*` attributes, the same `label`-or-`aria-hidden` behaviour.

## Licence

[MIT](LICENSE.txt) © 2026 The Glyphy authors.
