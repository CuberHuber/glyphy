/**
 * The Glyphy page.
 *
 * A faithful build of the design handoff, rendered entirely from the published
 * packages — every mark on this page is a `<Glyph>`, and nothing here reaches
 * past the public API. If a section of the kit cannot be expressed in props,
 * that is a gap in the library, not something for the page to work around.
 *
 * This is also what gets deployed to GitHub Pages, which is why it carries a
 * nav, a footer and a light/dark switch that the original single-page handoff
 * did not need.
 */

import { useState, type ReactElement } from 'react';
import { type Fill } from '@glyphy/core';
import { GlyphProvider } from '@glyphy/react';
import { sans } from './theme.js';
import { Toolbar, PAGE_INK } from './Toolbar.js';
import { SiteNav, useThemeMode } from './SiteNav.js';
import { Footer } from './Footer.js';
import { Hero } from './sections/Hero.js';
import { Anatomy } from './sections/Anatomy.js';
import { Scale } from './sections/Scale.js';
import { Surfaces } from './sections/Surfaces.js';
import { Palette } from './sections/Palette.js';
import { MotionStates } from './sections/MotionStates.js';
import { Playground } from './sections/Playground.js';
import { Compare } from './sections/Compare.js';
import { InProduct } from './sections/InProduct.js';
import { Rules } from './sections/Rules.js';
import { ExportCode } from './sections/ExportCode.js';
import { LiveCode } from './sections/LiveCode.js';
import { Panel } from './sections/Panel.js';
import { Patterns } from './sections/Patterns.js';
import { PatternBrowser } from './sections/PatternBrowser.js';

/** The whole kit, top to bottom. */
export function App(): ReactElement {
  const [mode, setMode] = useThemeMode();
  const [ink, setInk] = useState<string>(PAGE_INK);
  const [fill, setFill] = useState<Fill>('stroke');
  const [dots, setDots] = useState(true);
  const [paused, setPaused] = useState(false);

  return (
    <GlyphProvider theme={{ ink, fill, dots, paused }} cssVariables>
      <a className="skip-link" href="#anatomy">
        Skip to the kit
      </a>

      <SiteNav mode={mode} onMode={setMode} />

      <main style={{ fontFamily: sans, padding: '0 0 120px' }}>
        <Hero />
        <Anatomy />
        <Scale />
        <Surfaces />
        <Palette />
        <MotionStates />
        <Playground />
        <Compare />
        <InProduct />
        <Rules />
        <ExportCode />
        <LiveCode />
        <Panel />
        <Patterns />
        <PatternBrowser />
      </main>

      <Footer />

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
