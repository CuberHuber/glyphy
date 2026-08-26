import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const source = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

/**
 * Where the Pages build is served from.
 *
 * A project site lives under `/<repo>/`, and Pages hands `404.html` back for
 * every unmatched path *at any depth*. A relative base would resolve the
 * bundle against that path — `/glyphy/docs/api` would look for the script in
 * `/glyphy/docs/`, miss, and render the fallback blank — so the Pages build
 * addresses its assets from the site root. Read off the repository slug rather
 * than typed here, so `npm run set-repo` carries it along with everything else.
 */
function pagesBase(): string {
  const manifest = JSON.parse(readFileSync(source('../../package.json'), 'utf8')) as {
    repository?: { url?: string };
  };
  const repo = manifest.repository?.url?.match(/github\.com\/[^/]+\/(.+?)(?:\.git)?$/)?.[1];
  // A user or organisation site is served from the root; everything else from
  // its own path. No slug at all means a plain root, which is what a fork
  // building locally wants.
  return !repo || repo.endsWith('.github.io') ? '/' : `/${repo}/`;
}

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // `--mode pages` is what `npm run build:pages` passes; a plain build stays
  // relative so the output can be opened from anywhere.
  base: mode === 'pages' ? pagesBase() : './',
  resolve: {
    // Run the example against the packages' TypeScript sources, so a change in
    // the library shows up here without a build step in between.
    alias: {
      '@glyphy/core': source('../../packages/core/src/index.ts'),
      '@glyphy/react': source('../../packages/react/src/index.ts'),
      '@glyphy/motion': source('../../packages/motion/src/index.ts'),
      '@glyphy/tailwind': source('../../packages/tailwind/src/index.ts'),
    },
  },
}));
