import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CELLS, PATTERNS, sharedClock } from '@glyphy/core';
import { Glyph, GlyphProvider } from '@glyphy/react';

/** The nine ring elements of the first mark on the screen. */
function rings(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[data-glyphy-ring]')];
}

/** The nine bare dots. */
function dots(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[data-glyphy-dot]')];
}

describe('the mark', () => {
  it('draws nine cells, each a dot under a ring', () => {
    const { container } = render(<Glyph variant="all" />);
    expect(container.querySelectorAll('[data-glyphy-cell]')).toHaveLength(CELLS);
    expect(rings(container)).toHaveLength(CELLS);
    expect(dots(container)).toHaveLength(CELLS);
  });

  it('numbers its cells in reading order', () => {
    const { container } = render(<Glyph variant="all" />);
    const numbers = [...container.querySelectorAll('[data-glyphy-cell]')].map((cell) =>
      cell.getAttribute('data-glyphy-cell'),
    );
    expect(numbers).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8']);
  });

  it('is a square of the size it is given', () => {
    const { container } = render(<Glyph variant="all" size={96} />);
    const grid = container.querySelector<HTMLElement>('[data-glyphy]');
    expect(grid?.style.width).toBe('96px');
    expect(grid?.style.height).toBe('96px');
  });

  it('scales its stroke and its dots with the box', () => {
    const { container } = render(<Glyph variant="all" size={104} ink="#1c1a17" />);
    expect(rings(container)[0]?.style.border).toBe('2px solid rgb(28, 26, 23)');
    expect(dots(container)[0]?.style.width).toBe('3px');
  });

  it('gives each cell its own wobble, so no two rings match', () => {
    const { container } = render(<Glyph variant="all" />);
    const radii = new Set(rings(container).map((ring) => ring.style.borderRadius));
    expect(radii.size).toBe(CELLS);
  });

  it('names its variant on the element, for styling and for tests', () => {
    const { container } = render(<Glyph variant="thinking" />);
    expect(container.querySelector('[data-glyphy]')).toHaveAttribute(
      'data-glyphy-variant',
      'thinking',
    );
  });
});

describe('fills', () => {
  it('strokes by default', () => {
    const { container } = render(<Glyph variant="all" ink="#1c1a17" />);
    expect(rings(container)[0]?.style.background).toBe('transparent');
  });

  it('washes at eighteen percent when tinted, with no stroke', () => {
    const { container } = render(<Glyph variant="all" fill="tint" ink="#1c1a17" />);
    expect(rings(container)[0]?.style.border).toBe('0px');
    expect(rings(container)[0]?.style.background).toBe('rgba(28, 26, 23, 0.18)');
  });
});

describe('the bare dots', () => {
  it('shows them by default', () => {
    const { container } = render(<Glyph variant="all" />);
    expect(dots(container)[0]?.style.opacity).toBe('0.42');
  });

  it('hides them when asked, keeping the lattice spacing', () => {
    const { container } = render(<Glyph variant="all" dots={false} />);
    expect(dots(container)[0]?.style.opacity).toBe('0');
  });

  it('drops them below the scale ramp floor when set to auto', () => {
    const small = render(<Glyph variant="all" size={16} dots="auto" />);
    expect(dots(small.container)[0]?.style.opacity).toBe('0');
    small.unmount();

    const large = render(<Glyph variant="all" size={96} dots="auto" />);
    expect(dots(large.container)[0]?.style.opacity).toBe('0.42');
  });
});

describe('patterns', () => {
  it('rings only the cells the pattern names', () => {
    const { container } = render(<Glyph variant="mask" mask={PATTERNS.seed} />);
    const opacities = rings(container).map((ring) => ring.style.opacity);
    expect(opacities).toEqual(['0', '0', '0', '0', '1', '0', '0', '0', '0']);
  });

  it('takes a pattern by name', () => {
    const byName = render(<Glyph variant="mask" mask="saltire" />);
    const named = rings(byName.container).map((ring) => ring.style.opacity);
    byName.unmount();

    const byBits = render(<Glyph variant="mask" mask="101010101" />);
    expect(rings(byBits.container).map((ring) => ring.style.opacity)).toEqual(named);
  });

  it('starts a pattern variant on the kit default rather than blank', () => {
    const { container } = render(<Glyph variant="mask" />);
    const lit = rings(container).filter((ring) => ring.style.opacity === '1');
    expect(lit).toHaveLength(5);
  });

  it('clips any variant to the pattern when gating', () => {
    const { container } = render(<Glyph variant="all" mask="spine" maskMode="gate" />);
    const opacities = rings(container).map((ring) => ring.style.opacity);
    expect(opacities).toEqual(['0', '1', '0', '0', '1', '0', '0', '1', '0']);
  });
});

