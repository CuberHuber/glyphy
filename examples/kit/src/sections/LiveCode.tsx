/**
 * Section 11 — type a mark, watch it render.
 *
 * The snippet is read rather than evaluated: a tiny reader in `live/parse.ts`
 * accepts one self-closing element from a closed vocabulary and rejects
 * anything else by name. No `eval`, no bundler in a worker, nothing that would
 * make a static page on GitHub Pages into an execution surface. The cost of
 * that choice is that only literals work; the benefit is that the page can be
 * served from anywhere without anybody having to think about it.
 */

import { useMemo, useState, type ReactElement } from 'react';
import { COLORS } from '@glyphy/core';
import { Glyph, GlyphLattice, GlyphRow } from '@glyphy/react';
import { Section } from '../ui.js';
import { CopyButton, Note, chipStyle } from '../controls.js';
import { card, ink, mono, sans } from '../theme.js';
import {
  dotsOf,
  fillOf,
  flag,
  list,
  maskModeOf,
  number,
  read,
  text,
  variantOf,
  type Success,
} from '../live/parse.js';

/** Snippets worth starting from. */
const EXAMPLES: readonly { readonly name: string; readonly code: string }[] = [
  { name: 'The mark', code: '<Glyph variant="travel" size={140} label="Loading" />' },
  {
    name: 'Error state',
    code: '<Glyph variant="error" ink="error" size={140} label="Upload failed" />',
  },
  {
    name: 'Gated motion',
    code: '<Glyph variant="travel" mask="saltire" maskMode="gate" size={140} />',
  },
  {
    name: 'A row',
    code: '<GlyphRow variant="travel" count={5} size={64} gap={22} label="Syncing" />',
  },
  {
    name: 'A lattice',
    code: `<GlyphLattice masks={['cross', 'saltire', 'seed']} count={18} size={44} accentEvery={12} />`,
  },
  {
    name: 'Tinted still',
    code: '<Glyph variant="mask" mask="quoin" fill="tint" size={140} dots={false} />',
  },
];

/** Build the element the snippet described. */
function Rendered(props: { readonly reading: Success }): ReactElement {
  const { component, values } = props.reading;

  const shared = {
    variant: variantOf(values),
    size: number(values, 'size'),
    ink: text(values, 'ink'),
    fill: fillOf(values),
    dots: dotsOf(values),
    maskMode: maskModeOf(values),
    phase: number(values, 'phase'),
    paused: flag(values, 'paused'),
    tickMs: number(values, 'tickMs'),
    respectReducedMotion: flag(values, 'respectReducedMotion'),
  };

  if (component === 'GlyphRow') {
    return (
      <GlyphRow
        {...shared}
        mask={text(values, 'mask')}
        count={number(values, 'count') ?? 3}
        stepsApart={number(values, 'stepsApart')}
        gap={number(values, 'gap')}
        label={text(values, 'label')}
      />
    );
  }

  if (component === 'GlyphLattice') {
    return (
      <GlyphLattice
        {...shared}
        masks={list(values, 'masks') ?? ['cross']}
        count={number(values, 'count')}
        columnWidth={number(values, 'columnWidth')}
        accentEvery={number(values, 'accentEvery')}
        accentInk={text(values, 'accentInk') ?? COLORS.accent}
      />
    );
  }

  return (
    <Glyph
      {...shared}
      mask={text(values, 'mask')}
      label={text(values, 'label')}
      live={flag(values, 'live')}
    />
  );
}

/** Section 11 — the live editor. */
export function LiveCode(): ReactElement {
  const [source, setSource] = useState(EXAMPLES[0]?.code ?? '');
  const reading = useMemo(() => read(source), [source]);

  return (
    <Section
      id="live-code"
      note="read, not evaluated — literals only, and every prop checked by name"
    >
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '40px 0 0' }}>
        {EXAMPLES.map((example) => (
          <button
            key={example.name}
            type="button"
            aria-pressed={source === example.code}
            onClick={() => {
              setSource(example.code);
            }}
            style={chipStyle(source === example.code)}
          >
            {example.name}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))',
          gap: 20,
          padding: '20px 0 0',
          alignItems: 'stretch',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <textarea
              value={source}
              spellCheck={false}
              aria-label="Editable snippet"
              onChange={(event) => {
                setSource(event.target.value);
              }}
              rows={7}
              style={{
                width: '100%',
                resize: 'vertical',
                background: COLORS.night,
                color: COLORS.inkInverse,
                border: `1px solid rgba(239,236,228,.12)`,
                borderRadius: 6,
                padding: '26px 96px 26px 26px',
                font: `400 12.5px/1.75 ${mono}`,
              }}
            />
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
              <CopyButton value={source} dark />
            </div>
          </div>

          <div
            role="status"
            style={{
              font: `500 11px/1.5 ${mono}`,
              color: reading.ok ? ink.ghost : COLORS.error,
              minHeight: 34,
              padding: '8px 12px',
              border: `1px solid ${reading.ok ? ink.hairline : COLORS.error}`,
              borderRadius: 4,
            }}
          >
            {reading.ok
              ? `${reading.component} · ${reading.values.size} props set`
              : reading.problem}
          </div>

          <Note>
            Only what the kit&apos;s props can hold: a quoted string, a number, <code>true</code> or{' '}
            <code>false</code>, or an array of quoted strings. Anything else is rejected with the
            reason rather than run — the page has no evaluator in it.
          </Note>
        </div>

        <div
          style={{
            ...card,
            padding: 40,
            display: 'grid',
            placeItems: 'center',
            minHeight: 300,
            overflow: 'hidden',
          }}
        >
          {reading.ok ? (
            <Rendered reading={reading} />
          ) : (
            <span style={{ font: `400 13px/1.5 ${sans}`, color: ink.faint, textAlign: 'center' }}>
              Nothing rendered — fix the snippet on the left.
            </span>
          )}
        </div>
      </div>
    </Section>
  );
}
