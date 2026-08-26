/**
 * A tiling band.
 *
 * Patterns tile edge to edge with no gutter, so the bare dots of neighbouring
 * marks line up and read as one continuous lattice. Used as texture: hold it
 * at low opacity and never run it under body copy.
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { type MaskInput } from '@glyphy/core';
import { Glyph, type GlyphProps } from './Glyph.js';

/** Props for {@link GlyphLattice}. */
export interface GlyphLatticeProps
  extends
    Omit<GlyphProps, 'mask' | 'label' | 'live'>,
    Pick<HTMLAttributes<HTMLDivElement>, 'className'> {
  /** The patterns to tile, in order. Repeats to fill {@link count}. */
  readonly masks: readonly MaskInput[];
  /** How many tiles to draw. Defaults to the length of {@link masks}. */
  readonly count?: number;
  /** Minimum column width in pixels. Defaults to the mark size plus 10. */
  readonly columnWidth?: number;
  /** Accent every nth tile. The kit allows no more than one in twelve. */
  readonly accentEvery?: number;
  /** The accent ink. Only used when {@link accentEvery} is set. */
  readonly accentInk?: string;
}

/**
 * A gutterless band of patterns.
 *
 * @example
 * ```tsx
 * <GlyphLattice masks={['cross', 'saltire', 'seed']} count={16} size={48} />
 * ```
 */
export const GlyphLattice = forwardRef<HTMLDivElement, GlyphLatticeProps>(
  function GlyphLattice(props, ref) {
    const {
      masks,
      count = masks.length,
      columnWidth,
      accentEvery,
      accentInk,
      className,
      style,
      size = 48,
      ink,
      // Tiling patterns is the whole job, so the still pattern is the default
      // variant here — `idle` would ignore the masks it was handed.
      variant = 'mask',
      ...glyph
    } = props;

    const column = columnWidth ?? size + 10;

    return (
      <div
        ref={ref}
        className={className}
        aria-hidden
        data-glyphy-lattice=""
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill,minmax(${column}px,1fr))`,
          gap: 0,
          ...style,
        }}
      >
        {Array.from({ length: masks.length === 0 ? 0 : Math.max(0, count) }, (_, index) => {
          const accented =
            accentEvery !== undefined && accentEvery > 0 && index % accentEvery === accentEvery - 1;
          return (
            <Glyph
              key={index}
              {...glyph}
              variant={variant}
              size={size}
              ink={accented ? (accentInk ?? ink) : ink}
              mask={masks[index % masks.length]}
            />
          );
        })}
      </div>
    );
  },
);
