import type { ReactElement } from 'react';
import { COLORS, type Fill } from '@glyphy/core';
import { Glyph } from '@glyphy/react';
import { Section, Specimen } from '../ui.js';

interface Surface {
  readonly title: string;
  readonly note: string;
  readonly fill: Fill;
  readonly ink: string;
  readonly dark: boolean;
}

const SURFACES: readonly Surface[] = [
  {
    title: 'Stroke · light',
    note: '#1c1a17 on #f7f5f0',
    fill: 'stroke',
    ink: COLORS.ink,
    dark: false,
  },
  {
    title: 'Tint · light',
    note: '18% ink fill, no stroke',
    fill: 'tint',
    ink: COLORS.ink,
    dark: false,
  },
  {
    title: 'Stroke · dark',
    note: '#efece4 on #191816',
    fill: 'stroke',
    ink: COLORS.inkInverse,
    dark: true,
  },
  {
    title: 'Accent · dark',
    note: '#b5522f — one per screen',
    fill: 'stroke',
    ink: COLORS.accent,
    dark: true,
  },
];

/** Section 03 — two treatments across two surfaces. */
export function Surfaces(): ReactElement {
  return (
    <Section id="surfaces" note="two treatments, two surfaces — never mix both fills in one mark">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(220px,100%),1fr))',
          gap: 20,
          padding: '40px 0 0',
        }}
      >
        {SURFACES.map((surface) => (
          <Specimen
            key={surface.title}
            title={surface.title}
            note={surface.note}
            dark={surface.dark}
          >
            <Glyph variant="accumulate" size={112} fill={surface.fill} ink={surface.ink} />
          </Specimen>
        ))}
      </div>
    </Section>
  );
}
