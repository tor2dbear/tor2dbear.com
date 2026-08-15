---
title: "Redirect www to the apex"
status: next
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
2. **Rules → Redirect Rules → Create rule**, or the *Redirect from www to root*
   template if it is offered.
   - When: hostname equals `www.tor2dbear.com`
   - Then: dynamic redirect, status **301**
   - Target: `concat("https://tor2dbear.com", http.request.uri.path)`
   - Preserve query string: on
3. Check `curl -sSI https://www.tor2dbear.com` returns `301` with the right
   `location`, and that the apex itself still answers `200`.

## Open questions
- Should the same rule exist for every project subdomain (`www.pia.…`)? Probably
  not worth it — nobody types `www.` in front of a subdomain.
- If the portfolio moves to Cloudflare, does `tor-bjorn.com` want the inverse
  (apex → `www`, which is where it lives today)? That reverses the canonical
  direction and should be decided once, for both domains.
