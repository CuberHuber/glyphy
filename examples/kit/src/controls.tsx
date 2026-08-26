/**
 * The controls the interactive sections share.
 *
 * `ui.tsx` holds the document's shapes — a section rule, a specimen card. This
 * file holds the things a reader can push. They are written once here because
 * the playground, the comparison and the pattern browser would otherwise grow
 * three slightly different sliders, and a kit page that cannot keep its own
 * controls consistent is not making a strong case for itself.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { fieldLabel, ink, mono, sans } from './theme.js';

/** How long the copy button admits to having worked. */
const COPIED_MS = 1400;

/**
 * Put text on the clipboard.
 *
 * The async clipboard is absent over plain HTTP and in older browsers, so this
 * falls back to a selection the reader can copy by hand rather than failing
 * silently — the page is served from GitHub Pages over TLS, but it is also
 * opened from `file://` by anybody reading the built output.
 */
export async function copyText(value: string): Promise<boolean> {
  // Typed as optional on the way in: the DOM lib declares `clipboard` as always
  // present, and it is not — it is absent over plain HTTP and in older engines.
  const clipboard: Clipboard | undefined =
    typeof navigator === 'undefined' ? undefined : navigator.clipboard;
  if (clipboard === undefined) return false;
  try {
    await clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

/** A button that copies a string and says so. */
export function CopyButton(props: {
  readonly value: string;
  readonly label?: string;
  readonly dark?: boolean;
  readonly style?: CSSProperties;
}): ReactElement {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      if (timer.current !== undefined) clearTimeout(timer.current);
    },
    [],
  );

  const onClick = useCallback(() => {
    void copyText(props.value).then((ok) => {
      setState(ok ? 'copied' : 'failed');
      if (timer.current !== undefined) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setState('idle');
      }, COPIED_MS);
    });
  }, [props.value]);

  const said =
    state === 'copied' ? 'Copied' : state === 'failed' ? 'Press ⌘C' : (props.label ?? 'Copy');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: TAP,
        font: `500 10px/1 ${mono}`,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        padding: '0 11px',
        borderRadius: 4,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        border: `1px solid ${props.dark === true ? 'rgba(239,236,228,.2)' : ink.pill}`,
        background: 'transparent',
        color: props.dark === true ? 'rgba(239,236,228,.75)' : ink.muted,
        ...props.style,
      }}
    >
      {said}
    </button>
  );
}

/** A dark code slab, optionally with a copy button in its corner. */
export function CodeBlock(props: {
  readonly code: string;
  readonly copy?: boolean;
  readonly style?: CSSProperties;
}): ReactElement {
  return (
    <div
      style={{
        position: 'relative',
        background: '#191816',
        border: '1px solid rgba(239,236,228,.12)',
        borderRadius: 6,
        ...props.style,
      }}
    >
      {props.copy === true && (
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <CopyButton value={props.code} dark />
        </div>
      )}
      <pre
        style={{
          margin: 0,
          padding: props.copy === true ? '30px 96px 30px 26px' : '26px',
          font: `400 12.5px/1.75 ${mono}`,
          color: '#efece4',
          whiteSpace: 'pre',
          overflow: 'auto',
        }}
      >
        {props.code}
      </pre>
    </div>
  );
}

/** A labelled row in a control panel. */
export function Field(props: {
  readonly label: string;
  readonly value?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <span style={fieldLabel}>{props.label}</span>
        {props.value !== undefined && (
          <span style={{ font: `500 10px/1 ${mono}`, color: ink.ghost }}>{props.value}</span>
        )}
      </div>
      {props.children}
    </div>
  );
}

/**
 * Minimum height for anything a finger has to land on.
 *
 * The chips were 26px, which clears the 24px floor and misses every guideline
 * above it. Height is set rather than derived from padding so a narrower chip
 * stays as tall as a wide one.
 */
export const TAP = 32;

