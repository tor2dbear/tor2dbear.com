# Conventions

The shared rules for every `tor2dbear` project. One place, so a new repo — or an
agent — can learn the whole setup in a single read. Project-specific specs stay in
their own repos (see [Roadmap](#roadmap) below); this file is the cross-cutting stuff.

## The fleet

| Project | Lives at | Repo | Hosting |
| --- | --- | --- | --- |
| Portfolio | `www.tor-bjorn.com` | `tor2dbear/portfolio` | Netlify _(Hugo; may move to CF)_ |
| PIA | `pia.tor2dbear.com` | `tor2dbear/pia-terminal` | Cloudflare Pages + Supabase |
| Cadence | `cadence.tor2dbear.com` | `tor2dbear/cadence` | Cloudflare Pages |
| Méta-Matic ∞ | `meta-matic.tor2dbear.com` | `tor2dbear/meta-matic` | Cloudflare Worker (static assets) + `api/` Worker (D1 + R2) |
| Roadmap | _(board)_ | `tor2dbear/roadmap` | GitHub Pages _(to move to CF)_ |
| Workshop | `tor2dbear.com` | `tor2dbear/tor2dbear.com` | Cloudflare Worker (static assets) |

**Cloudflare is the house standard.** New projects go on Cloudflare. Netlify (portfolio)
and GitHub Pages (roadmap) are legacy and slated to move.

## Domains

- **`tor-bjorn.com`** — the portfolio. The polished, narrative front door.
- **`tor2dbear.com`** — the workshop. The apex lists every project; each project runs on
  its own **subdomain**: `<project>.tor2dbear.com`.
- Subdomain = the project slug, lowercase, hyphenated (`meta-matic`, not `MetaMatic`).

## Hosting: two patterns, one flow

Pick by whether the project needs server-side logic. Both follow the **same deploy flow**.

### A. Static / frontend-only → Cloudflare **Pages**

For pure frontends (Cadence, PIA). Connect the repo in the Cloudflare dashboard; pushes
build and deploy automatically, branch pushes get preview URLs for free. Simplest setup,
but the deploy config lives in the dashboard, not the repo.

### B. Static-assets **Worker** (recommended default) → committed `wrangler.jsonc`

For everything else, and preferred for new work (Méta-Matic, this workshop). A committed
`wrangler.jsonc` with `assets.directory` version-controls the deploy config, so production
and previews share one source of truth. When a project grows a backend, add a separate
Worker under `api/` with its own `wrangler.toml` and bindings (D1, R2, KV, secrets) —
exactly how Méta-Matic splits site from order/print API.

```jsonc
{
  "name": "<project>",
  "compatibility_date": "<yyyy-mm-dd>",
  "preview_urls": true,
  "assets": { "directory": "." }
}
```

### The deploy flow (both patterns)

```
develop on a branch  →  Cloudflare preview URL  →  open a PR  →  review
  →  merge to main  →  only then does production change
```

- **Production branch is `main`.** Merging to `main` deploys production.
- **Non-production branches get preview URLs**, never touch production.
- Custom domain always points at the **production** deployment.
- For static-assets Workers, enable this in **Workers & Pages → (project) → Settings →
  Builds**: production branch `main` with deploy command `npx wrangler deploy`, and
  "Non-production branch builds" with version command `npx wrangler versions upload`.

## Repo hygiene

Every project repo should carry:

- `README.md` — what it is, how to run it locally.
- `roadmap/` — the roadmap pucks (see below). A project isn't "set up" without it.
- A committed deploy config when it's a static-assets Worker (`wrangler.jsonc`).
- `CLAUDE.md` — agent notes, when the project has agent-run workflows.

## Roadmap

Every project describes its roadmap the **same way** so the aggregator can harvest it: one
markdown file per item (a "puck") with YAML frontmatter, under `roadmap/`. The full spec and
a drop-in template live in the roadmap repo — **do not duplicate it here**:

- Spec: [`tor2dbear/roadmap` → `CONVENTION.md`](https://github.com/tor2dbear/roadmap/blob/main/CONVENTION.md)
- The board aggregates PIA, Cadence and Méta-Matic today; adding a project is a line in
  that repo's `sources.json`.

## Adding a project

Until the `new-project` script lands (see `scripts/`, planned), the manual checklist is:

1. Create `tor2dbear/<slug>` on GitHub.
2. Copy the starter (planned: `starter/`) — index, `wrangler.jsonc`, `roadmap/`, README.
3. First deploy to Cloudflare; point `<slug>.tor2dbear.com` at production.
4. Add the project to this repo's `projects.json` (shows it on the workshop front page).
5. Add it to `tor2dbear/roadmap` `sources.json` (shows it on the board).

The script will collapse steps 1–5 into `./new-project <slug>`.
