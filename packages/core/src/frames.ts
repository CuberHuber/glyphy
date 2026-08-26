/**
 * Frame computation.
 *
 * Given a variant, a tick and a cell, work out how that cell should look. Pure
 * functions all the way down: no timers, no DOM, no state. The same three
 * arguments always produce the same frame, which is what makes the mark
 * server-renderable and snapshot-testable.
 */

import { CELLS, spiralPositionOf } from './geometry.js';
import { hash } from './hash.js';
import { maskHas, type Mask } from './mask.js';
import { type Variant } from './variants.js';

/** How one cell looks in one frame. */
export interface CellFrame {
  /** Ring opacity, 0 to 1. */
  readonly on: number;
  /** Ring scale, where 1 is the full ring diameter. */
  readonly scale: number;
  /** Whether to cut to this frame rather than ease into it. */
  readonly snap: boolean;
}

/** A cell with no ring. Slightly undersized, so it grows into view. */
export const OFF_FRAME: CellFrame = Object.freeze({ on: 0, scale: 0.72, snap: false });

/** A cell with a full ring. */
export const ON_FRAME: CellFrame = Object.freeze({ on: 1, scale: 1, snap: false });

/** The index of the centre cell. */
const CENTRE = 4;

/** How the mask interacts with the variant. */
export type MaskMode =
  /** Only `mask` and `breathe-mask` read the mask. The kit's own behaviour. */
  | 'auto'
  /** Every variant is clipped to the mask: any pattern, any motion. */
  | 'gate';

/** Inputs beyond the variant, tick and cell. */
export interface FrameOptions {
  /** The fill pattern, when the variant or mask mode calls for one. */
  readonly mask?: Mask;
  /** Defaults to `auto`. */
  readonly maskMode?: MaskMode;
}

function frameOf(on: number, scale: number, snap = false): CellFrame {
  return { on, scale, snap };
}

/** Centre ring alone, breathing on a sine. */
function idleFrame(tick: number, cell: number): CellFrame {
  if (cell !== CENTRE) return OFF_FRAME;
  return frameOf(0.95, 1 + 0.08 * Math.sin(tick / 7));
}

/** One ring walking the spiral, trailing two fading cells behind it. */
function travelFrame(tick: number, cell: number): CellFrame {
  const step = Math.floor(tick / 3) % CELLS;
  const distance = (step - spiralPositionOf(cell) + CELLS) % CELLS;
  if (distance === 0) return ON_FRAME;
  if (distance === 1) return frameOf(0.42, 0.93);
  if (distance === 2) return frameOf(0.14, 0.86);
  return OFF_FRAME;
}

/** Rings setting one by one in spiral order, holding, then resetting. */
function accumulateFrame(tick: number, cell: number): CellFrame {
  const drawn = Math.floor(tick / 4) % 12;
  return spiralPositionOf(cell) < drawn ? ON_FRAME : OFF_FRAME;
}

/** All nine rings arriving in one hard frame, holding, then cutting out. */
function snapFrame(tick: number): CellFrame {
  const phase = Math.floor(tick / 4) % 9;
  return phase >= 1 && phase <= 6 ? frameOf(1, 1, true) : frameOf(0, 1, true);
}

/** The full field folding inward to a single oversized centre ring. */
function collapseFrame(tick: number, cell: number): CellFrame {
  const phase = Math.floor(tick / 4) % 13;
  if (phase < 6) return ON_FRAME;
  if (cell === CENTRE) return frameOf(1, 1.25);
  return frameOf(0, 0.35);
}

/** Rings dropping out unevenly, leaving the bare lattice behind. */
function errorFrame(tick: number, cell: number): CellFrame {
  const phase = Math.floor(tick / 3) % 11;
  if (phase < 3) return frameOf(1, 1, true);
  if (phase > 8) return frameOf(0, 1, true);
  return frameOf(hash(cell, phase) > 0.5 ? 0 : 0.45, 1, true);
}

/** Cells ringing on and off with no fixed path. */
function thinkingFrame(tick: number, cell: number): CellFrame {
  return hash(cell, Math.floor(tick / 5)) > 0.55 ? ON_FRAME : frameOf(0, 0.78);
}