/** The chip every segmented control is made of. */
export function chipStyle(active: boolean): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: TAP,
    font: `500 10px/1 ${mono}`,
    letterSpacing: '.05em',
    padding: '0 10px',
    borderRadius: 4,
    cursor: 'pointer',
    border: `1px solid ${active ? 'transparent' : ink.pill}`,
    background: active ? ink.base : 'transparent',
    color: active ? 'var(--page-paper)' : ink.muted,
  };
}

/** A row of mutually exclusive chips. */
export function Segmented<T extends string>(props: {
  readonly label: string;
  readonly options: readonly T[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly name?: (value: T) => string;
}): ReactElement {
  return (
    <Field label={props.label}>
      <div
        role="group"
        aria-label={props.label}
        style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}
      >
        {props.options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={props.value === option}
            onClick={() => {
              props.onChange(option);
            }}
            style={chipStyle(props.value === option)}
          >
            {props.name?.(option) ?? option}
          </button>
        ))}
      </div>
    </Field>
  );
}

/** A labelled range input that prints its own value. */
export function Slider(props: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly unit?: string;
  readonly onChange: (value: number) => void;
}): ReactElement {
  return (
    <Field label={props.label} value={`${props.value}${props.unit ?? ''}`}>
      <input
        type="range"
        aria-label={props.label}
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        onChange={(event) => {
          props.onChange(Number(event.target.value));
        }}
        style={{ width: '100%', accentColor: 'var(--glyphy-accent)' }}
      />
    </Field>
  );
}

/** An on/off chip. */
export function Toggle(props: {
  readonly label: string;
  readonly value: boolean;
  readonly onChange: (value: boolean) => void;
  readonly on?: string;
  readonly off?: string;
}): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={props.value}
      onClick={() => {
        props.onChange(!props.value);
      }}
      style={chipStyle(props.value)}
    >
      {props.value ? (props.on ?? props.label) : (props.off ?? props.label)}
    </button>
  );
}

/** A colour swatch that doubles as a radio button. */
export function InkSwatch(props: {
  readonly name: string;
  readonly value: string;
  readonly active: boolean;
  readonly onChange: (value: string) => void;
}): ReactElement {
  return (
    <button
      type="button"
      title={`${props.name} · ${props.value}`}
      aria-label={props.name}
      aria-pressed={props.active}
      onClick={() => {
        props.onChange(props.value);
      }}
      style={{
        width: TAP,
        height: TAP,
        borderRadius: 4,
        cursor: 'pointer',
        background: props.value,
        border: props.active ? `2px solid ${ink.base}` : `1px solid ${ink.pill}`,
        boxShadow: props.active ? `0 0 0 2px var(--page-surface) inset` : undefined,
      }}
    />
  );
}

/** A nine-cell bit editor: click a cell to ring it. */
export function MaskEditor(props: {
  readonly value: string;
  readonly onChange: (mask: string) => void;
}): ReactElement {
  return (
    <div
      role="group"
      aria-label="Fill pattern, nine cells"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3,${TAP}px)`,
        gap: 4,
      }}
    >
      {Array.from({ length: 9 }, (_, cell) => {
        const on = props.value[cell] === '1';
        return (
          <button
            key={cell}
            type="button"
            aria-label={`Cell ${cell + 1}`}
            aria-pressed={on}
            onClick={() => {
              const bits = Array.from({ length: 9 }, (_, at) =>
                at === cell ? (on ? '0' : '1') : (props.value[at] ?? '0'),
              );
              props.onChange(bits.join(''));
            }}
            style={{
              width: TAP,
              height: TAP,
              padding: 0,
              cursor: 'pointer',
              borderRadius: 4,
              border: `1px solid ${on ? 'transparent' : ink.pill}`,
              background: on ? 'var(--glyphy-accent)' : 'transparent',
            }}
          />
        );
      })}
    </div>
  );
}

/** A quiet inline note, for the sentence that explains a control. */
export function Note(props: { readonly children: ReactNode }): ReactElement {
  return (
    <p style={{ font: `400 12.5px/1.6 ${sans}`, color: ink.soft, margin: 0, textWrap: 'pretty' }}>
      {props.children}
    </p>
  );
}
