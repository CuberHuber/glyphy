import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MOTION_VARIANTS,
  PATTERN_VARIANTS,
  STATIC_VARIANTS,
  TICK_MS,
  TIMING,
  VARIANTS,
  createClock,
  cycleDuration,
  isVariant,
  phaseFor,
  resetSharedClocks,
  sharedClock,
  stepDuration,
} from '@glyphy/core';

describe('the variant catalogue', () => {
  it('lists twelve behaviours', () => {
    expect(VARIANTS).toHaveLength(12);
  });

  it('names the seven the kit documents as motion', () => {
    expect(MOTION_VARIANTS).toEqual([
      'idle',
      'travel',
      'accumulate',
      'thinking',
      'snap',
      'collapse',
      'error',
    ]);
  });

  it('keeps every subset inside the catalogue', () => {
    for (const list of [MOTION_VARIANTS, PATTERN_VARIANTS, STATIC_VARIANTS]) {
      for (const variant of list) expect(VARIANTS).toContain(variant);
    }
  });

  it('describes every variant it lists', () => {
    for (const variant of VARIANTS) {
      expect(TIMING[variant].summary.length).toBeGreaterThan(10);
      expect(TIMING[variant].ticksPerStep).toBeGreaterThan(0);
    }
  });

  it('recognises a variant by name', () => {
    expect(isVariant('travel')).toBe(true);
    expect(isVariant('sparkle')).toBe(false);
    expect(isVariant(4)).toBe(false);
  });
});

describe('the timings the kit prints on its cards', () => {
  it('runs the travelling ring at 210ms a cell', () => {
    expect(stepDuration('travel')).toBe(210);
  });

  it('draws an accumulating ring on every 280ms', () => {
    expect(stepDuration('accumulate')).toBe(280);
  });

  it('changes a thinking frame every 350ms', () => {
    expect(stepDuration('thinking')).toBe(350);
  });

  it('ticks at 70ms', () => {
    expect(TICK_MS).toBe(70);
  });

  it('scales with a different clock period', () => {
    expect(stepDuration('travel', 100)).toBe(300);
  });

  it('gives the length of a full loop', () => {
    expect(cycleDuration('travel')).toBe(1890);
    expect(cycleDuration('snap')).toBe(2520);
  });

  it('has no cycle for the continuous states', () => {
    expect(cycleDuration('idle')).toBeUndefined();
    expect(cycleDuration('thinking')).toBeUndefined();
    expect(cycleDuration('breathe-mask')).toBeUndefined();
  });

  it('marks the two states that cut instead of easing', () => {
    const snapping = VARIANTS.filter((variant) => TIMING[variant].snaps);
    expect(snapping).toEqual(['snap', 'error']);
  });
});

describe('the clock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetSharedClocks();
  });

  it('starts at zero and stays still with nobody listening', () => {
    const clock = createClock(70);
    expect(clock.tick).toBe(0);
    expect(clock.running).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(clock.tick).toBe(0);
  });

  it('runs only while something is listening', () => {
    const clock = createClock(70);
    const stop = clock.subscribe(() => undefined);
    expect(clock.running).toBe(true);
    stop();
    expect(clock.running).toBe(false);
  });

  it('advances one tick per period', () => {
    const clock = createClock(70);
    clock.subscribe(() => undefined);
    vi.advanceTimersByTime(70 * 5);
    expect(clock.tick).toBe(5);
  });

  it('tells every listener the same number', () => {
    const clock = createClock(70);
    const seen: number[][] = [[], []];
    clock.subscribe((tick) => seen[0]?.push(tick));
    clock.subscribe((tick) => seen[1]?.push(tick));
    vi.advanceTimersByTime(210);
    expect(seen[0]).toEqual([1, 2, 3]);
    expect(seen[1]).toEqual([1, 2, 3]);
  });

  it('keeps running while any listener remains', () => {
    const clock = createClock(70);
    const first = clock.subscribe(() => undefined);
    clock.subscribe(() => undefined);
    first();
    expect(clock.running).toBe(true);
  });

  it('ignores a second unsubscribe', () => {
    const clock = createClock(70);
    const stop = clock.subscribe(() => undefined);
    const other = clock.subscribe(() => undefined);
    stop();
    stop();
    expect(clock.running).toBe(true);
    other();
    expect(clock.running).toBe(false);
  });

  it('can be advanced by hand, for tests and manual drivers', () => {
    const clock = createClock(70);
    clock.advance(4);
    expect(clock.tick).toBe(4);
    clock.advance();
    expect(clock.tick).toBe(5);
  });

  it('drops everything when destroyed', () => {
    const clock = createClock(70);
    clock.subscribe(() => undefined);
    clock.destroy();
    expect(clock.running).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(clock.tick).toBe(0);
  });

  it('survives a listener that unsubscribes mid-tick', () => {
    const clock = createClock(70);
    const stop = clock.subscribe(() => {
      stop();
    });
    clock.subscribe(() => undefined);
    expect(() => {
      clock.advance();
    }).not.toThrow();
  });

  it('reports its period', () => {
    expect(createClock(120).period).toBe(120);
    expect(createClock().period).toBe(TICK_MS);
  });
});

describe('the shared clock', () => {
  afterEach(() => {
    resetSharedClocks();
  });

  it('hands the same clock to everyone at the same period', () => {
    expect(sharedClock(70)).toBe(sharedClock(70));
    expect(sharedClock()).toBe(sharedClock(TICK_MS));
  });

  it('keeps separate clocks for separate periods', () => {
    expect(sharedClock(70)).not.toBe(sharedClock(140));
  });

  it('is forgotten on reset, so tests do not leak into each other', () => {
    const before = sharedClock(70);
    resetSharedClocks();
    expect(sharedClock(70)).not.toBe(before);
  });
});

describe('staggering a row', () => {
  it('offsets two steps a mark, as the kit specifies', () => {
    expect([0, 1, 2, 3, 4].map((index) => phaseFor(index))).toEqual([0, 2, 4, 6, 8]);
  });

  it('takes a different spacing', () => {
    expect(phaseFor(3, 3)).toBe(9);
  });
});
