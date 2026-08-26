import type { ReactElement, ReactNode } from 'react';
import { COLORS, type Variant } from '@glyphy/core';
import { Glyph } from '@glyphy/react';
import { Card, Section } from '../ui.js';
import { caption, eyebrow, fixed, ink, mono, sans } from '../theme.js';

/**
 * The hero band's twelve marks.
 *
 * Deliberately every behaviour at once, which the do-and-don't rules forbid
 * anywhere else. At 20% opacity behind a gradient it reads as texture rather
 * than as twelve competing indicators — that is the whole point of the band.
 */
const BAND: readonly Variant[] = [
  'collapse',
  'thinking',
  'all',
  'travel',
  'accumulate',
  'idle',
  'thinking',
  'snap',
  'collapse',
  'all',
  'travel',
  'idle',
];

/** A round button, dark or outlined, with a mark inside it. */
function Button(props: {
  readonly children: ReactNode;
  readonly solid: boolean;
  readonly label: string;
}): ReactElement {
  return (
    <button
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        background: props.solid ? ink.base : 'transparent',
        color: props.solid ? 'var(--page-paper)' : ink.base,
        border: props.solid ? 0 : `1px solid ${ink.pill}`,
        borderRadius: 100,
        padding: props.solid ? '13px 22px' : '12px 21px',
        font: `500 14px/1 ${sans}`,
        cursor: 'pointer',
      }}
    >
      {props.children}
      {props.label}
    </button>
  );
}

/** One step of the progress stepper. */
function Step(props: {
  readonly name: string;
  readonly active?: boolean;
  readonly upcoming?: boolean;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 11,
        width: 96,
        opacity: props.upcoming === true ? 0.45 : 1,
      }}
    >
      {props.children}
      <span
        style={{
          font: `500 11px/1 ${sans}`,
          color: props.active === true ? COLORS.accent : undefined,
        }}
      >
        {props.name}
      </span>
    </div>
  );
}

/** The hairline that joins one step to the next. */
function Connector(): ReactElement {
  return <div style={{ flex: 1, height: 1, background: 'var(--page-rule)', marginBottom: 24 }} />;
}

