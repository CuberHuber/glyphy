import type { ReactElement } from 'react';
import { COLORS } from '@glyphy/core';
import { Glyph } from '@glyphy/react';
import { ink, mono, sans } from '../theme.js';

const TAGS = ['loading', 'thinking', 'pattern'];

/** The masthead: the name, the claim, and the mark doing what it does. */
export function Hero(): ReactElement {
  return (
    <header style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 48px 0' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 64,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <div
            style={{
              font: `500 11px/1 ${mono}`,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: COLORS.accent,
            }}
          >
            UI-Kit · v0.1 · glyph + motion
          </div>
          <h1
            style={{
              font: `600 92px/.92 ${sans}`,
              letterSpacing: '-.045em',
              margin: '22px 0 0',
            }}
          >
            Glyphy
          </h1>
          <p
            style={{
              font: `400 17px/1.55 ${sans}`,
              color: ink.muted,
              margin: '20px 0 0',
              textWrap: 'pretty',
            }}
          >
            A nine-cell dot matrix. Every cell is either a bare dot or a ringed dot; the pattern of
            rings over time is the whole language. Hand-drawn origin, kept deliberately uneven —
            clean stroke, wobbly path.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '28px 0 0' }}>
            {TAGS.map((tag) => (
              <span
                key={tag}
                style={{
                  font: `500 11px/1 ${mono}`,
                  letterSpacing: '.06em',
                  padding: '7px 11px',
                  border: `1px solid ${ink.pill}`,
                  borderRadius: 100,
                  color: 'rgba(28,26,23,.7)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div style={{ padding: '8px 0 0' }}>
          <Glyph variant="travel" size={228} label="The Glyphy mark, loading" />
        </div>
      </div>
    </header>
  );
}
