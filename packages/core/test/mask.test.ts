import { describe, expect, it } from 'vitest';
import {
  EMPTY_MASK,
  FULL_MASK,
  MASK_COUNT,
  PATTERNS,
  PATTERN_NAMES,
  allMasks,
  differenceMask,
  intersectMask,
  invertMask,
  isMask,
  maskDensity,
  maskFromCells,
  maskFromIndex,
  maskHas,
  maskOrbit,
  maskToCells,
  maskToIndex,
  masksOfDensity,
  mirrorMaskX,
  mirrorMaskY,
  patternNameOf,
  rotateMask,
  rotateMaskBy,
  toMask,
  transposeMask,
  unionMask,
} from '@glyphy/core';

describe('the sanctioned patterns', () => {
  it('holds the ten the kit names', () => {
    expect(PATTERN_NAMES).toEqual([
      'seed',
      'cross',
      'saltire',
      'hollow',
      'bars',
      'spine',
      'quoin',
      'fall',
      'quarter',
      'full',
    ]);
  });

  it('spells each one as the kit prints it', () => {
    expect(PATTERNS.seed).toBe('000010000');
    expect(PATTERNS.cross).toBe('010111010');
    expect(PATTERNS.saltire).toBe('101010101');
    expect(PATTERNS.hollow).toBe('111101111');
    expect(PATTERNS.bars).toBe('111000111');
    expect(PATTERNS.spine).toBe('010010010');
    expect(PATTERNS.quoin).toBe('101000101');
    expect(PATTERNS.fall).toBe('100010001');
    expect(PATTERNS.quarter).toBe('011011000');
    expect(PATTERNS.full).toBe('111111111');
  });

  it('is a set of distinct marks', () => {
    expect(new Set(Object.values(PATTERNS)).size).toBe(PATTERN_NAMES.length);
  });

  it('names a mask back again', () => {
    expect(patternNameOf(PATTERNS.cross)).toBe('cross');
    expect(patternNameOf('110000011')).toBeUndefined();
  });
});

describe('recognising a mask', () => {
  it('accepts nine bits and nothing else', () => {
    expect(isMask('010111010')).toBe(true);
    expect(isMask('01011101')).toBe(false);
    expect(isMask('0101110100')).toBe(false);
    expect(isMask('01011101x')).toBe(false);
    expect(isMask(9)).toBe(false);
    expect(isMask(undefined)).toBe(false);
  });

  it('coerces a pattern name to its bits', () => {
    expect(toMask('cross')).toBe(PATTERNS.cross);
    expect(toMask('101010101')).toBe('101010101');
  });

  it('falls back when handed something else', () => {
    expect(toMask('nonsense')).toBe(FULL_MASK);
    expect(toMask(undefined, EMPTY_MASK)).toBe(EMPTY_MASK);
  });
});

describe('reading a mask', () => {
  it('reports which cells carry a ring', () => {
    expect(maskHas(PATTERNS.seed, 4)).toBe(true);
    expect(maskHas(PATTERNS.seed, 0)).toBe(false);
  });

  it('round-trips through booleans', () => {
    for (const name of PATTERN_NAMES) {
      expect(maskFromCells(maskToCells(PATTERNS[name]))).toBe(PATTERNS[name]);
    }
  });

  it('counts the ringed cells', () => {
    expect(maskDensity(EMPTY_MASK)).toBe(0);
    expect(maskDensity(PATTERNS.seed)).toBe(1);
    expect(maskDensity(PATTERNS.cross)).toBe(5);
    expect(maskDensity(FULL_MASK)).toBe(9);
  });
});

describe('the 512 marks', () => {
  it('counts two to the nine', () => {
    expect(MASK_COUNT).toBe(512);
    expect(allMasks()).toHaveLength(512);
  });

  it('is all distinct', () => {
    expect(new Set(allMasks()).size).toBe(512);
  });

  it('round-trips every mask through its index', () => {
    for (const mask of allMasks()) {
      expect(maskFromIndex(maskToIndex(mask))).toBe(mask);
    }
  });

  it('puts the empty mark first and the full mark last', () => {
    expect(maskFromIndex(0)).toBe(EMPTY_MASK);
    expect(maskFromIndex(511)).toBe(FULL_MASK);
  });

  it('wraps an index outside the range', () => {
    expect(maskFromIndex(512)).toBe(EMPTY_MASK);
    expect(maskFromIndex(-1)).toBe(FULL_MASK);
  });

  it('groups them by how many cells are ringed', () => {
    expect(masksOfDensity(0)).toEqual([EMPTY_MASK]);
    expect(masksOfDensity(9)).toEqual([FULL_MASK]);
    expect(masksOfDensity(1)).toHaveLength(9);
    expect(masksOfDensity(4)).toHaveLength(126);
  });
});

describe('turning and flipping a mark', () => {
  it('rotates a quarter turn clockwise', () => {
    expect(rotateMask(PATTERNS.spine)).toBe('000111000');
    expect(rotateMask('000111000')).toBe(PATTERNS.spine);
  });

  it('returns to itself after four turns', () => {
    for (const name of PATTERN_NAMES) {
      expect(rotateMaskBy(PATTERNS[name], 4)).toBe(PATTERNS[name]);
    }
  });

  it('turns the other way for a negative count', () => {
    expect(rotateMaskBy(PATTERNS.quarter, -1)).toBe(rotateMaskBy(PATTERNS.quarter, 3));
  });

  it('mirrors left to right', () => {
    expect(mirrorMaskX(PATTERNS.quarter)).toBe('110110000');
  });

  it('mirrors top to bottom', () => {
    expect(mirrorMaskY(PATTERNS.quarter)).toBe('000011011');
  });

  it('reflects across the leading diagonal', () => {
    expect(transposeMask(PATTERNS.spine)).toBe('000111000');
    expect(transposeMask(PATTERNS.fall)).toBe(PATTERNS.fall);
  });

  it('leaves the symmetric patterns alone', () => {
    for (const name of ['seed', 'cross', 'saltire', 'hollow', 'full'] as const) {
      expect(rotateMask(PATTERNS[name])).toBe(PATTERNS[name]);
    }
  });
});

describe('combining marks', () => {
  it('swaps ringed for bare', () => {
    expect(invertMask(PATTERNS.seed)).toBe('111101111');
    expect(invertMask(invertMask(PATTERNS.quarter))).toBe(PATTERNS.quarter);
  });

  it('unions, intersects and differences', () => {
    expect(unionMask(PATTERNS.spine, '000111000')).toBe(PATTERNS.cross);
    expect(intersectMask(PATTERNS.spine, '000111000')).toBe(PATTERNS.seed);
    expect(differenceMask(PATTERNS.full, PATTERNS.seed)).toBe(PATTERNS.hollow);
  });
});

describe('the symmetries of a mark', () => {
  it('gives eight for a mark with no symmetry at all', () => {
    expect(maskOrbit('110000000')).toHaveLength(8);
  });

  it('gives four for the corner block, which is its own mirror image', () => {
    expect(maskOrbit(PATTERNS.quarter)).toEqual([
      '011011000',
      '110110000',
      '000011011',
      '000110110',
    ]);
  });

  it('collapses for a mark that is already symmetric', () => {
    expect(maskOrbit(PATTERNS.seed)).toEqual([PATTERNS.seed]);
    expect(maskOrbit(PATTERNS.full)).toEqual([PATTERNS.full]);
    expect(maskOrbit(PATTERNS.spine)).toHaveLength(2);
  });

  it('includes the mark itself', () => {
    expect(maskOrbit(PATTERNS.fall)).toContain(PATTERNS.fall);
  });
});
