---
title: "Redirect www to the apex"
status: done
tags: [infra]
updated: 2026-08-15
---

## Goal
`www.tor2dbear.com` resolves to nothing. Anyone who types the habitual `www.` in
front of the workshop gets a dead page instead of the front door.

## Research

The zone has no `www` record at all — Cloudflare's own DNS panel flags it:
*"Visitors cannot reach www.tor2dbear.com."* Two ways to fix it:

**A second custom domain on the Worker.** Add `www.tor2dbear.com` to `routes` in
`wrangler.jsonc` next to the apex. One line, deploys itself. But it *serves* the
site at both hostnames rather than redirecting, so the same page lives at two
URLs — split search ranking, two canonical candidates, and every project link on
the page would have to be host-relative to stay consistent. Rejected.

**A Redirect Rule.** `www` sends a 301 to the apex, one canonical hostname, no
code and no deploy. This is the way, and it is what the portfolio should use for
its own `www` too if it ever moves off Netlify.

It needs a DNS record to fire against: Cloudflare only runs rules on hostnames it
proxies, so `www` needs a **proxied** record even though nothing is behind it.
The idiomatic placeholder is `AAAA www → 100::` (the discard prefix), which is
exactly what `api.tor2dbear.com` already uses in this zone.

Steps, all in the dashboard:

1. **DNS → Add record** — type `AAAA`, name `www`, address `100::`, proxy **on**.
2. **Rules → Redirect Rules → Create rule → *Redirect from WWW to root*.** The
   template needs no edits: it matches the wildcard `https://www.*` and redirects
   to `https://${1}`, so the captured host and path carry over. Status **301**.
   Check *Preserve query string* is on — it sits below the fold on a phone.

   A custom filter expression (`hostname eq "www.tor2dbear.com"` with a
   `concat()` target) does the same thing with more handling, and only for this
   one host. The wildcard covers any future `www.` in the zone. Use the template.
3. Check `curl -sSI https://www.tor2dbear.com` returns `301` with the right
   `location`, and that the apex itself still answers `200`.

## Delivered

Both steps, in the dashboard. `AAAA www → 100::` proxied, then the *Redirect
from WWW to root* template deployed unmodified.

Verified from outside:

| | |
| --- | --- |
| `www.tor2dbear.com` | 301 → `https://tor2dbear.com/` |
| Path | `/projects.json` carried over |
| Query | `?utm_source=test&x=1` intact |
| Following the redirect | 200 on the target |
| Apex direct | 200, unaffected |

One thing worth remembering: between the two steps `www` answered **522**. That
is the expected intermediate state, not a fault — the record resolves, so
Cloudflare tries to proxy to `100::`, which discards it. Once the rule is live
the edge answers 301 before it ever reaches for an origin. Anyone adding a
proxied placeholder record without a rule behind it will see the same.

The wildcard template beat the hand-written filter expression: it needed no
edits and covers any future `www.` host in the zone rather than one name.

## Open questions
- Should the same rule exist for every project subdomain (`www.pia.…`)? The
  wildcard already covers them if they ever get a proxied record — nothing more
  to do unless one is added.
- If the portfolio moves to Cloudflare, does `tor-bjorn.com` want the inverse
  (apex → `www`, which is where it lives today)? That reverses the canonical
  direction and should be decided once, for both domains.
