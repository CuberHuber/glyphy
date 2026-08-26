/**
 * Style computation.
 *
 * Turns a frame into plain style objects. Nothing here touches the DOM or
 * imports a framework: the objects are shaped so React can spread them into
 * `style`, but a Vue or Svelte binding can serialise them just as easily.
 *
 * Rings are CSS borders with an irregular `border-radius`, not paths. That is
 * why the mark stays crisp at any size and why the wobble costs nothing.
 */

import { type CellFrame, glyphFrame, type FrameOptions } from './frames.js';
import { CELLS, DOT_OPACITY, dotDiameter, GRID, RING_RATIO, strokeWidth } from './geometry.js';
import { type Mask } from './mask.js';
import {
  COLORS,
  EASE,
  EASE_OPACITY_MS,
  EASE_TRANSFORM_MS,
  type Fill,
  SNAP_MS,
  tintOf,
} from './theme.js';
import { type Variant } from './variants.js';
import { wobbleFor } from './wobble.js';

/** A CSS declaration value. */
export type StyleValue = string | number;

/** A bag of CSS declarations, camelCased as the DOM wants them. */
export type Style = Readonly<Record<string, StyleValue>>;

/** The three styles that make up one cell. */
export interface CellStyle {
  /** Positioning context that centres the dot and the ring on each other. */
  readonly wrapper: Style;
  /** The ring itself. */
  readonly ring: Style;
  /** The bare dot beneath it. */
  readonly dot: Style;
}

/** Everything needed to paint one mark. */
export interface GlyphStyle {
  /** The 3x3 grid container. */
  readonly grid: Style;
  /** Nine cells, in reading order. */
  readonly cells: readonly CellStyle[];
}

/** A fully resolved description of a mark at one instant. */
export interface GlyphSpec extends FrameOptions {
  /** What the mark is doing. Defaults to `idle`. */
  readonly variant?: Variant;
  /** Box size in pixels. Defaults to 120. */
  readonly size?: number;
  /** Ring and dot colour. Defaults to the kit's ink. */
  readonly ink?: string;
  /** Outline or wash. Defaults to `stroke`. */
  readonly fill?: Fill;
  /** Whether bare dots are drawn. Defaults to `true`. */
  readonly dots?: boolean;
  /** Frames elapsed. Defaults to 0. */
  readonly tick?: number;
  /** Pre-computed frames. Supply these to skip recomputation. */
  readonly frames?: readonly CellFrame[];
}

/** Default box size, matching the kit's reference mark. */
export const DEFAULT_SIZE = 120;

/** Default pattern, used when a pattern variant is asked for without one. */
export const DEFAULT_MASK: Mask = '010111010';

/** The transition applied to eased frames. */
export const EASED_TRANSITION = `opacity ${EASE_OPACITY_MS}ms ${EASE}, transform ${EASE_TRANSFORM_MS}ms ${EASE}`;

/** The transition applied to snapping frames. Short enough to read as a cut. */
export const SNAP_TRANSITION = `opacity ${SNAP_MS}ms linear, transform ${SNAP_MS}ms linear`;

/** The transition for a frame. */
export function transitionFor(frame: CellFrame): string {
  return frame.snap ? SNAP_TRANSITION : EASED_TRANSITION;
}

/** The grid container for a mark of the given size. */
export function gridStyle(size: number = DEFAULT_SIZE): Style {
  return {
    width: size,
    height: size,
    display: 'grid',
    gridTemplateColumns: `repeat(${GRID},1fr)`,
    gridTemplateRows: `repeat(${GRID},1fr)`,
  };
}

/** The positioning context shared by every cell. */
export function cellWrapperStyle(): Style {
  return { position: 'relative', display: 'grid', placeItems: 'center' };
}

/** The ring for one cell in one frame. */
export function ringStyle(
  frame: CellFrame,
  cell: number,
  spec: Pick<GlyphSpec, 'size' | 'ink' | 'fill'> = {},
): Style {
  const size = spec.size ?? DEFAULT_SIZE;
  const ink = spec.ink ?? COLORS.ink;
  const fill = spec.fill ?? 'stroke';
  const wobble = wobbleFor(cell);
  const percent = `${RING_RATIO * 100}%`;
  return {
    position: 'absolute',
    width: percent,
    height: percent,
    boxSizing: 'border-box',
    border: fill === 'tint' ? '0' : `${strokeWidth(size)}px solid ${ink}`,
    background: fill === 'tint' ? tintOf(ink) : 'transparent',
    borderRadius: wobble.radius,
    transform: `rotate(${wobble.rotate}deg) scale(${frame.scale})`,
    opacity: frame.on,
    transition: transitionFor(frame),
  };
}

/** The bare dot for one cell. */
export function dotStyle(spec: Pick<GlyphSpec, 'size' | 'ink' | 'dots'> = {}): Style {
  const diameter = dotDiameter(spec.size ?? DEFAULT_SIZE);
  return {
    width: diameter,
    height: diameter,
    borderRadius: '50%',
    background: spec.ink ?? COLORS.ink,
    opacity: spec.dots === false ? 0 : DOT_OPACITY,
  };
}

/**
 * Every style for one mark at one instant.
 *
 * Pass `frames` when you already have them — from a shared clock, say, or from
 * a reduced-motion still — and the variant and tick are ignored.
 */
export function glyphStyle(spec: GlyphSpec = {}): GlyphStyle {
  const {
    variant = 'idle',
    tick = 0,
    size = DEFAULT_SIZE,
    ink = COLORS.ink,
    fill = 'stroke',
    dots = true,
    mask,
    maskMode,
    frames,
  } = spec;

  const resolved = frames ?? glyphFrame(variant, tick, { mask, maskMode });
  const wrapper = cellWrapperStyle();
  const dot = dotStyle({ size, ink, dots });

  return {
    grid: gridStyle(size),
    cells: Array.from({ length: CELLS }, (_, cell) => ({
      wrapper,
      ring: ringStyle(resolved[cell] ?? { on: 0, scale: 1, snap: false }, cell, {
        size,
        ink,
        fill,
      }),
      dot,
    })),
  };
}
