import { describe, expect, it } from 'vitest';
import {
  CELLS,
  DOTS_FLOOR,
  DOT_DIVISOR,
  DOT_OPACITY,
  GRID,
  MAX_SIZE,
  MIN_SIZE,
  RING_RATIO,
  SPIRAL,
  SPIRAL_POSITION,
  STROKE_DIVISOR,
  cellPitch,
  columnOf,
  dotDiameter,
  dotsAdvisedAt,
  ringDiameter,
  rowOf,
  spiralPositionOf,
  strokeWidth,
} from '@glyphy/core';

describe('lattice constants', () => {
  it('is three by three', () => {
    expect(GRID).toBe(3);
    expect(CELLS).toBe(9);
  });

  it('keeps the ratios the kit specifies', () => {
    expect(RING_RATIO).toBe(0.78);
    expect(STROKE_DIVISOR).toBe(52);
    expect(DOT_DIVISOR).toBe(30);
    expect(DOT_OPACITY).toBe(0.42);
    expect(MIN_SIZE).toBe(16);
    expect(MAX_SIZE).toBe(320);
    expect(DOTS_FLOOR).toBe(24);
  });
});

describe('the spiral', () => {
  it('walks the outer ring clockwise, then the centre', () => {
    expect([...SPIRAL]).toEqual([0, 1, 2, 5, 8, 7, 6, 3, 4]);
  });

  it('visits every cell exactly once', () => {
    expect(new Set(SPIRAL).size).toBe(CELLS);
  });

  it('ends on the centre, so accumulation closes inward', () => {
    expect(SPIRAL[SPIRAL.length - 1]).toBe(4);
  });

  it('inverts to the step that lights each cell', () => {
    expect([...SPIRAL_POSITION]).toEqual([0, 1, 2, 7, 8, 3, 6, 5, 4]);
  });

  it('agrees with the lookup function for every cell', () => {
    for (let cell = 0; cell < CELLS; cell += 1) {
      expect(spiralPositionOf(cell)).toBe(SPIRAL_POSITION[cell]);
    }
  });

  it('sorts a cell outside the lattice after every real step', () => {
    expect(spiralPositionOf(9)).toBe(CELLS);
    expect(spiralPositionOf(-1)).toBe(CELLS);
  });
});

describe('measurements derived from size', () => {
  it('scales the stroke with the box', () => {
    expect(strokeWidth(52)).toBe(1);
    expect(strokeWidth(104)).toBe(2);
    expect(strokeWidth(120)).toBe(2);
    expect(strokeWidth(228)).toBe(4);
  });

  it('never draws a stroke thinner than a pixel', () => {
    expect(strokeWidth(16)).toBe(1);
    expect(strokeWidth(1)).toBe(1);
    expect(strokeWidth(0)).toBe(1);
  });

  it('scales the dot with the box', () => {
    expect(dotDiameter(120)).toBe(4);
    expect(dotDiameter(60)).toBe(2);
    expect(dotDiameter(96)).toBe(3);
  });

  it('never draws a dot below two pixels', () => {
    expect(dotDiameter(16)).toBe(2);
    expect(dotDiameter(0)).toBe(2);
  });

  it('divides the box into three cells', () => {
    expect(cellPitch(120)).toBe(40);
    expect(ringDiameter(120)).toBeCloseTo(31.2, 5);
  });
});

describe('the scale ramp advice', () => {
  it('drops the bare dots below the floor', () => {
    expect(dotsAdvisedAt(16)).toBe(false);
    expect(dotsAdvisedAt(23)).toBe(false);
  });

  it('keeps them from the floor up', () => {
    expect(dotsAdvisedAt(24)).toBe(true);
    expect(dotsAdvisedAt(96)).toBe(true);
  });
});

describe('cell coordinates', () => {
  it('reads left to right, top to bottom', () => {
    expect([rowOf(0), columnOf(0)]).toEqual([0, 0]);
    expect([rowOf(4), columnOf(4)]).toEqual([1, 1]);
    expect([rowOf(8), columnOf(8)]).toEqual([2, 2]);
    expect([rowOf(5), columnOf(5)]).toEqual([1, 2]);
  });
});
