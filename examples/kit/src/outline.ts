/**
 * The page's running order.
 *
 * The section number, the heading and the nav link all come from here, so the
 * three cannot disagree. Renumbering is a matter of moving a line rather than
 * of finding every place a number was typed.
 */

/** One section of the page. */
export interface Entry {
  /** The `id` its heading anchors on, and the fragment the nav links to. */
  readonly id: string;
  /** The heading. */
  readonly title: string;
  /** Whether the top nav offers it. */
  readonly nav?: 'primary' | 'secondary';
}

/** Every section, in the order the page renders them. */
export const OUTLINE: readonly Entry[] = Object.freeze([
  { id: 'anatomy', title: 'Anatomy', nav: 'primary' },
  { id: 'scale', title: 'Scale ramp' },
  { id: 'surfaces', title: 'Fill & surface' },
  { id: 'palette', title: 'Palette', nav: 'primary' },
  { id: 'motion', title: 'Motion states', nav: 'primary' },
  { id: 'playground', title: 'Playground', nav: 'primary' },
  { id: 'compare', title: 'Compare', nav: 'secondary' },
  { id: 'in-product', title: 'In product' },
  { id: 'rules', title: "Do & don't" },
  { id: 'code', title: 'Export & code', nav: 'primary' },
  { id: 'live-code', title: 'Live code', nav: 'secondary' },
  { id: 'panel', title: 'Glyphs panel' },
  { id: 'patterns', title: 'Filling patterns', nav: 'primary' },
  { id: 'browser', title: 'Pattern browser', nav: 'secondary' },
]);

/** Sections the top nav links to. */
export const NAV_ENTRIES: readonly Entry[] = OUTLINE.filter((entry) => entry.nav !== undefined);

/**
 * A section's place in the running order, as the two-digit number the page
 * prints beside its heading.
 */
export function numberOf(id: string): string {
  const at = OUTLINE.findIndex((entry) => entry.id === id);
  // An unknown id is a typo in a section, not a runtime condition to survive:
  // the page would print a heading with no number and nobody would notice.
  if (at === -1) throw new Error(`no section named ${id} in the outline`);
  return String(at + 1).padStart(2, '0');
}

/** A section's heading. */
export function titleOf(id: string): string {
  const found = OUTLINE.find((entry) => entry.id === id);
  if (found === undefined) throw new Error(`no section named ${id} in the outline`);
  return found.title;
}
