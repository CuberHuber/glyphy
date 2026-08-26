/**
 * The top bar.
 *
 * Every documentation site for a component library has one, and they all do the
 * same three things: say what the thing is called, get you to a section, and
 * let you flip the page over. This one adds the mark itself as the wordmark,
 * because a library whose whole subject is one animated glyph should be showing
 * it in the corner rather than describing it.
 */

import { useCallback, useEffect, useState, type MouseEvent, type ReactElement } from 'react';
import { Glyph } from '@glyphy/react';
import { NAV_ENTRIES } from './outline.js';
import { ink, mono, sans } from './theme.js';
import { chipStyle } from './controls.js';

/** Where the reader's choice is remembered. */
const STORAGE_KEY = 'glyphy-theme';

/** The three states of the switch: two choices and the absence of one. */
const MODES = ['auto', 'light', 'dark'] as const;

/** A page theme, or `auto` for whatever the system asks for. */
export type ThemeMode = (typeof MODES)[number];

function isMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value);
}

/** What the document is currently set to, read back from the attribute. */
function storedMode(): ThemeMode {
  if (typeof document === 'undefined') return 'auto';
  const attribute = document.documentElement.getAttribute('data-theme');
  return isMode(attribute) && attribute !== 'auto' ? attribute : 'auto';
}

/**
 * The light/dark switch.
 *
 * `auto` removes the attribute rather than resolving the media query itself, so
 * a reader who leaves it alone follows their system when it changes at dusk
 * instead of being frozen at whatever it was when the page loaded.
 */
export function useThemeMode(): readonly [ThemeMode, (mode: ThemeMode) => void] {
  const [mode, setMode] = useState<ThemeMode>(storedMode);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    try {
      if (mode === 'auto') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Storage can be denied. The attribute is already set; only the memory
      // of the choice is lost, and that is not worth failing the page over.
    }
  }, [mode]);

  return [mode, setMode] as const;
}

/** Props for {@link SiteNav}. */
export interface SiteNavProps {
  readonly mode: ThemeMode;
  readonly onMode: (mode: ThemeMode) => void;
}

/** The sticky header. */
export function SiteNav(props: SiteNavProps): ReactElement {
  const onJump = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    // Let the browser own the hash — it is what makes a section linkable — but
    // scroll it ourselves so `scroll-padding-top` is honoured consistently.
    const id = event.currentTarget.getAttribute('href')?.slice(1);
    const target = id === undefined ? undefined : (document.getElementById(id) ?? undefined);
    if (target === undefined) return;
    event.preventDefault();
    target.scrollIntoView({ block: 'start' });
    // `undefined` rather than `null`: the History API serialises either to the
    // same empty state, and absence has one spelling in this repo.
    window.history.replaceState(undefined, '', `#${id}`);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'var(--page-chrome)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${ink.rule}`,
      }}
    >
      <nav
        aria-label="Sections"
        className="column-flat"
        style={{ height: 60, display: 'flex', alignItems: 'center', gap: 20 }}
      >
        <a
          href="#top"
          onClick={onJump}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            color: ink.base,
            flexShrink: 0,
          }}
        >
          <Glyph variant="idle" size={22} dots={false} />
          <span style={{ font: `600 15px/1 ${sans}`, letterSpacing: '-.02em' }}>Glyphy</span>
        </a>

        <div className="nav-links">
          {NAV_ENTRIES.map((entry) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              onClick={onJump}
              className={entry.nav === 'secondary' ? 'nav-secondary' : undefined}
              style={{ font: `400 13px/1 ${sans}`, color: ink.muted, whiteSpace: 'nowrap' }}
            >
              {entry.title}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
          <div role="group" aria-label="Page theme" style={{ display: 'flex', gap: 4 }}>
            {MODES.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={props.mode === option}
                onClick={() => {
                  props.onMode(option);
                }}
                style={{ ...chipStyle(props.mode === option), padding: '6px 8px' }}
              >
                {option}
              </button>
            ))}
          </div>
          <a
            href="https://github.com/CuberHuber/glyphy"
            className="nav-secondary"
            style={{
              font: `500 10px/1 ${mono}`,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              padding: '7px 10px',
              border: `1px solid ${ink.pill}`,
              borderRadius: 4,
              color: ink.muted,
              whiteSpace: 'nowrap',
            }}
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}