describe('accessibility', () => {
  it('hides itself from assistive technology when it is decoration', () => {
    const { container } = render(<Glyph variant="travel" />);
    expect(container.querySelector('[data-glyphy]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('becomes an image with a name when it stands alone', () => {
    render(<Glyph variant="travel" label="Loading" />);
    expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
  });

  it('announces politely when it stands in for progress', () => {
    render(<Glyph variant="snap" label="Saved" live />);
    expect(screen.getByRole('img', { name: 'Saved' })).toHaveAttribute('aria-live', 'polite');
  });

  it('does not announce unless asked', () => {
    render(<Glyph variant="travel" label="Loading" />);
    expect(screen.getByRole('img', { name: 'Loading' })).not.toHaveAttribute('aria-live');
  });
});

describe('driving the mark', () => {
  it('takes a tick directly, so a caller can drive it', () => {
    const { container } = render(<Glyph variant="travel" tick={0} />);
    expect(rings(container)[0]?.style.opacity).toBe('1');
  });

  it('offsets by phase, which is what staggers a row', () => {
    const first = render(<Glyph variant="travel" tick={0} phase={0} />);
    const head = rings(first.container).map((ring) => ring.style.opacity);
    first.unmount();

    const second = render(<Glyph variant="travel" tick={0} phase={3} />);
    expect(rings(second.container).map((ring) => ring.style.opacity)).not.toEqual(head);
  });

  it('reads the shared clock when no tick is given', () => {
    const { container } = render(<Glyph variant="travel" />);
    expect(sharedClock().running).toBe(true);
    expect(rings(container)).toHaveLength(CELLS);
  });

  it('leaves the clock alone when paused', () => {
    render(<Glyph variant="travel" paused />);
    expect(sharedClock().running).toBe(false);
  });

  it('stops the clock again once every mark has gone', () => {
    const { unmount } = render(<Glyph variant="travel" />);
    expect(sharedClock().running).toBe(true);
    unmount();
    expect(sharedClock().running).toBe(false);
  });
});

describe('the provider', () => {
  it('sets the defaults for the marks below it', () => {
    const { container } = render(
      <GlyphProvider theme={{ ink: '#b5522f', dots: false }}>
        <Glyph variant="all" size={104} />
      </GlyphProvider>,
    );
    expect(rings(container)[0]?.style.border).toBe('2px solid rgb(181, 82, 47)');
    expect(dots(container)[0]?.style.opacity).toBe('0');
  });

  it('loses to a prop on the mark itself', () => {
    const { container } = render(
      <GlyphProvider theme={{ ink: '#b5522f' }}>
        <Glyph variant="all" size={104} ink="#1c1a17" />
      </GlyphProvider>,
    );
    expect(rings(container)[0]?.style.border).toBe('2px solid rgb(28, 26, 23)');
  });

  it('nests, so an inner provider only names what it changes', () => {
    const { container } = render(
      <GlyphProvider theme={{ ink: '#b5522f', size: 104 }}>
        <GlyphProvider theme={{ fill: 'tint' }}>
          <Glyph variant="all" />
        </GlyphProvider>
      </GlyphProvider>,
    );
    expect(rings(container)[0]?.style.background).toBe('rgba(181, 82, 47, 0.18)');
  });

  it('pauses everything below it', () => {
    render(
      <GlyphProvider theme={{ paused: true }}>
        <Glyph variant="travel" />
      </GlyphProvider>,
    );
    expect(sharedClock().running).toBe(false);
  });

  it('adds no element of its own by default', () => {
    const { container } = render(
      <GlyphProvider theme={{ ink: '#b5522f' }}>
        <Glyph variant="all" />
      </GlyphProvider>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-glyphy');
  });

  it('emits the design tokens when asked to', () => {
    const { container } = render(
      <GlyphProvider cssVariables>
        <Glyph variant="all" />
      </GlyphProvider>,
    );
    const wrapper = container.querySelector<HTMLElement>('[data-glyphy-provider]');
    expect(wrapper?.style.getPropertyValue('--glyphy-ink')).toBe('#1c1a17');
    expect(wrapper?.style.getPropertyValue('--glyphy-accent')).toBe('#b5522f');
  });
});

describe('passing through to the element', () => {
  it('keeps class names and data attributes', () => {
    const { container } = render(<Glyph variant="all" className="hero" data-testid="mark" />);
    const grid = container.querySelector('[data-glyphy]');
    expect(grid).toHaveClass('hero');
    expect(grid).toHaveAttribute('data-testid', 'mark');
  });

  it('lets a caller add to the grid style without losing the box', () => {
    const { container } = render(<Glyph variant="all" size={64} style={{ opacity: 0.4 }} />);
    const grid = container.querySelector<HTMLElement>('[data-glyphy]');
    expect(grid?.style.opacity).toBe('0.4');
    expect(grid?.style.width).toBe('64px');
  });
});
