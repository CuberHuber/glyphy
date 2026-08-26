# Contributing

## From clone to green

```bash
git clone https://github.com/CuberHuber/glyphy.git
cd glyphy
npm ci
npm run verify
```

`verify` is the whole gate: format check, lint, types, tests with a coverage
floor, build, and a packaging check. It is the same command CI runs and the same
command the merge bot runs. If it passes here it passes there.

To see your change in something real:

```bash
npm run dev
```

That serves the kit page from `examples/kit`, wired to the packages' TypeScript
sources rather than their builds — so a change in `packages/core` shows up
without a build step in between.

## How work gets merged

1. Branch from `main`. Name it after the issue: `42-travel-trail-length`.
2. Commit as you go. `git push` runs types and tests before it lets you.
3. Open a pull request. CI runs on Node 20 and 22.
4. A maintainer reviews, then comments `@rultor merge` on the pull request.

Nobody pushes to `main`, including maintainers. The bot checks the branch out,
runs `npm run verify` in a clean container, and fast-forwards only if it exits
zero. This is the one rule that keeps `main` always releasable.

## Commits

[Conventional commits](https://www.conventionalcommits.org), enforced by
commitlint on the `commit-msg` hook.

```
feat(core): add a wave variant that runs by row
fix(react): stop the shared clock when the last mark unmounts
docs(tailwind): explain the v4 stylesheet
```

Allowed scopes: `core`, `react`, `motion`, `tailwind`, `example`, `ci`, `deps`,
`docs`, `repo`.

The subject line says what changed. The body says why — it is read far more
often than it is written, usually by someone trying to understand a decision
years later with no other record of it.

## Releasing

Versions come from [changesets](https://github.com/changesets/changesets), not
from whoever merges. If your change is user-visible:

```bash
npm run changeset
```

Pick the packages, pick a bump, and write one sentence a user of the library
would understand — it goes into the changelog verbatim.

The four `@glyphy/*` packages are versioned together, so they always agree with
each other. On merge to `main`, CI opens a "Version Packages" pull request;
merging that publishes to npm with provenance.

## The gates

None of these are advisory.

| Gate       | Command                 | Notes                                      |
| ---------- | ----------------------- | ------------------------------------------ |
| Formatting | `npm run format:check`  | Prettier. No arguments about style.        |
| Linting    | `npm run lint`          | Type-aware. `complexity` capped at 14.     |
| Types      | `npm run typecheck`     | `strict`, plus `noUncheckedIndexedAccess`. |
| Tests      | `npm run test:coverage` | 95% statements, 92% branches.              |
| Build      | `npm run build`         | Every package emits ESM, CJS and types.    |
| Packaging  | `npm run publint`       | Catches broken `exports` before npm does.  |

**Lowering the coverage floor needs a reason in the pull request.** Not "the new
code is hard to test" — that is usually the code telling you something. A real
reason looks like "this branch only runs on a platform CI cannot reach".

## Puzzles

Deferred work is filed, not commented. Write a puzzle:

```ts
// @todo #42:30min The clock should coalesce listeners that share a period so a
//  page with forty marks holds one timer rather than forty. Measure first —
//  this may already be cheap enough not to matter.
```

`0pdd` opens an issue for it, and closes the issue when the puzzle is deleted.
A pull request that leaves something undone files a puzzle for it; reviewers ask
for the puzzle rather than for the work. See `.pdd` for the format.

## House style

The repo borrows its standards from
[yegor256's](https://www.yegor256.com/2014/04/17/how-to-be-a-good-open-source-citizen.html)
open source practice. Those come out of an object-oriented Java world, so they
translate rather than transplant. What carried over, concretely:

- **Immutability.** Every exported constant is frozen, every interface is
  `readonly`. Nothing in the kit is mutated after it is built.
- **No `null`.** Absence has one spelling here, and it is `undefined`. The
  linter rejects the other one. Convert at the boundary — see
  `examples/kit/src/main.tsx`, where the DOM's `null` is turned into `undefined`
  on the way in.
- **No static mutable state.** The one exception is the shared clock registry,
  which is what makes a staggered row possible at all, and it has a documented
  reset for tests.
- **Everything exported is documented.** A TSDoc comment on every exported
  symbol, and the comment says _why_, not _what_ — the code already says what.
- **Purity where it is possible.** `@glyphy/core` is entirely pure functions of
  `(variant, tick, cell)`. That is what makes the mark server-renderable,
  snapshot-testable and replayable, and it is not negotiable.

Where the analogy runs out: this is not an EO codebase. There are no
single-method objects, and pure functions over frozen data do the work that
immutable objects would do in Java. It is the discipline that was borrowed, not
the idiom.

## The design handoff

`design/` holds the original Claude Design export the kit was built from — the
prototypes, the chat transcript, and the source glyph. It is a historical
record. Read it to understand why a number is what it is; do not edit it.

The numbers in `@glyphy/core` are the prototype's numbers, and the tests in
`packages/core/test/frames.test.ts` pin them there deliberately. If you change
what the mark looks like, those tests are supposed to fail. Update them in the
same commit, and say in the message what the mark does differently now.
