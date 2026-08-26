/**
 * Geometry of the Glyphy mark.
 *
 * The mark is a 3x3 lattice. Every cell holds a bare dot and, when the current
 * frame calls for it, a ring drawn around that dot. Every measurement below is
 * derived from a single `size` in pixels, so the mark is defined by one number.
 */

/** Cells per row and per column. */
export const GRID = 3;

/** Total cells in the lattice. */
export const CELLS = GRID * GRID;

/** Ring diameter as a fraction of the cell pitch. */
export const RING_RATIO = 0.78;

/** Ring stroke is `size / STROKE_DIVISOR`, floored at {@link MIN_STROKE}. */
export const STROKE_DIVISOR = 52;

/** Bare dot diameter is `size / DOT_DIVISOR`, floored at {@link MIN_DOT}. */
export const DOT_DIVISOR = 30;

/** Ring stroke never renders thinner than one device-independent pixel. */
export const MIN_STROKE = 1;

/** A bare dot below two pixels stops reading as a dot. */
export const MIN_DOT = 2;

/** Opacity of a bare, unringed dot. */
export const DOT_OPACITY = 0.42;

/**
 * Below this size the bare dots are dropped: they collapse into the ring
 * stroke and the mark turns to mush. Callers decide, the kit only advises.
 */
export const DOTS_FLOOR = 24;

/** Smallest size at which the nine-cell lattice still reads. */
export const MIN_SIZE = 16;

/** Largest size the scale ramp is specified for. */
export const MAX_SIZE = 320;

/**
 * Order in which the travelling ring visits cells: the outer ring clockwise
 * from the top left, then the centre. Index into this array is a step number;
 * the value is the cell that step lights.
 */
export const SPIRAL: readonly number[] = Object.freeze([0, 1, 2, 5, 8, 7, 6, 3, 4]);

/**
 * Inverse of {@link SPIRAL}: index is a cell, value is the step that lights it.
 * Precomputed because frame code asks this question nine times per tick.
 */
export const SPIRAL_POSITION: readonly number[] = Object.freeze(
  Array.from({ length: CELLS }, (_, cell) => SPIRAL.indexOf(cell)),
);

/**
 * The step at which the travelling ring reaches a cell.
 *
 * A cell outside the lattice has no step, and sorts after every real one — so
 * an oversized grid degrades to "never lit" rather than to an exception.
 */
export function spiralPositionOf(cell: number): number {
  const step = SPIRAL.indexOf(cell);
  return step === -1 ? SPIRAL.length : step;
}

/** Ring stroke width in pixels for a mark of the given size. */
export function strokeWidth(size: number): number {
  return Math.max(MIN_STROKE, Math.round(size / STROKE_DIVISOR));
}

/** Bare dot diameter in pixels for a mark of the given size. */
export function dotDiameter(size: number): number {
  return Math.max(MIN_DOT, Math.round(size / DOT_DIVISOR));
}

/** Cell pitch in pixels — one ninth of the box, one unit of the lattice. */
export function cellPitch(size: number): number {
  return size / GRID;
}

/** Ring diameter in pixels, including its stroke. */
export function ringDiameter(size: number): number {
  return cellPitch(size) * RING_RATIO;
}

/** Whether bare dots should be drawn at this size, per the scale ramp. */
export function dotsAdvisedAt(size: number): boolean {
  return size >= DOTS_FLOOR;
}

/** Row of a cell index, 0 at the top. */
export function rowOf(cell: number): number {
  return Math.floor(cell / GRID);
}

/** Column of a cell index, 0 at the left. */
export function columnOf(cell: number): number {
  return cell % GRID;
}
