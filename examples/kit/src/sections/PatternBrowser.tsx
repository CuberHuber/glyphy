/**
 * Section 14 — all 512 of them.
 *
 * Nine bits is 512 marks, and the kit sanctions ten. The other 502 are not
 * hidden, they are just unnamed, and this is where they are reachable: filter
 * by how many cells are ringed, walk the transforms, and copy the one you want.
 *
 * Every mark in the grid is rendered under a paused provider. A paused mark
 * never subscribes to the clock, so a hundred and twenty-eight stills cost a
 * hundred and twenty-eight renders once rather than fourteen a second forever.
 */

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import {
  CELLS,
  MASK_COUNT,
  PATTERN_NAMES,
  invertMask,
  maskDensity,
  maskFromIndex,
  maskOrbit,
  maskToIndex,
  mirrorMaskX,
  mirrorMaskY,
  patternNameOf,
  rotateMask,
  transposeMask,
} from '@glyphy/core';
import { Glyph, GlyphProvider } from '@glyphy/react';
import { Section } from '../ui.js';
import { CopyButton, Field, Note, chipStyle } from '../controls.js';
import { card, ink, mono, sans } from '../theme.js';

/** How many tiles are drawn at once. */
const PAGE = 128;

/** Every mask, computed once. */
const ALL: readonly string[] = Array.from({ length: MASK_COUNT }, (_, at) => maskFromIndex(at));

/** The transforms a reader can walk from one pattern to the next. */
const MOVES: readonly { readonly name: string; readonly of: (mask: string) => string }[] = [
  { name: 'rotate', of: rotateMask },
  { name: 'mirror x', of: mirrorMaskX },
  { name: 'mirror y', of: mirrorMaskY },
  { name: 'transpose', of: transposeMask },
  { name: 'invert', of: invertMask },
];

/** Densities, plus the answer that means "do not filter". */
const DENSITIES: readonly string[] = [
  'all',
  ...Array.from({ length: CELLS + 1 }, (_, n) => String(n)),
];

/** One tile in the grid. */
function Tile(props: {
  readonly mask: string;
  readonly selected: boolean;
  readonly onSelect: (mask: string) => void;
}): ReactElement {
  const name = patternNameOf(props.mask);
  return (
    <button
      type="button"
      title={`${props.mask}${name === undefined ? '' : ` · ${name}`}`}
      aria-label={`Pattern ${props.mask}`}
      aria-pressed={props.selected}
      onClick={() => {
        props.onSelect(props.mask);
      }}
      style={{
        display: 'grid',
        placeItems: 'center',
        gap: 6,
        padding: '10px 4px 8px',
        borderRadius: 5,
        cursor: 'pointer',
        background: props.selected ? 'var(--glyphy-accent)' : 'transparent',
        border: `1px solid ${props.selected ? 'transparent' : ink.hairline}`,
      }}
    >
      <Glyph
        variant="mask"
        mask={props.mask}
        size={38}
        ink={props.selected ? 'var(--page-surface)' : ink.base}
      />
      <span
        style={{
          font: `500 9px/1 ${mono}`,
          color: props.selected ? 'var(--page-surface)' : ink.ghost,
        }}
      >
        {name ?? maskToIndex(props.mask)}
      </span>
    </button>
  );
}

/** What the reader has narrowed the 512 down to. */
function filtered(density: string, query: string, namedOnly: boolean): readonly string[] {
  const wanted = query.trim().toLowerCase();
  return ALL.filter((mask) => {
    if (density !== 'all' && maskDensity(mask) !== Number(density)) return false;
    const name = patternNameOf(mask);
    if (namedOnly && name === undefined) return false;
    if (wanted === '') return true;
    return (
      mask.includes(wanted) || (name ?? '').includes(wanted) || String(maskToIndex(mask)) === wanted
    );
  });
}

