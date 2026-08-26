/**
 * Section 07 — two marks, one clock.
 *
 * Everywhere else on this page a mark is shown alone, which is the hardest way
 * to judge one. Here two are set beside each other off the same shared counter,
 * so the difference between them is the only thing moving. The column between
 * them lists exactly which props differ, because "these look different" is not
 * a specification and the reader should not have to squint to reverse-engineer
 * one.
 */

import { useState, type ReactElement } from 'react';
import {
  COLORS,
  PATTERNS,
  PATTERN_NAMES,
  VARIANTS,
  patternNameOf,
  type Fill,
  type MaskMode,
  type Variant,
} from '@glyphy/core';
import { Glyph } from '@glyphy/react';
import { Section } from '../ui.js';
import { Field, Note, chipStyle } from '../controls.js';
import { card, ink, mono, sans } from '../theme.js';

/** One side of the comparison. */
interface Side {
  readonly variant: Variant;
  readonly ink: string;
  readonly fill: Fill;
  readonly dots: boolean;
  readonly mask: string;
  readonly maskMode: MaskMode;
}

/** The props the comparison lets a reader move, in the order they are listed. */
const KEYS: readonly (keyof Side)[] = ['variant', 'ink', 'fill', 'dots', 'mask', 'maskMode'];

const INKS = ['ink', 'accent', 'error', 'slate'] as const;

const BASE: Side = {
  variant: 'travel',
  ink: 'ink',
  fill: 'stroke',
  dots: true,
  mask: PATTERNS.cross,
  maskMode: 'auto',
};

/** Pairs the kit has an opinion about. */
const PRESETS: readonly {
  readonly name: string;
  readonly note: string;
  readonly left: Partial<Side>;
  readonly right: Partial<Side>;
}[] = [
  {
    name: 'Stroke vs tint',
    note: 'Stroke for something still happening, tint for something finished. Never both in one mark.',
    left: { variant: 'accumulate', fill: 'stroke' },
    right: { variant: 'accumulate', fill: 'tint' },
  },
  {
    name: 'Accent vs error',
    note: 'The live step and the failed state, on the same variant. Two colours because they are two facts.',
    left: { variant: 'accumulate', ink: 'accent' },
    right: { variant: 'error', ink: 'error' },
  },
  {
    name: 'Travel vs wave',
    note: 'One ring walking the spiral, against a column lighting and handing off. Both read as loading; only one implies an order.',
    left: { variant: 'travel' },
    right: { variant: 'wave' },
  },
  {
    name: 'Auto vs gate',
    note: 'The same motion, clipped to the saltire. Gate is how any pattern gets to own any variant.',
    left: { variant: 'travel', mask: PATTERNS.saltire, maskMode: 'auto' },
    right: { variant: 'travel', mask: PATTERNS.saltire, maskMode: 'gate' },
  },
  {
    name: 'Dots on vs off',
    note: 'The bare lattice is what survives an error. Drop it and the mark loses the ground its rings sit on.',
    left: { variant: 'error', ink: 'error', dots: true },
    right: { variant: 'error', ink: 'error', dots: false },
  },
];

/** How a value reads in the difference column. */
function printed(key: keyof Side, side: Side): string {
  if (key === 'mask') return patternNameOf(side.mask) ?? side.mask;
  const value = side[key];
  return typeof value === 'boolean' ? String(value) : value;
}

