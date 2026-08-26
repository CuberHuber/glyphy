/**
 * Per-cell wobble signatures.
 *
 * The mark is drawn by hand, so no ring is a true circle. The unevenness is
 * fixed rather than random: cell 4 wobbles the same way in every instance, on
 * every render, forever. Regenerating it per instance would make the mark
 * shimmer and stop it being recognisable — see the "never regenerate" rule in
 * the kit. These nine signatures are the mark's fingerprint.
 */

/** The irregularity applied to one cell's ring. */
export interface Wobble {
  /** A four-corner `border-radius` value; the ellipse that is not a circle. */
  readonly radius: string;
  /** Rotation in degrees, so the flat side does not always face the same way. */
  readonly rotate: number;
}

/** Rotation stays inside this band; beyond it the lattice starts to read as tilted. */
export const WOBBLE_ROTATION_LIMIT = 9;

/** Radii stay within five percentage points of a true 50% circle. */
export const WOBBLE_RADIUS_TOLERANCE = 5;

const SIGNATURES = Object.freeze([
  Object.freeze({ radius: '53% 47% 45% 55% / 48% 54% 46% 52%', rotate: -7 }),
  Object.freeze({ radius: '46% 54% 52% 48% / 53% 47% 53% 47%', rotate: 5 }),
  Object.freeze({ radius: '51% 49% 47% 53% / 45% 55% 49% 51%', rotate: -3 }),
  Object.freeze({ radius: '48% 52% 55% 45% / 52% 48% 51% 49%', rotate: 8 }),
  Object.freeze({ radius: '54% 46% 48% 52% / 47% 53% 52% 48%', rotate: -5 }),
  Object.freeze({ radius: '47% 53% 51% 49% / 54% 46% 47% 53%', rotate: 4 }),
  Object.freeze({ radius: '52% 48% 54% 46% / 46% 54% 53% 47%', rotate: -9 }),
  Object.freeze({ radius: '49% 51% 46% 54% / 51% 49% 45% 55%', rotate: 6 }),
  Object.freeze({ radius: '55% 45% 49% 51% / 49% 51% 54% 46%', rotate: -4 }),
] as const satisfies readonly Wobble[]);

/** The nine fixed signatures, indexed by cell. */
export const WOBBLE: readonly Wobble[] = SIGNATURES;

/**
 * The signature for a cell. Indices outside the lattice wrap, so callers
 * building larger tilings still get a stable, repeatable signature.
 */
export function wobbleFor(cell: number): Wobble {
  const size = SIGNATURES.length;
  const index = ((cell % size) + size) % size;
  return SIGNATURES[index] ?? SIGNATURES[0];
}
