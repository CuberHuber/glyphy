/**
 * The component contract, written out by hand.
 *
 * Every kit surveyed for `design/BRIEF.md` writes its prop tables rather than
 * generating them, and shadcn — with six button variants and eight sizes — says
 * so out loud. One component with fourteen props does not need a docgen
 * pipeline; it needs a table somebody read before publishing.
 *
 * The list lives here rather than in the section that prints it because the
 * search index reads it too, and a prop that is findable but undocumented (or
 * the reverse) is worse than either.
 */

/** One row of a prop table. */
export interface PropSpec {
  /** The prop, as written in JSX. */
  readonly name: string;
  /** Its type, as a literal union where the set is closed. */
  readonly type: string;
  /** What it falls back to. An em dash when there is no default. */
  readonly fallback: string;
  /** One sentence. */
  readonly note: string;
  /** Which component takes it. */
  readonly on: 'Glyph' | 'GlyphRow' | 'GlyphLattice';
}

/** Props on `<Glyph>`, which the other two inherit. */
export const GLYPH_PROPS: readonly PropSpec[] = Object.freeze([
  {
    name: 'variant',
    type: `'idle' | 'travel' | 'accumulate' | 'thinking' | 'snap' | 'collapse' | 'error' | 'wave' | 'mask' | 'breathe-mask' | 'all' | 'off'`,
    fallback: `'idle'`,
    note: 'Seven motion states, three pattern behaviours, two stills.',
    on: 'Glyph',
  },
  {
    name: 'size',
    type: 'number',
    fallback: '120',
    note: 'Box side in pixels, 16 to 320. Stroke and dot are derived from it.',
    on: 'Glyph',
  },
  {
    name: 'ink',
    type: 'string',
    fallback: `'ink'`,
    note: 'A palette name such as error, or any CSS colour. Tint is this at 18%.',
    on: 'Glyph',
  },
  {
    name: 'fill',
    type: `'stroke' | 'tint'`,
    fallback: `'stroke'`,
    note: 'Stroke while something is happening, tint once it has finished.',
    on: 'Glyph',
  },
  {
    name: 'dots',
    type: `boolean | 'auto'`,
    fallback: 'true',
    note: 'Bare dot visibility. auto drops them below 24px, as the ramp advises.',
    on: 'Glyph',
  },
  {
    name: 'mask',
    type: 'string',
    fallback: `'010111010'`,
    note: 'Nine bits, or one of the ten sanctioned pattern names.',
    on: 'Glyph',
  },
  {
    name: 'maskMode',
    type: `'auto' | 'gate'`,
    fallback: `'auto'`,
    note: 'auto lets only the pattern variants read the mask; gate clips any variant to it.',
    on: 'Glyph',
  },
  {
    name: 'phase',
    type: 'number',
    fallback: '0',
    note: 'Steps to offset this mark from the shared clock.',
    on: 'Glyph',
  },
  {
    name: 'paused',
    type: 'boolean',
    fallback: 'false',
    note: 'Hold the current frame. A paused mark never subscribes to the clock.',
    on: 'Glyph',
  },
  {
    name: 'tick',
    type: 'number',
    fallback: '—',
    note: 'Drive the mark yourself. Overrides the shared clock entirely.',
    on: 'Glyph',
  },
  {
    name: 'tickMs',
    type: 'number',
    fallback: '70',
    note: 'Clock period. Marks sharing a period share a clock.',
    on: 'Glyph',
  },
  {
    name: 'respectReducedMotion',
    type: 'boolean',
    fallback: 'true',
    note: 'Fall back to the still that carries the meaning when the system asks.',
    on: 'Glyph',
  },
  {
    name: 'label',
    type: 'string',
    fallback: '—',
    note: 'What the mark means. Without one it is decoration and is hidden.',
    on: 'Glyph',
  },
  {
    name: 'live',
    type: 'boolean',
    fallback: 'false',
    note: 'Announce changes to label politely.',
    on: 'Glyph',
  },
  {
    name: 'count',
    type: 'number',
    fallback: '—',
    note: 'How many marks to draw.',
    on: 'GlyphRow',
  },
  {
    name: 'stepsApart',
    type: 'number',
    fallback: '2',
    note: 'Steps between one mark and the next, so the ring travels the row.',
    on: 'GlyphRow',
  },
  {
    name: 'gap',
    type: 'number',
    fallback: '22',
    note: 'Pixels between marks.',
    on: 'GlyphRow',
  },
  {
    name: 'masks',
    type: 'readonly string[]',
    fallback: '—',
    note: 'The patterns to tile, in order. Repeats to fill count.',
    on: 'GlyphLattice',
  },
  {
    name: 'columnWidth',
    type: 'number',
    fallback: 'size + 10',
    note: 'Minimum column width. Set it to size for a gutterless lattice.',
    on: 'GlyphLattice',
  },
  {
    name: 'accentEvery',
    type: 'number',
    fallback: '—',
    note: 'Accent every nth tile. The kit allows no more than one in twelve.',
    on: 'GlyphLattice',
  },
  {
    name: 'accentInk',
    type: 'string',
    fallback: '—',
    note: 'The accent ink. Only read when accentEvery is set.',
    on: 'GlyphLattice',
  },
]);
