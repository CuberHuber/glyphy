import { describe, expect, it } from 'vitest';
import {
  CELLS,
  COLORS,
  DEFAULT_MASK,
  DEFAULT_SIZE,
  EASED_TRANSITION,
  OFF_FRAME,
  ON_FRAME,
  PATTERNS,
  SNAP_TRANSITION,
  TINT_ALPHA,
  TINT_ALPHA_HEX,
  WOBBLE,
  WOBBLE_RADIUS_TOLERANCE,
  WOBBLE_ROTATION_LIMIT,
  cellWrapperStyle,
  dotStyle,
  glyphStyle,
  gridStyle,
  isFill,
  ringStyle,
  tintOf,
  transitionFor,
  wobbleFor,
} from '@glyphy/core';

describe('the wobble signatures', () => {
  it('gives one per cell', () => {
    expect(WOBBLE).toHaveLength(CELLS);
  });

  it('never repeats a signature, so no two cells look alike', () => {
    expect(new Set(WOBBLE.map((w) => w.radius)).size).toBe(CELLS);
  });

  it('stays inside the rotation the kit allows', () => {
    for (const wobble of WOBBLE) {
      expect(Math.abs(wobble.rotate)).toBeLessThanOrEqual(WOBBLE_ROTATION_LIMIT);
      expect(wobble.rotate).not.toBe(0);
    }
  });

  it('keeps every radius within five points of a true circle', () => {
    for (const wobble of WOBBLE) {
      const percentages = wobble.radius.match(/\d+(?=%)/g) ?? [];
      expect(percentages).toHaveLength(8);
      for (const value of percentages) {
        expect(Math.abs(Number(value) - 50)).toBeLessThanOrEqual(WOBBLE_RADIUS_TOLERANCE);
      }
    }
  });

  it('alternates the tilt, so the mark does not lean', () => {
    const signs = WOBBLE.map((wobble) => Math.sign(wobble.rotate));
    expect(signs).toEqual([-1, 1, -1, 1, -1, 1, -1, 1, -1]);
  });

  it('is the same on every call — the mark must not shimmer', () => {
    expect(wobbleFor(4)).toEqual(wobbleFor(4));
    expect(wobbleFor(4)).toBe(WOBBLE[4]);
  });

  it('wraps for a cell outside the lattice, so tilings stay stable', () => {
    expect(wobbleFor(9)).toEqual(wobbleFor(0));
    expect(wobbleFor(-1)).toEqual(wobbleFor(8));
  });
});

describe('the tint', () => {
  it('is the ink at eighteen percent', () => {
    expect(TINT_ALPHA_HEX).toBe('2e');
    expect(TINT_ALPHA).toBeCloseTo(0.18, 2);
  });

  it('appends the alpha to a six-digit hex, as the kit specifies', () => {
    expect(tintOf('#1c1a17')).toBe('#1c1a172e');
    expect(tintOf('#EFECE4')).toBe('#EFECE42e');
  });

  it('falls back to color-mix for anything else, so tokens still work', () => {
    expect(tintOf('var(--brand)')).toBe('color-mix(in srgb, var(--brand) 18%, transparent)');
    expect(tintOf('rebeccapurple')).toBe('color-mix(in srgb, rebeccapurple 18%, transparent)');
    expect(tintOf('#fff')).toBe('color-mix(in srgb, #fff 18%, transparent)');
  });

  it('recognises the two fills', () => {
    expect(isFill('stroke')).toBe(true);
    expect(isFill('tint')).toBe(true);
    expect(isFill('gradient')).toBe(false);
  });
});

describe('transitions', () => {
  it('eases by default, on the kit curve', () => {
    expect(transitionFor(ON_FRAME)).toBe(EASED_TRANSITION);
    expect(EASED_TRANSITION).toBe(
      'opacity 300ms cubic-bezier(.4,0,.2,1), transform 340ms cubic-bezier(.4,0,.2,1)',
    );
  });

  it('cuts when the frame snaps', () => {
    expect(transitionFor({ on: 1, scale: 1, snap: true })).toBe(SNAP_TRANSITION);
    expect(SNAP_TRANSITION).toBe('opacity 50ms linear, transform 50ms linear');
  });
});

