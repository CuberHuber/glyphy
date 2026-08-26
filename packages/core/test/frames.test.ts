import { describe, expect, it } from 'vitest';
import {
  CELLS,
  OFF_FRAME,
  ON_FRAME,
  PATTERNS,
  SPIRAL,
  VARIANTS,
  cellFrame,
  glyphFrame,
  hash,
  restingFrame,
  type CellFrame,
  type Variant,
} from '@glyphy/core';

/** The cells whose ring is fully on in this frame. */
function lit(frames: readonly CellFrame[]): number[] {
  return frames.flatMap((frame, cell) => (frame.on === 1 ? [cell] : []));
}

/** The cells with any ring at all, however faint. */
function visible(frames: readonly CellFrame[]): number[] {
  return frames.flatMap((frame, cell) => (frame.on > 0 ? [cell] : []));
}

describe('every variant', () => {
  it('answers for all nine cells', () => {
    for (const variant of VARIANTS) {
      expect(glyphFrame(variant, 0)).toHaveLength(CELLS);
    }
  });

  it('stays within legal opacity and positive scale', () => {
    for (const variant of VARIANTS) {
      for (let tick = 0; tick < 60; tick += 1) {
        for (const frame of glyphFrame(variant, tick, { mask: PATTERNS.cross })) {
          expect(frame.on).toBeGreaterThanOrEqual(0);
          expect(frame.on).toBeLessThanOrEqual(1);
          expect(frame.scale).toBeGreaterThan(0);
        }
      }
    }
  });

  it('gives the same frame for the same tick, every time', () => {
    for (const variant of VARIANTS) {
      const first = glyphFrame(variant, 17, { mask: PATTERNS.quoin });
      const second = glyphFrame(variant, 17, { mask: PATTERNS.quoin });
      expect(second).toEqual(first);
    }
  });
});

describe('idle', () => {
  it('rings the centre alone', () => {
    expect(visible(glyphFrame('idle', 0))).toEqual([4]);
  });

  it('holds the centre just short of full', () => {
    expect(cellFrame('idle', 0, 4).on).toBe(0.95);
  });

  it('breathes between 0.92 and 1.08 of the ring', () => {
    const scales = Array.from({ length: 88 }, (_, tick) => cellFrame('idle', tick, 4).scale);
    expect(Math.min(...scales)).toBeGreaterThanOrEqual(0.92);
    expect(Math.max(...scales)).toBeLessThanOrEqual(1.08);
    expect(Math.max(...scales)).toBeGreaterThan(1.07);
  });

  it('starts the sine at rest, so the first frame is the plain ring', () => {
    expect(cellFrame('idle', 0, 4).scale).toBe(1);
  });
});

describe('travel', () => {
  it('lights the head of the spiral at the first tick', () => {
    expect(lit(glyphFrame('travel', 0))).toEqual([0]);
  });

  it('trails two cells behind the head, fading', () => {
    // At tick 0 the head is spiral step 0; steps 8 and 7 are cells 4 and 3.
    expect(cellFrame('travel', 0, 4)).toEqual({ on: 0.42, scale: 0.93, snap: false });
    expect(cellFrame('travel', 0, 3)).toEqual({ on: 0.14, scale: 0.86, snap: false });
  });

  it('shows exactly three cells at any moment', () => {
    for (let tick = 0; tick < 27; tick += 1) {
      expect(visible(glyphFrame('travel', tick))).toHaveLength(3);
    }
  });

  it('holds each cell for three ticks', () => {
    expect(lit(glyphFrame('travel', 0))).toEqual(lit(glyphFrame('travel', 2)));
    expect(lit(glyphFrame('travel', 3))).not.toEqual(lit(glyphFrame('travel', 2)));
  });

  it('walks the spiral in order', () => {
    const heads = Array.from(
      { length: CELLS },
      (_, step) => lit(glyphFrame('travel', step * 3))[0],
    );
    expect(heads).toEqual([...SPIRAL]);
  });

  it('closes the loop after nine steps', () => {
    expect(glyphFrame('travel', 27)).toEqual(glyphFrame('travel', 0));
  });
});

describe('accumulate', () => {
  it('starts from an empty lattice', () => {
    expect(visible(glyphFrame('accumulate', 0))).toEqual([]);
  });

  it('adds one ring per step, in spiral order', () => {
    for (let step = 1; step <= CELLS; step += 1) {
      expect(lit(glyphFrame('accumulate', step * 4)).sort((a, b) => a - b)).toEqual(
        SPIRAL.slice(0, step).sort((a, b) => a - b),
      );
    }
  });

  it('holds the full mark for three beats before resetting', () => {
    for (const step of [9, 10, 11]) {
      expect(lit(glyphFrame('accumulate', step * 4))).toHaveLength(CELLS);
    }
    expect(visible(glyphFrame('accumulate', 12 * 4))).toEqual([]);
  });
});

