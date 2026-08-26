# Design brief — Glyphy Pages and previews

For **Claude Design**. The rest of `design/` is the first handoff bundle, kept as
a record; this is the brief for the second round.

The first round designed the mark. This round designs the surface it is
published on: the GitHub Pages site and the three static images that stand in
for it — the social card, the README hero, and the favicon.

**The site already ships.** <https://cuberhuber.github.io/glyphy/> is live and
built from `examples/kit`. You are redesigning something that works, not
inventing something that does not. Every requirement below is either a fact
about what exists, a constraint you cannot design around, or a gap the survey in
§9 found.

---

## 01 · The subject, in one paragraph

Glyphy is a UI kit with exactly one mark: a 3×3 dot matrix where every cell is
either a bare dot or a dot with a ring around it. The pattern of rings over time
is the entire language — a loading spinner, a thinking indicator, a progress
stepper and a background texture are the same mark under different
instructions. Twelve motion states, 512 fill patterns, nine hardcoded wobble
signatures. Hand-drawn origin, kept deliberately uneven: clean stroke, wobbly
path.

The rings are CSS borders with an irregular `border-radius`, not paths. There is
no SVG, no sprite sheet and no canvas anywhere in the library, and that fact is
half the pitch.

## 02 · What already exists

| Thing | Where | State |
| --- | --- | --- |
| The page | `examples/kit/` | 14 sections, React + Vite, ships to `docs/` |
| The engine | `packages/core/` | Pure functions of `(variant, tick, cell)` |
| The tokens | `packages/core/src/theme.ts` | 12 colours, see §4 |
| The first handoff | `design/project/` | `Ocelli UI Kit.dc.html`, `GlyphGrid.dc.html` |

The fourteen sections, in order, with the anchors they already own:

`anatomy` · `scale` · `surfaces` · `palette` · `motion` · `playground` ·
`compare` · `in-product` · `rules` · `code` · `live-code` · `panel` ·
`patterns` · `browser`

Numbers and headings both come from one ordered list in
`examples/kit/src/outline.ts`, so a section cannot be renumbered by accident.
If you add, remove or reorder a section, say so explicitly — that list is the
thing that has to change.

## 03 · Constraints you cannot design around

These are not preferences. A design that breaks one of them cannot be built.

1. **Static hosting, project path.** GitHub Pages under `/glyphy/`. No server,
   no rewrites, no redirects, no cookies, no runtime API calls, no environment
   variables. Anything that needs a request at view time is out.
2. **`base: './'` and fragment links.** The site works under `/glyphy/`, at a
   domain root, and from `file://`. Do not design real paths — they need
   `trailingSlash`, per-route `index.html` and a correct `basePath`, and still
   break on refresh.
3. **The mark is CSS, always.** No image of the glyph anywhere, including in
   mockups. If a board needs a mark, draw it with nine divs.
4. **The wobble is fixed.** Nine signatures, one per cell, the same on every
   render forever. Never randomise, never regenerate, never add a tenth.
5. **One moving glyph per screen.** `GlyphRow` and `GlyphLattice` are the two
   sanctioned exceptions, because each is one mark spread out.
6. **Motion respects `prefers-reduced-motion`.** Every state has a still that
   carries its meaning, and the clock is not subscribed to at all.
7. **Colour is never the only channel.** See §4.
8. **No runtime third party.** No hosted search, no in-browser bundler with a
   remote compiler, no star-count fetches, no bundlephobia calls. Bake numbers
   in at build time or leave them out.
9. **No new hues.** The palette in §4 is closed. If a board needs a colour that
   is not there, that is a finding to report, not a swatch to invent.

## 04 · The palette

Twelve colours. Do not add a thirteenth without saying why.

