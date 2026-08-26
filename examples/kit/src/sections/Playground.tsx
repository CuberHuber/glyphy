/**
 * Section 06 — every prop, on a knob.
 *
 * The kit page can only show the combinations somebody chose in advance. This
 * section shows the other ones: pick a variant, a pattern, a size and an ink,
 * and read back the exact `<Glyph>` that produces what is on screen. The code
 * is generated from the same state the mark is, so it cannot describe a
 * different component from the one beside it.
 */

import { useMemo, useState, type ReactElement } from 'react';
import {
  COLORS,
  DEFAULT_MASK,
  MIN_SIZE,
  MAX_SIZE,
  PATTERNS,
  PATTERN_NAMES,
  TICK_MS,
  VARIANTS,
  glyphStyle,
  patternNameOf,
  restingFrame,
  type Fill,
  type MaskMode,
  type Variant,
} from '@glyphy/core';
import { GLYPH_DEFAULTS, Glyph, type DotsSetting } from '@glyphy/react';
import { Section } from '../ui.js';
import {
  CodeBlock,
  Field,
  MaskEditor,
  Note,
  Segmented,
  Slider,
  Toggle,
  chipStyle,
} from '../controls.js';
import { card, ink, mono, sans } from '../theme.js';

/** The inks the playground offers by name, in the order the palette reads. */
const INKS: readonly { readonly name: string; readonly token: string }[] = [
  { name: 'Ink', token: 'ink' },
  { name: 'Inverse', token: 'inkInverse' },
  { name: 'Accent', token: 'accent' },
  { name: 'Error', token: 'error' },
  { name: 'Slate', token: 'slate' },
];

const FILLS: readonly Fill[] = ['stroke', 'tint'];
const MASK_MODES: readonly MaskMode[] = ['auto', 'gate'];
const DOTS: readonly DotsSetting[] = [true, false, 'auto'];

/** Everything the playground holds. */
interface Settings {
  readonly variant: Variant;
  readonly size: number;
  readonly ink: string;
  readonly fill: Fill;
  readonly dots: DotsSetting;
  readonly mask: string;
  readonly maskMode: MaskMode;
  readonly phase: number;
  readonly tickMs: number;
  readonly paused: boolean;
  readonly dark: boolean;
  readonly label: string;
}

const START: Settings = {
  variant: 'travel',
  size: 160,
  ink: 'ink',
  fill: 'stroke',
  dots: true,
  mask: DEFAULT_MASK,
  maskMode: 'auto',
  phase: 0,
  tickMs: TICK_MS,
  paused: false,
  dark: false,
  label: '',
};

/** Combinations worth arriving at directly. */
const PRESETS: readonly { readonly name: string; readonly settings: Partial<Settings> }[] = [
  {
    name: 'Button spinner',
    settings: {
      variant: 'travel',
      size: 24,
      dots: 'auto',
      ink: 'ink',
      fill: 'stroke',
      label: 'Saving',
    },
  },
  {
    name: 'AI thinking',
    settings: { variant: 'thinking', size: 120, ink: 'ink', fill: 'stroke', label: 'Thinking' },
  },
  {
    name: 'Saved',
    settings: { variant: 'collapse', size: 120, ink: 'ink', fill: 'tint', label: 'Saved' },
  },
  {
    name: 'Failed',
    settings: { variant: 'error', size: 120, ink: 'error', fill: 'stroke', label: 'Upload failed' },
  },
  {
    name: 'Gated travel',
    settings: { variant: 'travel', size: 160, mask: PATTERNS.saltire, maskMode: 'gate' },
  },
  {
    name: 'Texture tile',
    settings: {
      variant: 'breathe-mask',
      size: 96,
      mask: PATTERNS.quoin,
      fill: 'tint',
      dots: false,
    },
  },
];

/**
 * The props that describe how the mark looks, as JSX attribute strings.
 *
 * Anything already equal to the kit's own default is left out: a snippet that
 * repeats the defaults back is longer and says less.
 */
