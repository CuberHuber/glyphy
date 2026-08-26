/**
 * Glyphy for Tailwind.
 *
 * A v3 preset, a v3 plugin, and the tokens behind both. Tailwind v4 users want
 * `@glyphy/tailwind/glyphy.css` instead — CSS cannot import TypeScript, so v4
 * gets its own stylesheet generated from the same numbers.
 *
 * @packageDocumentation
 */

import { glyphyPlugin, type TailwindPlugin } from './plugin.js';
import { glyphyTheme } from './tokens.js';

export {
  cssVariableBlock,
  glyphyColors,
  glyphyDurations,
  glyphyEasing,
  glyphySizes,
  glyphyTheme,
} from './tokens.js';

export {
  HAIRLINE,
  glyphyPlugin,
  rootVariables,
  type CssRules,
  type TailwindPlugin,
  type TailwindPluginApi,
} from './plugin.js';

/** A Tailwind v3 preset. */
export interface GlyphyPreset {
  theme: { extend: typeof glyphyTheme };
  plugins: TailwindPlugin[];
}

/**
 * The preset.
 *
 * @example
 * ```js
 * // tailwind.config.js
 * import { glyphyPreset } from '@glyphy/tailwind';
 * export default { presets: [glyphyPreset], content: ['./src/**\/*.tsx'] };
 * ```
 */
export const glyphyPreset: GlyphyPreset = {
  theme: { extend: glyphyTheme },
  plugins: [glyphyPlugin],
};

export default glyphyPreset;
