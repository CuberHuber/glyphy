/**
 * Deterministic pseudo-randomness.
 *
 * The `thinking` and `error` states need to look unpredictable without being
 * unpredictable: the same cell at the same frame must always decide the same
 * way, or the mark cannot be server-rendered, snapshot-tested or replayed.
 * This is the standard fract(sin(x) * large) trick, which is stable enough for
 * animation and cheap enough to run nine times a frame.
 */

const HASH_CELL_SCALE = 127.1;
const HASH_SEED_SCALE = 311.7;
const HASH_MAGNITUDE = 43758.5453;

/**
 * A stable value in `[0, 1)` for a cell and a seed.
 *
 * @param cell - Cell index, 0 to 8.
 * @param seed - Frame number, or any other varying integer.
 */
export function hash(cell: number, seed: number): number {
  const x = Math.sin(cell * HASH_CELL_SCALE + seed * HASH_SEED_SCALE) * HASH_MAGNITUDE;
  return x - Math.floor(x);
}
