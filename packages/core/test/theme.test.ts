import { describe, expect, it } from 'vitest';
import {
  COLORS,
  CSS_VARIABLES,
  RESERVED_COLORS,
  TINT_ALPHA_HEX,
  isColorName,
  resolveColor,
  softOf,
  tintOf,
} from '@glyphy/core';

/** Relative luminance, per WCAG. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);
  const linear = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

/** Contrast ratio between two six-digit hex colours. */
function contrast(one: string, other: string): number {
  const [lighter = 0, darker = 0] = [luminance(one), luminance(other)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/** CIE L*a*b*, for asking whether two colours read as the same colour. */
function lab(hex: string): readonly [number, number, number] {
  const [red = 0, green = 0, blue = 0] = [1, 3, 5]
    .map((at) => parseInt(hex.slice(at, at + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const x = (red * 0.4124 + green * 0.3576 + blue * 0.1805) / 0.95047;
  const y = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  const z = (red * 0.0193 + green * 0.1192 + blue * 0.9505) / 1.08883;
  const f = (t: number): number => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

/** Perceptual distance. Under about 10 and two colours are the same idea. */
function distance(one: string, other: string): number {
  const [l1, a1, b1] = lab(one);
  const [l2, a2, b2] = lab(other);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

describe('the palette', () => {
  it('names every colour in six-digit hex, so the tint can be a suffix', () => {
    for (const [name, value] of Object.entries(COLORS)) {
      expect(value, `${name} is not six-digit hex`).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('reserves the accent and the error, and nothing else', () => {
    expect([...RESERVED_COLORS]).toEqual(['accent', 'error']);
    for (const name of RESERVED_COLORS) expect(COLORS[name]).toBeDefined();
  });

  it('keeps the error far enough from the accent to be a different colour', () => {
    // The accent and its own hover are 13 apart. The error has to be further
    // from the accent than that, or a reader sees a hovered accent.
    const ownHover = distance(COLORS.accent, COLORS.accentHover);
    expect(distance(COLORS.error, COLORS.accent)).toBeGreaterThan(ownHover + 5);
  });

  it('pairs each reserved colour with a hover a readable step darker', () => {
    for (const [base, hover] of [
      [COLORS.accent, COLORS.accentHover],
      [COLORS.error, COLORS.errorHover],
    ] as const) {
      expect(luminance(hover)).toBeLessThan(luminance(base));
      expect(distance(base, hover)).toBeGreaterThan(10);
    }
  });

  it('carries the error on both papers, as the kit uses one value for both', () => {
    expect(contrast(COLORS.error, COLORS.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(COLORS.error, COLORS.night)).toBeGreaterThanOrEqual(3);
  });

  it('holds the error to the accent on the dark surface, where accents are weakest', () => {
    expect(contrast(COLORS.error, COLORS.night)).toBeGreaterThanOrEqual(
      contrast(COLORS.accent, COLORS.night) * 0.9,
    );
  });
});

describe('naming a colour', () => {
  it('recognises the palette and nothing else', () => {
    expect(isColorName('error')).toBe(true);
    expect(isColorName('accent')).toBe(true);
    expect(isColorName('crimson')).toBe(false);
    expect(isColorName(undefined)).toBe(false);
  });

  it('resolves a palette name to its hex', () => {
    expect(resolveColor('error')).toBe(COLORS.error);
    expect(resolveColor('ink')).toBe(COLORS.ink);
  });

  it('hands anything else back untouched, so CSS still works', () => {
    expect(resolveColor('#c62f2a')).toBe('#c62f2a');
    expect(resolveColor('var(--brand)')).toBe('var(--brand)');
    expect(resolveColor('rebeccapurple')).toBe('rebeccapurple');
  });

  it('tints a palette name as readily as a hex', () => {
    expect(tintOf('error')).toBe(`${COLORS.error}${TINT_ALPHA_HEX}`);
  });
});

describe('the reserved tiers', () => {
  it('gives each reserved colour a hover, a contrast and a wash — and no ramp', () => {
    for (const name of RESERVED_COLORS) {
      expect(COLORS[`${name}Hover`]).toBeDefined();
      expect(COLORS[`${name}Contrast`]).toBeDefined();
      expect(softOf(name)).toBe(`${COLORS[name]}${TINT_ALPHA_HEX}`);
    }
    // A numeric step would invite the reserved colours to be spent on
    // decoration, which is the one thing they are not for.
    expect(Object.keys(COLORS).some((name) => /\d/.test(name))).toBe(false);
  });

  it('draws the contrast ink legibly on the colour it is named for', () => {
    for (const name of RESERVED_COLORS) {
      expect(contrast(COLORS[`${name}Contrast`], COLORS[name])).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('washes at the same strength as the tint fill, never a second alpha', () => {
    for (const name of RESERVED_COLORS) {
      expect(softOf(name)).toBe(tintOf(COLORS[name]));
    }
  });
});

describe('the custom properties', () => {
  it('emits one per colour, one wash per reserved colour, and the easing curve', () => {
    expect(Object.keys(CSS_VARIABLES)).toHaveLength(
      Object.keys(COLORS).length + RESERVED_COLORS.length + 1,
    );
  });

  it('spells the error out under its own name, at every tier', () => {
    expect(CSS_VARIABLES['--glyphy-error']).toBe(COLORS.error);
    expect(CSS_VARIABLES['--glyphy-error-hover']).toBe(COLORS.errorHover);
    expect(CSS_VARIABLES['--glyphy-error-contrast']).toBe(COLORS.errorContrast);
    expect(CSS_VARIABLES['--glyphy-error-soft']).toBe(softOf('error'));
  });
});
