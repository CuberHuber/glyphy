import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CELLS, EASE_OPACITY_MS, EASE_TRANSFORM_MS, SNAP_MS, PATTERNS } from '@glyphy/core';
import {
  GLYPHY_BEZIER,
  MotionGlyph,
  faithfulTransition,
  springTransition,
  transitionFor,
} from '@glyphy/motion';

const EASED = { on: 1, scale: 1, snap: false } as const;
const SNAPPED = { on: 1, scale: 1, snap: true } as const;

describe('the faithful preset', () => {
  it('gives opacity and transform the durations the kit specifies', () => {
    const transition = faithfulTransition(EASED) as Record<string, { duration: number }>;
    expect(transition.opacity?.duration).toBeCloseTo(EASE_OPACITY_MS / 1000, 5);
    expect(transition.scale?.duration).toBeCloseTo(EASE_TRANSFORM_MS / 1000, 5);
  });

  it('keeps the two durations different, which is what lags the ring behind its fade', () => {
    const transition = faithfulTransition(EASED) as Record<string, { duration: number }>;
    expect(transition.opacity?.duration).not.toBe(transition.scale?.duration);
  });

  it('eases on the kit curve', () => {
    const transition = faithfulTransition(EASED) as Record<string, { ease: readonly number[] }>;
    expect(transition.opacity?.ease).toEqual(GLYPHY_BEZIER);
    expect(GLYPHY_BEZIER).toEqual([0.4, 0, 0.2, 1]);
  });

  it('cuts linearly when the frame snaps', () => {
    expect(faithfulTransition(SNAPPED)).toEqual({ duration: SNAP_MS / 1000, ease: 'linear' });
  });
});

describe('the spring preset', () => {
  it('springs the eased frames', () => {
    expect(springTransition(EASED).type).toBe('spring');
  });

  it('still cuts a snap, because a snap that springs is not a snap', () => {
    expect(springTransition(SNAPPED)).toEqual(faithfulTransition(SNAPPED));
  });
});

describe('choosing a preset', () => {
  it('is faithful unless told otherwise', () => {
    expect(transitionFor(EASED)).toEqual(faithfulTransition(EASED));
  });

  it('takes the spring when asked', () => {
    expect(transitionFor(EASED, 'spring')).toEqual(springTransition(EASED));
  });
});

describe('the motion-driven mark', () => {
  it('keeps the same DOM contract as the plain mark', () => {
    const { container } = render(<MotionGlyph variant="all" size={96} />);
    expect(container.querySelectorAll('[data-glyphy-cell]')).toHaveLength(CELLS);
    expect(container.querySelectorAll('[data-glyphy-ring]')).toHaveLength(CELLS);
    expect(container.querySelectorAll('[data-glyphy-dot]')).toHaveLength(CELLS);
  });

  it('marks itself as the motion-driven one', () => {
    const { container } = render(<MotionGlyph variant="travel" />);
    const mark = container.querySelector('[data-glyphy]');
    expect(mark).toHaveAttribute('data-glyphy-motion', '');
    expect(mark).toHaveAttribute('data-glyphy-variant', 'travel');
  });

  it('leaves the static half of the ring style to the core', () => {
    const { container } = render(<MotionGlyph variant="all" size={104} ink="#1c1a17" />);
    const ring = container.querySelector<HTMLElement>('[data-glyphy-ring]');
    expect(ring?.style.border).toBe('2px solid rgb(28, 26, 23)');
    expect(ring?.style.borderRadius).not.toBe('');
  });

  it('hands the animated half to Motion, leaving no CSS transition to fight it', () => {
    const { container } = render(<MotionGlyph variant="travel" tick={0} />);
    const ring = container.querySelector<HTMLElement>('[data-glyphy-ring]');
    expect(ring?.style.transition).toBe('');
  });

  it('still paints the bare dots', () => {
    const { container } = render(<MotionGlyph variant="all" size={120} />);
    expect(container.querySelector<HTMLElement>('[data-glyphy-dot]')?.style.opacity).toBe('0.42');
  });

  it('takes a pattern like the plain mark does', () => {
    const { container } = render(<MotionGlyph variant="mask" mask={PATTERNS.seed} />);
    expect(container.querySelectorAll('[data-glyphy-ring]')).toHaveLength(CELLS);
  });

  it('is decoration unless it is named', () => {
    const { container } = render(<MotionGlyph variant="travel" />);
    expect(container.querySelector('[data-glyphy]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('becomes an image with a name when it stands alone', () => {
    render(<MotionGlyph variant="travel" label="Loading" />);
    expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
  });

  it('announces politely when asked', () => {
    render(<MotionGlyph variant="snap" label="Saved" live />);
    expect(screen.getByRole('img', { name: 'Saved' })).toHaveAttribute('aria-live', 'polite');
  });

  it('is the size it is given', () => {
    const { container } = render(<MotionGlyph variant="all" size={64} />);
    expect(container.querySelector<HTMLElement>('[data-glyphy]')?.style.width).toBe('64px');
  });
});