/** The panel describing the pattern in hand. */
function Detail(props: {
  readonly mask: string;
  readonly onSelect: (mask: string) => void;
}): ReactElement {
  const name = patternNameOf(props.mask);
  const orbit = maskOrbit(props.mask);
  const snippet = `<Glyph variant="mask" mask="${name ?? props.mask}" />`;

  return (
    <div style={{ ...card, padding: 26, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', placeItems: 'center', padding: '10px 0' }}>
        <Glyph variant="mask" mask={props.mask} size={150} />
      </div>

      <div>
        <div style={{ font: `600 16px/1 ${sans}`, textTransform: 'capitalize' }}>
          {name ?? 'Unnamed'}
        </div>
        <div style={{ font: `500 11px/1.6 ${mono}`, color: ink.muted, marginTop: 8 }}>
          bits {props.mask}
          <br />
          index {maskToIndex(props.mask)} of {MASK_COUNT}
          <br />
          density {maskDensity(props.mask)} of {CELLS}
          <br />
          symmetries {orbit.length}
        </div>
      </div>

      <Field label="Transforms">
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {MOVES.map((move) => (
            <button
              key={move.name}
              type="button"
              onClick={() => {
                props.onSelect(move.of(props.mask));
              }}
              style={chipStyle(false)}
            >
              {move.name}
            </button>
          ))}
        </div>
      </Field>

      <Field label={`Orbit · ${orbit.length}`}>
        <GlyphProvider theme={{ paused: true }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {orbit.map((sibling) => (
              <button
                key={sibling}
                type="button"
                aria-label={`Pattern ${sibling}`}
                onClick={() => {
                  props.onSelect(sibling);
                }}
                style={{
                  padding: 6,
                  borderRadius: 4,
                  cursor: 'pointer',
                  border: `1px solid ${sibling === props.mask ? ink.base : ink.hairline}`,
                  background: 'transparent',
                }}
              >
                <Glyph variant="mask" mask={sibling} size={34} />
              </button>
            ))}
          </div>
        </GlyphProvider>
      </Field>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <code style={{ font: `500 11px/1.5 ${mono}`, color: ink.muted, flex: '1 1 200px' }}>
          {snippet}
        </code>
        <CopyButton value={snippet} />
      </div>
    </div>
  );
}

/** Props for {@link PatternBrowser}. */
export interface PatternBrowserProps {
  /** The pattern in hand. Lifted so the search palette can deep-link to one. */
  readonly selected: string;
  readonly onSelect: (mask: string) => void;
}

/** Section 14 — the browser. */
export function PatternBrowser(props: PatternBrowserProps): ReactElement {
  const [density, setDensity] = useState('all');
  const [query, setQuery] = useState('');
  const [namedOnly, setNamedOnly] = useState(false);
  const { selected, onSelect: setSelected } = props;
  const [page, setPage] = useState(0);

  const matches = useMemo(() => filtered(density, query, namedOnly), [density, query, namedOnly]);
  const pages = Math.max(1, Math.ceil(matches.length / PAGE));
  const at = Math.min(page, pages - 1);
  const shown = matches.slice(at * PAGE, at * PAGE + PAGE);

  // The search palette can select a pattern the grid is not currently showing —
  // index 400 is on the fourth page — and a highlighted tile nowhere on screen
  // is the deep link half-working. Page to whichever page holds it.
  //
  // Keyed on the selection changing rather than on `matches`, because narrowing
  // the filters resets to the first page on purpose and re-running here would
  // undo that.
  const revealed = useRef(selected);
  useEffect(() => {
    if (revealed.current === selected) return;
    revealed.current = selected;
    const index = matches.indexOf(selected);
    if (index >= 0) setPage(Math.floor(index / PAGE));
  }, [selected, matches]);

  const narrow = (change: () => void): void => {
    change();
    setPage(0);
  };

  return (
    <Section
      id="browser"
      note={`all ${MASK_COUNT} — the ${PATTERN_NAMES.length} sanctioned ones are named, the rest are numbered`}
    >
      <div className="split" style={{ padding: '40px 0 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Field label="Ringed cells">
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {DENSITIES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={density === option}
                    onClick={() => {
                      narrow(() => {
                        setDensity(option);
                      });
                    }}
                    style={{ ...chipStyle(density === option), padding: '0 8px' }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Search">
              <input
                type="search"
                value={query}
                placeholder="bits, name or index"
                aria-label="Search patterns"
                onChange={(event) => {
                  const next = event.target.value;
                  narrow(() => {
                    setQuery(next);
                  });
                }}
                style={{
                  font: `400 12px/1 ${mono}`,
                  padding: '9px 10px',
                  borderRadius: 4,
                  border: `1px solid ${ink.pill}`,
                  background: 'transparent',
                  width: 190,
                }}
              />
            </Field>

            <button
              type="button"
              aria-pressed={namedOnly}
              onClick={() => {
                narrow(() => {
                  setNamedOnly(!namedOnly);
                });
              }}
              style={chipStyle(namedOnly)}
            >
              named only
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ font: `500 10px/1 ${mono}`, color: ink.ghost }}>
              {matches.length} of {MASK_COUNT}
              {pages > 1 ? ` · page ${at + 1} of ${pages}` : ''}
            </span>
            {pages > 1 && (
              <div style={{ display: 'flex', gap: 5 }}>
                <button
                  type="button"
                  disabled={at === 0}
                  onClick={() => {
                    setPage(at - 1);
                  }}
                  style={{ ...chipStyle(false), opacity: at === 0 ? 0.4 : 1 }}
                >
                  previous
                </button>
                <button
                  type="button"
                  disabled={at >= pages - 1}
                  onClick={() => {
                    setPage(at + 1);
                  }}
                  style={{ ...chipStyle(false), opacity: at >= pages - 1 ? 0.4 : 1 }}
                >
                  next
                </button>
              </div>
            )}
          </div>

          {shown.length === 0 ? (
            <div style={{ ...card, padding: 40, display: 'grid', placeItems: 'center' }}>
              <Note>Nothing matches. Widen the density, or clear the search.</Note>
            </div>
          ) : (
            <GlyphProvider theme={{ paused: true }}>
              <div
                style={{
                  ...card,
                  padding: 14,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(min(62px,100%),1fr))',
                  gap: 4,
                }}
              >
                {shown.map((mask) => (
                  <Tile
                    key={mask}
                    mask={mask}
                    selected={mask === selected}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            </GlyphProvider>
          )}
        </div>

        <Detail mask={selected} onSelect={setSelected} />
      </div>
    </Section>
  );
}
