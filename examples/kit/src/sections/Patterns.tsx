import type { ReactElement } from 'react';
import { COLORS, MASK_COUNT, PATTERNS, PATTERN_NAMES, type MaskInput } from '@glyphy/core';
import { Glyph, GlyphLattice } from '@glyphy/react';
import { Section } from '../ui.js';
import { card, ink, mono, sans } from '../theme.js';

/**
 * The tiling band's running order.
 *
 * Sixteen tiles, chosen so no pattern sits next to itself and the seed marks
 * break up the denser ones. The accent lands on the fifth tile — one in
 * twelve is the ceiling the kit sets, and sixteen tiles carrying one accent
 * is inside it.
 */
const BAND: readonly MaskInput[] = [
  'cross',
  'saltire',
  'seed',
  'bars',
  'quarter',
  'spine',
  'hollow',
  'fall',
  'quoin',
  'seed',
  'cross',
  'full',
  'saltire',
  'quarter',
  'spine',
  'seed',
];

/** Section 09 — the ten sanctioned patterns, and the lattice they tile into. */
export function Patterns(): ReactElement {
  return (
    <Section
      id="patterns"
      note={`nine bits, ${MASK_COUNT} marks — these ten are the sanctioned set`}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(min(180px,100%),1fr))',
          gap: 16,
          padding: '40px 0 0',
        }}
      >
        {PATTERN_NAMES.map((name) => (
          <div
            key={name}
            style={{
              ...card,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <Glyph variant="mask" mask={name} size={72} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ font: `500 12.5px/1.2 ${sans}`, textTransform: 'capitalize' }}>
                {name}
              </div>
              <div
                style={{ font: `500 10px/1 ${mono}`, color: 'var(--page-eyebrow)', marginTop: 6 }}
              >
                {PATTERNS[name]}
              </div>
            </div>
          </div>
        ))}
      </div>

      <GlyphLattice
        masks={BAND}
        count={BAND.length}
        size={48}
        columnWidth={58}
        ink={COLORS.inkInverse}
        accentEvery={12}
        accentInk={COLORS.accent}
        style={{
          background: COLORS.night,
          borderRadius: 6,
          padding: 24,
          margin: '20px 0 0',
        }}
      />

      <p
        style={{
          font: `400 12.5px/1.6 ${sans}`,
          color: ink.soft,
          margin: '16px 0 0',
          maxWidth: 640,
        }}
      >
        Patterns tile edge-to-edge with no gutter — the bare dots of neighbouring marks read as one
        continuous lattice. Accent no more than one tile in twelve.
      </p>

      <p
        style={{
          font: `400 12.5px/1.6 ${sans}`,
          color: ink.faint,
          margin: '80px 0 0',
          borderTop: `1px solid ${ink.rule}`,
          paddingTop: 22,
        }}
      >
        Next: a second glyph size for favicon/app-icon lockups · a 4×4 lattice variant for denser
        progress · sound-on-snap spec.
      </p>
    </Section>
  );
}
