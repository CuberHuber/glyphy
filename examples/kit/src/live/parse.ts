/**
 * A very small JSX reader.
 *
 * The live-code section lets a reader type a `<Glyph>` and see it render. That
 * is normally done with a bundler in a worker or with `eval`; this page does
 * neither. It reads one self-closing element whose attribute values are string
 * literals, numbers, booleans or arrays of strings — which is the whole of what
 * the kit's props can be — and refuses anything else by name.
 *
 * Nothing here is a general JSX parser and it is not trying to be one. It reads
 * a known, closed vocabulary, which is why it can be safe without being clever.
 */

import {
  PATTERN_NAMES,
  VARIANTS,
  isFill,
  isVariant,
  type Fill,
  type MaskMode,
  type Variant,
} from '@glyphy/core';

/** The three components the reader may write. */
export const COMPONENTS = Object.freeze(['Glyph', 'GlyphRow', 'GlyphLattice'] as const);

/** One of the components. */
export type ComponentName = (typeof COMPONENTS)[number];

/** Everything an attribute is allowed to evaluate to. */
export type Value = string | number | boolean | readonly string[];

/** Props every component takes. */
const SHARED: readonly string[] = [
  'variant',
  'size',
  'ink',
  'fill',
  'dots',
  'maskMode',
  'paused',
  'tick',
  'tickMs',
  'respectReducedMotion',
];

/**
 * What each component accepts on top of the shared set.
 *
 * `phase` is not shared: `GlyphRowProps` omits it and the row sets its own per
 * mark, so offering it there would accept a prop the row then overwrites.
 */
const EXTRA: Readonly<Record<ComponentName, readonly string[]>> = {
  Glyph: ['mask', 'label', 'live', 'phase'],
  GlyphRow: ['count', 'stepsApart', 'gap', 'mask', 'label'],
  GlyphLattice: ['masks', 'count', 'columnWidth', 'accentEvery', 'accentInk', 'phase'],
};

/** Props whose value is a number, on whichever component takes them. */
const NUMERIC: readonly string[] = [
  'size',
  'phase',
  'tick',
  'tickMs',
  'count',
  'stepsApart',
  'gap',
  'columnWidth',
  'accentEvery',
];

/** A snippet that could not be read, with the reason. */
export interface Failure {
  readonly ok: false;
  readonly problem: string;
}

/** A snippet that was read. */
export interface Success {
  readonly ok: true;
  readonly component: ComponentName;
  readonly values: ReadonlyMap<string, Value>;
}

/** The outcome of reading a snippet. */
export type Reading = Success | Failure;