| Token | Value | Role |
| --- | --- | --- |
| `paper` | `#efece4` | Page ground, light |
| `surface` | `#f7f5f0` | Cards, one step up from the paper |
| `ink` | `#1c1a17` | Body ink on light |
| `inkInverse` | `#efece4` | Ink on dark |
| `night` | `#191816` | Dark surface |
| `slate` | `#3a4a52` | The optional third ink |
| `accent` | `#b5522f` | **Reserved.** The live step of a flow |
| `accentHover` | `#8f3f22` | Accent under the pointer |
| `accentContrast` | `#f7f5f0` | Drawn on the accent — 4.58:1 |
| `error` | `#c62f2a` | **Reserved.** The failed state |
| `errorHover` | `#a12622` | Error under the pointer |
| `errorContrast` | `#f7f5f0` | Drawn on the error — 5.02:1 |

Plus one derived tier per reserved colour: `--glyphy-accent-soft` `#b5522f2e`
and `--glyphy-error-soft` `#c62f2a2e` — the same 18% the `tint` ring fill uses,
never a second alpha.

**The rule that governs the two reserved colours.** The accent marks the step
that is happening now. The error marks a state that failed. Neither is ever
spent on emphasis. One accented thing per screen; an error does not count
against that budget, because a screen may have to show both at once.

**The risk you must design against.** They are both warm reds — a terracotta and
a vermilion, 20.6 apart in CIE L\*a\*b\*. That is enough to tell them apart side by
side and not enough to rely on. So the state is carried by motion first: `error`
cuts rather than eases, holds three ticks a frame, and drops its rings unevenly
until only the bare lattice is left. Any board showing state must read correctly
with the hue removed. Test it in greyscale before you call it done.

**Dark.** The page inverts; the palette does not. Specimen surfaces are the
exception — a card demonstrating the light surface stays light when the page
goes dark, or it is a specimen of nothing.

## 05 · Type, space, line

**Two families, and only two.** `'Helvetica Neue', Helvetica, Arial, sans-serif`
and `ui-monospace, 'SF Mono', Menlo, monospace`. No web font: the page loads no
external asset and should not start.

Monospace is not decoration. It is used for exactly one thing — anything meant
to be read *exactly*: a bit string, a duration, a hex value, a prop name, a
section number, a caption under a specimen.

**The scale in use.** 92/58 hero · 24 section heading · 17 lede · 15 · 14 · 13 ·
12.5 body · 11 · 10 mono label. Tracking: `-.045em` on the hero, `-.02em` on
headings, `+.06em` to `+.14em` on uppercase mono labels.

**The column.** 1180 max width, 48px gutter, 96px between sections; 20px gutter
and 64px between sections below 640px. Two sidebar layouts, both collapsing to
one column at 900px: content-then-rail (340px) and rail-then-content (300px).

**Line and radius.** Hairlines only, no shadows except the floating toolbar.
Card border 1px ink at 10%; section rule at 14%; pill outline at 16%. Radius: 6
on cards and slabs, 4 on chips and inputs, 100 on pills, 50% on dots.

**Geometry of the mark itself**, if you draw one: ring diameter 0.78 of the cell
pitch, stroke `size ÷ 52`, dot `size ÷ 30`, bare dot at 42% opacity, dots
dropped below 24px. Rotation stays in −9°…+8°; radii within five points of a
true 50% circle.

**Timing**, if you animate one: a 70ms clock. `travel` 210ms a step, `error`
210ms and snapping, `accumulate` 280ms, `thinking` 350ms, `idle` 490ms,
`breathe-mask` 630ms. Eased states use `cubic-bezier(.4,0,.2,1)`, 300ms opacity
and 340ms transform; snapping states cut in 50ms linear.

## 06 · Artboards to produce

Name each file exactly as written — the coding agent maps board to source file
by name, and `repo/APPLY.md` is where that mapping is written down.

