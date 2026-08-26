/**
 * The page's own styling vocabulary.
 *
 * The kit page is a document, not an application: it has a type scale, three
 * surfaces and a hairline, and nothing else. These constants are the whole of
 * it, lifted from the design so the numbers live in one place rather than
 * being retyped into forty inline styles.
 *
 * Every page-level colour is a custom property rather than a literal, so the
 * whole document can invert from one attribute on `<html>`. The literals live
 * in `page.css`. Specimen surfaces are the exception and stay literal on
 * purpose: a card demonstrating the light surface has to be light even when the
 * page around it is dark, or it stops being a specimen of anything.
 */

import { COLORS } from '@glyphy/core';
import type { CSSProperties } from 'react';

/** The kit palette, plus the alpha ramps the page draws its rules with. */
export const ink = {
  base: 'var(--page-ink)',
  /** Body copy under a heading. */
  muted: 'var(--page-muted)',
  /** Captions and specimen labels. */
  soft: 'var(--page-soft)',
  /** Section notes. */
  faint: 'var(--page-faint)',
  /** Numbers and units. */
  ghost: 'var(--page-ghost)',
  /** Card borders. */
  hairline: 'var(--page-hairline)',
  /** Section rules, one step stronger than a card border. */
  rule: 'var(--page-rule)',
  /** Pill outlines. */
  pill: 'var(--page-pill)',
} as const;

/**
 * The ink ramp on a surface that stays light whatever the page does.
 *
 * A card demonstrating the light surface has to be light in dark mode too, and
 * the copy on it has to be dark. This is that copy. Everywhere else, use the
 * inverting ramp above.
 */
export const fixed = {
  base: COLORS.ink,
  muted: 'rgba(28,26,23,.62)',
  soft: 'rgba(28,26,23,.55)',
  faint: 'rgba(28,26,23,.5)',
  ghost: 'rgba(28,26,23,.42)',
  hairline: 'rgba(28,26,23,.1)',
  rule: 'rgba(28,26,23,.12)',
  edge: 'rgba(28,26,23,.2)',
} as const;

/** The same ramp on a dark surface. Fixed: dark specimens do not invert. */
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

/** A light card: one step up from the paper, hairline border, 6px radius. */
export const card: CSSProperties = {
  background: 'var(--page-surface)',
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
  color: 'var(--page-eyebrow)',
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
  backgroundImage: 'radial-gradient(var(--page-dot-grid) 1px,transparent 1px)',
  backgroundSize: '26px 26px',
  backgroundPosition: '13px 13px',
};

/** A field label in a control panel: small, quiet, monospace. */
export const fieldLabel: CSSProperties = {
  font: `500 10px/1 ${mono}`,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: 'var(--page-eyebrow)',
};

/** The dark slab a code sample sits on. Fixed, like a specimen. */
export const codeSlab: CSSProperties = {
  background: COLORS.night,
  border: `1px solid rgba(239,236,228,.12)`,
  borderRadius: 6,
  color: COLORS.inkInverse,
  overflow: 'auto',
};