describe('the grid', () => {
  it('is a square of three by three', () => {
    expect(gridStyle(120)).toEqual({
      width: 120,
      height: 120,
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gridTemplateRows: 'repeat(3,1fr)',
    });
  });

  it('defaults to the reference size', () => {
    expect(gridStyle()).toEqual(gridStyle(DEFAULT_SIZE));
    expect(DEFAULT_SIZE).toBe(120);
  });

  it('centres the dot and ring on each other', () => {
    expect(cellWrapperStyle()).toEqual({
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
    });
  });
});

describe('the ring', () => {
  it('draws a stroke that scales with the box', () => {
    const style = ringStyle(ON_FRAME, 0, { size: 104, ink: '#1c1a17' });
    expect(style.border).toBe('2px solid #1c1a17');
    expect(style.background).toBe('transparent');
  });

  it('draws a wash with no stroke when tinted', () => {
    const style = ringStyle(ON_FRAME, 0, { size: 104, ink: '#1c1a17', fill: 'tint' });
    expect(style.border).toBe('0');
    expect(style.background).toBe('#1c1a172e');
  });

  it('occupies 78 percent of its cell', () => {
    const style = ringStyle(ON_FRAME, 0);
    expect(style.width).toBe('78%');
    expect(style.height).toBe('78%');
    expect(style.boxSizing).toBe('border-box');
  });

  it('carries its cell wobble into the radius and the rotation', () => {
    const style = ringStyle(ON_FRAME, 4);
    expect(style.borderRadius).toBe(WOBBLE[4]?.radius);
    expect(style.transform).toBe('rotate(-5deg) scale(1)');
  });

  it('carries the frame opacity and scale', () => {
    const style = ringStyle({ on: 0.42, scale: 0.93, snap: false }, 0);
    expect(style.opacity).toBe(0.42);
    expect(style.transform).toContain('scale(0.93)');
  });

  it('defaults to the kit ink', () => {
    expect(ringStyle(ON_FRAME, 0).border).toContain(COLORS.ink);
  });
});

describe('the bare dot', () => {
  it('scales with the box and holds at 42 percent', () => {
    expect(dotStyle({ size: 120, ink: '#1c1a17' })).toEqual({
      width: 4,
      height: 4,
      borderRadius: '50%',
      background: '#1c1a17',
      opacity: 0.42,
    });
  });

  it('goes invisible rather than absent, so the lattice keeps its spacing', () => {
    expect(dotStyle({ size: 120, dots: false }).opacity).toBe(0);
    expect(dotStyle({ size: 120, dots: false }).width).toBe(4);
  });
});

describe('a whole mark', () => {
  it('is a grid and nine cells', () => {
    const style = glyphStyle({ variant: 'all', size: 96 });
    expect(style.cells).toHaveLength(CELLS);
    expect(style.grid.width).toBe(96);
  });

  it('gives every cell a ring, a dot and a wrapper', () => {
    for (const cell of glyphStyle({ variant: 'all' }).cells) {
      expect(cell.ring.position).toBe('absolute');
      expect(cell.dot.borderRadius).toBe('50%');
      expect(cell.wrapper.position).toBe('relative');
    }
  });

  it('paints the variant it is asked for', () => {
    const off = glyphStyle({ variant: 'off' });
    expect(off.cells.every((cell) => cell.ring.opacity === 0)).toBe(true);
  });

  it('takes pre-computed frames over the variant, so a shared clock can drive it', () => {
    const frames = Array.from({ length: CELLS }, () => OFF_FRAME);
    const style = glyphStyle({ variant: 'all', frames });
    expect(style.cells.every((cell) => cell.ring.opacity === 0)).toBe(true);
  });

  it('paints a pattern when given one', () => {
    const style = glyphStyle({ variant: 'mask', mask: PATTERNS.seed });
    expect(style.cells[4]?.ring.opacity).toBe(1);
    expect(style.cells[0]?.ring.opacity).toBe(0);
  });

  it('has a default pattern for the panel to start from', () => {
    expect(DEFAULT_MASK).toBe(PATTERNS.cross);
  });

  it('survives being handed too few frames', () => {
    const style = glyphStyle({ frames: [ON_FRAME] });
    expect(style.cells).toHaveLength(CELLS);
    expect(style.cells[8]?.ring.opacity).toBe(0);
  });
});
