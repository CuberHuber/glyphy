/**
 * The page's own styling vocabulary.
 *
 * The kit page is a document, not an application: it has a type scale, three
 * surfaces and a hairline, and nothing else. These constants are the whole of
 * it, lifted from the design so the numbers live in one place rather than
 * being retyped into forty inline styles.
 */

import { COLORS } from '@glyphy/core';
import type { CSSProperties } from 'react';

/** The kit palette, plus the alpha ramps the page draws its rules with. */
export const ink = {
  base: COLORS.ink,
  /** Body copy under a heading. */
  muted: 'rgba(28,26,23,.62)',
  /** Captions and specimen labels. */
  soft: 'rgba(28,26,23,.58)',
  /** Section notes. */
  faint: 'rgba(28,26,23,.5)',
  /** Numbers and units. */
  ghost: 'rgba(28,26,23,.42)',
  /** Card borders. */
  hairline: 'rgba(28,26,23,.1)',
  /** Section rules, one step stronger than a card border. */
  rule: 'rgba(28,26,23,.14)',
  /** Pill outlines. */
  pill: 'rgba(28,26,23,.16)',
} as const;

/** The same ramp on a dark surface. */
export const inverse = {
  base: COLORS.inkInverse,
  muted: 'rgba(239,236,228,.75)',
  soft: 'rgba(239,236,228,.55)',
  faint: 'rgba(239,236,228,.45)',
  ghost: 'rgba(239,236,228,.4)',
  label: 'rgba(239,236,228,.38)',
  hairline: 'rgba(239,236,228,.1)',
  border: 'rgba(239,236,228,.14)',
  wash: 'rgba(239,236,228,.04)',
} as const;

/** Two families, and only two. */
export const sans = "'Helvetica Neue',Helvetica,Arial,sans-serif";
export const mono = "ui-monospace,'SF Mono',Menlo,monospace";

/** The page column. Everything sits inside it. */
export const column: CSSProperties = {
  maxWidth: 1180,
  margin: '0 auto',
  padding: '96px 48px 0',
};

/** A light card: one step up from the paper, hairline border, 6px radius. */
export const card: CSSProperties = {
  background: COLORS.surface,
  border: `1px solid ${ink.hairline}`,
  borderRadius: 6,
};

/** A dark card, for the specimen panels and the hero band. */
export const darkCard: CSSProperties = {
  background: COLORS.night,
  border: `1px solid rgba(239,236,228,.12)`,
  borderRadius: 6,
};

/** The all-caps monospace label above a specimen. */
export const eyebrow: CSSProperties = {
  font: `500 10px/1 ${mono}`,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'rgba(28,26,23,.45)',
};

/** Caption copy under a specimen. */
export const caption: CSSProperties = {
  font: `400 12.5px/1.55 ${sans}`,
  color: ink.soft,
  margin: 0,
};

/** A number, a unit, a bit string — anything meant to be read exactly. */
export const figure: CSSProperties = {
  font: `500 10px/1 ${mono}`,
  color: ink.ghost,
};

/** The dot-grid paper the anatomy specimen is drawn on. */
export const dotGrid: CSSProperties = {
  backgroundImage: 'radial-gradient(rgba(28,26,23,.22) 1px,transparent 1px)',
  backgroundSize: '26px 26px',
  backgroundPosition: '13px 13px',
};
