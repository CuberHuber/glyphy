### What this changes

<!-- One paragraph. What behaviour is different afterwards, and why. -->

### How to see it

<!-- The command, the test, or the section of `npm run dev` that shows it working. -->

---

- [ ] `npm run verify` passes locally
- [ ] Tests cover the change — a bug fix has a test that failed before it
- [ ] A changeset is added if anything user-visible changed (`npm run changeset`)
- [ ] Docs updated: the package README, and the kit page if the design moved
- [ ] Anything deferred is a `@todo` puzzle with an issue number, not a bare TODO
- [ ] The coverage floor was not lowered; if it was, the reason is above

<!--
The gates are not advisory. CI runs format, lint, types, tests with a coverage
floor, a build and a packaging check, on Node 20 and 22. A pull request that
cannot go green does not merge, and master is only ever fast-forwarded by the
merge bot.
-->
