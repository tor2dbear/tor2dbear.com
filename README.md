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
scripts/new-project bootstraps a whole new project in one command
starter/            the template new projects are scaffolded from
```

## Start a new project

```bash
./scripts/new-project <slug> --name "Name" --blurb "One line."
```

Scaffolds from `starter/`, creates `tor2dbear/<slug>`, deploys it to Cloudflare
(which also claims `<slug>.tor2dbear.com`), and opens the two pull requests that
list it on the front page and the roadmap board. `--dry-run` shows the whole run
without touching anything remote; `--help` lists the flags.

Cloudflare is driven through the `wrangler` CLI using your existing
`wrangler login` — no API token and no account or zone ids live in this repo.

## Add an existing project to the front page

Edit `projects.json` — add an object under `projects` (name, url, repo, blurb, color,
stack). The page reads it at runtime; no rebuild needed. (For a *new* project,
`new-project` does this for you.)

## Develop & deploy

Static site, Cloudflare static-assets Worker. Follows the fleet flow: branch → preview →
PR → merge to `main` → production. See [`CONVENTIONS.md`](CONVENTIONS.md#the-deploy-flow-both-patterns).

```bash
npx wrangler dev      # local preview
npx wrangler deploy   # production (from main)
```
