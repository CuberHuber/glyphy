/**
 * Glyphy for Motion.
 *
 * An adapter, not an alternative: the frames still come from `@glyphy/core`
 * and the resolution still comes from `@glyphy/react`. Only the thing that
 * moves the rings changes.
 *
 * @packageDocumentation
 */

export { MotionGlyph, type MotionGlyphProps } from './MotionGlyph.js';
export {
  GLYPHY_BEZIER,
  faithfulTransition,
  springTransition,
  transitionFor,
  type GlyphMotionPreset,
} from './transitions.js';