describe('snap', () => {
  it('cuts rather than eases', () => {
    expect(glyphFrame('snap', 0).every((frame) => frame.snap)).toBe(true);
  });

  it('arrives whole, with no stagger', () => {
    const frames = glyphFrame('snap', 4);
    expect(lit(frames)).toHaveLength(CELLS);
    expect(new Set(frames.map((frame) => frame.on)).size).toBe(1);
  });

  it('holds for six steps of nine', () => {
    const on = Array.from({ length: 9 }, (_, phase) => cellFrame('snap', phase * 4, 0).on === 1);
    expect(on).toEqual([false, true, true, true, true, true, true, false, false]);
  });

  it('keeps the ring at full size even while invisible, so it does not grow in', () => {
    expect(cellFrame('snap', 0, 0).scale).toBe(1);
  });
});

describe('collapse', () => {
  it('starts from the full field', () => {
    expect(lit(glyphFrame('collapse', 0))).toHaveLength(CELLS);
  });

  it('folds to one oversized centre ring', () => {
    const frames = glyphFrame('collapse', 6 * 4);
    expect(visible(frames)).toEqual([4]);
    expect(frames[4]?.scale).toBe(1.25);
  });

  it('shrinks the outer cells as they go', () => {
    expect(cellFrame('collapse', 6 * 4, 0)).toEqual({ on: 0, scale: 0.35, snap: false });
  });
});

describe('error', () => {
  it('cuts rather than eases, throughout', () => {
    for (let tick = 0; tick < 33; tick += 1) {
      expect(glyphFrame('error', tick).every((frame) => frame.snap)).toBe(true);
    }
  });

  it('shows the whole mark first', () => {
    expect(lit(glyphFrame('error', 0))).toHaveLength(CELLS);
  });

  it('drops out unevenly in the middle of the cycle', () => {
    const frames = glyphFrame('error', 5 * 3);
    const opacities = new Set(frames.map((frame) => frame.on));
    expect(opacities.size).toBeGreaterThan(1);
    for (const frame of frames) expect([0, 0.45]).toContain(frame.on);
  });

  it('ends on the bare lattice', () => {
    expect(visible(glyphFrame('error', 9 * 3))).toEqual([]);
  });

  it('drops the same cells on every replay', () => {
    expect(glyphFrame('error', 5 * 3)).toEqual(glyphFrame('error', 5 * 3 + 33));
  });
});

describe('thinking', () => {
  it('holds a frame for five ticks', () => {
    expect(glyphFrame('thinking', 0)).toEqual(glyphFrame('thinking', 4));
    expect(glyphFrame('thinking', 5)).not.toEqual(glyphFrame('thinking', 0));
  });

  it('follows no fixed path, but always the same one', () => {
    const runs = Array.from({ length: 12 }, (_, frame) => lit(glyphFrame('thinking', frame * 5)));
    const shapes = new Set(runs.map((run) => run.join(',')));
    expect(shapes.size).toBeGreaterThan(6);
    expect(glyphFrame('thinking', 35)).toEqual(glyphFrame('thinking', 39));
  });

  it('shrinks the cells that are off, so they read as receding', () => {
    const off = glyphFrame('thinking', 0).filter((frame) => frame.on === 0);
    for (const frame of off) expect(frame.scale).toBe(0.78);
  });
});

describe('wave', () => {
  it('lights a whole column at once', () => {
    expect(lit(glyphFrame('wave', 0))).toEqual([0, 3, 6]);
    expect(lit(glyphFrame('wave', 3))).toEqual([1, 4, 7]);
    expect(lit(glyphFrame('wave', 6))).toEqual([2, 5, 8]);
  });

  it('leaves a faint column behind as it moves on', () => {
    expect(cellFrame('wave', 3, 0)).toEqual({ on: 0.3, scale: 0.92, snap: false });
  });

  it('rests for a beat before starting over', () => {
    expect(visible(glyphFrame('wave', 12))).toEqual([]);
    expect(glyphFrame('wave', 21)).toEqual(glyphFrame('wave', 0));
  });
});

