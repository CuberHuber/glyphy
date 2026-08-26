/**
 * The preview shell.
 *
 * One bordered container: the thing running on top, its source fused
 * underneath and collapsed, a copy button that admits when it failed. Every kit
 * surveyed for `design/BRIEF.md` has exactly one of these and reuses it
 * everywhere; this page had three near-variants, which is how a demo ends up
 * looking slightly different depending on which section a reader landed in.
 *
 * Not tabs. shadcn abandoned preview/code tabs on purpose, and for a library
 * whose demo *is* the argument, putting it behind a click is a loss with no
 * gain. The code is dark in both page themes because code has its own ground.
 */

import { useState, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { COLORS } from '@glyphy/core';
import { CopyButton } from './controls.js';
import { ink, mono, sans } from './theme.js';

/** How tall the code pane is before it is opened. */
const COLLAPSED = 128;

/** Props for {@link PreviewStage}. */
export interface PreviewStageProps {
  /** Floor for the live area, so the page does not jump when a demo mounts. */
  readonly minHeight?: number;
  /** Put the demo on the night surface instead of the page surface. */
  readonly dark?: boolean;
  /** Why there is nothing to show. Replaces the children when set. */
  readonly problem?: string;
  readonly children?: ReactNode;
  readonly style?: CSSProperties;
}

/**
 * The live half, on its own.
 *
 * Exported because the live-code section is an editor rather than a preview —
 * it has an input where this has a snippet — but its output has to look
 * identical to every other demo on the page or the page has two vocabularies.
 */
export function PreviewStage(props: PreviewStageProps): ReactElement {
  const failed = props.problem !== undefined;
  return (
    <div
      style={{
        minHeight: props.minHeight ?? 300,
        display: 'grid',
        placeItems: 'center',
        padding: 40,
        background: props.dark === true ? COLORS.night : 'var(--page-surface)',
        ...props.style,
      }}
    >
      {failed ? (
        <p
          style={{
            font: `400 13px/1.6 ${sans}`,
            color: COLORS.error,
            margin: 0,
            maxWidth: 42 * 8,
            textAlign: 'center',
          }}
        >
          {props.problem}
        </p>
      ) : (
        (props.children ?? (
          <span style={{ font: `400 13px/1.5 ${sans}`, color: ink.faint }}>
            Nothing to show yet.
          </span>
        ))
      )}
    </div>
  );
}

/** Props for {@link Preview}. */
export interface PreviewProps extends PreviewStageProps {
  /** The source that produces what is above it. */
  readonly code: string;
  /** Start with the code open. Off by default — the demo is the argument. */
  readonly open?: boolean;
}

/** A demo and its source, in one container. */
export function Preview(props: PreviewProps): ReactElement {
  const { code, open = false, ...stage } = props;
  const [shown, setShown] = useState(open);

  return (
    <div
      style={{
        border: `1px solid ${ink.hairline}`,
        borderRadius: 6,
        overflow: 'hidden',
        background: 'var(--page-surface)',
      }}
    >
      <PreviewStage {...stage} />

      <div
        style={{
          position: 'relative',
          background: COLORS.night,
          borderTop: `1px solid ${ink.hairline}`,
        }}
      >
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
          <CopyButton value={code} dark />
        </div>

        <pre
          style={{
            margin: 0,
            padding: '26px 96px 26px 26px',
            font: `400 12.5px/1.75 ${mono}`,
            color: COLORS.inkInverse,
            whiteSpace: 'pre',
            overflow: shown ? 'auto' : 'hidden',
            maxHeight: shown ? 340 : COLLAPSED,
          }}
        >
          {code}
        </pre>

        {/* The scrim only exists while there is something under it to hide. */}
        {!shown && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 72,
              background: `linear-gradient(to bottom, rgba(25,24,22,0), ${COLORS.night} 78%)`,
            }}
          />
        )}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            padding: '0 0 12px',
          }}
        >
          <button
            type="button"
            aria-expanded={shown}
            onClick={() => {
              setShown(!shown);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 32,
              padding: '0 14px',
              borderRadius: 4,
              cursor: 'pointer',
              border: `1px solid rgba(239,236,228,.2)`,
              background: COLORS.night,
              color: 'rgba(239,236,228,.78)',
              font: `500 10px/1 ${mono}`,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
            }}
          >
            {shown ? 'Hide code' : 'View code'}
          </button>
        </div>
      </div>
    </div>
  );
}
