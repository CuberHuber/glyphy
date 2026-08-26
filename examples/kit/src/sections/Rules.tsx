import type { ReactElement, ReactNode } from 'react';
import { COLORS } from '@glyphy/core';
import { Glyph } from '@glyphy/react';
import { Section } from '../ui.js';
import { card, mono, sans } from '../theme.js';

/** A do-or-don't card. The don'ts get an accent border, so the page can be skimmed. */
function Rule(props: {
  readonly verdict: 'DO' | "DON'T";
  readonly body: string;
  readonly children: ReactNode;
}): ReactElement {
  const wrong = props.verdict === "DON'T";
  return (
    <div
      style={{
        ...card,
        border: `1px solid ${wrong ? 'rgba(181,82,47,.3)' : 'rgba(28,26,23,.1)'}`,
        padding: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      <div style={{ display: 'grid', placeItems: 'center', height: 110 }}>{props.children}</div>
      <div>
        <div style={{ font: `500 11px/1 ${mono}`, color: wrong ? COLORS.accent : COLORS.ink }}>
          {props.verdict}
        </div>
        <p
          style={{
            font: `400 12.5px/1.5 ${sans}`,
            color: 'rgba(28,26,23,.6)',
            margin: '8px 0 0',
          }}
        >
          {props.body}
        </p>
      </div>
    </div>
  );
}

/** Section 06 — the four rules that keep the mark recognisable. */
export function Rules(): ReactElement {
  return (
    <Section number="06" title="Do &amp; don't">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
          gap: 20,
          padding: '40px 0 0',
        }}
      >
        <Rule
          verdict="DO"
          body="Keep the square box and the nine-cell lattice intact at every size."
        >
          <Glyph variant="all" size={86} ink={COLORS.ink} />
        </Rule>

        <Rule
          verdict="DON'T"
          body="Stretch, skew or non-uniformly scale. The wobble is the only distortion allowed."
        >
          <div style={{ transform: 'scaleX(1.5) skewX(-9deg)' }}>
            <Glyph variant="all" size={86} ink={COLORS.ink} />
          </div>
        </Rule>

        <Rule
          verdict="DON'T"
          body="Mix fills or colour cells individually. One ink, one fill, per mark."
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <Glyph variant="all" size={40} ink={COLORS.accent} />
            <Glyph variant="all" size={40} fill="tint" ink={COLORS.ink} />
          </div>
        </Rule>

        <Rule
          verdict="DON'T"
          body="Run several animated marks in one view. One moving glyph per screen, maximum."
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Glyph variant="travel" size={34} ink={COLORS.ink} dots={false} />
            <Glyph variant="thinking" size={34} ink={COLORS.ink} dots={false} />
            <Glyph variant="accumulate" size={34} ink={COLORS.ink} dots={false} />
          </div>
        </Rule>
      </div>
    </Section>
  );
}