/** Section 05 — six placements, web and mobile. */
export function InProduct(): ReactElement {
  return (
    <Section id="in-product" note="web and mobile placements">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))',
          gap: 20,
          padding: '40px 0 0',
        }}
      >
        <Card style={{ padding: 34, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <span style={eyebrow}>Button · inline spinner</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button solid label="Processing">
              <Glyph variant="travel" size={18} ink="var(--page-paper)" dots={false} />
            </Button>
            <Button solid={false} label="Saved">
              <Glyph variant="snap" size={18} ink={ink.base} dots={false} />
            </Button>
          </div>
          <p style={{ ...caption }}>
            At 18px the bare dots are dropped and stroke floors at 1px. Optical size only — never
            scale the 96px mark down.
          </p>
        </Card>

        <Card style={{ padding: 34, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <span style={eyebrow}>Chat · AI thinking</span>
          {/*
            A mock of a light chat, fixed on purpose: it sits on its own paper so
            the dark user bubble stays a dark bubble when the page inverts. A
            placement example has to look like the product, not like this page.
          */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: COLORS.paper,
              border: `1px solid ${fixed.rule}`,
              borderRadius: 10,
              padding: 16,
            }}
          >
            <div
              style={{
                alignSelf: 'flex-end',
                maxWidth: '76%',
                background: COLORS.ink,
                color: COLORS.inkInverse,
                borderRadius: '16px 16px 5px 16px',
                // A mock of a light chat, fixed on purpose: inverting it would
                // make the section a demonstration of the page, not of the mark.
                padding: '13px 16px',
                font: `400 13.5px/1.45 ${sans}`,
              }}
            >
              Summarise the Q3 anomalies for me.
            </div>
            <div
              style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: COLORS.surface,
                border: `1px solid ${fixed.rule}`,
                borderRadius: '16px 16px 16px 5px',
                padding: '14px 18px',
              }}
            >
              <Glyph variant="thinking" size={26} ink={ink.base} />
              <span style={{ font: `400 13px/1 ${sans}`, color: fixed.soft }}>
                Reading 14 documents
              </span>
            </div>
          </div>
          <p style={{ ...caption }}>
            Thinking is the only state allowed to run indefinitely. Pair it with changing copy,
            never with a fake percentage.
          </p>
        </Card>
      </div>

      <div className="split-narrow" style={{ padding: '20px 0 0' }}>
        <div
          style={{
            background: COLORS.night,
            border: `1px solid ${ink.hairline}`,
            borderRadius: 6,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <span style={{ ...eyebrow, color: 'rgba(239,236,228,.4)' }}>Mobile · launch</span>
          <div
            style={{
              flex: 1,
              borderRadius: 22,
              background: COLORS.paper,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 30,
              padding: '64px 0',
              minHeight: 380,
              color: COLORS.ink,
            }}
          >
            <Glyph
              variant="accumulate"
              size={88}
              ink={COLORS.ink}
              label="Restoring your workspace"
            />
            <div style={{ textAlign: 'center' }}>
              <div style={{ font: `600 19px/1 ${sans}`, letterSpacing: '-.02em' }}>Glyphy</div>
              <div style={{ font: `500 10px/1 ${mono}`, color: fixed.ghost, marginTop: 9 }}>
                restoring your workspace
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card style={{ padding: 34, display: 'flex', flexDirection: 'column', gap: 26 }}>
            <span style={eyebrow}>Stepper · progress</span>
            {/* Four steps and three connectors do not wrap into anything a
                reader can follow, so on a narrow screen the row scrolls. */}
            <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
              <Step name="Upload">
                <Glyph variant="all" size={34} fill="tint" ink={ink.base} dots={false} />
              </Step>
              <Connector />
              <Step name="Verify">
                <Glyph variant="all" size={34} fill="tint" ink={ink.base} dots={false} />
              </Step>
              <Connector />
              <Step name="Reconcile" active>
                <Glyph variant="travel" size={34} ink={ink.base} />
              </Step>
              <Connector />
              <Step name="Publish" upcoming>
                <Glyph variant="off" size={34} ink={ink.base} />
              </Step>
            </div>
            <p style={{ ...caption }}>
              Done steps use the tint fill, the active step animates, upcoming steps show the bare
              lattice at 45%.
            </p>
          </Card>

          <Card style={{ padding: 34, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <span style={eyebrow}>Empty state</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }}>
              <div style={{ opacity: 0.4 }}>
                <Glyph variant="idle" size={62} ink={ink.base} />
              </div>
              <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                <div style={{ font: `500 15px/1.3 ${sans}` }}>Nothing here yet</div>
                <div
                  style={{
                    font: `400 13px/1.5 ${sans}`,
                    color: ink.soft,
                    marginTop: 5,
                  }}
                >
                  Connect a source and the lattice fills in as records arrive.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div
        style={{
          background: COLORS.night,
          borderRadius: 6,
          margin: '20px 0 0',
          overflow: 'hidden',
          position: 'relative',
          minHeight: 220,
          display: 'grid',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 0,
            flexWrap: 'wrap',
            opacity: 0.2,
            padding: 30,
            justifyContent: 'center',
          }}
        >
          {BAND.map((variant, index) => (
            <Glyph key={index} variant={variant} size={46} ink={COLORS.inkInverse} />
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 52px',
            background: `linear-gradient(90deg,${COLORS.night} 22%,rgba(25,24,22,.55) 70%)`,
          }}
        >
          <div style={{ ...eyebrow, color: 'rgba(239,236,228,.45)' }}>Hero band · pattern use</div>
          <div
            style={{
              font: `600 30px/1.15 ${sans}`,
              letterSpacing: '-.03em',
              color: COLORS.inkInverse,
              marginTop: 12,
              maxWidth: 440,
            }}
          >
            The lattice tiles as texture — at 20% opacity, never over body copy.
          </div>
        </div>
      </div>
    </Section>
  );
}