| Board | Viewport | What it settles |
| --- | --- | --- |
| `Glyphy Pages.dc.html` | 1440 × full | The whole page, light. Nav, hero, all 14 sections, footer |
| `Glyphy Pages Dark.dc.html` | 1440 × full | The same page inverted. Prove the specimens stay fixed |
| `Glyphy Pages Mobile.dc.html` | 390 × full | Nav collapse, the two sidebar layouts stacked, the stepper scrolling |
| `Preview Shell.dc.html` | 1200 × 900 | The one repeated demo container and every state it has — §7 |
| `Error Palette.dc.html` | 1200 × 1400 | The palette section: the reserved pair, the greyscale proof, the swatch grid |
| `Search Palette.dc.html` | 1200 × 900 | The ⌘K dialog — §9, item 4. Built; the board settles its look |
| `Section Kit.dc.html` | 1200 × 1600 | Every repeated shape: section rule, card, chip, slider, prop row, spec row, copy button, mask editor |
| `Social Preview.dc.html` | 1280 × 640 | The GitHub repo card — §8 |
| `README Hero.dc.html` | 1280 × 860 | The image the README opens with — §8 |

Priority if you cannot do all nine: `Glyphy Pages`, `Error Palette`,
`Preview Shell`, `Social Preview`. The rest can follow.

## 07 · The preview shell

Every kit surveyed in §9 has exactly one of these and reuses it everywhere.
The site currently has three near-variants. Settle it into one.

Required states, all on the board:

- **Resting.** Bordered container, radius 6, `overflow: hidden`. Live area on
  top, centred, with a fixed minimum height so the page does not shift when the
  demo mounts. Source fused underneath on the dark slab, collapsed.
- **Expanded.** Code revealed. The code pane is dark in both page themes — every
  surveyed kit does this and it is right: code has its own ground.
- **Copy idle / copied / failed.** The button swaps its label for ~1.4s. The
  failed state matters because the async clipboard is absent over plain HTTP.
- **Empty and error.** What the live area shows when a snippet will not parse.
- **Focus.** Keyboard focus on the container, the toggle and the copy button.

No preview/code **tabs**. shadcn abandoned them deliberately; for a library
whose demo *is* the argument, hiding it behind a click is a loss with no gain.

## 08 · The three preview images

These are static artefacts, not pages. Design them as artboards; they get
rendered to PNG.

**Social preview — 1280 × 640.** What GitHub shows when the repo is linked in
Slack, on a timeline, in a search result. It is usually seen at ~320px wide, so:
the wordmark and one legible claim, nothing smaller than ~28px at full size, and
a 64px safe margin. The mark should be the loudest thing on it. Do not put a
screenshot of the page on it — a screenshot at thumbnail size is a grey smear.

**README hero — 1280 × 860.** Currently a screenshot of the live page top, and
that is a reasonable answer. If you can beat it, the bar is: it must show
something true about the library within two seconds, and it must survive being
rendered at 700px wide in a GitHub README on a phone.

**Favicon — 48 × 48 SVG.** Exists. One `prefers-color-scheme` swap, ink on
transparent. If you redraw it, keep it recognisable at 16px, which means fewer
rings, not smaller ones.

**Rules for all three.** No fabricated metrics, no invented testimonials, no
logos the project does not own, no mock UI presented as a real product
screenshot. Everything shown must be a thing the library actually does.

## 09 · Patterns to adopt

From a survey of eight React kits' own sites — shadcn/ui, Radix, Mantine,
Chakra, MUI, HeroUI, Park UI, daisyUI. Where they converge, they are usually
right.

1. **Demo first, prose second.** Every one of them puts a running instance above
   any sentence. One line of prose per heading, then the thing itself.
2. **The hero's art is the library running,** never a screenshot or an
   illustration. Mobile may fall back to a prerendered image.
3. **One preview shell** — §7.
4. **⌘K search over a build-time index.** Nobody runs a search server; Radix
   moved *off* hosted search to a JSON index and MiniSearch. It is the only way
   the 512 patterns become findable. **Built** — the index is derived from the
   outline, the variants, the props and all 512 masks, and the dialog is a
   native `<dialog>` with grouped results, a keyboard-hint footer and an empty
   state. What the board settles is how it *looks*: row density, the thumbnail,
   how a capped group says so.
5. **A metadata chip row under the title** — source, licence, version, size.
   The cheapest thing that makes a small library read as a real one.
6. **Persist one preference, globally.** `localStorage`, never cookies — there is
   no server to read them. Wrap every read and write in `try`/`catch`: private
   windows throw.
