# Security policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |
| < 0.1   | No        |

The four `@glyphy/*` packages are versioned together, so a fix ships to all of
them at once.

## Reporting a vulnerability

Report privately, through
[GitHub Security Advisories](https://github.com/your-org/glyphy/security/advisories/new).
If that is not available to you, email `security@example.com`.

Please do not open a public issue for a vulnerability, and please do not
demonstrate one against a site you do not own.

Include what you would want if you were reading it: the affected package and
version, what an attacker gets, and the smallest reproduction you can manage.

## What happens next

- **Within 3 working days** — we acknowledge the report and say whether we can
  reproduce it.
- **Within 10 working days** — we agree a severity and a rough fix date with you.
- **Within 90 days** — the fix ships and the advisory is published. If it is
  going to take longer than that we will tell you why rather than go quiet.

You will be credited in the advisory unless you would rather not be.

## Scope

The packages render a decorative mark. They execute no user input, make no
network calls, read no storage and touch no filesystem, so the plausible
surface is small: supply-chain integrity of the published tarballs, and CSS or
markup injected through a prop such as `ink`.

`ink` is interpolated into a CSS value. If your application passes attacker-controlled
strings to it, sanitise them first — the same as you would for any other style
value. We consider a report about that in scope, and it is the first thing worth
looking at.
