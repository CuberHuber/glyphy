import { useState, type ReactElement } from 'react';
import { COLORS, PATTERNS, PATTERN_NAMES, type PatternName, type Variant } from '@glyphy/core';
import { Glyph, GlyphRow } from '@glyphy/react';
import { Card, Section } from '../ui.js';
import { caption, eyebrow, ink, inverse, mono, sans } from '../theme.js';

/** The three behaviours the panel's segmented control offers. */
const MOTIONS: readonly { readonly label: string; readonly variant: Variant }[] = [
  { label: 'Travel', variant: 'travel' },
  { label: 'Wave', variant: 'wave' },
  { label: 'Breathe', variant: 'breathe-mask' },
];

/** A slider that shows a value rather than accepting one — this is a mockup of a panel. */
function Readout(props: {
  readonly name: string;
  readonly value: string;
  readonly at: number;
}): ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ font: `400 11px/1 ${sans}`, color: inverse.soft }}>{props.name}</span>
        <span style={{ font: `500 10px/1 ${mono}`, color: COLORS.inkInverse }}>{props.value}</span>
      </div>
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: inverse.border,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '0 auto 0 0',
            width: `${props.at}%`,
            background: COLORS.inkInverse,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${props.at}%`,
            top: -4,
            width: 11,
            height: 11,
            borderRadius: '50%',
            background: COLORS.inkInverse,
          }}
        />
      </div>
    </div>
  );
}

/** Section 08 — the authoring surface, and the two multi-mark compositions. */
export function Panel(): ReactElement {
  const [pattern, setPattern] = useState<PatternName>('cross');
  const [motion, setMotion] = useState<Variant>('travel');
  const [dots, setDots] = useState(true);

  return (
    <Section
      id="panel"
      note="the authoring surface — pick a fill pattern, set the motion, copy the mark"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))',
          gap: 20,
          padding: '40px 0 0',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            background: COLORS.night,
            border: `1px solid ${inverse.hairline}`,
            borderRadius: 10,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 344,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 18px',
              borderBottom: `1px solid ${inverse.hairline}`,
            }}
          >
            <span
              style={{
                font: `500 12px/1 ${sans}`,
                color: COLORS.inkInverse,
                letterSpacing: '-.01em',
              }}
            >
              Glyph
            </span>
            <span style={{ font: `500 10px/1 ${mono}`, color: inverse.ghost }}>
              {PATTERNS[pattern]}
            </span>
          </div>

          <div
            style={{
              padding: '20px 18px',
              borderBottom: `1px solid ${inverse.hairline}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <span
              style={{
                font: `500 9.5px/1 ${mono}`,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: inverse.label,
              }}
            >
              Fill pattern
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
              {PATTERN_NAMES.map((name) => {
                const selected = name === pattern;
                return (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    onClick={() => {
                      setPattern(name);
                    }}
                    style={{
                      aspectRatio: '1',
                      display: 'grid',
                      placeItems: 'center',
                      border: `1px solid ${selected ? COLORS.accent : inverse.border}`,
                      borderRadius: 5,
                      background: selected ? 'rgba(181,82,47,.16)' : inverse.wash,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <Glyph
                      variant="mask"
                      mask={name}
                      size={30}
                      ink={COLORS.inkInverse}
                      dots={false}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              padding: '20px 18px',
              borderBottom: `1px solid ${inverse.hairline}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <span
              style={{
                font: `500 9.5px/1 ${mono}`,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: inverse.label,
              }}
            >
              Motion
            </span>
            <div
              style={{
                display: 'flex',
                gap: 5,
                background: 'rgba(239,236,228,.06)',
                borderRadius: 6,
                padding: 3,
              }}
            >
              {MOTIONS.map((option) => {
                const selected = option.variant === motion;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      setMotion(option.variant);
                    }}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      font: `500 11px/1 ${sans}`,
                      color: selected ? COLORS.night : inverse.soft,
                      background: selected ? COLORS.inkInverse : 'transparent',
                      border: 0,
                      borderRadius: 4,
                      padding: '8px 0',
                      cursor: 'pointer',
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <Readout name="Size" value="96px" at={34} />
            <Readout name="Step duration" value="210ms" at={58} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ font: `400 11px/1 ${sans}`, color: inverse.soft }}>
                Show bare dots
              </span>
              <button
                type="button"
                aria-pressed={dots}
                aria-label="Show bare dots"
                onClick={() => {
                  setDots((on) => !on);
                }}
                style={{
                  width: 34,
                  height: 19,
                  borderRadius: 100,
                  background: dots ? COLORS.accent : inverse.border,
                  position: 'relative',
                  border: 0,
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: dots ? 17 : 2,
                    width: 15,
                    height: 15,
                    borderRadius: '50%',
                    background: COLORS.inkInverse,
                    transition: 'left 160ms cubic-bezier(.4,0,.2,1)',
                  }}
                />
              </button>
            </div>
          </div>

          <div
            style={{
              padding: '26px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
              background: 'rgba(239,236,228,.03)',
            }}
          >
            <Glyph variant={motion} mask={pattern} size={104} ink={COLORS.inkInverse} dots={dots} />
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <span
                style={{
                  flex: 1,
                  textAlign: 'center',
                  font: `500 11.5px/1 ${sans}`,
                  color: COLORS.night,
                  background: COLORS.inkInverse,
                  borderRadius: 6,
                  padding: '11px 0',
                }}
              >
                Copy JSX
              </span>
              <span
                style={{
                  flex: 1,
                  textAlign: 'center',
                  font: `500 11.5px/1 ${sans}`,
                  color: inverse.muted,
                  border: `1px solid rgba(239,236,228,.18)`,
                  borderRadius: 6,
                  padding: '10px 0',
                }}
              >
                Export SVG
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card style={{ padding: 34, display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <span style={eyebrow}>Multiple animation · phase offset</span>
              <span style={{ font: `500 10px/1 ${mono}`, color: ink.ghost }}>
                phase += 2 per mark
              </span>
            </div>
            <GlyphRow variant="travel" count={5} size={64} />
            <p style={{ ...caption, maxWidth: 640 }}>
              A row of marks sharing one clock, each offset two steps — the ring appears to travel
              across the whole row rather than inside each glyph. The only sanctioned exception to
              “one moving glyph per screen”.
            </p>
          </Card>

          <Card style={{ padding: 34, display: 'flex', flexDirection: 'column', gap: 26 }}>
            <span style={eyebrow}>Column wave · one mark, three columns</span>
            <div style={{ display: 'flex', gap: 34, alignItems: 'center', flexWrap: 'wrap' }}>
              <Glyph variant="wave" size={104} />
              <Glyph variant="breathe-mask" mask="cross" size={104} />
              <Glyph variant="breathe-mask" mask="saltire" size={104} fill="tint" />
              <div style={{ maxWidth: 260 }}>
                <div style={{ font: `500 13px/1.3 ${sans}` }}>Wave · Breathe · Breathe (tint)</div>
                <p style={{ ...caption, margin: '8px 0 0' }}>
                  Any fill pattern can carry the breathe motion — the pattern stays legible while
                  opacity cycles 55 → 100%.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
