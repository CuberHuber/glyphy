/**
 * The ⌘K dialog.
 *
 * A native `<dialog>`, so focus trapping, the backdrop and Escape are the
 * platform's job rather than three hooks of mine. Arrow keys move, Enter goes,
 * and the footer says so — a palette that does not teach its own keys is a
 * palette most people click.
 */

import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { Glyph } from '@glyphy/react';
import { ink, mono, sans } from '../theme.js';
import { GROUPS, PER_GROUP, countOf, search, type Hit, type Target } from './index.js';

/** Props for {@link SearchDialog}. */
export interface SearchDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onChoose: (target: Target) => void;
}

/** The thumbnail beside a hit, when the hit is a thing that can be drawn. */
function Thumb(props: { readonly hit: Hit }): ReactElement {
  const { target } = props.hit;
  if (target.kind === 'pattern') {
    return <Glyph variant="mask" mask={target.mask} size={26} dots={false} paused />;
  }
  if (target.kind === 'variant') {
    return <Glyph variant={target.variant} size={26} dots={false} />;
  }
  return (
    <span
      aria-hidden
      style={{
        width: 26,
        height: 26,
        display: 'grid',
        placeItems: 'center',
        font: `500 11px/1 ${mono}`,
        color: ink.ghost,
      }}
    >
      §
    </span>
  );
}

/** The palette. */
export function SearchDialog(props: SearchDialogProps): ReactElement {
  // The elements are held in state rather than in refs. A ref for a DOM node
  // is spelled `null` in React's own types, and absence has one spelling in
  // this repo; a callback ref converts at the boundary instead.
  const [dialog, setDialog] = useState<HTMLDialogElement | undefined>(undefined);
  const [list, setList] = useState<HTMLDivElement | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [at, setAt] = useState(0);

  const hits = useMemo(() => search(query), [query]);
  const total = useMemo(() => countOf(query), [query]);
  const capped = total > hits.length;

  useEffect(() => {
    if (dialog === undefined) return;
    if (props.open && !dialog.open) {
      setQuery('');
      setAt(0);
      dialog.showModal();
    }
    if (!props.open && dialog.open) dialog.close();
  }, [props.open, dialog]);

  // Keep the active row in view when the arrows walk past the fold.
  useEffect(() => {
    list?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [at, list]);

  const choose = useCallback(
    (hit: Hit | undefined) => {
      if (hit === undefined) return;
      props.onChoose(hit.target);
      props.onClose();
    },
    [props],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setAt((current) => (hits.length === 0 ? 0 : (current + 1) % hits.length));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setAt((current) => (hits.length === 0 ? 0 : (current - 1 + hits.length) % hits.length));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        choose(hits[at]);
      }
    },
    [hits, at, choose],
  );

  let cursor = -1;

  return (
    <dialog
      ref={(node) => {
        setDialog(node ?? undefined);
      }}
      className="search-dialog"
      aria-label="Search the kit"
      onClose={props.onClose}
      onClick={(event) => {
        // A click on the dialog element itself is a click on the backdrop; the
        // panel inside stops its own.
        if (event.target === dialog) props.onClose();
      }}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
        }}
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '70vh' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 18px' }}>
          <Glyph variant="thinking" size={20} dots={false} />
          <input
            autoFocus
            type="text"
            value={query}
            aria-label="Search sections, variants, patterns and props"
            placeholder="Search 14 sections, 12 variants, 512 patterns, 21 props…"
            onChange={(event) => {
              setQuery(event.target.value);
              setAt(0);
            }}
            onKeyDown={onKeyDown}
            style={{
              flex: 1,
              border: 0,
              outline: 'none',
              background: 'transparent',
              font: `400 15px/1 ${sans}`,
              padding: '18px 0',
              minWidth: 0,
            }}
          />
          <span style={{ font: `500 10px/1 ${mono}`, color: ink.ghost, whiteSpace: 'nowrap' }}>
            {total} {total === 1 ? 'match' : 'matches'}
          </span>
        </div>

        <div
          ref={(node) => {
            setList(node ?? undefined);
          }}
          role="listbox"
          aria-label="Results"
          style={{ overflowY: 'auto', borderTop: `1px solid ${ink.hairline}`, padding: '8px 0' }}
        >
          {hits.length === 0 && (
            <p
              style={{
                font: `400 13px/1.6 ${sans}`,
                color: ink.soft,
                margin: 0,
                padding: '26px 22px',
                textAlign: 'center',
              }}
            >
              Nothing matches <strong>{query}</strong>. Patterns answer to their bits (
              <span style={{ font: `500 12px ${mono}` }}>010111010</span>), their index, or one of
              the ten names.
            </p>
          )}

          {GROUPS.map((group) => {
            const inGroup = hits.filter((hit) => hit.group === group);
            if (inGroup.length === 0) return undefined;
            return (
              <div key={group}>
                <div
                  style={{
                    font: `500 10px/1 ${mono}`,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: ink.ghost,
                    padding: '12px 22px 8px',
                  }}
                >
                  {group}
                  {inGroup.length === PER_GROUP && capped ? ' · first 6' : ''}
                </div>
                {inGroup.map((hit) => {
                  cursor += 1;
                  const active = cursor === at;
                  const mine = cursor;
                  return (
                    <button
                      key={hit.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      data-active={active}
                      onMouseEnter={() => {
                        setAt(mine);
                      }}
                      onClick={() => {
                        choose(hit);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        width: '100%',
                        textAlign: 'left',
                        border: 0,
                        cursor: 'pointer',
                        padding: '9px 22px',
                        background: active ? 'var(--page-hairline)' : 'transparent',
                      }}
                    >
                      <Thumb hit={hit} />
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            display: 'block',
                            font: `500 13.5px/1.3 ${sans}`,
                            textTransform: hit.group === 'Patterns' ? 'capitalize' : 'none',
                          }}
                        >
                          {hit.title}
                        </span>
                        <span
                          style={{
                            display: 'block',
                            font: `400 11.5px/1.4 ${mono}`,
                            color: ink.soft,
                            marginTop: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {hit.detail}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            padding: '11px 22px',
            borderTop: `1px solid ${ink.hairline}`,
            font: `500 10px/1 ${mono}`,
            color: ink.ghost,
            letterSpacing: '.04em',
            flexWrap: 'wrap',
          }}
        >
          <span>↑↓ move</span>
          <span>↵ go</span>
          <span>esc close</span>
          <span style={{ marginLeft: 'auto' }}>indexed at build, searched in the page</span>
        </div>
      </div>
    </dialog>
  );
}

/** Opens the palette on ⌘K or Ctrl+K, from anywhere on the page. */
export function useSearchShortcut(onOpen: () => void): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      onOpen();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onOpen]);
}