/** A column lighting and handing off to the next, with a fading neighbour. */
function waveFrame(tick: number, cell: number): CellFrame {
  const step = Math.floor(tick / 3) % 7;
  const column = cell % 3;
  if (step === column) return ON_FRAME;
  if (step === column + 1) return frameOf(0.3, 0.92);
  return OFF_FRAME;
}

/** A still fill pattern. Without a mask there is nothing to show. */
function maskFrame(cell: number, mask: Mask | undefined): CellFrame {
  if (mask === undefined) return OFF_FRAME;
  return maskHas(mask, cell) ? ON_FRAME : OFF_FRAME;
}

/** A fill pattern cycling its opacity. Without a mask, every cell breathes. */
function breatheMaskFrame(tick: number, cell: number, mask: Mask | undefined): CellFrame {
  const lit = mask === undefined ? true : maskHas(mask, cell);
  if (!lit) return OFF_FRAME;
  return frameOf(0.55 + 0.45 * Math.abs(Math.sin(tick / 9)), 1);
}

/** One variant's behaviour, as a function of time, cell and pattern. */
type FrameFunction = (tick: number, cell: number, mask: Mask | undefined) => CellFrame;

/**
 * Every variant's behaviour, keyed by name.
 *
 * A table rather than a switch, so adding a variant to {@link Variant} without
 * describing what it does is a compile error rather than a silent fall-through
 * to nothing.
 */
const BEHAVIOUR: Readonly<Record<Variant, FrameFunction>> = Object.freeze({
  idle: (tick, cell) => idleFrame(tick, cell),
  travel: (tick, cell) => travelFrame(tick, cell),
  accumulate: (tick, cell) => accumulateFrame(tick, cell),
  thinking: (tick, cell) => thinkingFrame(tick, cell),
  snap: (tick) => snapFrame(tick),
  collapse: (tick, cell) => collapseFrame(tick, cell),
  error: (tick, cell) => errorFrame(tick, cell),
  wave: (tick, cell) => waveFrame(tick, cell),
  mask: (_tick, cell, mask) => maskFrame(cell, mask),
  'breathe-mask': (tick, cell, mask) => breatheMaskFrame(tick, cell, mask),
  all: () => ON_FRAME,
  off: () => OFF_FRAME,
});

/**
 * The frame for one cell.
 *
 * @param variant - What the mark is doing.
 * @param tick - Frames elapsed. Add a phase offset here to stagger marks.
 * @param cell - Cell index, 0 to 8, left to right and top to bottom.
 * @param options - Fill pattern and how it applies.
 */
export function cellFrame(
  variant: Variant,
  tick: number,
  cell: number,
  options: FrameOptions = {},
): CellFrame {
  const { mask, maskMode = 'auto' } = options;

  if (maskMode === 'gate' && mask !== undefined && !maskHas(mask, cell)) {
    return OFF_FRAME;
  }

  return BEHAVIOUR[variant](tick, cell, mask);
}

/** The frames for all nine cells at one tick. */
export function glyphFrame(
  variant: Variant,
  tick: number,
  options: FrameOptions = {},
): CellFrame[] {
  return Array.from({ length: CELLS }, (_, cell) => cellFrame(variant, tick, cell, options));
}

/**
 * The still to show when motion is unwelcome — a reader who has asked for
 * reduced motion, a print stylesheet, a snapshot test. Each variant resolves
 * to the frame that carries its meaning without moving.
 */
export function restingFrame(variant: Variant, options: FrameOptions = {}): CellFrame[] {
  if (variant === 'off' || variant === 'idle') return glyphFrame(variant, 0, options);
  if (variant === 'mask') return glyphFrame('mask', 0, options);
  if (variant === 'breathe-mask') {
    // Without a pattern, `breathe-mask` breathes every cell, so its still is
    // the full mark rather than the empty one `mask` would give.
    return glyphFrame(options.mask === undefined ? 'all' : 'mask', 0, options);
  }
  return glyphFrame('all', 0, options);
}
