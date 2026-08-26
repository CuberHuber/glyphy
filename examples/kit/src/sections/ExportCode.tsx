import type { ReactElement } from 'react';
import { Glyph } from '@glyphy/react';
import { PropTable, Section } from '../ui.js';
import { Preview } from '../Preview.js';
import { GLYPH_PROPS } from '../props.js';
import { ink, mono, sans } from '../theme.js';

const SNIPPET = `<Glyph
  variant="travel"   // idle · travel · accumulate
                     // thinking · snap · collapse · error
  size={96}          // px, square
  ink="error"        // a palette name, or any CSS colour
  fill="stroke"      // stroke | tint
  dots               // bare dots visible
  label="Loading"    // without one the mark is decoration
/>`;

/** Section 10 — the component contract, and why it is CSS rather than SVG. */
export function ExportCode(): ReactElement {
  return (
    <Section id="code" note={`${GLYPH_PROPS.length} props across three components`}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))',
          gap: 20,
          padding: '40px 0 0',
          alignItems: 'start',
        }}
      >
        <Preview code={SNIPPET} minHeight={220} open>
          <Glyph variant="travel" size={96} ink="error" label="Loading" />
        </Preview>

        <p
          style={{
            font: `400 13px/1.65 ${sans}`,
            color: ink.muted,
            margin: 0,
            textWrap: 'pretty',
          }}
        >
          Rings are CSS borders with an irregular{' '}
          <code style={{ font: `500 12px ${mono}` }}>border-radius</code> per cell, not paths — so
          the mark stays crisp at any size and the wobble costs nothing. No SVG, no sprite sheet, no
          canvas. The table below is written by hand and checked by eye: one component with fourteen
          props does not need a generator, and a generator would break in a build long before the
          props changed.
        </p>
      </div>

      <div style={{ padding: '34px 0 0' }}>
        <PropTable />
      </div>
    </Section>
  );
}
