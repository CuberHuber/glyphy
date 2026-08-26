# @glyphy/tailwind

[![npm](https://img.shields.io/npm/v/@glyphy/tailwind.svg)](https://www.npmjs.com/package/@glyphy/tailwind)
[![ci](https://github.com/CuberHuber/glyphy/actions/workflows/ci.yml/badge.svg)](https://github.com/CuberHuber/glyphy/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.txt)

The [Glyphy](https://github.com/CuberHuber/glyphy) design tokens, for Tailwind v3
and v4 — and for projects with no Tailwind at all.

```bash
npm install @glyphy/tailwind
```

`tailwindcss` is an **optional** peer dependency. Nothing in this package
imports it, so installing it without Tailwind is harmless and importing it
throws nothing.

## Tailwind v3

```js
// tailwind.config.js
import { glyphyPreset } from '@glyphy/tailwind';

export default {
  presets: [glyphyPreset],
  content: ['./src/**/*.{ts,tsx}'],
};
```

Or take just the plugin, and keep your own theme:

```js
import { glyphyPlugin } from '@glyphy/tailwind';

export default { plugins: [glyphyPlugin] };
```

## Tailwind v4

v4 reads its theme from CSS, and CSS cannot import TypeScript, so v4 gets a
stylesheet generated from the same numbers:

```css
@import 'tailwindcss';
@import '@glyphy/tailwind/glyphy.css';
```

## Without Tailwind

The tokens are plain data. Either let the React provider emit them:

```tsx
<GlyphProvider cssVariables>{children}</GlyphProvider>
```

…or take the declarations as a string and put them where you like:

```ts
import { cssVariableBlock } from '@glyphy/tailwind';

`:root { ${cssVariableBlock()} }`;
```

## What you get

**Colours** — `bg-glyphy-paper`, `text-glyphy-ink`, `border-glyphy-accent`:

| Token          | Value     | Use                                      |
| -------------- | --------- | ---------------------------------------- |
| `paper`        | `#efece4` | Page background                          |
| `surface`      | `#f7f5f0` | Cards, one step up from the paper        |
| `ink`          | `#1c1a17` | Body ink on light                        |
| `ink-inverse`  | `#efece4` | Ink on dark                              |
| `night`        | `#191816` | Dark surface                             |
| `accent`       | `#b5522f` | Error, and the active step. Nothing else |
| `accent-hover` | `#8f3f22` | Accent under the pointer                 |
| `slate`        | `#3a4a52` | The optional third ink                   |

**Durations** — `duration-glyph-travel`, and so on. These are derived from the
engine's own timing table, not retyped, so a class name and the mark it sits
beside cannot fall out of step:

| Token              | Value   | What it is                         |
| ------------------ | ------- | ---------------------------------- |
| `glyph-tick`       | `70ms`  | One tick of the shared clock       |
| `glyph-cut`        | `50ms`  | The hard cut a snapping frame uses |
| `glyph-opacity`    | `300ms` | A ring's opacity transition        |
| `glyph-transform`  | `340ms` | A ring's transform transition      |
| `glyph-idle`       | `490ms` | One step of `idle`                 |
| `glyph-travel`     | `210ms` | One step of `travel`               |
| `glyph-accumulate` | `280ms` | One step of `accumulate`           |
| `glyph-thinking`   | `350ms` | One step of `thinking`             |
| `glyph-snap`       | `280ms` | One step of `snap`                 |
| `glyph-collapse`   | `280ms` | One step of `collapse`             |
| `glyph-error`      | `210ms` | One step of `error`                |

Note `glyph-cut` and `glyph-snap` are different things: the first is how long a
hard cut takes, the second is how long the `snap` state holds between them.

**Easing** — `ease-glyphy`, the one curve the kit uses.

**Sizes** — the scale ramp as spacing: `glyph-16` through `glyph-160`, so
`w-glyph-96` is a mark-sized box.

**Components** — `.glyphy-surface`, `.glyphy-surface-dark`, `.glyphy-card`.
The three surfaces the kit page is built from, and no more; a design system that
wants a fourth should extend the theme rather than wait for this plugin to grow.

**Utilities** — `.glyphy-ink`, `.glyphy-ink-inverse`, `.glyphy-accent`,
`.glyphy-tint`.

## Keeping the two in step

`glyphy.css` duplicates values that `src/tokens.ts` derives, because CSS cannot
import TypeScript. A test reads the stylesheet and asserts every colour,
duration and size in it matches the TypeScript token of the same name, so the
duplication cannot silently drift.

## Licence

[MIT](LICENSE.txt) © 2026 The Glyphy authors.
