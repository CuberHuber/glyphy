/**
 * The handful of shapes the page repeats.
 *
 * A numbered section rule, a specimen card, a spec row. Everything else on the
 * page is written out where it is used, because it appears once.
 */

import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { COLORS } from '@glyphy/core';
import { numberOf, titleOf } from './outline.js';
import { GLYPH_PROPS, type PropSpec } from './props.js';
import { caption, card, fixed, ink, mono, sans } from './theme.js';

/**
 * A numbered section heading with its rule.
 *
 * The number and the heading come from the outline rather than from props, so
 * the nav, the anchor and the printed number cannot drift apart.
 */
export function Section(props: {
  readonly id: string;
  readonly note?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <section id={props.id} className="column">
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
        <span style={{ font: `500 11px/1 ${mono}`, color: COLORS.accent }}>
          {numberOf(props.id)}
        </span>
        <h2 style={{ font: `600 24px/1 ${sans}`, letterSpacing: '-.02em', margin: 0 }}>
          {titleOf(props.id)}
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
      <span style={{ font: `400 13px/1.3 ${sans}`, color: ink.muted }}>{props.name}</span>
      <span style={{ font: `500 12px/1.3 ${mono}` }}>{props.value}</span>
    </div>
  );
}

/**
 * The prop table.
 *
 * Four columns, types written as literal unions, and a horizontal scroll on the
 * container rather than a wrap — every kit surveyed for `design/BRIEF.md` does
 * exactly this, and none of them generates it. A missing default is an em dash,
 * not an empty cell, so a reader can tell "none" from "nobody filled this in".
 */
export function PropTable(props: { readonly on?: PropSpec['on'] }): ReactElement {
  const rows =
    props.on === undefined ? GLYPH_PROPS : GLYPH_PROPS.filter((row) => row.on === props.on);
  const cell = {
    padding: '11px 14px 11px 0',
    borderBottom: `1px solid ${ink.hairline}`,
    verticalAlign: 'top',
  } as const;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{ borderCollapse: 'collapse', width: '100%', minWidth: 460, textAlign: 'left' }}
      >
        <thead>
          <tr>
            {['Prop', 'Type', 'Default', 'What it does'].map((head) => (
              <th
                key={head}
                style={{
                  font: `500 10px/1 ${mono}`,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: 'var(--page-eyebrow)',
                  padding: '0 14px 10px 0',
                  borderBottom: `1px solid ${ink.rule}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.on}.${row.name}`}>
              <td style={{ ...cell, font: `500 12px/1.4 ${mono}`, whiteSpace: 'nowrap' }}>
                {row.name}
              </td>
              <td style={{ ...cell, font: `400 11px/1.5 ${mono}`, color: ink.soft, maxWidth: 240 }}>
                {row.type}
              </td>
              <td
                style={{
                  ...cell,
                  font: `500 11px/1.5 ${mono}`,
                  color: ink.ghost,
                  whiteSpace: 'nowrap',
                }}
              >
                {row.fallback}
              </td>
              <td
                style={{
                  ...cell,
                  paddingRight: 0,
                  font: `400 12.5px/1.5 ${sans}`,
                  color: ink.muted,
                }}
              >
                {row.note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * A specimen with a name and a monospace note under it.
 *
 * Both surfaces are fixed rather than themed. The section that uses this is
 * about the two surfaces themselves, so a light specimen has to stay light when
 * the page around it goes dark — otherwise it is a specimen of nothing.
 */
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
          : {
              background: COLORS.surface,
              border: `1px solid ${fixed.hairline}`,
              color: COLORS.ink,
            }),
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
            color: props.dark === true ? COLORS.inkInverse : COLORS.ink,
          }}
        >
          {props.title}
        </div>
        <div
          style={{
            font: `500 10px/1.4 ${mono}`,
            color: props.dark === true ? 'rgba(239,236,228,.45)' : fixed.faint,
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
