/**
 * Glyphy core — the nine-cell glyph, with no framework attached.
 *
 * Everything is a pure function of `(variant, tick, cell)`. Bindings for React,
 * Motion and Tailwind are built on top of this and add nothing to the model.
 *
 * @packageDocumentation
 */

export {
  CELLS,
  DOT_DIVISOR,
  DOT_OPACITY,
  DOTS_FLOOR,
  GRID,
  MAX_SIZE,
  MIN_DOT,
  MIN_SIZE,
  MIN_STROKE,
  RING_RATIO,
  SPIRAL,
  SPIRAL_POSITION,
  STROKE_DIVISOR,
  cellPitch,
  columnOf,
  dotDiameter,
  dotsAdvisedAt,
  ringDiameter,
  rowOf,
  spiralPositionOf,
  strokeWidth,
} from './geometry.js';

export {
  WOBBLE,
  WOBBLE_RADIUS_TOLERANCE,
  WOBBLE_ROTATION_LIMIT,
  wobbleFor,
  type Wobble,
} from './wobble.js';

export { hash } from './hash.js';

export {
  EMPTY_MASK,
  FULL_MASK,
  MASK_COUNT,
  PATTERNS,
  PATTERN_NAMES,
  allMasks,
  differenceMask,
  intersectMask,
  invertMask,
  isMask,
  maskDensity,
  maskFromCells,
  maskFromIndex,
  maskHas,
  maskOrbit,
  maskToCells,
  maskToIndex,
  masksOfDensity,
  mirrorMaskX,
  mirrorMaskY,
  patternNameOf,
  rotateMask,
  rotateMaskBy,
  toMask,
  transposeMask,
  unionMask,
  type Mask,
  type MaskInput,
  type PatternName,
} from './mask.js';

export {
  MOTION_VARIANTS,
  PATTERN_VARIANTS,
  STATIC_VARIANTS,
  TICK_MS,
  TIMING,
  VARIANTS,
  cycleDuration,
  isVariant,
  stepDuration,
  type Variant,
  type VariantTiming,
} from './variants.js';

export {
  OFF_FRAME,
  ON_FRAME,
  cellFrame,
  glyphFrame,
  restingFrame,
  type CellFrame,
  type FrameOptions,
  type MaskMode,
} from './frames.js';

export {
  COLORS,
  CSS_VARIABLES,
  EASE,
  EASE_OPACITY_MS,
  EASE_TRANSFORM_MS,
  FILLS,
  RESERVED_COLORS,
  SNAP_MS,
  TINT_ALPHA,
  TINT_ALPHA_HEX,
  isColorName,
  isFill,
  resolveColor,
  tintOf,
  type ColorName,
  type Fill,
  type ReservedColorName,
} from './theme.js';

export {
  DEFAULT_MASK,
  DEFAULT_SIZE,
  EASED_TRANSITION,
  SNAP_TRANSITION,
  cellWrapperStyle,
  dotStyle,
  glyphStyle,
  gridStyle,
  ringStyle,
  transitionFor,
  type CellStyle,
  type GlyphSpec,
  type GlyphStyle,
  type Style,
  type StyleValue,
} from './style.js';

export {
  createClock,
  phaseFor,
  resetSharedClocks,
  sharedClock,
  type Clock,
  type TickListener,
  type Unsubscribe,
} from './clock.js';
