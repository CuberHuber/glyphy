/**
 * Glyphy for React.
 *
 * `<Glyph>` is the mark. `<GlyphProvider>` sets the defaults. `useGlyph` is
 * the same thing with the markup taken away, for when you want your own.
 *
 * @packageDocumentation
 */

export { Glyph, type GlyphProps } from './Glyph.js';
export { GlyphRow, type GlyphRowProps } from './GlyphRow.js';
export { GlyphLattice, type GlyphLatticeProps } from './GlyphLattice.js';
export {
  DEFAULT_THEME,
  GlyphProvider,
  useGlyphTheme,
  type DotsSetting,
  type GlyphProviderProps,
  type GlyphTheme,
} from './context.js';
export {
  useGlyph,
  useGlyphTick,
  useReducedMotion,
  type UseGlyphOptions,
  type UseGlyphResult,
  type UseGlyphTickOptions,
} from './hooks.js';

export type { CellFrame, Fill, Mask, MaskMode, PatternName, Variant } from '@glyphy/core';
export { PATTERNS, PATTERN_NAMES, TIMING, VARIANTS } from '@glyphy/core';
