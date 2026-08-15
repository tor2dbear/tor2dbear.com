# tor2dbear.com — the workshop

The apex site and the hub for the `tor2dbear` project fleet.

Two jobs:

1. **Front door.** `tor2dbear.com` lists every project and links to its subdomain, so the
   bare apex is a real page — not a 404. The polished portfolio lives at
   [tor-bjorn.com](https://www.tor-bjorn.com); this is where the things actually run.
2. **Rule book.** [`CONVENTIONS.md`](CONVENTIONS.md) is the single source of truth for the
   shared setup across repos — domains, hosting patterns, the deploy flow, roadmap.

## Layout

```
index.html          the front page (no build step)
styles.css          theme-aware, no external assets
projects.json       the project list — one source of truth for the cards
wrangler.jsonc      Cloudflare static-assets Worker config for the apex
.assetsignore       keeps docs/config out of the served bundle
CONVENTIONS.md      the multirepo rules
scripts/            (planned) new-project bootstrap
starter/            (planned) template new projects copy from
```

## Add a project to the front page

Edit `projects.json` — add an object under `projects` (name, url, repo, blurb, color,
stack). The page reads it at runtime; no rebuild needed.

## Develop & deploy

Static site, Cloudflare static-assets Worker. Follows the fleet flow: branch → preview →
PR → merge to `main` → production. See [`CONVENTIONS.md`](CONVENTIONS.md#the-deploy-flow-both-patterns).

```bash
npx wrangler dev      # local preview
npx wrangler deploy   # production (from main)
```
