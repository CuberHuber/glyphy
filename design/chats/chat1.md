# UI-Kit Glyph Animation

_Started 2026-08-26 10:05 UTC_

---

## User

Make UI mockups for my own UI-KIT. the UI-KIT of a glyph and its animation. The glyph pattern in pinned heic image

## Assistant



## Assistant

_[tool: list_files]_

I don't see the image in the project — the pin didn't come through. Attach the glyph HEIC (or a PNG/screenshot of it) and I'll build from the actual pattern.

Meanwhile, a few calls so I can start the moment it lands:

_[tool: ask_user]_

Waiting on the glyph image plus your answers — the image is the blocker, everything else I can decide if you skip it.

## User

Answered — Asked for follow-up questions; glyph_file: IMG_1958.jpeg; kit_scope: Glyph anatomy / construction grid, Color / fill variants, Animation states (idle, loading, success, error), In-product usage examples, Do / don't rules, Export + code snippets; glyph_role: App loading + progress indicator, AI thinking / processing state, Decorative pattern system; animation_char: Mechanical — precise, stepped, grid-snapped, Morphing — one shape flows into another, Additive — parts assemble/disassemble; live_or_static: Live & looping; surface: Both; variations: Kit page layout / structure, Animatio…

## Assistant



## Assistant

_[tool: view_image]_

Read it: a 3×3 dot matrix on dot-grid paper, each cell either a bare dot or a ringed dot, and the vertical bars mark animation frames — the pattern is which cells are ringed over time. Two tactical calls before I build:

_[tool: ask_user]_

Waiting on the read-check and ring treatment, then I'll build the kit.

## User

Answered — Asked for follow-up questions; read_check: 3×3 dot matrix; each cell is a bare dot or a ringed dot; frames = which cells are ringed; ring_treatment: option_1, option_2; hand_quality: Fully sketchy

## Assistant



## Assistant

_[tool: ask_user]_

Waiting on those three, then I'll build the kit page.

## User

Answered — Asked for follow-up questions; sketch_method: Clean stroke, wobbly path — uneven circles but smooth ink; frame_advance: Both, by state; usage_examples: Inline loading spinner in a button, Full-screen app launch, AI thinking bubble in a chat, Progress bar / stepper, Empty-state decoration, Background pattern / hero tile

## Assistant



## Assistant

_[tool: ask_user]_

Waiting on the state mapping, name, and page shape — then I build.

## User

Answered — state_mapping: Idle = one ring breathing at center, Loading = ring travels the 9 cells in sequence, Loading = rings accumulate until all 9 are filled, then reset, Success = all 9 rings snap on at once, Success = ri…; page_scale: One tall page

## Assistant

_[tool: dc_write]_

_[tool: show_html]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

Built it as **Ocelli** — the 3×3 lattice read from your sketch, rings as wobbly CSS borders (fixed per-cell wobble signature, so it's hand-drawn but never random).

Page covers anatomy on the dot grid, scale ramp, stroke/tint × light/dark, all seven live motion states with timings, six in-product placements, do/don'ts, and the prop spec. Tweaks panel exposes ink, fill and dot visibility globally.

Two things I decided for you: the name, and the accent (terracotta, reserved for error + active step only). Say the word and I'll swap either.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Hero band now has a 220px floor, so the headline has room; tile row keeps its own padding.

## User

UI kit extension. Glyphs panel, multiplie animation and filling pattern

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_set_props]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Extended with three additions:

**08 Glyphs panel** — dark inspector mockup: 10-swatch pattern picker (selected state), motion segmented control, size/duration sliders, dots toggle, live preview + export actions.

**Multiple animation** — a phase-offset row (one clock, +2 steps per mark, so the ring travels across the row), plus a column-wave variant and breathe-on-pattern.

**09 Filling patterns** — the mark is now a 9-bit mask; ten named patterns (Seed, Cross, Saltire, Hollow, Bars, Spine, Quoin, Fall, Quarter, Full) with their bit strings, and a gutterless tiling band showing them as continuous lattice.

New glyph props: `mask`, `phase`, and variants `wave` / `mask` / `breathe-mask` — all tweakable on GlyphGrid.

