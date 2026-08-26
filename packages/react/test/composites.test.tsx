import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import { CELLS, PATTERNS, sharedClock } from '@glyphy/core';
import {
  GLYPH_DEFAULTS,
  Glyph,
  GlyphLattice,
  GlyphProvider,
  GlyphRow,
  useGlyph,
  useGlyphTick,
  useReducedMotion,
} from '@glyphy/react';

/** Every mark rendered, in document order. */
function marks(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[data-glyphy]')];
}

/** The ring opacities of one mark, as a comparable string. */
function shape(mark: HTMLElement): string {
  return [...mark.querySelectorAll<HTMLElement>('[data-glyphy-ring]')]
    .map((ring) => ring.style.opacity)
    .join(',');
}

describe('a staggered row', () => {
  it('draws the marks it is asked for', () => {
    const { container } = render(<GlyphRow variant="travel" count={5} tick={0} />);
    expect(marks(container)).toHaveLength(5);
  });

  it('offsets each mark from the last, so the ring crosses the row', () => {
    const { container } = render(<GlyphRow variant="travel" count={5} tick={0} />);
    const shapes = marks(container).map(shape);
    // Phase counts ticks, not steps, and travel holds each cell for three
    // ticks — so a two-tick stagger across five marks lands on three distinct
    // frames. That is the prototype's behaviour, and it is what makes the row
    // read as one ring sweeping rather than five marks flickering in lockstep.
    expect(new Set(shapes).size).toBe(3);
    expect(shapes[0]).not.toBe(shapes[4]);
  });

  it('separates every mark when staggered by a whole step', () => {
    const { container } = render(<GlyphRow variant="travel" count={5} stepsApart={3} tick={0} />);
    expect(new Set(marks(container).map(shape)).size).toBe(5);
  });

  it('takes a different spacing', () => {
    const { container } = render(<GlyphRow variant="travel" count={3} stepsApart={0} tick={0} />);
    const shapes = marks(container).map(shape);
    expect(new Set(shapes).size).toBe(1);
  });

  it('draws nothing for a count of zero, and does not fall over on a negative', () => {
    const empty = render(<GlyphRow variant="travel" count={0} />);
    expect(marks(empty.container)).toHaveLength(0);
    empty.unmount();

    const negative = render(<GlyphRow variant="travel" count={-3} />);
    expect(marks(negative.container)).toHaveLength(0);
  });

  it('is decoration unless it is given a name', () => {
    const { container } = render(<GlyphRow variant="travel" count={3} />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('becomes one image when named, rather than five', () => {
    render(<GlyphRow variant="travel" count={5} label="Syncing" />);
    expect(screen.getByRole('img', { name: 'Syncing' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('shares one clock across the row', () => {
    render(<GlyphRow variant="travel" count={5} />);
    expect(sharedClock().running).toBe(true);
  });
});

describe('a tiling band', () => {
  it('repeats the patterns to fill the count', () => {
    const { container } = render(<GlyphLattice masks={['cross', 'saltire']} count={6} size={48} />);
    const shapes = marks(container).map(shape);
    expect(shapes).toHaveLength(6);
    expect(shapes[0]).toBe(shapes[2]);
    expect(shapes[1]).toBe(shapes[3]);
    expect(shapes[0]).not.toBe(shapes[1]);
  });

  it('defaults its count to the patterns it was given', () => {
    const { container } = render(<GlyphLattice masks={['cross', 'saltire', 'seed']} />);
    expect(marks(container)).toHaveLength(3);
  });

  it('tiles with no gutter, so neighbouring dots read as one lattice', () => {
    const { container } = render(<GlyphLattice masks={['cross']} count={4} />);
    const band = container.querySelector<HTMLElement>('[data-glyphy-lattice]');
    expect(band?.style.gap).toBe('0');
    expect(band?.style.display).toBe('grid');
  });

  it('accents one tile in every n', () => {
    const { container } = render(
      <GlyphLattice
        masks={['cross']}
        count={12}
        ink="#efece4"
        accentEvery={12}
        accentInk="#b5522f"
        size={48}
      />,
    );
    const borders = marks(container).map(
      (mark) => mark.querySelector<HTMLElement>('[data-glyphy-ring]')?.style.borderColor,
    );
    expect(borders.filter((colour) => colour === 'rgb(181, 82, 47)')).toHaveLength(1);
    expect(borders[11]).toBe('rgb(181, 82, 47)');
  });

  it('draws nothing when given no patterns, rather than dividing by zero', () => {
    const { container } = render(<GlyphLattice masks={[]} count={6} />);
    expect(marks(container)).toHaveLength(0);
  });

  it('is always decoration — texture is not content', () => {
    const { container } = render(<GlyphLattice masks={['cross']} count={4} />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('the headless hook', () => {
  it('hands back styles, frames and the tick behind them', () => {
    const { result } = renderHook(() => useGlyph({ variant: 'all', tick: 0 }));
    expect(result.current.frames).toHaveLength(CELLS);
    expect(result.current.style.cells).toHaveLength(CELLS);
    expect(result.current.tick).toBe(0);
    expect(result.current.still).toBe(false);
  });

  it('resolves a pattern name to its bits', () => {
    const { result } = renderHook(() => useGlyph({ variant: 'mask', mask: 'quoin' }));
    expect(result.current.mask).toBe(PATTERNS.quoin);
  });

  it('reports no pattern for a variant that does not use one', () => {
    const { result } = renderHook(() => useGlyph({ variant: 'travel' }));
    expect(result.current.mask).toBeUndefined();
  });

  it('falls back to the kit default rather than an empty mark', () => {
    const { result } = renderHook(() => useGlyph({ variant: 'mask' }));
    expect(result.current.mask).toBe(PATTERNS.cross);
  });

  it('adds the phase to the tick it was given', () => {
    const { result } = renderHook(() => useGlyph({ variant: 'travel', tick: 10, phase: 4 }));
    expect(result.current.tick).toBe(14);
  });

  it('starts from the kit defaults when told nothing', () => {
    const { result } = renderHook(() => useGlyph());
    expect(result.current.style.grid.width).toBe(GLYPH_DEFAULTS.size);
  });
});

describe('the tick hook', () => {
  it('starts at zero and follows the shared clock', () => {
    const { result } = renderHook(() => useGlyphTick());
    expect(result.current).toBe(0);
    act(() => {
      sharedClock().advance(3);
    });
    expect(result.current).toBe(3);
  });

  it('holds its number while paused', () => {
    const { result, rerender } = renderHook(
      ({ paused }: { paused: boolean }) => useGlyphTick({ paused }),
      { initialProps: { paused: false } },
    );
    act(() => {
      sharedClock().advance(5);
    });
    expect(result.current).toBe(5);

    rerender({ paused: true });
    act(() => {
      sharedClock().advance(10);
    });
    expect(result.current).toBe(5);
  });

  it('keeps separate clocks for separate periods', () => {
    renderHook(() => useGlyphTick({ tickMs: 140 }));
    expect(sharedClock(140).running).toBe(true);
    expect(sharedClock(70).running).toBe(false);
  });
});

describe('reduced motion', () => {
  const listeners = new Set<() => void>();

  function setPreference(reduced: boolean): void {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: reduced && query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener),
      })),
    );
  }

  beforeEach(() => {
    listeners.clear();
  });

  it('is false when the reader has not asked for it', () => {
    setPreference(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('is true when they have', () => {
    setPreference(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('falls back to motion on a platform with no media queries', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('freezes the mark to a still that still carries its meaning', () => {
    setPreference(true);
    const { container } = render(<Glyph variant="travel" />);
    const opacities = [...container.querySelectorAll<HTMLElement>('[data-glyphy-ring]')].map(
      (ring) => ring.style.opacity,
    );
    expect(opacities.every((opacity) => opacity === '1')).toBe(true);
    expect(container.querySelector('[data-glyphy]')).toHaveAttribute('data-glyphy-still', '');
  });

  it('keeps a pattern as its pattern', () => {
    setPreference(true);
    const { container } = render(<Glyph variant="breathe-mask" mask="seed" />);
    const opacities = [...container.querySelectorAll<HTMLElement>('[data-glyphy-ring]')].map(
      (ring) => ring.style.opacity,
    );
    expect(opacities).toEqual(['0', '0', '0', '0', '1', '0', '0', '0', '0']);
  });

  it('keeps moving when a caller overrides the preference', () => {
    setPreference(true);
    const { container } = render(<Glyph variant="travel" respectReducedMotion={false} tick={0} />);
    expect(container.querySelector('[data-glyphy]')).not.toHaveAttribute('data-glyphy-still');
  });

  it('can be overridden for a whole screen through the provider', () => {
    setPreference(true);
    const { container } = render(
      <GlyphProvider theme={{ respectReducedMotion: false }}>
        <Glyph variant="travel" tick={0} />
      </GlyphProvider>,
    );
    expect(container.querySelector('[data-glyphy]')).not.toHaveAttribute('data-glyphy-still');
  });

  it('notices when the reader changes their mind', () => {
    setPreference(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    setPreference(true);
    act(() => {
      for (const listener of listeners) listener();
    });
    expect(result.current).toBe(true);
  });
});
