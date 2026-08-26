import type { ReactElement } from 'react';
import { COLORS, type Variant } from '@glyphy/core';
import { Glyph } from '@glyphy/react';
import { Section, StateCard } from '../ui.js';

interface State {
  readonly variant: Variant;
  readonly title: string;
  readonly tag: string;
  readonly body: string;
  readonly timing: string;
  readonly ink?: string;
}

const STATES: readonly State[] = [
  {
    variant: 'idle',
    title: 'Idle',
    tag: 'breathe',
    body: 'Centre ring only, scaling 1.00 → 1.08 on a 3s sine. Dots hold at 42%.',
    timing: '3000ms · sine · infinite',
  },
  {
    variant: 'travel',
    title: 'Loading · travel',
    tag: 'stepped',
    body: 'One ring walks the spiral path with a two-cell fading trail. Grid-snapped, never interpolated between cells.',
    timing: '210ms/cell · 9 steps · loop',
  },
  {
    variant: 'accumulate',
    title: 'Loading · accumulate',
    tag: 'additive',
    body: 'Rings draw on in spiral order until all nine are set, hold two beats, reset. Use when duration is unknown but progress matters.',
    timing: '280ms/cell · draw-on 300ms · loop',
  },
  {
    variant: 'thinking',
    title: 'Thinking',
    tag: 'stochastic',
    body: 'Cells ring on and off with no fixed path — deliberately unpredictable, so it reads as considering rather than counting.',
    timing: '350ms/frame · hash-seeded · loop',
  },
  {
    variant: 'snap',
    title: 'Success · snap',
    tag: 'mechanical',
    body: 'All nine rings arrive in a single 50ms frame. No stagger, no easing — the hard cut is the payoff.',
    timing: '50ms in · 1120ms hold · linear',
  },
  {
    variant: 'collapse',
    title: 'Success · collapse',
    tag: 'morph',
    body: 'The full field folds inward to a single oversized centre ring — the resting mark. Use as the terminal state of a flow.',
    timing: '340ms · cubic(.4,0,.2,1) · once',
  },
  {
    variant: 'error',
    title: 'Error · flicker out',
    tag: 'accent only',
    body: "Rings drop out unevenly and the bare dots remain — the lattice survives, the state doesn't. The one state that may use the accent.",
    timing: '50ms steps · 11 frames · once',
    ink: COLORS.accent,
  },
];

/** Section 04 — all seven behaviours, live and looping. */
export function MotionStates(): ReactElement {
  return (
    <Section
      number="04"
      title="Motion states"
      note="all live, all looping — one glyph, seven behaviours"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(252px,1fr))',
          gap: 20,
          padding: '40px 0 0',
        }}
      >
        {STATES.map((state) => (
          <StateCard
            key={state.title}
            title={state.title}
            tag={state.tag}
            body={state.body}
            timing={state.timing}
          >
            <Glyph variant={state.variant} size={104} ink={state.ink} />
          </StateCard>
        ))}
      </div>
    </Section>
  );
}
