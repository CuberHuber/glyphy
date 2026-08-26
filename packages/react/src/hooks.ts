/**
 * Hooks.
 *
 * `useGlyphTick` is the only thing in the kit that touches time; everything
 * else derives from the number it returns. `useGlyph` is the headless door:
 * take the styles and render whatever element tree you like.
 */

import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import {
  DEFAULT_MASK,
  DEFAULT_SIZE,
  PATTERNS,
  TICK_MS,
  dotsAdvisedAt,
  glyphFrame,
  glyphStyle,
  restingFrame,
  sharedClock,
  toMask,
  type CellFrame,
  type Fill,
  type GlyphStyle,
  type Mask,
  type MaskInput,
  type MaskMode,
  type Variant,
} from '@glyphy/core';
import { type DotsSetting, useGlyphTheme } from './context.js';

const NOOP = (): void => undefined;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function mediaQuery(query: string): MediaQueryList | undefined {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
  return window.matchMedia(query);
}

/** Drop the keys whose value is `undefined`, so a spread does not erase a default. */
function omitUndefined<T extends object>(source: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

/**
 * Whether the reader has asked their system for reduced motion.
 *
 * Returns `false` during server rendering and on platforms with no media
 * query support, which is the safe answer: motion is the documented default,
 * and the first client render corrects it.
 */
export function useReducedMotion(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const list = mediaQuery(REDUCED_MOTION_QUERY);
    if (list === undefined) return NOOP;
    list.addEventListener('change', onChange);
    return () => {
      list.removeEventListener('change', onChange);
    };
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => mediaQuery(REDUCED_MOTION_QUERY)?.matches ?? false,
    () => false,
  );
}

/** Options for {@link useGlyphTick}. */
export interface UseGlyphTickOptions {
  /** Hold the current frame. */
  readonly paused?: boolean;
  /** Clock period in milliseconds. Marks sharing a period share a clock. */
  readonly tickMs?: number;
}

/**
 * The current frame number.
 *
 * Every mark on the page with the same period reads the same counter, which is
 * what lets a staggered row read as one ring travelling across it.
 */
export function useGlyphTick(options: UseGlyphTickOptions = {}): number {
  const theme = useGlyphTheme();
  const paused = options.paused ?? theme.paused ?? false;
  const period = options.tickMs ?? theme.tickMs ?? TICK_MS;

  const clock = useMemo(() => sharedClock(period), [period]);
  const held = useRef(clock.tick);

  const subscribe = useCallback(
    (onChange: () => void) => (paused ? NOOP : clock.subscribe(onChange)),
    [clock, paused],
  );

  const snapshot = useCallback(() => {
    if (paused) return held.current;
    held.current = clock.tick;
    return clock.tick;
  }, [clock, paused]);

  return useSyncExternalStore(subscribe, snapshot, () => 0);
}

/** Everything that describes a mark, before it is rendered. */
export interface UseGlyphOptions {
  /** What the mark is doing. Defaults to `idle`. */
  readonly variant?: Variant;
  /** Box size in pixels. */
  readonly size?: number;
  /** Ring and dot colour. */
  readonly ink?: string;
  /** Outline or wash. */
  readonly fill?: Fill;
  /** Bare dot visibility. `auto` follows the scale ramp. */
  readonly dots?: DotsSetting;
  /** A nine-bit mask or a sanctioned pattern name. */
  readonly mask?: MaskInput;
  /** How the mask interacts with the variant. */
  readonly maskMode?: MaskMode;
  /** Steps to offset this mark from the shared clock. */
  readonly phase?: number;
  /** Hold the current frame. */
  readonly paused?: boolean;
  /** Drive the mark yourself. Overrides the shared clock entirely. */
  readonly tick?: number;
  /** Clock period in milliseconds. */
  readonly tickMs?: number;
  /** Fall back to a still under reduced motion. Defaults to `true`. */
  readonly respectReducedMotion?: boolean;
}

/** The shape of {@link GLYPH_DEFAULTS}. Every field is resolved, none optional. */
export interface GlyphDefaults {
  readonly variant: Variant;
  readonly size: number;
  readonly fill: Fill;
  readonly dots: DotsSetting;
  readonly maskMode: MaskMode;
  readonly phase: number;
  readonly paused: boolean;
  readonly tickMs: number;
  readonly respectReducedMotion: boolean;
}

/** What every mark falls back to when neither prop nor provider says. */
export const GLYPH_DEFAULTS: GlyphDefaults = Object.freeze({
  variant: 'idle',
  size: DEFAULT_SIZE,
  fill: 'stroke',
  dots: true,
  maskMode: 'auto',
  phase: 0,
  paused: false,
  tickMs: TICK_MS,
  respectReducedMotion: true,
});

/** What {@link useGlyph} hands back. */
export interface UseGlyphResult {
  /** Styles for the grid and the nine cells. */
  readonly style: GlyphStyle;
  /** The nine frames behind those styles. */
  readonly frames: readonly CellFrame[];
  /** The frame number used, including any phase offset. */
  readonly tick: number;
  /** Whether the mark is showing its reduced-motion still. */
  readonly still: boolean;
  /** The resolved mask, if the variant or mask mode uses one. */
  readonly mask: Mask | undefined;
}

/**
 * The headless mark.
 *
 * Resolves theme, clock, reduced motion and pattern into a set of styles.
 * `<Glyph>` is a thin wrapper over this; reach for the hook when you want a
 * different element tree, a canvas, or to hand the frames to another engine.
 */
export function useGlyph(options: UseGlyphOptions = {}): UseGlyphResult {
  const theme = useGlyphTheme();

  const settings = {
    ...GLYPH_DEFAULTS,
    ...omitUndefined(theme),
    ...omitUndefined(options),
  };

  const { variant, size, ink, fill, maskMode, phase } = settings;
  const dots = settings.dots === 'auto' ? dotsAdvisedAt(size) : settings.dots;

  const mask = useMemo<Mask | undefined>(() => {
    // `mask` is meaningless without a pattern, so it falls back to the kit's
    // own default rather than rendering an empty lattice.
    if (settings.mask === undefined) return variant === 'mask' ? DEFAULT_MASK : undefined;
    return toMask(settings.mask, PATTERNS.full);
  }, [settings.mask, variant]);

  const reduced = useReducedMotion();
  const still = settings.respectReducedMotion && reduced;

  const clockTick = useGlyphTick({ paused: settings.paused, tickMs: settings.tickMs });
  const tick = (settings.tick ?? clockTick) + phase;

  const frames = useMemo<readonly CellFrame[]>(
    () =>
      still
        ? restingFrame(variant, { mask, maskMode })
        : glyphFrame(variant, tick, { mask, maskMode }),
    [still, variant, tick, mask, maskMode],
  );

  const style = useMemo<GlyphStyle>(
    () => glyphStyle({ size, ink, fill, dots, frames }),
    [size, ink, fill, dots, frames],
  );

  return { style, frames, tick, still, mask };
}