const ELEMENT = /^<([A-Za-z]+)([\s\S]*?)\/>$/;
const ATTRIBUTE = /([A-Za-z][A-Za-z0-9]*)(?:=(?:"([^"]*)"|\{([^}]*)\}))?/g;
const NUMBER = /^-?\d+(?:\.\d+)?$/;
const QUOTED = /^(['"])(.*)\1$/;

/** Read one `{...}` expression. Literals only — there is nothing to evaluate. */
function braced(source: string): Value | undefined {
  const body = source.trim();
  if (NUMBER.test(body)) return Number(body);
  if (body === 'true') return true;
  if (body === 'false') return false;

  const quoted = QUOTED.exec(body);
  if (quoted?.[2] !== undefined) return quoted[2];

  if (body.startsWith('[') && body.endsWith(']')) {
    const inner = body.slice(1, -1).trim();
    if (inner === '') return [];
    const items = inner.split(',').map((item) => QUOTED.exec(item.trim())?.[2]);
    if (items.every((item): item is string => item !== undefined)) return items;
  }

  return undefined;
}

/** Read the attributes off an opening tag, or say which one is not a literal. */
function attributes(source: string): ReadonlyMap<string, Value> | string {
  const values = new Map<string, Value>();
  for (const [, name = '', quoted, expression] of source.matchAll(ATTRIBUTE)) {
    if (quoted !== undefined) {
      values.set(name, quoted);
    } else if (expression === undefined) {
      // A bare attribute is `true`, exactly as JSX has it.
      values.set(name, true);
    } else {
      const value = braced(expression);
      if (value === undefined) {
        return `${name}={${expression.trim()}} is not a literal — use a number, true, false, a quoted string, or an array of quoted strings.`;
      }
      values.set(name, value);
    }
  }
  return values;
}

/** Whether a component takes a prop of this name. */
function accepts(component: ComponentName, name: string): boolean {
  return SHARED.includes(name) || EXTRA[component].includes(name);
}

/**
 * Check that every prop taking a number was given one.
 *
 * `size="96"` reads as a string and `size=96` as a bare attribute; both would
 * be dropped by {@link number} further on, leaving the reader a default-sized
 * mark under a message saying the prop was set.
 */
function checkNumbers(values: ReadonlyMap<string, Value>): string | undefined {
  for (const name of NUMERIC) {
    const value = values.get(name);
    if (value === undefined || typeof value === 'number') continue;
    const example = typeof value === 'string' && NUMBER.test(value) ? value : '96';
    return `${name} is a number — write ${name}={${example}}.`;
  }
  return undefined;
}

/** Check the props whose legal answers are a closed set. */
function checkValues(values: ReadonlyMap<string, Value>): string | undefined {
  const variant = values.get('variant');
  if (variant !== undefined && !isVariant(variant)) {
    return `variant="${String(variant)}" is not one of: ${VARIANTS.join(', ')}.`;
  }

  const fill = values.get('fill');
  if (fill !== undefined && !isFill(fill)) {
    return `fill="${String(fill)}" is either stroke or tint.`;
  }

  const mode = values.get('maskMode');
  if (mode !== undefined && mode !== 'auto' && mode !== 'gate') {
    return `maskMode="${String(mode)}" is either auto or gate.`;
  }

  const dots = values.get('dots');
  if (dots !== undefined && typeof dots !== 'boolean' && dots !== 'auto') {
    return 'dots is true, false, or "auto".';
  }

  const mask = values.get('mask');
  const named: readonly string[] = PATTERN_NAMES;
  if (typeof mask === 'string' && !/^[01]{9}$/.test(mask) && !named.includes(mask)) {
    return `mask="${mask}" is nine bits or one of: ${PATTERN_NAMES.join(', ')}.`;
  }

  return undefined;
}

/** Read a snippet, or say why it could not be read. */
export function read(source: string): Reading {
  const body = source.trim();
  if (body === '') return { ok: false, problem: 'Nothing to render yet.' };

  const element = ELEMENT.exec(body) ?? undefined;
  if (element === undefined) {
    return { ok: false, problem: 'Write one self-closing element, ending in `/>`.' };
  }

  const [, name = '', rest = ''] = element;
  const component = COMPONENTS.find((known) => known === name);
  if (component === undefined) {
    return { ok: false, problem: `${name} is not part of the kit. Try ${COMPONENTS.join(', ')}.` };
  }

  const values = attributes(rest);
  if (typeof values === 'string') return { ok: false, problem: values };

  for (const key of values.keys()) {
    if (!accepts(component, key)) {
      return { ok: false, problem: `${component} has no prop \`${key}\`.` };
    }
  }

  const problem = checkNumbers(values) ?? checkValues(values);
  return problem === undefined ? { ok: true, component, values } : { ok: false, problem };
}

/** A string prop, if the snippet set one. */
export function text(values: ReadonlyMap<string, Value>, name: string): string | undefined {
  const value = values.get(name);
  return typeof value === 'string' ? value : undefined;
}

/** A numeric prop, if the snippet set one. */
export function number(values: ReadonlyMap<string, Value>, name: string): number | undefined {
  const value = values.get(name);
  return typeof value === 'number' ? value : undefined;
}

/** A boolean prop, if the snippet set one. */
export function flag(values: ReadonlyMap<string, Value>, name: string): boolean | undefined {
  const value = values.get(name);
  return typeof value === 'boolean' ? value : undefined;
}

/** A list-of-strings prop, if the snippet set one. */
export function list(
  values: ReadonlyMap<string, Value>,
  name: string,
): readonly string[] | undefined {
  const value = values.get(name);
  return Array.isArray(value) ? value : undefined;
}

/** The variant, already checked. */
export function variantOf(values: ReadonlyMap<string, Value>): Variant | undefined {
  const value = values.get('variant');
  return isVariant(value) ? value : undefined;
}

/** The fill, already checked. */
export function fillOf(values: ReadonlyMap<string, Value>): Fill | undefined {
  const value = values.get('fill');
  return isFill(value) ? value : undefined;
}

/** The mask mode, already checked. */
export function maskModeOf(values: ReadonlyMap<string, Value>): MaskMode | undefined {
  const value = values.get('maskMode');
  return value === 'auto' || value === 'gate' ? value : undefined;
}

/** Dot visibility, already checked. */
export function dotsOf(values: ReadonlyMap<string, Value>): boolean | 'auto' | undefined {
  const value = values.get('dots');
  if (typeof value === 'boolean') return value;
  return value === 'auto' ? 'auto' : undefined;
}
