/**
 * Design tokens.
 *
 * Two inks, two papers, one accent. The accent is reserved: the error state
 * and the active step of a flow, nothing else. One accented thing per screen.
 */

/** Every colour the kit names. */
export const COLORS = Object.freeze({
  /** Page background, light surface. */
  paper: '#efece4',
  /** Card background, one step up from the paper. */
  surface: '#f7f5f0',
  /** Body ink on light surfaces. */
  ink: '#1c1a17',
  /** Ink on dark surfaces. */
  inkInverse: '#efece4',
  /** Card background, dark surface. */
  night: '#191816',
  /** Terracotta. Error, and the active step. Nothing else. */
  accent: '#b5522f',
  /** Accent under the pointer. */
  accentHover: '#8f3f22',
  /** The optional third ink. */
  slate: '#3a4a52',
} as const);

/** A named colour. */
export type ColorName = keyof typeof COLORS;

/** How the ring is drawn. */
export const FILLS = Object.freeze(['stroke', 'tint'] as const);

/** Ring treatment: an outline, or a flat wash at {@link TINT_ALPHA}. */
export type Fill = (typeof FILLS)[number];

/**
 * Alpha of the tint fill. `0x2e` of 255 — the "18% ink" the kit specifies,
 * written as a hex suffix so it can be appended to a six-digit ink directly.
 */
export const TINT_ALPHA_HEX = '2e';

/** The same alpha as a fraction, for engines that want a number. */
export const TINT_ALPHA = 0x2e / 0xff;

/** Easing for every state that is not `snap`. */
export const EASE = 'cubic-bezier(.4,0,.2,1)';

/** Opacity transition for eased states, in milliseconds. */
export const EASE_OPACITY_MS = 300;

/** Transform transition for eased states, in milliseconds. */
export const EASE_TRANSFORM_MS = 340;

/** Transition for snapping states. Short enough to read as a cut. */
export const SNAP_MS = 50;

/** Whether a value names a fill. */
export function isFill(value: unknown): value is Fill {
  return typeof value === 'string' && (FILLS as readonly string[]).includes(value);
}

/**
 * The ink at tint strength.
 *
 * Six-digit hex gets the hex-suffix treatment the kit specifies, which is
 * exact and cheap. Anything else — a named colour, a CSS variable, `oklch()` —
 * falls back to `color-mix`, so the kit works with a design system's own
 * tokens rather than demanding hex.
 */
export function tintOf(ink: string): string {
  return /^#[0-9a-f]{6}$/i.test(ink)
    ? `${ink}${TINT_ALPHA_HEX}`
    : `color-mix(in srgb, ${ink} 18%, transparent)`;
}

/** Every token as a CSS custom property, for the style provider to emit. */
export const CSS_VARIABLES = Object.freeze({
  '--glyphy-paper': COLORS.paper,
  '--glyphy-surface': COLORS.surface,
  '--glyphy-ink': COLORS.ink,
  '--glyphy-ink-inverse': COLORS.inkInverse,
  '--glyphy-night': COLORS.night,
  '--glyphy-accent': COLORS.accent,
  '--glyphy-accent-hover': COLORS.accentHover,
  '--glyphy-slate': COLORS.slate,
  '--glyphy-ease': EASE,
} as const);
