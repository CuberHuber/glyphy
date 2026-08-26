# Releasing

`@glyphy/*` publishes from GitHub Actions over OIDC — npm calls this
**trusted publishing**. GitHub mints a credential that lives for the length of
one workflow run and is bound to that workflow; npm checks it against a trusted
publisher recorded on each package. There is no npm token in this repository,
in GitHub secrets, or in a container anywhere. A token cannot leak because
there is not one.

Provenance comes free with it. Every tarball carries a signed attestation
linking it to the commit and the run that built it, which npm shows as the
"Provenance" badge and consumers check with `npm audit signatures`.

## Cutting a release

You need Node 20 or newer locally, and 22 matches what CI and rultor run.
`.npmrc` sets `engine-strict=true`, so on anything older `npm ci` stops with
`Unsupported engine` before it installs a thing.

Changesets owns the version arithmetic. It is the only thing that rewrites the
`@glyphy/core` pins inside `@glyphy/react`, `@glyphy/motion` and
`@glyphy/tailwind`, so a version it did not compute will publish packages that
depend on a sibling version nobody published.

1. Land changes with a changeset: `npm run changeset`.
2. When you want to ship, compute the version:

   ```bash
   npm run version-packages
   ```

   That bumps all four packages together, rewrites the internal pins, writes
   the changelogs and consumes the changeset files.

3. Commit as `chore: release 0.2.0`, open a pull request, and `@rultor merge`
   it. Main is still only ever written by rultor.

4. **Actions → Release → Run workflow.** State the version. Leave _dry run_
   on for the first pass, read the summary, then run it again with dry run
   off.

The workflow refuses to publish if the version you state disagrees with the
version in the packages, if any changeset is still unconsumed, or if the ref
is not `main`. Stating the version is not how the version is decided — it is
how you confirm you know what you are shipping.

## One-time setup

### 1. Bootstrap the first publish

npm cannot configure a trusted publisher on a package that does not exist yet,
and none of the four are published. The first release therefore uses a token,
exactly once.

- On npmjs.com create a **granular** access token: read and write, restricted
  to the `@glyphy` scope, with the shortest expiry offered.
- Add it as the `NPM_TOKEN` secret under **Settings → Secrets and
  variables → Actions**.
- Run the Release workflow. It prints a warning that it is publishing with a
  token rather than OIDC.

The four packages now exist. The token has done the only job it will ever do.

### 2. Configure trusted publishers

One command per package — the registry holds one configuration per package and
there is no scope-level or organisation-level equivalent.

```bash
for pkg in core react motion tailwind; do
  npm trust github "@glyphy/$pkg" \
    --file release.yml --repo CuberHuber/glyphy \
    --env release --allow-publish
done
```

Confirm with `npm trust list @glyphy/core`. The same thing is available on each
package's settings page on npmjs.com if you would rather click it.

`--env release` ties the trust to the `release` environment the workflow
declares, so a run outside that environment cannot publish even from this repo.

### 3. Close the door

Trusted publishing only removes the token risk if no token still works.

- Delete the `NPM_TOKEN` secret from the repository.
- Revoke the granular token on npmjs.com.
- Revoke the old long-lived token that used to live in
  `CuberHuber/glyphy-secrets`, and delete `.npmrc.asc` from that repository.
  Rultor no longer decrypts it — see the note in `.rultor.yml`.
- On npmjs.com, set the packages to require trusted publishing, so a token
  cannot publish them even if one is created later. This is what makes a
  future leak inert rather than merely unlikely.
- Add required reviewers to the `release` environment under **Settings →
  Environments** if you want a human approval in front of each publish.
- Protect `.github/workflows/release.yml` — the trust is pinned to that
  filename, so whoever can edit it can change what publishes. Require review
  on changes to that path.

Then run a release. The workflow summary should say it published over OIDC.

## Why it is not rultor any more

Rultor still guards main and still rebuilds the page — `@rultor merge` and
`@rultor deploy` are unchanged. Only publishing moved, and only because npm
mints its OIDC credential from GitHub's issuer, which no third-party CI can
present. Keeping the release on rultor would have meant keeping a long-lived
npm token and decrypting it into a container on every release: the exact thing
trusted publishing exists to abolish.

The shape of the decision did not change. A release is still a version a
person states out loud. They state it in the Actions tab now instead of in a
pull request comment.