function appearance(settings: Settings): readonly string[] {
  const written: string[] = [];
  if (settings.variant !== GLYPH_DEFAULTS.variant) written.push(`variant="${settings.variant}"`);
  if (settings.size !== GLYPH_DEFAULTS.size) written.push(`size={${settings.size}}`);
  if (settings.ink !== 'ink') written.push(`ink="${settings.ink}"`);
  if (settings.fill !== GLYPH_DEFAULTS.fill) written.push(`fill="${settings.fill}"`);
  if (settings.dots !== GLYPH_DEFAULTS.dots) {
    written.push(settings.dots === 'auto' ? 'dots="auto"' : `dots={${String(settings.dots)}}`);
  }
  return written;
}

/** The props about the pattern, the clock and what the mark is called. */
function behaviour(settings: Settings): readonly string[] {
  const written: string[] = [];
  if (settings.maskMode === 'gate' || settings.variant.endsWith('mask')) {
    written.push(`mask="${patternNameOf(settings.mask) ?? settings.mask}"`);
  }
  if (settings.maskMode !== GLYPH_DEFAULTS.maskMode)
    written.push(`maskMode="${settings.maskMode}"`);
  if (settings.phase !== GLYPH_DEFAULTS.phase) written.push(`phase={${settings.phase}}`);
  if (settings.tickMs !== GLYPH_DEFAULTS.tickMs) written.push(`tickMs={${settings.tickMs}}`);
  if (settings.paused) written.push('paused');
  if (settings.label !== '') written.push(`label="${settings.label}"`);
  return written;
}

/** The exact `<Glyph>` that produces what is on the stage. */
function generate(settings: Settings): string {
  const written = [...appearance(settings), ...behaviour(settings)];
  if (written.length === 0) return '<Glyph />';
  return `<Glyph\n${written.map((line) => `  ${line}`).join('\n')}\n/>`;
}

/**
 * The reduced-motion still, drawn through the headless door.
 *
 * `<Glyph>` shows this by itself when the reader's system asks for it, which
 * means the page cannot demonstrate it on a machine that does not. Reaching for
 * `restingFrame` and `glyphStyle` directly is both the honest way to preview it
 * and the shortest example of what `@glyphy/core` is for.
 */
function Still(props: {
  readonly variant: Variant;
  readonly size: number;
  readonly ink: string;
  readonly fill: Fill;
  readonly mask: string;
  readonly maskMode: MaskMode;
}): ReactElement {
  const style = useMemo(
    () =>
      glyphStyle({
        size: props.size,
        ink: props.ink,
        fill: props.fill,
        frames: restingFrame(props.variant, { mask: props.mask, maskMode: props.maskMode }),
      }),
    [props.variant, props.size, props.ink, props.fill, props.mask, props.maskMode],
  );

  return (
    <div aria-hidden style={style.grid}>
      {style.cells.map((cell, at) => (
        <div key={at} style={cell.wrapper}>
          <div style={cell.ring} />
          <div style={cell.dot} />
        </div>
      ))}
    </div>
  );
}

