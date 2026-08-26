/**
 * The style provider.
 *
 * A mark reads its ink, fill and dot visibility from context so a screen can
 * set them once. Anything passed to a single `<Glyph>` still wins, and a mark
 * outside any provider falls back to the kit's own defaults — the provider is
 * a convenience, never a requirement.
 */

import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react';
import { CSS_VARIABLES, type Fill, type MaskMode, TICK_MS, type Style } from '@glyphy/core';

/** Whether bare dots are drawn. `auto` follows the scale ramp. */
export type DotsSetting = boolean | 'auto';

/** Defaults every mark below the provider inherits. */
export interface GlyphTheme {
  /** Ring and dot colour. */
  readonly ink?: string;
  /** Outline or wash. */
  readonly fill?: Fill;
  /** Bare dot visibility. */
  readonly dots?: DotsSetting;
  /** Box size in pixels. */
  readonly size?: number;
  /** Clock period in milliseconds. Marks sharing a period share a clock. */
  readonly tickMs?: number;
  /** How a fill pattern interacts with the variant. */
  readonly maskMode?: MaskMode;
  /** Whether to fall back to a still when the reader asks for reduced motion. */
  readonly respectReducedMotion?: boolean;
  /** Freeze every mark below this provider. */
  readonly paused?: boolean;
}

/** The theme in force when no provider has set one. */
export const DEFAULT_THEME: Required<
  Pick<GlyphTheme, 'tickMs' | 'maskMode' | 'respectReducedMotion' | 'paused'>
> = Object.freeze({
  tickMs: TICK_MS,
  maskMode: 'auto',
  respectReducedMotion: true,
  paused: false,
});

const GlyphContext = createContext<GlyphTheme | undefined>(undefined);

/** The theme from the nearest provider, merged over the kit's defaults. */
export function useGlyphTheme(): GlyphTheme {
  return useContext(GlyphContext) ?? DEFAULT_THEME;
}

/** Props for {@link GlyphProvider}. */
export interface GlyphProviderProps {
  /** Defaults for every mark below. Merged over an enclosing provider's theme. */
  readonly theme?: GlyphTheme;
  /**
   * Emit the kit's design tokens as CSS custom properties on the wrapper.
   * Off by default: a provider should not force an element into the tree
   * unless it has something to put on it.
   */
  readonly cssVariables?: boolean;
  /** Element to render when {@link cssVariables} is on. Defaults to `div`. */
  readonly as?: ElementType;
  /** Class for that element. */
  readonly className?: string;
  /** Extra styles for that element. */
  readonly style?: Style;
  readonly children?: ReactNode;
}

/**
 * Sets the defaults for the marks below it.
 *
 * Providers nest: an inner one only has to name what it changes.
 */
export function GlyphProvider(props: GlyphProviderProps): ReactElement {
  const { theme, cssVariables = false, as = 'div', className, style, children } = props;
  const inherited = useContext(GlyphContext);

  const merged = useMemo<GlyphTheme>(
    () => ({ ...DEFAULT_THEME, ...inherited, ...theme }),
    [inherited, theme],
  );

  const body = cssVariables
    ? createElement(
        as,
        {
          className,
          style: { ...CSS_VARIABLES, ...style },
          'data-glyphy-provider': '',
        },
        children,
      )
    : children;

  return createElement(GlyphContext.Provider, { value: merged }, body);
}
