/**
 * Fill patterns.
 *
 * A mask is nine bits, one per cell, read left to right and top to bottom.
 * `1` means the cell carries a ring, `0` means it stays a bare dot. Nine bits
 * is 512 marks; the ten named below are the sanctioned set, and every other
 * one is reachable through {@link maskFromIndex} or the transforms here.
 */

import { CELLS, GRID } from './geometry.js';

/** Nine characters, each `0` or `1`. */
export type Mask = string;

/** The sanctioned patterns, by name. */
export const PATTERNS = Object.freeze({
  /** The centre alone — the resting mark. */
  seed: '000010000',
  /** A plus through the centre. */
  cross: '010111010',
  /** The two diagonals. */
  saltire: '101010101',
  /** The frame, centre punched out. */
  hollow: '111101111',
  /** Top and bottom rows. */
  bars: '111000111',
  /** The centre column. */
  spine: '010010010',
  /** The four corners plus the centre pair. */
  quoin: '101000101',
  /** The leading diagonal. */
  fall: '100010001',
  /** The top-right block. */
  quarter: '011011000',
  /** Every cell. */
  full: '111111111',
} as const);

/** Name of a sanctioned pattern. */
export type PatternName = keyof typeof PATTERNS;

/**
 * A mask, or the name of a sanctioned pattern.
 *
 * The second half of the union is `string` in a disguise that survives
 * reduction, so an editor still offers the ten names while any nine-bit
 * string remains valid.
 */
export type MaskInput = PatternName | (string & Record<never, never>);

/** All sanctioned pattern names, in kit order. */
export const PATTERN_NAMES = Object.freeze(Object.keys(PATTERNS) as PatternName[]);

/** No cell ringed. Not in the sanctioned set — the mark disappears. */
export const EMPTY_MASK: Mask = '000000000';

/** Every cell ringed. Alias of `PATTERNS.full`. */
export const FULL_MASK: Mask = PATTERNS.full;

/** Number of distinct masks: two states, nine cells. */
export const MASK_COUNT = 1 << CELLS;

/** Whether a value is a well-formed nine-bit mask. */
export function isMask(value: unknown): value is Mask {
  return typeof value === 'string' && /^[01]{9}$/.test(value);
}

/**
 * Coerce a value to a mask, falling back when it is not one.
 *
 * @param value - A mask, a sanctioned pattern name, or anything else.
 * @param fallback - Returned when `value` is neither. Defaults to the full mask.
 */
export function toMask(value: unknown, fallback: Mask = FULL_MASK): Mask {
  if (isMask(value)) return value;
  if (typeof value === 'string' && value in PATTERNS) return PATTERNS[value as PatternName];
  return fallback;
}

/** Whether the given cell is ringed in this mask. */
export function maskHas(mask: Mask, cell: number): boolean {
  return mask[cell] === '1';
}

/** A mask as nine booleans. */
export function maskToCells(mask: Mask): boolean[] {
  return Array.from({ length: CELLS }, (_, cell) => maskHas(mask, cell));
}

/** Nine booleans as a mask. */
export function maskFromCells(cells: readonly boolean[]): Mask {
  return Array.from({ length: CELLS }, (_, cell) => (cells[cell] ? '1' : '0')).join('');
}

/** How many cells are ringed, 0 to 9. */
export function maskDensity(mask: Mask): number {
  let count = 0;
  for (const bit of mask) if (bit === '1') count += 1;
  return count;
}

/**
 * The mask's index in `[0, 512)`, reading cell 0 as the most significant bit.
 * Round-trips with {@link maskFromIndex}.
 */
export function maskToIndex(mask: Mask): number {
  return parseInt(mask, 2);
}

/** The mask at the given index. Indices outside `[0, 512)` wrap. */
export function maskFromIndex(index: number): Mask {
  const wrapped = ((index % MASK_COUNT) + MASK_COUNT) % MASK_COUNT;
  return wrapped.toString(2).padStart(CELLS, '0');
}

/** Every mask, in index order. All 512 of them. */
export function allMasks(): Mask[] {
  return Array.from({ length: MASK_COUNT }, (_, index) => maskFromIndex(index));
}

/** Every mask with exactly this many cells ringed. */
export function masksOfDensity(density: number): Mask[] {
  return allMasks().filter((mask) => maskDensity(mask) === density);
}

function remap(mask: Mask, source: (row: number, column: number) => number): Mask {
  const cells: boolean[] = [];
  for (let row = 0; row < GRID; row += 1) {
    for (let column = 0; column < GRID; column += 1) {
      cells.push(maskHas(mask, source(row, column)));
    }
  }
  return maskFromCells(cells);
}

/** Rotate a quarter turn clockwise. */
export function rotateMask(mask: Mask): Mask {
  return remap(mask, (row, column) => (GRID - 1 - column) * GRID + row);
}

/** Rotate by `turns` quarter turns clockwise. Negative turns go the other way. */
export function rotateMaskBy(mask: Mask, turns: number): Mask {
  const times = ((turns % 4) + 4) % 4;
  let result = mask;
  for (let turn = 0; turn < times; turn += 1) result = rotateMask(result);
  return result;
}

/** Mirror left to right. */
export function mirrorMaskX(mask: Mask): Mask {
  return remap(mask, (row, column) => row * GRID + (GRID - 1 - column));
}

/** Mirror top to bottom. */
export function mirrorMaskY(mask: Mask): Mask {
  return remap(mask, (row, column) => (GRID - 1 - row) * GRID + column);
}

/** Reflect across the leading diagonal. */
export function transposeMask(mask: Mask): Mask {
  return remap(mask, (row, column) => column * GRID + row);
}

/** Swap ringed and bare cells. */
export function invertMask(mask: Mask): Mask {
  return maskFromCells(maskToCells(mask).map((on) => !on));
}

/** Cells ringed in either mask. */
export function unionMask(left: Mask, right: Mask): Mask {
  return maskFromCells(maskToCells(left).map((on, cell) => on || maskHas(right, cell)));
}

/** Cells ringed in both masks. */
export function intersectMask(left: Mask, right: Mask): Mask {
  return maskFromCells(maskToCells(left).map((on, cell) => on && maskHas(right, cell)));
}

/** Cells ringed in exactly one of the two masks. */
export function differenceMask(left: Mask, right: Mask): Mask {
  return maskFromCells(maskToCells(left).map((on, cell) => on !== maskHas(right, cell)));
}

/**
 * The eight symmetries of the square applied to a mask, deduplicated.
 * A symmetric pattern such as `saltire` yields fewer than eight.
 */
export function maskOrbit(mask: Mask): Mask[] {
  const seen = new Set<Mask>();
  let rotation = mask;
  for (let turn = 0; turn < 4; turn += 1) {
    seen.add(rotation);
    seen.add(mirrorMaskX(rotation));
    rotation = rotateMask(rotation);
  }
  return [...seen];
}

/** The sanctioned pattern with this mask, if there is one. */
export function patternNameOf(mask: Mask): PatternName | undefined {
  return PATTERN_NAMES.find((name) => PATTERNS[name] === mask);
}
