/**
 * Design tokens.
 *
 * Two inks, two papers, and two reserved colours that must never be confused
 * for one another: the accent marks the live step of a flow, the error marks a
 * state that has failed. They were one token until the palette was split,
 * which meant a page could not show a step in progress and a step that broke
 * on the same screen. One accented thing per screen still holds, and an error
 * does not count against that budget — it is not decoration.
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
  /** Terracotta. The live step of a flow, and nothing else. */
  accent: '#b5522f',
  /** Accent under the pointer. */
  accentHover: '#8f3f22',
  /** What is legible drawn *on* the accent: 4.58:1, above the floor for text. */
  accentContrast: '#f7f5f0',
  /** Vermilion. The failed state, and nothing else. */
  error: '#c62f2a',
  /** Error under the pointer. */
  errorHover: '#a12622',
  /** What is legible drawn *on* the error: 5.02:1. */
  errorContrast: '#f7f5f0',
  /** The optional third ink. */
  slate: '#3a4a52',
} as const);

/** A named colour. */
export type ColorName = keyof typeof COLORS;

/**
 * Colours the kit reserves — each one means a single thing and is never spent
 * on emphasis. Ordered as the palette reads them: what is happening, then what
 * went wrong.
 *
 * Each has three more names beside it and no numeric ramp: `<name>Hover` is the
 * pointer state, `<name>Contrast` is what is drawn on top of it, and
 * `--glyphy-<name>-soft` is the same eighteen percent the `tint` fill uses. A
 * ramp would invite `error-300` to be spent on decoration, which is the one
 * thing these two colours are not for.
 */
export const RESERVED_COLORS = Object.freeze(['accent', 'error'] as const);

/** A reserved colour's name. */
export type ReservedColorName = (typeof RESERVED_COLORS)[number];

/**
 * Whether a value names a colour in the palette.
 *
 * Own keys only: `in` would also answer yes to everything on
 * `Object.prototype`, which would send `resolveColor('toString')` back with a
 * function where the signature promises a string.
 */
export function isColorName(value: unknown): value is ColorName {
  return typeof value === 'string' && Object.hasOwn(COLORS, value);
}

/**
 * A colour, given either as a palette name or as CSS.
 *
 * A palette name resolves to its hex; everything else is handed back
 * untouched, so `ink="error"`, `ink="#c62f2a"` and `ink="var(--brand)"` are
 * all valid and only the first is the kit's business.
 */
export function resolveColor(value: string): string {
  return isColorName(value) ? COLORS[value] : value;
}

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
  const resolved = resolveColor(ink);
  return /^#[0-9a-f]{6}$/i.test(resolved)
    ? `${resolved}${TINT_ALPHA_HEX}`
    : `color-mix(in srgb, ${resolved} 18%, transparent)`;
}

/**
 * The reserved colour at wash strength, under the name the stylesheet uses.
 *
 * Derived rather than authored, and derived through {@link tintOf}, so a soft
 * surface and a tinted ring are provably the same weight instead of being two
 * numbers that happen to agree today.
 */
export function softOf(name: ReservedColorName): string {
  return tintOf(COLORS[name]);
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
  '--glyphy-accent-contrast': COLORS.accentContrast,
  '--glyphy-accent-soft': softOf('accent'),
  '--glyphy-error': COLORS.error,
  '--glyphy-error-hover': COLORS.errorHover,
  '--glyphy-error-contrast': COLORS.errorContrast,
  '--glyphy-error-soft': softOf('error'),
  '--glyphy-slate': COLORS.slate,
  '--glyphy-ease': EASE,
} as const);
