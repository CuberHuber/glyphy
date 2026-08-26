import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COLORS, EASE, MOTION_VARIANTS, RESERVED_COLORS, softOf, stepDuration } from '@glyphy/core';
import {
  HAIRLINE,
  cssVariableBlock,
  glyphyColors,
  glyphyDurations,
  glyphyEasing,
  glyphyPlugin,
  glyphyPreset,
  glyphySizes,
  glyphyTheme,
  rootVariables,
  type CssRules,
} from '@glyphy/tailwind';

// Read from the workspace root, which is where vitest is rooted. The jsdom
// environment does not give this module a file: URL to resolve against.
const stylesheet = readFileSync(resolve('packages/tailwind/glyphy.css'), 'utf8');

/** The value of a custom property declared anywhere in the stylesheet. */
function declared(name: string): string | undefined {
  return new RegExp(`${name}:\\s*([^;]+);`).exec(stylesheet)?.[1]?.trim();
}

describe('the colour tokens', () => {
  it('is the kit palette, renamed for Tailwind', () => {
    expect(glyphyColors.ink).toBe(COLORS.ink);
    expect(glyphyColors['ink-inverse']).toBe(COLORS.inkInverse);
    expect(glyphyColors['accent-hover']).toBe(COLORS.accentHover);
  });

  it('covers every colour core defines, plus a wash per reserved colour', () => {
    expect(Object.keys(glyphyColors)).toHaveLength(
      Object.keys(COLORS).length + RESERVED_COLORS.length,
    );
  });

  it('derives each wash rather than retyping it, so it matches the tint fill', () => {
    for (const name of RESERVED_COLORS) {
      expect(glyphyColors[`${name}-soft`]).toBe(softOf(name));
    }
  });

  it('keeps the accent and the error apart, as two tokens with two jobs', () => {
    expect(glyphyColors.accent).toBe(COLORS.accent);
    expect(glyphyColors.error).toBe(COLORS.error);
    expect(glyphyColors['error-hover']).toBe(COLORS.errorHover);
    expect(glyphyColors.error).not.toBe(glyphyColors.accent);
  });
});

describe('the duration tokens', () => {
  it('derives each motion state from core rather than retyping it', () => {
    for (const variant of MOTION_VARIANTS) {
      expect(glyphyDurations[`glyph-${variant}`]).toBe(`${stepDuration(variant)}ms`);
    }
  });

  it('prints the numbers the kit puts on its cards', () => {
    expect(glyphyDurations['glyph-travel']).toBe('210ms');
    expect(glyphyDurations['glyph-accumulate']).toBe('280ms');
    expect(glyphyDurations['glyph-thinking']).toBe('350ms');
  });

  it('keeps the hard cut distinct from the snap state, which is longer', () => {
    expect(glyphyDurations['glyph-cut']).toBe('50ms');
    expect(glyphyDurations['glyph-snap']).toBe('280ms');
  });

  it('eases on the one curve the kit uses', () => {
    expect(glyphyEasing.glyphy).toBe(EASE);
  });
});

describe('the size tokens', () => {
  it('names the rungs of the scale ramp', () => {
    expect(glyphySizes['glyph-16']).toBe('16px');
    expect(glyphySizes['glyph-96']).toBe('96px');
    expect(glyphySizes['glyph-120']).toBe('120px');
  });
});

describe('the v4 stylesheet', () => {
  it('declares the same colours as the theme', () => {
    for (const [name, value] of Object.entries(glyphyColors)) {
      expect(declared(`--color-glyphy-${name}`)).toBe(value);
    }
  });

  it('declares the same durations as the theme', () => {
    for (const [name, value] of Object.entries(glyphyDurations)) {
      expect(declared(`--duration-${name}`)).toBe(value);
    }
  });

  it('declares the same sizes as the theme', () => {
    for (const [name, value] of Object.entries(glyphySizes)) {
      expect(declared(`--spacing-${name}`)).toBe(value);
    }
  });

  it('repeats the tokens under the names the React provider emits', () => {
    expect(declared('--glyphy-ink')).toBe(COLORS.ink);
    expect(declared('--glyphy-accent')).toBe(COLORS.accent);
    expect(declared('--glyphy-error')).toBe(COLORS.error);
    expect(declared('--glyphy-error-hover')).toBe(COLORS.errorHover);
  });

  it('carries a class for each reserved colour, so neither is spelled the other', () => {
    for (const rule of ['.glyphy-accent', '.glyphy-error']) {
      expect(stylesheet).toContain(rule);
    }
  });

  it('carries the three surfaces, so it works without Tailwind', () => {
    for (const rule of ['.glyphy-surface', '.glyphy-surface-dark', '.glyphy-card']) {
      expect(stylesheet).toContain(rule);
    }
  });

  it('tells v3 users where to go instead', () => {
    expect(stylesheet).toContain('glyphyPreset');
  });
});

describe('the plugin', () => {
  function run(): { base: CssRules; components: CssRules; utilities: CssRules } {
    const collected: { base: CssRules; components: CssRules; utilities: CssRules } = {
      base: {},
      components: {},
      utilities: {},
    };
    glyphyPlugin.handler({
      addBase: (rules) => Object.assign(collected.base, rules),
      addComponents: (rules) => Object.assign(collected.components, rules),
      addUtilities: (rules) => Object.assign(collected.utilities, rules),
    });
    return collected;
  }

  it('puts the custom properties on the root', () => {
    expect(run().base[':root']?.['--glyphy-ink']).toBe(COLORS.ink);
  });

  it('adds the three surfaces the kit page uses', () => {
    const { components } = run();
    expect(components['.glyphy-surface']?.backgroundColor).toBe(COLORS.paper);
    expect(components['.glyphy-surface-dark']?.backgroundColor).toBe(COLORS.night);
    expect(components['.glyphy-card']?.border).toBe(`1px solid ${HAIRLINE}`);
  });

  it('draws the card hairline lighter than the ring wash', () => {
    expect(HAIRLINE).toBe('#1c1a171a');
  });

  it('adds the ink utilities and the tint', () => {
    const { utilities } = run();
    expect(utilities['.glyphy-accent']?.color).toBe(COLORS.accent);
    expect(utilities['.glyphy-error']?.color).toBe(COLORS.error);
    expect(utilities['.glyphy-tint']?.backgroundColor).toBe('#1c1a172e');
  });

  it('needs no tailwind import to exist', () => {
    expect(typeof glyphyPlugin.handler).toBe('function');
    expect(glyphyPlugin.config).toEqual({ theme: { extend: glyphyTheme } });
  });

  it('exposes the root variables on their own too', () => {
    expect(rootVariables()['--glyphy-ease']).toBe(EASE);
  });
});

describe('the preset', () => {
  it('carries the theme and the plugin', () => {
    expect(glyphyPreset.theme.extend).toBe(glyphyTheme);
    expect(glyphyPreset.plugins).toContain(glyphyPlugin);
  });
});

describe('the no-Tailwind door', () => {
  it('emits every token as a declaration', () => {
    const block = cssVariableBlock();
    expect(block).toContain(`--glyphy-ink: ${COLORS.ink};`);
    expect(block).toContain(`--glyphy-error: ${COLORS.error};`);
    expect(block).toContain('--glyphy-duration-travel: 210ms;');
    expect(block).toContain('--glyphy-size-96: 96px;');
  });

  it('is valid to drop straight into a rule', () => {
    for (const line of cssVariableBlock().split('\n')) {
      expect(line).toMatch(/^--[a-z0-9-]+: .+;$/);
    }
  });
});
