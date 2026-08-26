/**
 * The handful of shapes the page repeats.
 *
 * A numbered section rule, a specimen card, a spec row. Everything else on the
 * page is written out where it is used, because it appears once.
 */

import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { COLORS } from '@glyphy/core';
import { caption, card, column, ink, mono, sans } from './theme.js';

/** A numbered section heading with its rule. */
export function Section(props: {
  readonly number: string;
  readonly title: string;
  readonly note?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <section style={column}>
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 14,
          padding: '0 0 26px',
          borderBottom: `1px solid ${ink.rule}`,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ font: `500 11px/1 ${mono}`, color: COLORS.accent }}>{props.number}</span>
        <h2 style={{ font: `600 24px/1 ${sans}`, letterSpacing: '-.02em', margin: 0 }}>
          {props.title}
        </h2>
        {props.note !== undefined && (
          <span style={{ font: `400 13px/1 ${sans}`, color: ink.faint }}>{props.note}</span>
        )}
      </header>
      {props.children}
    </section>
  );
}

/** A light specimen card. */
export function Card(props: {
  readonly style?: CSSProperties;
  readonly children: ReactNode;
}): ReactElement {
  return <div style={{ ...card, padding: 30, ...props.style }}>{props.children}</div>;
}

/** One line of a specification table: a name on the left, a value on the right. */
export function SpecRow(props: { readonly name: string; readonly value: string }): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        padding: '13px 0',
        borderBottom: `1px solid ${ink.hairline}`,
      }}
    >
      <span style={{ font: `400 13px/1.3 ${sans}`, color: 'rgba(28,26,23,.6)' }}>{props.name}</span>
      <span style={{ font: `500 12px/1.3 ${mono}` }}>{props.value}</span>
    </div>
  );
}

/**
 * One line of the prop table: the prop name in monospace, its note in prose.
 *
 * The mirror image of {@link SpecRow} — there the exact value is on the right,
 * here the exact thing is the name on the left.
 */
export function PropRow(props: { readonly name: string; readonly note: string }): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        padding: '13px 0',
        borderBottom: `1px solid ${ink.hairline}`,
      }}
    >
      <span style={{ font: `500 12px/1.3 ${mono}` }}>{props.name}</span>
      <span
        style={{
          font: `400 12.5px/1.3 ${sans}`,
          color: 'rgba(28,26,23,.6)',
          textAlign: 'right',
        }}
      >
        {props.note}
      </span>
    </div>
  );
}

/** A specimen with a name and a monospace note under it. */
export function Specimen(props: {
  readonly title: string;
  readonly note: string;
  readonly dark?: boolean;
  readonly children: ReactNode;
  readonly style?: CSSProperties;
}): ReactElement {
  return (
    <div
      style={{
        ...(props.dark === true
          ? {
              background: COLORS.night,
              border: '1px solid rgba(239,236,228,.12)',
              color: COLORS.inkInverse,
            }
          : card),
        borderRadius: 6,
        padding: 36,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 26,
        ...props.style,
      }}
    >
      {props.children}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            font: `500 13px/1.3 ${sans}`,
            color: props.dark === true ? COLORS.inkInverse : undefined,
          }}
        >
          {props.title}
        </div>
        <div
          style={{
            font: `500 10px/1.4 ${mono}`,
            color: props.dark === true ? 'rgba(239,236,228,.45)' : ink.faint,
            marginTop: 5,
          }}
        >
          {props.note}
        </div>
      </div>
    </div>
  );
}

/** A motion state card: the mark, its name, what it does and its timing. */
export function StateCard(props: {
  readonly title: string;
  readonly tag: string;
  readonly body: string;
  readonly timing: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 120 }}>{props.children}</div>
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 10,
          }}
        >
          <span style={{ font: `500 14px/1.2 ${sans}` }}>{props.title}</span>
          <span style={{ font: `500 10px/1 ${mono}`, color: COLORS.accent }}>{props.tag}</span>
        </div>
        <p style={{ ...caption, margin: '9px 0 0' }}>{props.body}</p>
        <div style={{ font: `500 10px/1.5 ${mono}`, color: ink.ghost, marginTop: 11 }}>
          {props.timing}
        </div>
      </div>
    </Card>
  );
}
