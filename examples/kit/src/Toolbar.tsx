import type { CSSProperties, ReactElement } from 'react';
/**
 * The global knobs.
 *
 * The design tool this kit came from had its own tweaks panel wired to three
 * props: ink, fill and dot visibility. Outside that tool the same knobs belong
 * to the page, so they live here and drive a single `<GlyphProvider>` — which
 * is also the shortest demonstration of what the provider is for.
 *
 * Pause is not from the design. It earns its place because a page of looping
 * marks is hard to screenshot, and because it shows the clock stopping.
 */

import { COLORS, type Fill } from '@glyphy/core';
import { mono } from './theme.js';

/**
 * The page's own ink.
 *
 * A custom property rather than a hex, so a mark with no ink of its own flips
 * with the page when the reader switches the document to dark. Everything else
 * in the list is a fixed palette colour, because an accent that inverted with
 * the surface would not be an accent.
 */
export const PAGE_INK = 'var(--page-ink)';

const INKS: readonly { readonly value: string; readonly name: string }[] = [
  { value: PAGE_INK, name: 'Ink' },
  { value: COLORS.accent, name: 'Accent' },
  { value: COLORS.error, name: 'Error' },
  { value: COLORS.slate, name: 'Slate' },
];

const FILLS: readonly Fill[] = ['stroke', 'tint'];

function chip(active: boolean): CSSProperties {
  return {
    font: `500 10px/1 ${mono}`,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    padding: '7px 10px',
    borderRadius: 4,
    border: `1px solid ${active ? COLORS.inkInverse : 'rgba(239,236,228,.2)'}`,
    background: active ? COLORS.inkInverse : 'transparent',
    color: active ? COLORS.night : 'rgba(239,236,228,.7)',
    cursor: 'pointer',
  };
}

/** Props for {@link Toolbar}. */
export interface ToolbarProps {
  readonly ink: string;
  readonly fill: Fill;
  readonly dots: boolean;
  readonly paused: boolean;
  readonly onInk: (ink: string) => void;
  readonly onFill: (fill: Fill) => void;
  readonly onDots: (dots: boolean) => void;
  readonly onPaused: (paused: boolean) => void;
}

/** A fixed strip that drives the provider for the whole page. */
export function Toolbar(props: ToolbarProps): ReactElement {
  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 10,
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        flexWrap: 'wrap',
        maxWidth: 'calc(100vw - 40px)',
        background: COLORS.night,
        border: `1px solid rgba(239,236,228,.14)`,
        borderRadius: 8,
        padding: '10px 12px',
        boxShadow: '0 6px 24px var(--page-shadow)',
      }}
    >
      <div style={{ display: 'flex', gap: 5 }}>
        {INKS.map((option) => (
          <button
            key={option.name}
            type="button"
            onClick={() => {
              props.onInk(option.value);
            }}
            style={chip(props.ink === option.value)}
          >
            {option.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 5 }}>
        {FILLS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              props.onFill(option);
            }}
            style={chip(props.fill === option)}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          props.onDots(!props.dots);
        }}
        style={chip(props.dots)}
      >
        Dots
      </button>

      <button
        type="button"
        onClick={() => {
          props.onPaused(!props.paused);
        }}
        style={chip(props.paused)}
      >
        {props.paused ? 'Paused' : 'Running'}
      </button>
    </div>
  );
}
