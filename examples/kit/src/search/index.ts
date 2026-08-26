/**
 * The search index.
 *
 * Built at module load out of things the library already knows: the page
 * outline, the twelve variants and their timings, the twenty-one props, and all
 * 512 patterns. There is no crawler, no build step and no service — the whole
 * index is a few hundred short strings, which is smaller than the request it
 * would take to fetch one.
 *
 * The 512 patterns are the reason this exists at all. A hosted search crawler
 * indexes rendered pages, and 384 of the patterns are on a page the reader has
 * not turned to yet; only an index built from the data can find them.
 */

import {
  MASK_COUNT,
  TIMING,
  VARIANTS,
  maskDensity,
  maskFromIndex,
  patternNameOf,
  stepDuration,
  type Variant,
} from '@glyphy/core';
import { OUTLINE } from '../outline.js';
import { GLYPH_PROPS } from '../props.js';

/** What selecting a hit does. */
export type Target =
  | { readonly kind: 'section'; readonly id: string }
  | { readonly kind: 'pattern'; readonly mask: string }
  | { readonly kind: 'variant'; readonly variant: Variant };

/** The four things worth finding, in the order the results list them. */
export const GROUPS = Object.freeze(['Sections', 'Variants', 'Patterns', 'Props'] as const);

/** One of the four. */
export type Group = (typeof GROUPS)[number];

/** One entry in the index. */
export interface Entry {
  readonly id: string;
  readonly group: Group;
  readonly title: string;
  readonly detail: string;
  /** Everything matched against, already lowercased. */
  readonly terms: readonly string[];
  readonly target: Target;
}

/** A hit, with the score that ranked it. */
export interface Hit extends Entry {
  readonly score: number;
}

function sectionEntries(): Entry[] {
  return OUTLINE.map((entry, at) => ({
    id: `section:${entry.id}`,
    group: 'Sections' as const,
    title: entry.title,
    detail: `Section ${String(at + 1).padStart(2, '0')}`,
    terms: [entry.title.toLowerCase(), entry.id],
    target: { kind: 'section', id: entry.id },
  }));
}

function variantEntries(): Entry[] {
  return VARIANTS.map((variant) => {
    const timing = TIMING[variant];
    const step = timing.steps === 1 ? 'still' : `${stepDuration(variant)}ms a step`;
    return {
      id: `variant:${variant}`,
      group: 'Variants' as const,
      title: variant,
      detail: `${timing.summary} · ${step}`,
      terms: [variant, timing.summary.toLowerCase()],
      target: { kind: 'variant', variant },
    };
  });
}

function propEntries(): Entry[] {
  return GLYPH_PROPS.map((prop) => ({
    id: `prop:${prop.on}.${prop.name}`,
    group: 'Props' as const,
    title: prop.name,
    detail: `${prop.on} · ${prop.note}`,
    terms: [prop.name.toLowerCase(), prop.on.toLowerCase(), prop.note.toLowerCase()],
    target: { kind: 'section', id: 'code' },
  }));
}

function patternEntries(): Entry[] {
  return Array.from({ length: MASK_COUNT }, (_, at) => {
    const mask = maskFromIndex(at);
    const name = patternNameOf(mask);
    return {
      id: `pattern:${mask}`,
      group: 'Patterns' as const,
      title: name ?? mask,
      detail: `${mask} · index ${at} · ${maskDensity(mask)} of 9 ringed`,
      terms: [mask, String(at), ...(name === undefined ? [] : [name])],
      target: { kind: 'pattern', mask },
    };
  });
}

/** Everything findable, built once. */
export const INDEX: readonly Entry[] = Object.freeze([
  ...sectionEntries(),
  ...variantEntries(),
  ...patternEntries(),
  ...propEntries(),
]);

/**
 * How well one term answers the query.
 *
 * An exact answer beats a prefix beats a substring, and a substring that starts
 * late in a long string beats nothing by very little. Deliberately crude: with
 * a few hundred short strings, ranking that a reader can predict is worth more
 * than ranking that is clever.
 */
function score(term: string, query: string): number {
  if (term === query) return 100;
  if (term.startsWith(query)) return 70;
  const at = term.indexOf(query);
  return at === -1 ? 0 : Math.max(10, 40 - at);
}

/** The best score any of an entry's terms manages. */
function scoreOf(entry: Entry, query: string): number {
  let best = 0;
  for (const term of entry.terms) best = Math.max(best, score(term, query));
  return best;
}

/** How many of each group the dialog will show. */
export const PER_GROUP = 6;

/** What the dialog shows before anything has been typed. */
export function opening(): readonly Hit[] {
  return INDEX.filter((entry) => entry.group === 'Sections').map((entry) => ({
    ...entry,
    score: 0,
  }));
}

/** The hits for a query, grouped and capped, best first inside each group. */
export function search(query: string): readonly Hit[] {
  const wanted = query.trim().toLowerCase();
  if (wanted === '') return opening();

  const scored: Hit[] = [];
  for (const entry of INDEX) {
    const value = scoreOf(entry, wanted);
    if (value > 0) scored.push({ ...entry, score: value });
  }
  scored.sort((one, other) => other.score - one.score);

  const kept: Hit[] = [];
  for (const group of GROUPS) {
    kept.push(...scored.filter((hit) => hit.group === group).slice(0, PER_GROUP));
  }
  return kept;
}

/**
 * How many entries a query matches in each group, before the per-group cap.
 *
 * Counted against what {@link search} would return, the empty query included:
 * an empty query opens on the sections rather than on the whole index, so
 * counting the index there would put a number over a list that never held it.
 */
export function countsOf(query: string): ReadonlyMap<Group, number> {
  const wanted = query.trim().toLowerCase();
  const counts = new Map<Group, number>(GROUPS.map((group) => [group, 0]));
  const matched = wanted === '' ? opening() : INDEX.filter((entry) => scoreOf(entry, wanted) > 0);
  for (const entry of matched) counts.set(entry.group, (counts.get(entry.group) ?? 0) + 1);
  return counts;
}

/** How many entries matched in total, before the per-group cap. */
export function countOf(query: string): number {
  let total = 0;
  for (const count of countsOf(query).values()) total += count;
  return total;
}

/**
 * What the palette can find, counted off the index rather than typed.
 *
 * The numbers move whenever a section, a variant or a prop is added, which is
 * the drift `outline.ts` and `props.ts` exist to prevent — so the placeholder
 * that quotes them reads them off the same source.
 */
export const SUMMARY: string = GROUPS.map(
  (group) => `${INDEX.filter((entry) => entry.group === group).length} ${group.toLowerCase()}`,
).join(', ');
