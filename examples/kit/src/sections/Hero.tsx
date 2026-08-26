import type { ReactElement } from 'react';
import { COLORS, MASK_COUNT, VARIANTS } from '@glyphy/core';
import { Glyph } from '@glyphy/react';
import { CopyButton } from '../controls.js';
import { ink, mono, sans } from '../theme.js';

const TAGS = ['loading', 'thinking', 'pattern'];

/** The one line most people will ever run. */
const INSTALL = 'npm install @glyphy/react';

/** The masthead: the name, the claim, and the mark doing what it does. */
export function Hero(): ReactElement {
  return (
    <header id="top" className="column-top">
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
          <h1 className="hero-title">Glyphy</h1>
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

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '26px 0 0',
              padding: '10px 10px 10px 16px',
              border: `1px solid ${ink.pill}`,
              borderRadius: 6,
              maxWidth: 400,
            }}
          >
            <code style={{ font: `500 12.5px/1 ${mono}`, flex: 1, color: ink.base }}>
              <span style={{ color: ink.ghost }}>$ </span>
              {INSTALL}
            </code>
            <CopyButton value={INSTALL} />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '18px 0 0' }}>
            <a
              href="#playground"
              style={{
                font: `500 12.5px/1 ${sans}`,
                padding: '11px 16px',
                borderRadius: 6,
                background: ink.base,
                color: 'var(--page-paper)',
              }}
            >
              Open the playground
            </a>
            <a
              href="https://github.com/CuberHuber/glyphy"
              style={{
                font: `500 12.5px/1 ${sans}`,
                padding: '11px 16px',
                borderRadius: 6,
                border: `1px solid ${ink.pill}`,
                color: ink.base,
              }}
            >
              Source on GitHub
            </a>
          </div>

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
                  color: ink.muted,
                }}
              >
                {tag}
              </span>
            ))}
            <span
              style={{
                font: `500 11px/1 ${mono}`,
                letterSpacing: '.06em',
                padding: '7px 11px',
                borderRadius: 100,
                color: ink.faint,
              }}
            >
              {VARIANTS.length} states · {MASK_COUNT} patterns
            </span>
          </div>
        </div>
        <div style={{ padding: '8px 0 0' }}>
          <Glyph variant="travel" size={228} label="The Glyphy mark, loading" />
        </div>
      </div>
    </header>
  );
}
