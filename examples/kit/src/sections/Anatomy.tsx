import type { ReactElement } from 'react';
import { COLORS } from '@glyphy/core';
import { Glyph } from '@glyphy/react';
import { Section, SpecRow } from '../ui.js';
import { card, dotGrid, ink, mono, sans } from '../theme.js';

/** Every measurement the mark is built from, all derived from one number. */
const SPEC = [
  ['Cell pitch', '1 u'],
  ['Ring diameter', '0.78 u'],
  ['Ring stroke', 'size ÷ 52'],
  ['Dot diameter', 'size ÷ 30'],
  ['Wobble tolerance', '±5% radius'],
  ['Cell rotation', '−9° … +8°'],
  ['Dot opacity (unringed)', '0.42'],
] as const;

/** Section 01 — the mark on its construction grid, and the numbers behind it. */
export function Anatomy(): ReactElement {
  return (
    <Section id="anatomy" note="construction on the 3×3 lattice">
      <div className="split" style={{ gap: 56, padding: '40px 0 0' }}>
        <div
          style={{
            ...card,
            ...dotGrid,
            padding: 56,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              padding: 26,
              outline: `1px dashed rgba(181,82,47,.5)`,
            }}
          >
            <Glyph variant="all" size={234} />
            <span
              style={{
                position: 'absolute',
                top: -11,
                left: 26,
                font: `500 10px/1 ${mono}`,
                background: 'var(--page-surface)',
                padding: '0 5px',
                color: COLORS.accent,
              }}
            >
              bounding box = 3 × pitch
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SPEC.map(([name, value]) => (
            <SpecRow key={name} name={name} value={value} />
          ))}
          <p
            style={{
              font: `400 13px/1.6 ${sans}`,
              color: ink.soft,
              margin: '22px 0 0',
              textWrap: 'pretty',
            }}
          >
            Each cell carries a fixed wobble signature — the same nine irregularities every time it
            renders, so the mark stays recognisable while never looking machined. Never regenerate
            the wobble randomly per instance.
          </p>
        </div>
      </div>
    </Section>
  );
}
