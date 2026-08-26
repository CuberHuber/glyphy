/**
 * A row of marks sharing one clock.
 *
 * Each mark is offset a fixed number of steps from the last, so the ring
 * appears to travel across the whole row rather than inside each glyph. This
 * is the one sanctioned exception to "one moving glyph per screen": the row is
 * a single mark, spread out.
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { phaseFor } from '@glyphy/core';
import { Glyph, type GlyphProps } from './Glyph.js';

/** Props for {@link GlyphRow}. */
export interface GlyphRowProps
  extends
    Omit<GlyphProps, 'phase' | 'label' | 'live'>,
    Pick<HTMLAttributes<HTMLDivElement>, 'className'> {
  /** How many marks to draw. */
  readonly count: number;
  /** Steps between one mark and the next. Defaults to 2, as the kit specifies. */
  readonly stepsApart?: number;
  /** Gap between marks in pixels. Defaults to 22. */
  readonly gap?: number;
  /** What the row means, for assistive technology. */
  readonly label?: string;
}

/**
 * A phase-offset row.
 *
 * @example
 * ```tsx
 * <GlyphRow variant="travel" count={5} size={64} label="Syncing" />
 * ```
 */
export const GlyphRow = forwardRef<HTMLDivElement, GlyphRowProps>(function GlyphRow(props, ref) {
  const { count, stepsApart = 2, gap = 22, label, className, style, ...glyph } = props;

  return (
    <div
      ref={ref}
      className={className}
      data-glyphy-row=""
      {...(label === undefined
        ? { 'aria-hidden': true }
        : { role: 'img' as const, 'aria-label': label })}
      style={{ display: 'flex', gap, alignItems: 'center', flexWrap: 'wrap', ...style }}
    >
      {Array.from({ length: Math.max(0, count) }, (_, index) => (
        <Glyph key={index} {...glyph} phase={phaseFor(index, stepsApart)} />
      ))}
    </div>
  );
});
