/**
 * Frames to Motion transitions.
 *
 * The kit specifies its motion as CSS: two tween durations and one cubic
 * bezier, or a 50ms linear cut. Motion can reproduce that exactly, and it can
 * also do things CSS cannot. Both are offered, and which one is right depends
 * on whether you want the kit's mark or a mark that behaves like the rest of
 * your Motion-driven interface.
 */

import { EASE_OPACITY_MS, EASE_TRANSFORM_MS, SNAP_MS, type CellFrame } from '@glyphy/core';
import { type Transition } from 'motion/react';

/**
 * Which timing model to use.
 *
 * `faithful` matches the kit's CSS to the millisecond. `spring` swaps the
 * eased tween for a spring, which reads softer and settles at its own pace.
 */
export type GlyphMotionPreset = 'faithful' | 'spring';

/** The kit's easing curve, as Motion's bezier array. */
export const GLYPHY_BEZIER: readonly number[] = Object.freeze([0.4, 0, 0.2, 1]);

/** Milliseconds to the seconds Motion expects. */
function seconds(ms: number): number {
  return ms / 1000;
}

/** The hard cut. Identical under both presets: a snap that springs is not a snap. */
function cut(): Transition {
  return { duration: seconds(SNAP_MS), ease: 'linear' };
}

/**
 * The kit's CSS, expressed as a Motion transition.
 *
 * Opacity and transform get different durations — 300ms and 340ms — which is
 * what gives the ring its slight lag behind its own fade. Motion takes
 * per-property transitions, so that difference survives the port rather than
 * being averaged away.
 */
export function faithfulTransition(frame: CellFrame): Transition {
  if (frame.snap) return cut();
  return {
    opacity: { duration: seconds(EASE_OPACITY_MS), ease: GLYPHY_BEZIER },
    scale: { duration: seconds(EASE_TRANSFORM_MS), ease: GLYPHY_BEZIER },
  };
}

/**
 * A spring instead of the eased tween.
 *
 * Tuned to settle in roughly the 340ms the tween takes, so a mark can be
 * swapped between presets without the surrounding layout timing changing.
 * `restDelta` is tight because the ring is small: a wobble that would be
 * invisible on a card is visible on a 31px circle.
 */
export function springTransition(frame: CellFrame): Transition {
  if (frame.snap) return cut();
  return { type: 'spring', stiffness: 420, damping: 32, mass: 0.9, restDelta: 0.001 };
}

/** The transition for a frame under the given preset. */
export function transitionFor(
  frame: CellFrame,
  preset: GlyphMotionPreset = 'faithful',
): Transition {
  return preset === 'spring' ? springTransition(frame) : faithfulTransition(frame);
}
