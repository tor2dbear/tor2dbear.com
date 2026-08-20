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
| Roadmap | `roadmap.tor2dbear.com` | `tor2dbear/roadmap` | Cloudflare Worker (static assets) |
| Workshop | `tor2dbear.com` | `tor2dbear/tor2dbear.com` | Cloudflare Worker (static assets) |

**Cloudflare is the house standard.** New projects go on Cloudflare. Netlify (portfolio)
is the last legacy host, slated to move. (Roadmap moved off GitHub Pages to a
Cloudflare Worker at `roadmap.tor2dbear.com`.)

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
  "assets": { "directory": "./dist" }, // "." when there is no build step
  // Declaring the custom domain here means wrangler creates it and its DNS
  // record on first deploy — the reason new-project needs no dashboard step.
  "routes": [{ "pattern": "<project>.tor2dbear.com", "custom_domain": true }]
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

For static-assets Workers this comes from **Workers Builds** — the Worker connected to
the GitHub repo. Set it up at creation: **Workers & Pages → Create application → Import
a repository**, then

| Field | Value |
| --- | --- |
| Project name | must equal `name` in `wrangler.jsonc`, or the build fails |
| Production branch | `main` |
| Build command | empty, unless the project has a build step |
| Deploy command | `npx wrangler deploy` |
| Builds for non-production branches | on — defaults to `npx wrangler versions upload` |

Three things that cost us time on the workshop repo, so check them:

- **The production branch defaults to the repo's default branch on GitHub.** GitHub makes
  the *first branch pushed to an empty repo* the default — which is not necessarily `main`.
  If that happened, production silently builds from a feature branch and merges to `main`
  deploy nothing. Fix on both sides: GitHub → Settings → General → Default branch, and
  Cloudflare → Settings → Build → Branch control.
- **Pin wrangler in `package.json`, even with no build step.** The deploy command runs
  `npx wrangler` inside Cloudflare's build container, which resolves whatever is latest
  that day unless a `devDependencies` entry pins it.
- **The custom domain really does come from `routes`.** Verified on `tor2dbear.com`: the
  first deploy created the Custom Domain and its DNS record with no dashboard step. An
  existing `TXT` on the same name (e.g. site verification) does not block it; an existing
  `A`/`AAAA`/`CNAME` does.

### Exception: projects whose served content is built in CI

Workers Builds (the git-connected build) is the default source of production deploys and
per-branch preview URLs. But a project that **builds its served content in CI** — the
roadmap aggregator harvests `data/` fresh from the source repos on every run — must keep
the Worker's **Git build disconnected**, or the git build redeploys the stale *committed*
artifact over CI's fresh one. Such a project drives everything from GitHub Actions instead
and replicates the same flow:

- **Production:** `npx wrangler deploy` from CI on push to `main` (not Workers Builds).
- **PR preview:** a `pull_request` workflow runs `npx wrangler versions upload
  --preview-alias pr-<number>` — a Worker *version*, never prod — and posts a **sticky PR
  comment** with a **stable per-PR URL** (`https://pr-<number>-<name>.<subdomain>.workers.dev`)
  that re-points at the newest version each push. This reproduces the Workers-Builds PR
  comment from CI without reconnecting the git build.
- **Gate + secrets:** the same workflow syntax-checks and rebuilds the artifact as the merge
  gate; the credentialed preview is restricted to owner-authored PRs so PR-controlled tooling
  can't read the deploy token.

Reference implementation: `tor2dbear/roadmap` → `.github/workflows/sync.yml` (deploy) +
`pr-preview.yml` (gate + preview).

## Repo hygiene

Every project repo should carry:

- `README.md` — what it is, how to run it locally.
- `roadmap/` — the roadmap pucks (see below). A project isn't "set up" without it.
- A committed deploy config when it's a static-assets Worker (`wrangler.jsonc`).
- `package.json` pinning `wrangler`, so Workers Builds does not float the version.
- `CLAUDE.md` — agent notes, when the project has agent-run workflows.

## Roadmap

Every project describes its roadmap the **same way** so the aggregator can harvest it: one
markdown file per item (a "puck") with YAML frontmatter, under `roadmap/`. The full spec and
a drop-in template live in the roadmap repo — **do not duplicate it here**:

- Spec: [`tor2dbear/roadmap` → `CONVENTION.md`](https://github.com/tor2dbear/roadmap/blob/main/CONVENTION.md)
- The board aggregates every project in the fleet — PIA, Cadence, Méta-Matic, the
  portfolio, this workshop, and the roadmap repo itself; adding a project is a line in
  that repo's `sources.json`.

## Adding a project

One command, from a checkout of this repo:

```bash
./scripts/new-project <slug> --name "Name" --blurb "One line about it."
```

It does the whole checklist:

1. Scaffolds from `starter/` — Vite + TypeScript + Vitest, `wrangler.jsonc`, `roadmap/`,
   README — substituting the slug, name, blurb and accent color throughout.
2. Verifies the scaffold installs, tests and builds, before anything remote exists.
3. Creates `tor2dbear/<slug>` on GitHub, pushes `main`, and asserts `main` really is the
   default branch.
4. Opens a PR against this repo adding the project to `projects.json` (front page).
5. Opens a PR against `tor2dbear/roadmap` adding it to `sources.json` (the board).
6. Prints the [Import a repository](#the-deploy-flow-both-patterns) settings to finish
   with.

Run `--dry-run` first to see the whole run without touching anything remote, and
`--help` for the flags (`--color`, `--dir`, `--private`, `--skip-register`, …).

**Why the script does not deploy.** It could run `wrangler deploy` and have the site
live a minute sooner — but that Worker would not be connected to the repo, so nothing
would build on push and there would be no preview URLs, which is the whole flow above.
Connecting a repo requires Cloudflare's GitHub App, an OAuth install that cannot be
automated headlessly, so one dashboard visit per project is unavoidable. The import
flow spends that visit well: it creates the Worker, deploys it, claims the custom
domain from `routes`, and turns on branch builds together.

Yours afterwards: the import, and merging the two pull requests.
