import type { ReactElement } from 'react';
import { Glyph } from '@glyphy/react';
import { Section } from '../ui.js';
import { figure } from '../theme.js';

/**
 * The ramp the kit is drawn at.
 *
 * The two smallest rungs drop their bare dots: below the floor the dots
 * collapse into the ring stroke and the mark turns to mush.
 */
const RAMP = [
  { size: 16, dots: false },
  { size: 24, dots: false },
  { size: 32, dots: true },
  { size: 48, dots: true },
  { size: 96, dots: true },
  { size: 160, dots: true },
] as const;

/** Section 02 — the mark at every size it is specified for. */
export function Scale(): ReactElement {
  return (
    <Section id="scale" note="stroke and dot scale with the box; below 24px drop the bare dots">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 44,
          flexWrap: 'wrap',
          padding: '44px 0 0',
        }}
      >
        {RAMP.map(({ size, dots }) => (
          <div
            key={size}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
          >
            <Glyph variant="all" size={size} dots={dots} />
            <span style={figure}>{size}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