describe('mask', () => {
  it('rings exactly the cells the pattern names', () => {
    expect(lit(glyphFrame('mask', 0, { mask: PATTERNS.cross }))).toEqual([1, 3, 4, 5, 7]);
    expect(lit(glyphFrame('mask', 0, { mask: PATTERNS.saltire }))).toEqual([0, 2, 4, 6, 8]);
    expect(lit(glyphFrame('mask', 0, { mask: PATTERNS.seed }))).toEqual([4]);
  });

  it('does not move', () => {
    expect(glyphFrame('mask', 99, { mask: PATTERNS.bars })).toEqual(
      glyphFrame('mask', 0, { mask: PATTERNS.bars }),
    );
  });

  it('shows nothing without a pattern, because there is nothing to show', () => {
    expect(visible(glyphFrame('mask', 0))).toEqual([]);
  });
});

describe('breathe-mask', () => {
  it('cycles the pattern between 55 and 100 percent', () => {
    const opacities = Array.from(
      { length: 60 },
      (_, tick) => cellFrame('breathe-mask', tick, 4, { mask: PATTERNS.cross }).on,
    );
    expect(Math.min(...opacities)).toBeCloseTo(0.55, 5);
    expect(Math.max(...opacities)).toBeCloseTo(1, 2);
  });

  it('leaves the cells outside the pattern bare', () => {
    expect(cellFrame('breathe-mask', 20, 0, { mask: PATTERNS.cross })).toEqual(OFF_FRAME);
  });

  it('breathes every cell when given no pattern', () => {
    expect(visible(glyphFrame('breathe-mask', 20))).toHaveLength(CELLS);
  });
});

describe('the stills', () => {
  it('sets every ring for `all`', () => {
    expect(glyphFrame('all', 0)).toEqual(Array.from({ length: CELLS }, () => ON_FRAME));
  });

  it('sets none for `off`', () => {
    expect(glyphFrame('off', 0)).toEqual(Array.from({ length: CELLS }, () => OFF_FRAME));
  });
});

describe('gating a variant with a pattern', () => {
  it('leaves the kit behaviour alone by default', () => {
    expect(glyphFrame('travel', 0, { mask: PATTERNS.seed })).toEqual(glyphFrame('travel', 0));
  });

  it('clips any variant to the pattern when asked', () => {
    const gated = glyphFrame('all', 0, { mask: PATTERNS.saltire, maskMode: 'gate' });
    expect(lit(gated)).toEqual([0, 2, 4, 6, 8]);
  });

  it('lets a travelling ring run only inside the pattern', () => {
    for (let tick = 0; tick < 27; tick += 1) {
      const gated = glyphFrame('travel', tick, { mask: PATTERNS.spine, maskMode: 'gate' });
      for (const cell of visible(gated)) expect([1, 4, 7]).toContain(cell);
    }
  });
});

describe('the reduced-motion still', () => {
  const still = (variant: Variant, mask?: string): number[] =>
    visible(restingFrame(variant, mask === undefined ? {} : { mask }));

  it('shows the whole mark for the motion states', () => {
    for (const variant of [
      'travel',
      'accumulate',
      'snap',
      'collapse',
      'error',
      'thinking',
      'wave',
    ]) {
      expect(still(variant as Variant)).toHaveLength(CELLS);
    }
  });

  it('keeps idle as its centre ring', () => {
    expect(still('idle')).toEqual([4]);
  });

  it('keeps a pattern as its pattern', () => {
    expect(still('mask', PATTERNS.quoin)).toEqual([0, 2, 6, 8]);
    expect(still('breathe-mask', PATTERNS.quoin)).toEqual([0, 2, 6, 8]);
  });

  it('falls back to the full mark for a breathing pattern with no pattern', () => {
    expect(still('breathe-mask')).toHaveLength(CELLS);
  });

  it('leaves `off` off', () => {
    expect(still('off')).toEqual([]);
  });

  it('does not move', () => {
    expect(restingFrame('travel')).toEqual(restingFrame('travel'));
  });
});

describe('the hash behind the unpredictable states', () => {
  it('stays inside the unit interval', () => {
    for (let cell = 0; cell < CELLS; cell += 1) {
      for (let seed = 0; seed < 50; seed += 1) {
        const value = hash(cell, seed);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    }
  });

  it('gives a different answer per cell and per seed', () => {
    expect(hash(0, 0)).not.toBe(hash(1, 0));
    expect(hash(0, 0)).not.toBe(hash(0, 1));
  });

  it('is stable, which is what makes the states replayable', () => {
    expect(hash(3, 7)).toBe(hash(3, 7));
  });
});
