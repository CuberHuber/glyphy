#!/usr/bin/env node
/**
 * Replace the repository placeholder across the whole tree.
 *
 * The repo's slug is written into every manifest, workflow, badge, template and
 * README, because a scaffold cannot know where it will live. This turns moving
 * it into one command instead of sixty find-and-replaces.
 *
 * Idempotent: running it twice with the same argument changes nothing the
 * second time, and running it after a previous rename picks up whatever slug
 * is currently in package.json.
 *
 * Usage:
 *   npm run set-repo -- <owner>/<repo> [@scope]
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

/** Never walk into these — they are generated, vendored, or historical. */
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', 'design', '.husky']);

/** Only rewrite text we understand. */
const EXTENSIONS = new Set(['.json', '.md', '.yml', '.yaml', '.ts', '.tsx', '.js', '.mjs', '.css']);

/** Files with no extension that still need rewriting. */
const NAMED = new Set(['CODEOWNERS', '.pdd', '.rultor.yml', '.npmrc']);

const HELP = `
set-repo — point this scaffold at a real repository.

  npm run set-repo -- <owner>/<repo> [@scope]

Arguments
  <owner>/<repo>   Required. The GitHub slug, e.g. acme/glyphy. Rewrites every
                   repository URL, badge, workflow reference, CODEOWNERS team
                   and issue-template link.

  [@scope]         Optional. A new npm scope, e.g. @acme. Renames the four
                   published packages from @glyphy/* to @acme/*, everywhere:
                   manifests, imports, tsconfig paths, vitest aliases, the
                   changesets config and the docs. Omit it to keep @glyphy.

Options
  --help, -h       Print this and exit.
  --dry-run        Report what would change without writing anything.

Examples
  npm run set-repo -- acme/glyphy
  npm run set-repo -- acme/marks @acme
`;

/** Walk the tree, yielding every file worth reading. */
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (!SKIP_DIRS.has(entry)) yield* walk(path);
      continue;
    }
    const dot = entry.lastIndexOf('.');
    const extension = dot === -1 ? '' : entry.slice(dot);
    if (EXTENSIONS.has(extension) || NAMED.has(entry)) yield path;
  }
}

/**
 * The first capture of a pattern, or `undefined`.
 *
 * `RegExp.exec` answers with `null`, which this repo does not use. Absence is
 * converted here, at the boundary, and never carried further in.
 */
function capture(pattern, text) {
  return (pattern.exec(text) ?? undefined)?.[1];
}

/** The slug currently written into the root manifest. */
function currentSlug() {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const slug = capture(/github\.com\/([^/]+\/[^/.]+)/, manifest.repository?.url ?? '');
  if (slug === undefined) {
    throw new Error('cannot read the current slug from package.json — fix repository.url first');
  }
  return slug;
}

/** The npm scope currently used by the packages. */
function currentScope() {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'packages/core/package.json'), 'utf8'));
  const scope = capture(/^(@[^/]+)\//, manifest.name ?? '');
  if (scope === undefined) throw new Error('packages/core is not scoped — nothing to rename');
  return scope;
}

/**
 * Read the command line.
 *
 * Answers either `{ message }` — something to print and stop — or the parsed
 * arguments. Keeping the complaining here leaves the rewriting free of it.
 */
function parseArgs(argv) {
  if (argv.includes('--help') || argv.includes('-h')) return { message: HELP, code: 0 };

  const [slug, scope] = argv.filter((arg) => !arg.startsWith('-'));

  if (slug === undefined) {
    return {
      message:
        'set-repo: missing <owner>/<repo>.\nTry: npm run set-repo -- acme/glyphy      (--help for more)',
      code: 1,
    };
  }
  if (!/^[A-Za-z0-9][\w.-]*\/[A-Za-z0-9][\w.-]*$/.test(slug)) {
    return { message: `set-repo: "${slug}" is not an owner/repo slug.`, code: 1 };
  }
  if (scope !== undefined && !/^@[a-z0-9][a-z0-9-]*$/.test(scope)) {
    return { message: `set-repo: "${scope}" is not an npm scope. It must start with @.`, code: 1 };
  }

  return { slug, scope, dryRun: argv.includes('--dry-run') };
}

