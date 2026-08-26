# @glyphy/core

[![npm](https://img.shields.io/npm/v/@glyphy/core.svg)](https://www.npmjs.com/package/@glyphy/core)
[![ci](https://github.com/CuberHuber/glyphy/actions/workflows/ci.yml/badge.svg)](https://github.com/CuberHuber/glyphy/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial-orange.svg)](LICENSE.txt)

The engine behind the [Glyphy](https://github.com/CuberHuber/glyphy) nine-cell
glyph. Geometry, motion frames, fill patterns and a shared clock — as pure
functions, with no framework and no dependencies.

You probably want [`@glyphy/react`](https://www.npmjs.com/package/@glyphy/react).
Reach for this package if you are writing a binding for another framework, or
driving the mark onto a canvas.

```bash
npm install @glyphy/core
```

## The model

The mark is a 3×3 lattice. Every cell holds a bare dot and, when the frame calls
for it, a ring around that dot. Everything is derived from one number:

```ts
import { strokeWidth, dotDiameter, RING_RATIO } from '@glyphy/core';

strokeWidth(104); // 2  — size / 52, floored at 1
dotDiameter(120); // 4  — size / 30, floored at 2
RING_RATIO; // 0.78 of the cell pitch
```

## Frames

The whole engine is one function. Give it a variant, a tick and a cell, and it
tells you how that cell looks.

```ts
import { cellFrame, glyphFrame } from '@glyphy/core';

cellFrame('travel', 0, 0); // { on: 1,    scale: 1,    snap: false }
cellFrame('travel', 0, 4); // { on: 0.42, scale: 0.93, snap: false } — trailing
glyphFrame('travel', 0); // all nine at once
```

It is pure. The same three arguments always give the same frame, which is what
makes the mark server-renderable, snapshot-testable and replayable — and lets
this package's own tests assert exact numbers rather than "something moved".

`snap` is the engine telling the renderer to cut rather than ease. Honour it:
a success state that eases in is no longer a success state.

## Variants

Twelve of them — see the [main README](https://github.com/CuberHuber/glyphy#twelve-behaviours)
for what each one does. Timings are derived rather than declared:

```ts
import { TIMING, stepDuration, cycleDuration } from '@glyphy/core';

stepDuration('travel'); // 210 — three ticks of a 70ms clock
stepDuration('travel', 100); // 300 — on a slower clock
cycleDuration('travel'); // 1890 — nine steps
cycleDuration('idle'); // undefined — continuous, never repeats on a whole tick
TIMING.snap.snaps; // true
```

## Patterns

A mask is nine bits, read left to right and top to bottom.

```ts
import {
  PATTERNS,
  allMasks,
  maskDensity,
  maskOrbit,
  rotateMask,
  invertMask,
  intersectMask,
  maskFromIndex,
} from '@glyphy/core';

PATTERNS.cross; // '010111010'
maskDensity(PATTERNS.cross); // 5
rotateMask(PATTERNS.spine); // '000111000'
invertMask(PATTERNS.seed); // '111101111' — which is `hollow`
intersectMask(PATTERNS.spine, '000111000'); // '000010000' — which is `seed`
maskOrbit(PATTERNS.quarter); // its four distinct symmetries
maskFromIndex(341); // '101010101'
allMasks(); // all 512
```

By default only `mask` and `breathe-mask` read the mask, which is the kit's own
behaviour. Pass `maskMode: 'gate'` to clip _any_ variant to a pattern:

```ts
// A ring travelling, but only through the cells the spine names
glyphFrame('travel', 12, { mask: PATTERNS.spine, maskMode: 'gate' });
```

## Styles

If you are rendering to the DOM, the engine will do the arithmetic for you and
hand back plain objects — camelCased, so React can spread them, and serialisable
for anything else.

```ts
import { glyphStyle } from '@glyphy/core';

const { grid, cells } = glyphStyle({ variant: 'travel', tick: 9, size: 96 });

grid; // { width: 96, height: 96, display: 'grid', ... }
cells[0].ring; // border, borderRadius, transform, opacity, transition
cells[0].dot; // width, height, borderRadius, background, opacity
cells[0].frame; // the frame these styles came from
```

Rings are CSS borders with an irregular `border-radius`, not paths. No SVG, no
sprite sheet — the mark stays crisp at any size and the wobble costs nothing.

`ink` is resolved through the palette first, so a reserved colour can be named
rather than retyped:

```ts
import { COLORS, RESERVED_COLORS, resolveColor, tintOf } from '@glyphy/core';

RESERVED_COLORS; // ['accent', 'error'] — one meaning each, never emphasis
resolveColor('error'); // '#c62f2a'
resolveColor('var(--brand)'); // 'var(--brand)' — untouched
tintOf('error'); // '#c62f2a2e' — the same colour at 18%
```

## The clock

Nothing above touches time. When you need it to move, the clock is the only
stateful thing in the package, and it is shared on purpose:

```ts
import { sharedClock, phaseFor } from '@glyphy/core';

const clock = sharedClock(); // everyone at 70ms gets this same one
const stop = clock.subscribe((tick) => draw(tick));
```

One clock per page is what makes a staggered row read as a single ring
travelling across it rather than five marks drifting apart. It runs only while
something is listening, so nothing is scheduled during a server render, and
`clock.advance(n)` steps it by hand in tests.

## The wobble

Nine fixed signatures, one per cell, identical on every render forever.

```ts
import { WOBBLE, wobbleFor } from '@glyphy/core';

wobbleFor(4); // { radius: '54% 46% 48% 52% / 47% 53% 52% 48%', rotate: -5 }
```

Do not regenerate these per instance. The unevenness is what makes the mark look
drawn; randomising it makes the mark shimmer and stop being recognisable. There
is deliberately no API for it.

## Licence

[PolyForm Noncommercial 1.0.0](LICENSE.txt) © 2026 CuberHuber.

Source-available, **not** open source: any noncommercial use is permitted, commercial use is not. For a commercial licence, open an issue.
