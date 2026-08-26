/**
 * The mark, animated by Motion.
 *
 * Same nine frames as `<Glyph>`, same DOM, same accessibility — only the thing
 * that moves the rings is different. Reach for this when the surrounding
 * interface is already Motion-driven and you want the mark to share its
 * scheduler; otherwise `@glyphy/react` is smaller and needs no peer.
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { type Style } from '@glyphy/core';
import { useGlyph, type UseGlyphOptions } from '@glyphy/react';
import { motion } from 'motion/react';
import { transitionFor, type GlyphMotionPreset } from './transitions.js';

/** Props for {@link MotionGlyph}. */
export interface MotionGlyphProps
  extends UseGlyphOptions, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color'> {
  /** Which timing model to animate on. Defaults to `faithful`. */
  readonly preset?: GlyphMotionPreset;
  /** What the mark means, for assistive technology. */
  readonly label?: string;
  /** Announce changes to `label` politely. */
  readonly live?: boolean;
}

/**
 * Strip the properties Motion is about to take over.
 *
 * This is the whole correctness risk of the package. The core computes a ring
 * style that already carries `opacity`, `transform` and a CSS `transition`;
 * leaving them in place would have CSS and Motion animating the same two
 * properties against each other, which reads as a stutter at every frame
 * boundary. The static half of the style — border, radius, size — still comes
 * from the core, because that is the part Motion has no opinion about.
 */
function staticRingStyle(ring: Style): Style {
  const { opacity: _opacity, transform: _transform, transition: _transition, ...rest } = ring;
  return rest;
}

/**
 * The Glyphy mark, driven by Motion.
 *
 * @example
 * ```tsx
 * <MotionGlyph variant="travel" size={96} preset="spring" label="Loading" />
 * ```
 */
export const MotionGlyph = forwardRef<HTMLDivElement, MotionGlyphProps>(
  function MotionGlyph(props, ref) {
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
      preset = 'faithful',
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
        data-glyphy-motion=""
        data-glyphy-variant={variant ?? 'idle'}
        data-glyphy-still={glyph.still ? '' : undefined}
        style={{ ...glyph.style.grid, ...styleOverride }}
      >
        {glyph.style.cells.map((styles, cell) => (
          <div key={cell} data-glyphy-cell={cell} style={styles.wrapper}>
            <motion.div
              data-glyphy-ring=""
              style={staticRingStyle(styles.ring)}
              initial={false}
              animate={{ opacity: styles.frame.on, scale: styles.frame.scale }}
              transition={transitionFor(styles.frame, preset)}
            />
            <div data-glyphy-dot="" style={styles.dot} />
          </div>
        ))}
      </div>
    );
  },
);
