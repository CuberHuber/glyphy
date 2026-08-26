/**
 * The two files GitHub Pages needs that a bundler does not produce.
 *
 * Run after `vite build --outDir ../../docs`. Kept as a script rather than as a
 * Vite plugin because neither file has anything to do with the bundle: they are
 * about the host, and a reader looking for "why is there a .nojekyll" should
 * find the answer in one place with the reason written next to it.
 */

import { copyFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const docs = fileURLToPath(new URL('../docs/', import.meta.url));

// Without this, Pages runs the output through Jekyll, which drops every path
// beginning with an underscore. Vite does not emit any today; a future asset
// name is not worth a silent 404.
writeFileSync(`${docs}.nojekyll`, '');

// The site is one page with fragment links, so a 404 only happens when somebody
// edits the URL. Serving the page back is friendlier than the default, and it
// costs one copied file.
copyFileSync(`${docs}index.html`, `${docs}404.html`);

console.log('pages: wrote .nojekyll and 404.html into docs/');
