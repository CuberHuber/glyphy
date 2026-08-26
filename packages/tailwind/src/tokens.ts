/**
 * Design tokens, in a shape a style system can eat.
 *
 * Everything here is derived from `@glyphy/core` rather than retyped, so the
 * durations a Tailwind user writes in a class name and the durations the mark
 * actually animates at cannot drift apart.
 */

import {
  COLORS,
  CSS_VARIABLES,
  DEFAULT_SIZE,
  EASE,
  EASE_OPACITY_MS,
  EASE_TRANSFORM_MS,
  MOTION_VARIANTS,
  SNAP_MS,
  TICK_MS,
  softOf,
  stepDuration,
} from '@glyphy/core';

/**
 * The kit's palette, keyed as Tailwind colour names.
 *
 * Every colour core names, plus the wash tier for each reserved colour. The
 * wash is derived rather than retyped, so `bg-glyphy-error-soft` and a ring
 * drawn with `fill="tint"` cannot end up at two different strengths.
 *
 * The keys are written out rather than spread in from `RESERVED_COLORS`, so
 * the object keeps its literal key type: `glyphyColors.acent` stays a compile
 * error and an editor still completes the token names. That a reserved colour
 * without a wash is a mistake is a job for the test that walks
 * `RESERVED_COLORS`, not for a spread that costs every consumer its checking.
 */
export const glyphyColors = Object.freeze({
  paper: COLORS.paper,
  surface: COLORS.surface,
  ink: COLORS.ink,
  'ink-inverse': COLORS.inkInverse,
  night: COLORS.night,
  accent: COLORS.accent,
  'accent-hover': COLORS.accentHover,
  'accent-contrast': COLORS.accentContrast,
  error: COLORS.error,
  'error-hover': COLORS.errorHover,
  'error-contrast': COLORS.errorContrast,
  slate: COLORS.slate,
  'accent-soft': softOf('accent'),
  'error-soft': softOf('error'),
});

/**
 * The durations the kit actually animates at.
 *
 * The per-variant entries are one step of that variant — the interval between
 * two frames of the mark — computed from core's timing table. Writing
 * `duration-glyph-travel` on a sibling element therefore keeps it in step with
 * the mark rather than merely close to it.
 */
export const glyphyDurations: Readonly<Record<string, string>> = Object.freeze({
  'glyph-tick': `${TICK_MS}ms`,
  // Named `cut`, not `snap`: the `snap` variant has a step of its own below,
  // and one key cannot mean both the hard cut and the state that uses it.
  'glyph-cut': `${SNAP_MS}ms`,
  'glyph-opacity': `${EASE_OPACITY_MS}ms`,
  'glyph-transform': `${EASE_TRANSFORM_MS}ms`,
  ...Object.fromEntries(
    MOTION_VARIANTS.map((variant) => [`glyph-${variant}`, `${stepDuration(variant)}ms`]),
  ),
});

/** The one curve the kit eases on. */
export const glyphyEasing = Object.freeze({ glyphy: EASE });

/**
 * The scale ramp, as named sizes.
 *
 * Keyed `glyph-<px>`, so `w-glyph-96` is a mark-sized box. These are the sizes
 * the kit's ramp is drawn at; anything between them works too, but these are
 * the ones that have been looked at.
 */
export const glyphySizes: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    [16, 24, 32, 48, 96, DEFAULT_SIZE, 160].map((size) => [`glyph-${size}`, `${size}px`]),
  ),
);

/** The whole set, shaped for a Tailwind `theme.extend`. */
export const glyphyTheme = Object.freeze({
  colors: { glyphy: glyphyColors },
  transitionTimingFunction: glyphyEasing,
  transitionDuration: glyphyDurations,
  spacing: glyphySizes,
});

/**
 * Every token as a block of CSS custom property declarations.
 *
 * For projects with no Tailwind at all: drop the result inside a `:root { }`
 * in a stylesheet, or hand it to a `<style>` tag. `<GlyphProvider cssVariables>`
 * does the same job from React, and is usually the easier door.
 */
export function cssVariableBlock(): string {
  const durations = Object.entries(glyphyDurations).map(
    ([name, value]) => [`--glyphy-duration-${name.replace('glyph-', '')}`, value] as const,
  );
  const sizes = Object.entries(glyphySizes).map(
    ([name, value]) => [`--glyphy-size-${name.replace('glyph-', '')}`, value] as const,
  );
  return [...Object.entries(CSS_VARIABLES), ...durations, ...sizes]
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n');
}
