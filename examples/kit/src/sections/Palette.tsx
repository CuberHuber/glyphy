/**
 * Section 04 — the palette, and the two colours it reserves.
 *
 * The accent and the error were a single terracotta until this page needed to
 * show a step running and a step that had failed at the same time. This section
 * is the argument for splitting them: the two marks side by side on both
 * surfaces, with the numbers that say neither depends on the other to be read.
 */

import { useState, type ReactElement } from 'react';
import { COLORS, CSS_VARIABLES, RESERVED_COLORS, tintOf } from '@glyphy/core';
import { Glyph } from '@glyphy/react';
import { Section } from '../ui.js';
import { CodeBlock, CopyButton, Note, copyText } from '../controls.js';
import { card, ink, mono, sans } from '../theme.js';

/** Relative luminance of a six-digit hex colour, per WCAG. */
function luminance(hex: string): number {
  const linear = [1, 3, 5]
    .map((at) => parseInt(hex.slice(at, at + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

/** Contrast between two hex colours, as the ratio a report would print. */
function contrast(one: string, other: string): string {
  const [lighter = 0, darker = 0] = [luminance(one), luminance(other)].sort((a, b) => b - a);
  return `${((lighter + 0.05) / (darker + 0.05)).toFixed(2)}:1`;
}

/** What each reserved colour is for, and the state that demonstrates it. */
const RESERVED = {
  accent: {
    hex: COLORS.accent,
    hover: COLORS.accentHover,
    title: 'Accent',
    reservedFor: 'The live step of a flow',
    variant: 'accumulate',
    body: 'The step that is happening now — the active item in a stepper, the row being saved. One per screen, and never for emphasis.',
  },
  error: {
    hex: COLORS.error,
    hover: COLORS.errorHover,
    title: 'Error',
    reservedFor: 'The failed state',
    variant: 'error',
    body: 'A state that did not complete. It does not spend the one-accent budget, because an error is not decoration and a screen may have to show both at once.',
  },
} as const;

/** Every colour, with the sentence that governs it. */
const USES: Readonly<Record<keyof typeof COLORS, string>> = {
  paper: 'Page background',
  surface: 'Cards, one step up',
  ink: 'Body ink on light',
  inkInverse: 'Ink on dark',
  night: 'Dark surface',
  accent: 'The live step',
  accentHover: 'Accent, hovered',
  accentContrast: 'Drawn on the accent',
  error: 'The failed state',
  errorHover: 'Error, hovered',
  errorContrast: 'Drawn on the error',
  slate: 'The optional third ink',
};

/** One reserved colour, shown on both surfaces with its numbers. */
function Reserved(props: { readonly which: (typeof RESERVED_COLORS)[number] }): ReactElement {
  const spec = RESERVED[props.which];
  return (
    <div style={{ ...card, padding: 30, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ font: `600 17px/1 ${sans}`, letterSpacing: '-.01em' }}>{spec.title}</span>
        <span style={{ font: `500 11px/1 ${mono}`, color: spec.hex }}>{spec.hex}</span>
        <span style={{ font: `400 12.5px/1 ${sans}`, color: ink.faint, marginLeft: 'auto' }}>
          reserved for: {spec.reservedFor}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid rgba(28,26,23,.1)`,
            borderRadius: 6,
            padding: '28px 0',
            display: 'grid',
            placeItems: 'center',
            gap: 14,
          }}
        >
          <Glyph variant={spec.variant} size={92} ink={props.which} />
          <span style={{ font: `500 10px/1 ${mono}`, color: 'rgba(28,26,23,.5)' }}>
            {contrast(spec.hex, COLORS.paper)} on paper
          </span>
        </div>
        <div
          style={{
            background: COLORS.night,
            border: `1px solid rgba(239,236,228,.12)`,
            borderRadius: 6,
            padding: '28px 0',
            display: 'grid',
            placeItems: 'center',
            gap: 14,
          }}
        >
          <Glyph variant={spec.variant} size={92} ink={props.which} />
          <span style={{ font: `500 10px/1 ${mono}`, color: 'rgba(239,236,228,.45)' }}>
            {contrast(spec.hex, COLORS.night)} on night
          </span>
        </div>
      </div>

      <Note>{spec.body}</Note>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {(
          [
            ['base', spec.hex],
            ['hover', spec.hover],
            ['tint 18%', tintOf(spec.hex)],
          ] as const
        ).map(([name, value]) => (
          <span
            key={name}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              font: `500 10px/1 ${mono}`,
              color: ink.muted,
              border: `1px solid ${ink.pill}`,
              borderRadius: 100,
              padding: '5px 9px 5px 5px',
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: value,
                border: `1px solid ${ink.hairline}`,
              }}
            />
            {name} {value}
          </span>
        ))}
        <CopyButton value={`ink="${props.which}"`} label={`Copy ink="${props.which}"`} />
      </div>
    </div>
  );
}

/** A swatch in the full palette grid. Clicking it copies the hex. */
function Swatch(props: { readonly name: keyof typeof COLORS }): ReactElement {
  const value = COLORS[props.name];
  const [copied, setCopied] = useState(false);
  const kebab = props.name.replace(/([A-Z])/g, (letter) => `-${letter.toLowerCase()}`);

  return (
    <button
      type="button"
      onClick={() => {
        void copyText(value).then((ok) => {
          if (!ok) return;
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 1200);
        });
      }}
      style={{
        ...card,
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span style={{ height: 62, background: value, display: 'block' }} />
      <span style={{ padding: '11px 12px 13px', display: 'block' }}>
        <span style={{ display: 'block', font: `500 12px/1.2 ${sans}` }}>{kebab}</span>
        <span
          style={{ display: 'block', font: `500 10px/1.4 ${mono}`, color: ink.ghost, marginTop: 4 }}
        >
          {copied ? 'copied' : value}
        </span>
        <span
          style={{ display: 'block', font: `400 11px/1.4 ${sans}`, color: ink.faint, marginTop: 6 }}
        >
          {USES[props.name]}
        </span>
      </span>
    </button>
  );
}

/** The custom properties, exactly as a project would paste them. */
const VARIABLES = `:root {\n${Object.entries(CSS_VARIABLES)
  .map(([name, value]) => `  ${name}: ${value};`)
  .join('\n')}\n}`;

/** Section 04 — the palette. */
export function Palette(): ReactElement {
  return (
    <Section
      id="palette"
      note="two inks, two papers, and two colours that are spent on nothing else"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(380px,100%),1fr))',
          gap: 20,
          padding: '40px 0 0',
        }}
      >
        {RESERVED_COLORS.map((name) => (
          <Reserved key={name} which={name} />
        ))}
      </div>

      <p
        style={{
          font: `400 13px/1.65 ${sans}`,
          color: ink.muted,
          margin: '22px 0 0',
          maxWidth: 760,
          textWrap: 'pretty',
        }}
      >
        These were one colour. A screen that has to say <em>this step is running</em> and{' '}
        <em>this step failed</em> in the same breath cannot do it with one, so the terracotta kept
        the first job and a vermilion took the second. They sit 21 apart in CIE L*a*b* — further
        than the accent is from its own hover — so neither is read as a state of the other.
      </p>

      <div
        style={{
          ...card,
          padding: 30,
          margin: '24px 0 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))',
          gap: 30,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 34, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', placeItems: 'center', gap: 12 }}>
            <Glyph variant="accumulate" size={96} ink="ink" />
            <span style={{ font: `500 10px/1 ${mono}`, color: ink.ghost }}>accumulate</span>
          </div>
          <div style={{ display: 'grid', placeItems: 'center', gap: 12 }}>
            <Glyph variant="error" size={96} ink="ink" />
            <span style={{ font: `500 10px/1 ${mono}`, color: ink.ghost }}>error</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span
            style={{
              font: `500 10px/1 ${mono}`,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--page-eyebrow)',
            }}
          >
            Colour is never the only channel
          </span>
          <Note>
            Both marks here are plain ink. The accent and the error are close in hue — a terracotta
            and a vermilion — and a reader who cannot separate two warm reds still has to be able to
            tell a step running from a step that failed. So the state is carried by the motion
            first: <code style={{ font: `500 12px ${mono}` }}>error</code> cuts rather than eases,
            holds each frame for three ticks, and drops its rings unevenly until only the bare
            lattice is left. The colour agrees with that reading. It does not do the work alone.
          </Note>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(min(160px,100%),1fr))',
          gap: 14,
          padding: '34px 0 0',
        }}
      >
        {(Object.keys(COLORS) as (keyof typeof COLORS)[]).map((name) => (
          <Swatch key={name} name={name} />
        ))}
      </div>

      <div style={{ padding: '34px 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Note>
          Every token as a custom property.{' '}
          <code style={{ font: `500 12px ${mono}` }}>&lt;GlyphProvider cssVariables&gt;</code> emits
          exactly this, and <code style={{ font: `500 12px ${mono}` }}>cssVariableBlock()</code> in{' '}
          <code style={{ font: `500 12px ${mono}` }}>@glyphy/tailwind</code> hands it over as a
          string with the durations and sizes alongside.
        </Note>
        <CodeBlock code={VARIABLES} copy />
      </div>
    </Section>
  );
}
