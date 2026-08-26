/**
 * Motion variants and their timing.
 *
 * Seven of these are the motion states the kit specifies, three are pattern
 * behaviours added by the glyphs panel, and two are stills. Every one of them
 * is a pure function of a tick counter — nothing here owns a timer.
 */

/** Every behaviour the mark can be in. */
export const VARIANTS = Object.freeze([
  'idle',
  'travel',
  'accumulate',
  'thinking',
  'snap',
  'collapse',
  'error',
  'wave',
  'mask',
  'breathe-mask',
  'all',
  'off',
] as const);

/** A motion variant name. */
export type Variant = (typeof VARIANTS)[number];

/** The seven states the kit documents as motion. */
export const MOTION_VARIANTS = Object.freeze([
  'idle',
  'travel',
  'accumulate',
  'thinking',
  'snap',
  'collapse',
  'error',
] as const);

/** Variants that read a {@link import('./mask.js').Mask} by default. */
export const PATTERN_VARIANTS = Object.freeze(['mask', 'breathe-mask'] as const);

/** Variants that never change between ticks. */
export const STATIC_VARIANTS = Object.freeze(['all', 'off', 'mask'] as const);

/** The clock period every variant is quantised against, in milliseconds. */
export const TICK_MS = 70;

/** What a variant does with time. */
export interface VariantTiming {
  /** Ticks the mark holds one step before advancing. */
  readonly ticksPerStep: number;
  /** Steps in one full cycle, or `undefined` for continuous sine motion. */
  readonly steps?: number;
  /** Whether the variant cuts hard between frames instead of easing. */
  readonly snaps: boolean;
  /** One-line description of the behaviour, as written in the kit. */
  readonly summary: string;
}

/** Timing for every variant. */
export const TIMING: Readonly<Record<Variant, VariantTiming>> = Object.freeze({
  idle: {
    ticksPerStep: 7,
    snaps: false,
    summary: 'Centre ring only, scaling 1.00 to 1.08 on a sine.',
  },
  travel: {
    ticksPerStep: 3,
    steps: 9,
    snaps: false,
    summary: 'One ring walks the spiral with a two-cell fading trail.',
  },
  accumulate: {
    ticksPerStep: 4,
    steps: 12,
    snaps: false,
    summary: 'Rings draw on in spiral order, hold, then reset.',
  },
  thinking: {
    ticksPerStep: 5,
    snaps: false,
    summary: 'Cells ring on and off with no fixed path.',
  },
  snap: {
    ticksPerStep: 4,
    steps: 9,
    snaps: true,
    summary: 'All nine rings arrive in a single frame, hold, cut out.',
  },
  collapse: {
    ticksPerStep: 4,
    steps: 13,
    snaps: false,
    summary: 'The full field folds inward to one oversized centre ring.',
  },
  error: {
    ticksPerStep: 3,
    steps: 11,
    snaps: true,
    summary: 'Rings drop out unevenly; the bare lattice survives.',
  },
  wave: {
    ticksPerStep: 3,
    steps: 7,
    snaps: false,
    summary: 'A column lights and hands off to the next.',
  },
  mask: {
    ticksPerStep: 1,
    steps: 1,
    snaps: false,
    summary: 'A still fill pattern.',
  },
  'breathe-mask': {
    ticksPerStep: 9,
    snaps: false,
    summary: 'A fill pattern cycling 55 to 100 percent opacity.',
  },
  all: {
    ticksPerStep: 1,
    steps: 1,
    snaps: false,
    summary: 'Every ring set. The static mark.',
  },
  off: {
    ticksPerStep: 1,
    steps: 1,
    snaps: false,
    summary: 'No rings. The bare lattice.',
  },
} as const);

/** Whether a value names a variant. */
export function isVariant(value: unknown): value is Variant {
  return typeof value === 'string' && (VARIANTS as readonly string[]).includes(value);
}

/**
 * How long one step of a variant lasts.
 *
 * @param variant - The variant to measure.
 * @param tickMs - Clock period; defaults to {@link TICK_MS}.
 */
export function stepDuration(variant: Variant, tickMs: number = TICK_MS): number {
  return TIMING[variant].ticksPerStep * tickMs;
}

/**
 * How long one full cycle lasts, or `undefined` for continuous variants that
 * never repeat on a whole number of ticks.
 */
export function cycleDuration(variant: Variant, tickMs: number = TICK_MS): number | undefined {
  const { steps } = TIMING[variant];
  return steps === undefined ? undefined : steps * stepDuration(variant, tickMs);
}
