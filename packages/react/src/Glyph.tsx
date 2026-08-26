/**
 * The mark.
 *
 * Nine cells, each a bare dot with a ring over it. The ring is a CSS border
 * with an irregular radius, so the mark stays crisp at any size and the
 * hand-drawn wobble costs nothing. No SVG, no sprite sheet.
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { useGlyph, type UseGlyphOptions } from './hooks.js';

/** Props for {@link Glyph}. */
export interface GlyphProps
  extends UseGlyphOptions, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color'> {
  /**
   * What the mark means, for assistive technology. Without one the mark is
   * treated as decoration and hidden — which is right for a mark sitting
   * beside its own label, and wrong for one standing alone.
   */
  readonly label?: string;
  /**
   * Announce changes to `label` politely. Use for a mark that stands in for
   * progress, so a screen reader hears "saved" when the state lands.
   */
  readonly live?: boolean;
}

/**
 * The Glyphy mark.
 *
 * @example
 * ```tsx
 * <Glyph variant="travel" size={96} label="Loading" />
 * ```
 */
export const Glyph = forwardRef<HTMLDivElement, GlyphProps>(function Glyph(props, ref) {
  const {
    variant,
    size,
    ink,
    fill,
    dots,
    mask,
    maskMode,
    phase,
    paused,
    tick,
    tickMs,
    respectReducedMotion,
    label,
    live = false,
    style: styleOverride,
    ...rest
  } = props;

  const glyph = useGlyph({
    variant,
    size,
    ink,
    fill,
    dots,
    mask,
    maskMode,
    phase,
    paused,
    tick,
    tickMs,
    respectReducedMotion,
  });

  const semantics =
    label === undefined
      ? ({ 'aria-hidden': true } as const)
      : ({
          role: 'img',
          'aria-label': label,
          ...(live ? { 'aria-live': 'polite' as const } : {}),
        } as const);

  return (
    <div
      {...rest}
      {...semantics}
      ref={ref}
      data-glyphy=""
      data-glyphy-variant={variant ?? 'idle'}
      data-glyphy-still={glyph.still ? '' : undefined}
      style={{ ...glyph.style.grid, ...styleOverride }}
    >
      {glyph.style.cells.map((styles, cell) => (
        <div key={cell} data-glyphy-cell={cell} style={styles.wrapper}>
          <div data-glyphy-ring="" style={styles.ring} />
          <div data-glyphy-dot="" style={styles.dot} />
        </div>
      ))}
    </div>
  );
});
