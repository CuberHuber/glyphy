import type { ReactElement } from 'react';
import { COLORS } from '@glyphy/core';
import { PropRow, Section } from '../ui.js';
import { mono, sans } from '../theme.js';

const SNIPPET = `<Glyph
  variant="travel"   // idle · travel · accumulate
                     // thinking · snap · collapse · error
  size={96}          // px, square
  ink="#1c1a17"      // any CSS colour
  fill="stroke"      // stroke | tint
  dots               // bare dots visible
/>`;

const PROPS = [
  ['variant', '7 motion states, 3 pattern behaviours, 2 stills'],
  ['size', '16–320px; derives stroke and dot'],
  ['ink', 'single colour; tint = ink @ 18%'],
  ['fill', 'stroke for motion, tint for completed'],
  ['dots', "off below 24px; 'auto' follows the ramp"],
  ['mask', 'nine bits, or one of ten pattern names'],
  ['phase', 'steps to offset from the shared clock'],
] as const;

/** Section 07 — the component contract, and why it is CSS rather than SVG. */
export function ExportCode(): ReactElement {
  return (
    <Section number="07" title="Export &amp; code">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
          gap: 20,
          padding: '40px 0 0',
        }}
      >
        <div
          style={{
            background: COLORS.night,
            borderRadius: 6,
            padding: '30px 32px',
            overflow: 'auto',
          }}
        >
          <pre
            style={{
              margin: 0,
              font: `400 12.5px/1.75 ${mono}`,
              color: COLORS.inkInverse,
              whiteSpace: 'pre',
            }}
          >
            {SNIPPET}
          </pre>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PROPS.map(([name, note]) => (
            <PropRow key={name} name={name} note={note} />
          ))}
          <p
            style={{
              font: `400 13px/1.6 ${sans}`,
              color: 'rgba(28,26,23,.55)',
              margin: '22px 0 0',
              textWrap: 'pretty',
            }}
          >
            Rings are CSS borders with an irregular{' '}
            <code style={{ font: `500 12px ${mono}` }}>border-radius</code> per cell, not paths — so
            the mark stays crisp at any size and the wobble costs nothing. No SVG, no sprite sheet.
          </p>
        </div>
      </div>
    </Section>
  );
}
