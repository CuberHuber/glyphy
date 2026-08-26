/**
 * The Glyphy UI kit page.
 *
 * A faithful build of the design handoff, rendered entirely from the published
 * packages — every mark on this page is a `<Glyph>`, and nothing here reaches
 * past the public API. If a section of the kit cannot be expressed in props,
 * that is a gap in the library, not something for the page to work around.
 */

import { useState, type ReactElement } from 'react';
import { COLORS, type Fill } from '@glyphy/core';
import { GlyphProvider } from '@glyphy/react';
import { sans } from './theme.js';
import { Toolbar } from './Toolbar.js';
import { Hero } from './sections/Hero.js';
import { Anatomy } from './sections/Anatomy.js';
import { Scale } from './sections/Scale.js';
import { Surfaces } from './sections/Surfaces.js';
import { MotionStates } from './sections/MotionStates.js';
import { InProduct } from './sections/InProduct.js';
import { Rules } from './sections/Rules.js';
import { ExportCode } from './sections/ExportCode.js';
import { Panel } from './sections/Panel.js';
import { Patterns } from './sections/Patterns.js';

/** The whole kit, top to bottom. */
export function App(): ReactElement {
  const [ink, setInk] = useState<string>(COLORS.ink);
  const [fill, setFill] = useState<Fill>('stroke');
  const [dots, setDots] = useState(true);
  const [paused, setPaused] = useState(false);

  return (
    <GlyphProvider theme={{ ink, fill, dots, paused }} cssVariables>
      <div
        style={{
          background: COLORS.paper,
          color: COLORS.ink,
          fontFamily: sans,
          minHeight: '100vh',
          padding: '0 0 120px',
        }}
      >
        <Hero />
        <Anatomy />
        <Scale />
        <Surfaces />
        <MotionStates />
        <InProduct />
        <Rules />
        <ExportCode />
        <Panel />
        <Patterns />
      </div>

      <Toolbar
        ink={ink}
        fill={fill}
        dots={dots}
        paused={paused}
        onInk={setInk}
        onFill={setFill}
        onDots={setDots}
        onPaused={setPaused}
      />
    </GlyphProvider>
  );
}