7. **Sticky header on two variables**, `--header-height` and a rail width, with
   `scroll-padding-top` so an anchor never lands under the bar.
8. **A right-hand "On this page" rail** above the breakpoint, a dropdown below
   it, with scroll-spy.
9. **Hand-written prop tables**, three or four columns, types as literal unions
   in backticks, horizontal scroll on the container. One component with fourteen
   props does not need a generator.
10. **Near-monochrome chrome.** The accent rationed to four or five places:
    primary action, active nav state, focus ring, section number.
11. **Almost no chrome motion.** The twelve marks must be the only things on the
    page that move. This library needs that contrast more than any of them.

## 10 · Anti-patterns

Do not design these, however good they look elsewhere.

- **A component sidebar.** They have 40–120 components to organise; Glyphy has
  one. Copying the tree shape produces a sidebar of nearly-empty pages. Group by
  *axis* — states, patterns, scale, tokens — not by component.
- **Numeric colour ramps.** A `--glyphy-error-400` would never be used and would
  invite the error colour to be spent decoratively, which is the one thing it is
  not for.
- **Version switchers.** At 0.1.0 with one deployment there is nothing to switch
  between. A changelog is the whole requirement.
- **Marketing furniture** — logo walls, testimonials, sponsor tiers, "trusted
  by". Load-bearing for funded projects, padding here. The honest equivalents
  already exist: `in-product` and `rules`.
- **Scrollytelling.** A page that moves while explaining a library whose product
  is motion. daisyUI does it; nobody else does, for this reason.
- **Heavy hero backgrounds.** Gradient blobs and 2560px collages cost paint time
  that belongs to the mark, and a repeating image is the opposite of the "pure
  CSS, no sprite sheet" claim the hero is making.
- **All 512 patterns animating at once.** Static by default, one shared clock,
  motion on hover or focus only.
- **Two spellings for one role.** `error` only — no `danger`, no `destructive`,
  no alias. `error` is already a variant name; a second spelling is where the
  drift starts.
- **Preview/code tabs** — §7.

## 11 · Acceptance criteria

A board is done when all of these are true of it.

- **Contrast.** Body copy ≥ 4.5:1 on its own surface. Reserved colours ≥ 4.5:1
  on paper and ≥ 3:1 on night — the numbers are in §4 and are already met.
- **Greyscale.** Convert the board to greyscale. Every state must still be
  distinguishable.
- **Focus.** Every interactive element has a visible focus state on the board,
  not just a hover.
- **Touch.** Interactive controls are at least 32px on the smallest axis. The
  current chips are 26px and that is the one measurement the live site fails.
- **No horizontal scroll at 390px**, page body only — a table or a stepper may
  scroll inside its own container.
- **Reduced motion.** For any animated board, show the still beside it.
- **Real content.** Real variant names, real bit strings, real hex values, real
  timings. No lorem, no `Component Name`, no invented props.

## 12 · Handoff

- One `.dc.html` per board, sharing one `support.js`.
- `repo/APPLY.md` maps each board to the file it lands in — for example
  `Error Palette.dc.html` → `examples/kit/src/sections/Palette.tsx`.
- `README.snippet.md` for anything the repo README should say differently.
- Where a board changes a token, say which token and what to. Do not leave a new
  value to be read out of a screenshot.

## 13 · Open questions

Answer these on the boards, or flag them.

1. **Does the accent want to move warmer** — toward `#b5622f`–`#bd6a35` — to buy
   hue separation from the error? The current pair passes every measurement; the
   question is whether it reads at a glance.
2. **Should the reserved colours have dark-mode values at all?** The first
   handoff says one accent on both surfaces, one per screen. Lighter, less
   chromatic values on night would raise 3.25:1 toward 4.5:1 and would break that
   rule. Which matters more?
3. **Where does search live** — a ⌘K dialog only, or also a persistent field in
   the nav?
4. **Does the pattern browser stay paginated at 128,** or become a virtualised
   wall of all 512?
