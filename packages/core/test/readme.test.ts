import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PATTERNS,
  TIMING,
  VARIANTS,
  allMasks,
  maskOrbit,
  rotateMask,
  stepDuration,
} from '@glyphy/core';

/**
 * The README prints a table of every variant and how long one of its steps
 * lasts. Those numbers are the first thing a reader believes and the last thing
 * anybody remembers to update, so they are checked rather than trusted.
 */
const readme = readFileSync(resolve('README.md'), 'utf8');

/** Rows of the variant table: `| \`name\` | description | 210ms |`. */
const ROW = /^\|\s*`([a-z-]+)`\s*\|[^|]*\|\s*([0-9]+ms|—)\s*\|/gm;

function documented(): Map<string, string> {
  const rows = new Map<string, string>();
  for (const [, name = '', step = ''] of readme.matchAll(ROW)) rows.set(name, step);
  return rows;
}

describe('the README variant table', () => {
  const rows = documented();

  it('was found and parsed', () => {
    expect(rows.size).toBeGreaterThan(0);
  });

  it('lists every variant the engine has', () => {
    expect([...rows.keys()].sort()).toEqual([...VARIANTS].sort());
  });

  it('prints the step duration the engine actually uses', () => {
    for (const variant of VARIANTS) {
      const printed = rows.get(variant);
      const steps = TIMING[variant].steps;
      // A variant that never advances has no step worth printing; the table
      // writes an em dash for those.
      if (steps === 1) {
        expect(printed, `${variant} does not move, so its step should be —`).toBe('—');
        continue;
      }
      expect(printed, `${variant} step duration`).toBe(`${stepDuration(variant)}ms`);
    }
  });
});

describe('the README pattern examples', () => {
  // Each entry is a claim the README makes in prose or in a code block, paired
  // with the call that has to agree with it. Run the code, compare the answer.
  const CLAIMS: readonly (readonly [string, unknown, unknown])[] = [
    ["PATTERNS.saltire is '101010101'", PATTERNS.saltire, '101010101'],
    ["rotateMask(PATTERNS.spine) is '000111000'", rotateMask(PATTERNS.spine), '000111000'],
    ['maskOrbit(PATTERNS.quarter) has four members', maskOrbit(PATTERNS.quarter).length, 4],
    ['allMasks() has 512 members', allMasks().length, 512],
    ['the cross pattern is 010111010', PATTERNS.cross, '010111010'],
  ];

  it.each(CLAIMS)('%s', (_claim, actual, expected) => {
    expect(actual).toEqual(expected);
  });

  it('shows each of those values somewhere in the README', () => {
    for (const bits of [PATTERNS.saltire, PATTERNS.cross, '000111000']) {
      expect(readme, `${bits} is asserted here but never shown`).toContain(bits);
    }
    expect(readme).toContain('512');
    expect(readme).toContain('four distinct symmetries');
  });
});