/** The controls for one side. */
function Controls(props: {
  readonly side: Side;
  readonly onChange: (side: Side) => void;
}): ReactElement {
  const set = <K extends keyof Side>(key: K, value: Side[K]): void => {
    props.onChange({ ...props.side, [key]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '18px 0 0' }}>
      <Field label="Variant" value={props.side.variant}>
        <select
          aria-label="Variant"
          value={props.side.variant}
          onChange={(event) => {
            set('variant', event.target.value as Variant);
          }}
          style={{
            font: `500 11px/1 ${mono}`,
            padding: '8px 9px',
            borderRadius: 4,
            border: `1px solid ${ink.pill}`,
            background: 'transparent',
            width: '100%',
          }}
        >
          {VARIANTS.map((variant) => (
            <option key={variant} value={variant}>
              {variant}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Ink" value={props.side.ink}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {INKS.map((name) => (
            <button
              key={name}
              type="button"
              aria-label={name}
              aria-pressed={props.side.ink === name}
              onClick={() => {
                set('ink', name);
              }}
              style={{
                ...chipStyle(props.side.ink === name),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: COLORS[name],
                  border: `1px solid ${ink.pill}`,
                }}
              />
              {name}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Pattern" value={patternNameOf(props.side.mask) ?? props.side.mask}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {PATTERN_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={props.side.mask === PATTERNS[name]}
              onClick={() => {
                set('mask', PATTERNS[name]);
              }}
              style={{ ...chipStyle(props.side.mask === PATTERNS[name]), padding: '0 8px' }}
            >
              {name}
            </button>
          ))}
        </div>
      </Field>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {(['stroke', 'tint'] as const).map((fill) => (
          <button
            key={fill}
            type="button"
            aria-pressed={props.side.fill === fill}
            onClick={() => {
              set('fill', fill);
            }}
            style={chipStyle(props.side.fill === fill)}
          >
            {fill}
          </button>
        ))}
        {(['auto', 'gate'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={props.side.maskMode === mode}
            onClick={() => {
              set('maskMode', mode);
            }}
            style={chipStyle(props.side.maskMode === mode)}
          >
            {mode}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={props.side.dots}
          onClick={() => {
            set('dots', !props.side.dots);
          }}
          style={chipStyle(props.side.dots)}
        >
          dots
        </button>
      </div>
    </div>
  );
}

/** One pane: a heading, the mark, and the controls under it. */
function Pane(props: {
  readonly name: string;
  readonly side: Side;
  readonly onChange: (side: Side) => void;
}): ReactElement {
  return (
    <div style={{ ...card, padding: 26 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ font: `600 13px/1 ${sans}` }}>{props.name}</span>
        <span style={{ font: `500 10px/1 ${mono}`, color: ink.ghost }}>{props.side.variant}</span>
      </div>
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 210, padding: '20px 0' }}>
        <Glyph
          variant={props.side.variant}
          size={150}
          ink={props.side.ink}
          fill={props.side.fill}
          dots={props.side.dots}
          mask={props.side.mask}
          maskMode={props.side.maskMode}
        />
      </div>
      <Controls side={props.side} onChange={props.onChange} />
    </div>
  );
}

/** Section 07 — the comparison. */
export function Compare(): ReactElement {
  const [left, setLeft] = useState<Side>({ ...BASE, ...PRESETS[0]?.left });
  const [right, setRight] = useState<Side>({ ...BASE, ...PRESETS[0]?.right });
  const [chosen, setChosen] = useState(0);

  const differences = KEYS.filter((key) => left[key] !== right[key]);

  return (
    <Section id="compare" note="two marks off one clock — the difference is the only thing moving">
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '40px 0 0' }}>
        {PRESETS.map((preset, at) => (
          <button
            key={preset.name}
            type="button"
            aria-pressed={chosen === at}
            onClick={() => {
              setChosen(at);
              setLeft({ ...BASE, ...preset.left });
              setRight({ ...BASE, ...preset.right });
            }}
            style={chipStyle(chosen === at)}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <p
        style={{
          font: `400 13px/1.6 ${sans}`,
          color: ink.muted,
          margin: '16px 0 0',
          maxWidth: 720,
        }}
      >
        {PRESETS[chosen]?.note}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))',
          gap: 20,
          padding: '24px 0 0',
          alignItems: 'start',
        }}
      >
        <Pane name="A" side={left} onChange={setLeft} />
        <Pane name="B" side={right} onChange={setRight} />
      </div>

      <div style={{ ...card, padding: '22px 26px', margin: '20px 0 0' }}>
        <div
          style={{
            font: `500 10px/1 ${mono}`,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: 'var(--page-eyebrow)',
          }}
        >
          {differences.length === 0
            ? 'Identical'
            : `${differences.length} prop${differences.length === 1 ? '' : 's'} apart`}
        </div>
        {differences.length === 0 ? (
          <Note>
            Both sides are the same mark. Because they share one clock they are also on the same
            frame — set two marks running independently and they drift within seconds.
          </Note>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
            {differences.map((key) => (
              <div
                key={key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr 1fr',
                  gap: 14,
                  padding: '11px 0',
                  borderBottom: `1px solid ${ink.hairline}`,
                  alignItems: 'baseline',
                }}
              >
                <span style={{ font: `500 12px/1.3 ${mono}` }}>{key}</span>
                <span style={{ font: `400 12px/1.3 ${mono}`, color: ink.muted }}>
                  A · {printed(key, left)}
                </span>
                <span style={{ font: `400 12px/1.3 ${mono}`, color: ink.muted }}>
                  B · {printed(key, right)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
