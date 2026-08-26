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

import { useCallback, useState, type ReactElement } from 'react';
import { PATTERNS, type Fill } from '@glyphy/core';
import { GlyphProvider } from '@glyphy/react';
import { sans } from './theme.js';
import { Toolbar, PAGE_INK } from './Toolbar.js';
import { SiteNav, useThemeMode } from './SiteNav.js';
import { SearchDialog, useSearchShortcut } from './search/SearchDialog.js';
import { type Target } from './search/index.js';
import { Footer } from './Footer.js';
import { Hero } from './sections/Hero.js';
import { Anatomy } from './sections/Anatomy.js';
import { Scale } from './sections/Scale.js';
import { Surfaces } from './sections/Surfaces.js';
import { Palette } from './sections/Palette.js';
import { MotionStates } from './sections/MotionStates.js';
import { Playground, type VariantRequest } from './sections/Playground.js';
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

  // The palette can land the reader on a section, a pattern or a variant, so
  // the two selections it reaches into are held here rather than inside the
  // sections that own them.
  const [searching, setSearching] = useState(false);
  const [pattern, setPattern] = useState<string>(PATTERNS.cross);
  const [requested, setRequested] = useState<VariantRequest | undefined>(undefined);

  const openSearch = useCallback(() => {
    setSearching(true);
  }, []);
  useSearchShortcut(openSearch);

  const go = useCallback((target: Target) => {
    const section =
      target.kind === 'section' ? target.id : target.kind === 'pattern' ? 'browser' : 'playground';
    if (target.kind === 'pattern') setPattern(target.mask);
    // Counted, so picking the same variant twice reaches the playground twice
    // rather than being swallowed as an unchanged value.
    if (target.kind === 'variant') {
      const { variant } = target;
      setRequested((previous) => ({ variant, nth: (previous?.nth ?? 0) + 1 }));
    }
    // The dialog is still closing on this frame; the scroll waits for it so the
    // section is not moved under a backdrop that is about to disappear.
    requestAnimationFrame(() => {
      document.getElementById(section)?.scrollIntoView({ block: 'start' });
      window.history.replaceState(undefined, '', `#${section}`);
    });
  }, []);

  return (
    <GlyphProvider theme={{ ink, fill, dots, paused }} cssVariables>
      <a className="skip-link" href="#anatomy">
        Skip to the kit
      </a>

      <SiteNav mode={mode} onMode={setMode} onSearch={openSearch} />

      <SearchDialog
        open={searching}
        onClose={() => {
          setSearching(false);
        }}
        onChoose={go}
      />

      <main style={{ fontFamily: sans, padding: '0 0 120px' }}>
        <Hero />
        <Anatomy />
        <Scale />
        <Surfaces />
        <Palette />
        <MotionStates />
        <Playground requested={requested} />
        <Compare />
        <InProduct />
        <Rules />
        <ExportCode />
        <LiveCode />
        <Panel />
        <Patterns />
        <PatternBrowser selected={pattern} onSelect={setPattern} />
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
