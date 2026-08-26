/**
 * The Tailwind v3 plugin.
 *
 * Tailwind is an optional peer dependency, so nothing here imports it — not
 * even for types. Tailwind accepts a plain `{ handler, config }` object in its
 * `plugins` array, and the handler API is small enough to describe
 * structurally. A project with no Tailwind can still import this module to get
 * at the tokens without the import throwing.
 */

import { COLORS, CSS_VARIABLES, tintOf } from '@glyphy/core';
import { glyphyTheme } from './tokens.js';

/**
 * The hairline the kit draws its card borders with: ink at ten percent.
 *
 * Lighter than {@link tintOf}, which is the eighteen percent wash a ring is
 * filled with. Two different jobs, two different alphas.
 */
export const HAIRLINE = `${COLORS.ink}1a`;

/** A bag of CSS declarations, as Tailwind passes them around. */
export type CssRules = Record<string, Record<string, string>>;

/** The slice of Tailwind's plugin API this plugin actually uses. */
export interface TailwindPluginApi {
  /** Declarations that belong at the base layer, before any component. */
  addBase(rules: CssRules): void;
  /** Multi-property classes a project composes with. */
  addComponents(rules: CssRules): void;
  /** Single-purpose classes. */
  addUtilities(rules: CssRules): void;
}

/** The plugin object shape Tailwind accepts directly in `plugins`. */
export interface TailwindPlugin {
  handler(api: TailwindPluginApi): void;
  config?: Record<string, unknown>;
}

/** The `--glyphy-*` custom properties, as a rule object. */
export function rootVariables(): Record<string, string> {
  return { ...CSS_VARIABLES };
}

/**
 * The kit's three surfaces and four ink utilities.
 *
 * Deliberately short. These are the classes the kit page itself needs; a
 * design system that wants more should extend the theme rather than expect
 * this plugin to grow.
 */
export const glyphyPlugin: TailwindPlugin = {
  handler(api: TailwindPluginApi): void {
    api.addBase({ ':root': rootVariables() });

    api.addComponents({
      '.glyphy-surface': {
        backgroundColor: COLORS.paper,
        color: COLORS.ink,
      },
      '.glyphy-surface-dark': {
        backgroundColor: COLORS.night,
        color: COLORS.inkInverse,
      },
      '.glyphy-card': {
        backgroundColor: COLORS.surface,
        border: `1px solid ${HAIRLINE}`,
        borderRadius: '6px',
      },
    });

    api.addUtilities({
      '.glyphy-ink': { color: COLORS.ink },
      '.glyphy-ink-inverse': { color: COLORS.inkInverse },
      '.glyphy-accent': { color: COLORS.accent },
      '.glyphy-tint': { backgroundColor: tintOf(COLORS.ink) },
    });
  },
  config: { theme: { extend: glyphyTheme } },
};