/** Section 06 — the playground. */
export function Playground(): ReactElement {
  const [settings, setSettings] = useState<Settings>(START);
  const set = <K extends keyof Settings>(key: K, value: Settings[K]): void => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const code = generate(settings);

  return (
    <Section
      id="playground"
      note="every prop on a knob — the code below is generated from the mark beside it"
    >
      <div className="split" style={{ padding: '40px 0 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setSettings((current) => ({ ...current, ...preset.settings }));
                }}
                style={chipStyle(false)}
              >
                {preset.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setSettings(START);
              }}
              style={{ ...chipStyle(false), color: ink.faint }}
            >
              Reset
            </button>
          </div>

          <div
            style={{
              ...(settings.dark
                ? { background: COLORS.night, border: `1px solid rgba(239,236,228,.12)` }
                : card),
              borderRadius: 6,
              minHeight: 360,
              display: 'grid',
              placeItems: 'center',
              padding: 40,
            }}
          >
            <Glyph
              variant={settings.variant}
              size={settings.size}
              ink={settings.ink}
              fill={settings.fill}
              dots={settings.dots}
              mask={settings.mask}
              maskMode={settings.maskMode}
              phase={settings.phase}
              tickMs={settings.tickMs}
              paused={settings.paused}
              label={settings.label === '' ? undefined : settings.label}
            />
          </div>

          <CodeBlock code={code} copy />

          <div
            style={{
              ...card,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              flexWrap: 'wrap',
            }}
          >
            <Still
              variant={settings.variant}
              size={56}
              ink={settings.ink === 'inkInverse' ? 'ink' : settings.ink}
              fill={settings.fill}
              mask={settings.mask}
              maskMode={settings.maskMode}
            />
            <div style={{ flex: '1 1 260px' }}>
              <div style={{ font: `500 12.5px/1.2 ${sans}` }}>Reduced motion still</div>
              <Note>
                What a reader who has asked their system for reduced motion sees instead — the frame
                that carries the meaning, with the clock never subscribed to at all.
              </Note>
            </div>
          </div>
        </div>

        <div style={{ ...card, padding: 26, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Segmented
            label="Variant"
            options={VARIANTS}
            value={settings.variant}
            onChange={(value) => {
              set('variant', value);
            }}
          />

          <Slider
            label="Size"
            unit="px"
            min={MIN_SIZE}
            max={MAX_SIZE}
            step={2}
            value={settings.size}
            onChange={(value) => {
              set('size', value);
            }}
          />

          <Field label="Ink" value={settings.ink}>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {INKS.map((option) => (
                <button
                  key={option.token}
                  type="button"
                  aria-pressed={settings.ink === option.token}
                  onClick={() => {
                    set('ink', option.token);
                  }}
                  style={{
                    ...chipStyle(settings.ink === option.token),
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
                      background: COLORS[option.token as keyof typeof COLORS],
                      border: `1px solid ${ink.pill}`,
                    }}
                  />
                  {option.name}
                </button>
              ))}
            </div>
          </Field>

          <Segmented
            label="Fill"
            options={FILLS}
            value={settings.fill}
            onChange={(value) => {
              set('fill', value);
            }}
          />

          <Field label="Dots">
            <div style={{ display: 'flex', gap: 5 }}>
              {DOTS.map((option) => (
                <button
                  key={String(option)}
                  type="button"
                  aria-pressed={settings.dots === option}
                  onClick={() => {
                    set('dots', option);
                  }}
                  style={chipStyle(settings.dots === option)}
                >
                  {option === true ? 'on' : option === false ? 'off' : 'auto'}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Pattern" value={patternNameOf(settings.mask) ?? settings.mask}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <MaskEditor
                value={settings.mask}
                onChange={(value) => {
                  set('mask', value);
                }}
              />
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {PATTERN_NAMES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={settings.mask === PATTERNS[name]}
                    onClick={() => {
                      set('mask', PATTERNS[name]);
                    }}
                    style={{ ...chipStyle(settings.mask === PATTERNS[name]), padding: '5px 7px' }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <Segmented
            label="Mask mode"
            options={MASK_MODES}
            value={settings.maskMode}
            onChange={(value) => {
              set('maskMode', value);
            }}
          />

          <Slider
            label="Phase"
            unit=" steps"
            min={0}
            max={8}
            value={settings.phase}
            onChange={(value) => {
              set('phase', value);
            }}
          />

          <Slider
            label="Clock"
            unit="ms"
            min={30}
            max={200}
            step={5}
            value={settings.tickMs}
            onChange={(value) => {
              set('tickMs', value);
            }}
          />

          <Field label="Label" value={settings.label === '' ? 'aria-hidden' : 'role="img"'}>
            <input
              type="text"
              value={settings.label}
              placeholder="Empty — the mark is decoration"
              aria-label="Accessible label"
              onChange={(event) => {
                set('label', event.target.value);
              }}
              style={{
                font: `400 12.5px/1 ${mono}`,
                padding: '9px 10px',
                borderRadius: 4,
                border: `1px solid ${ink.pill}`,
                background: 'transparent',
                width: '100%',
              }}
            />
          </Field>

          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <Toggle
              label="Clock"
              value={settings.paused}
              on="paused"
              off="running"
              onChange={(value) => {
                set('paused', value);
              }}
            />
            <Toggle
              label="Surface"
              value={settings.dark}
              on="night"
              off="paper"
              onChange={(value) => {
                setSettings((current) => ({
                  ...current,
                  dark: value,
                  // Flipping the surface flips the default ink with it; a named
                  // ink the reader chose on purpose is left alone.
                  ink:
                    current.ink === 'ink' && value
                      ? 'inkInverse'
                      : current.ink === 'inkInverse' && !value
                        ? 'ink'
                        : current.ink,
                }));
              }}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
