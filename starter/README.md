# {{NAME}}

{{BLURB}}

Lives at [{{SLUG}}.tor2dbear.com](https://{{SLUG}}.tor2dbear.com). Part of the
[tor2dbear workshop](https://tor2dbear.com) — the shared rules are in
[`CONVENTIONS.md`](https://github.com/tor2dbear/tor2dbear.com/blob/main/CONVENTIONS.md).

## Run it

```bash
npm install
npm run dev       # local dev server
npm test          # vitest
npm run build     # type-check + build to dist/
```

## Deploy

Static-assets Worker; `wrangler.jsonc` is committed, so production and previews
share one config. The flow is the fleet flow: branch → preview → PR → merge to
`main` → production.

```bash
npm run deploy            # production (from main)
npm run versions:upload   # preview URL for a branch
```

The custom domain and its DNS record are declared in `wrangler.jsonc` under
`routes` and created on the first deploy — no dashboard step.

## Roadmap

Planned work lives in [`roadmap/`](roadmap/) as one file per item. See
[`roadmap/README.md`](roadmap/README.md).