/** The literal substitutions that turn the old identity into the new one. */
function buildRules(fromSlug, fromScope, slug, scope) {
  const fromOwner = fromSlug.split('/')[0];
  const toOwner = slug.split('/')[0];
  const rules = [
    [fromSlug, slug],
    // The rultor architect and commanders are the owner alone, not the whole
    // slug, so they need a rule of their own.
    [`  - ${fromOwner}\n`, `  - ${toOwner}\n`],
  ];
  if (scope !== undefined && scope !== fromScope) rules.push([`${fromScope}/`, `${scope}/`]);
  return rules.filter(([from, to]) => from !== to);
}

/**
 * Substitutions that only make sense in CODEOWNERS.
 *
 * That file names a reviewer as a bare `@handle` — or `@org/team` — with no
 * slug around it. Rewriting a bare handle everywhere would be reckless (it
 * would catch npm scopes and email addresses), so it is confined to the one
 * file where it is unambiguous.
 */
function buildOwnerRules(fromSlug, slug) {
  const fromOwner = fromSlug.split('/')[0];
  const toOwner = slug.split('/')[0];
  return fromOwner === toOwner ? [] : [[`@${fromOwner}`, `@${toOwner}`]];
}

/** Apply a list of substitutions to one string, counting the hits. */
function applyRules(text, rules) {
  let after = text;
  let hits = 0;
  for (const [from, to] of rules) {
    const parts = after.split(from);
    hits += parts.length - 1;
    after = parts.join(to);
  }
  return { after, hits };
}

/** Apply the rules to every file, reporting what changed. */
function rewriteAll(rules, ownerRules, dryRun) {
  const touched = [];
  for (const path of walk(ROOT)) {
    const before = readFileSync(path, 'utf8');
    const forThisFile = path.endsWith('CODEOWNERS') ? [...rules, ...ownerRules] : rules;
    const { after, hits } = applyRules(before, forThisFile);
    if (after === before) continue;
    touched.push([relative(ROOT, path), hits]);
    if (!dryRun) writeFileSync(path, after);
  }
  return touched;
}

/** Print the summary table. */
function printReport(touched, { fromSlug, fromScope, slug, scope, dryRun }) {
  if (touched.length === 0) {
    const already = scope === undefined ? '.' : ` with ${scope}.`;
    process.stdout.write(`Nothing to change — already ${slug}${already}\n`);
    return;
  }

  const width = Math.max(...touched.map(([file]) => file.length));
  const scopeNote = scope === undefined ? '' : `, ${fromScope} -> ${scope}`;
  process.stdout.write(
    `${dryRun ? 'Would rewrite' : 'Rewrote'} ${fromSlug} -> ${slug}${scopeNote}\n\n`,
  );
  for (const [file, hits] of touched) {
    process.stdout.write(`  ${file.padEnd(width)}  ${String(hits).padStart(3)}\n`);
  }
  process.stdout.write(`\n${touched.length} file${touched.length === 1 ? '' : 's'}.\n`);
  if (!dryRun) {
    process.stdout.write('\nNext: npm install, then commit. Check the diff before you push.\n');
  }
}

function main(argv) {
  const parsed = parseArgs(argv);
  if (parsed.message !== undefined) {
    (parsed.code === 0 ? process.stdout : process.stderr).write(`${parsed.message}\n`);
    return parsed.code;
  }

  const { slug, scope, dryRun } = parsed;
  const fromSlug = currentSlug();
  const fromScope = currentScope();
  const rules = buildRules(fromSlug, fromScope, slug, scope);
  const ownerRules = buildOwnerRules(fromSlug, slug);

  printReport(rewriteAll(rules, ownerRules, dryRun), {
    fromSlug,
    fromScope,
    slug,
    scope,
    dryRun,
  });
  return 0;
}

process.exit(main(process.argv.slice(2)));
