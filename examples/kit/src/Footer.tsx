/**
 * The bottom of the page.
 *
 * Says who made it, under what terms, and where the source is — which is the
 * whole job. The licence is spelled out rather than linked as a badge because
 * this one is not the licence a reader will assume.
 */

import type { ReactElement } from 'react';
import { GlyphLattice } from '@glyphy/react';
import { COLORS } from '@glyphy/core';
import { ink, mono, sans } from './theme.js';

const LINKS: readonly (readonly [string, string])[] = [
  ['Source', 'https://github.com/CuberHuber/glyphy'],
  ['@glyphy/react', 'https://www.npmjs.com/package/@glyphy/react'],
  ['@glyphy/core', 'https://www.npmjs.com/package/@glyphy/core'],
  ['@glyphy/tailwind', 'https://www.npmjs.com/package/@glyphy/tailwind'],
  ['@glyphy/motion', 'https://www.npmjs.com/package/@glyphy/motion'],
  ['Issues', 'https://github.com/CuberHuber/glyphy/issues'],
];

/** The page footer, over a band of the mark used as texture. */
export function Footer(): ReactElement {
  return (
    <footer style={{ marginTop: 120, borderTop: `1px solid ${ink.rule}` }}>
      <GlyphLattice
        masks={['seed', 'cross', 'seed', 'spine', 'seed', 'saltire', 'seed', 'quoin']}
        count={40}
        size={34}
        columnWidth={40}
        ink={ink.base}
        accentEvery={12}
        accentInk={COLORS.accent}
        style={{ opacity: 0.5, padding: '26px 0', overflow: 'hidden' }}
      />
      <div
        className="column-flat"
        style={{
          padding: '10px 48px 72px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 32,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <div style={{ font: `600 15px/1 ${sans}`, letterSpacing: '-.02em' }}>Glyphy</div>
          <p style={{ font: `400 12.5px/1.6 ${sans}`, color: ink.soft, margin: '10px 0 0' }}>
            Source-available under PolyForm Noncommercial 1.0.0. Free for personal work, research,
            teaching and public-benefit bodies; a separate licence for anything a business sells.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LINKS.map(([name, href]) => (
            <a
              key={name}
              href={href}
              style={{ font: `500 11px/1 ${mono}`, letterSpacing: '.04em' }}
            >
              {name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
