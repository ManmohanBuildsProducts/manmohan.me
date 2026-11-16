# manmohan.work

Personal site. Text, no island. The homepage is `src/pages/index.astro`. Copy for the hero, the current work, and the five roles lives in `src/data/site.ts`. Notes are Markdown files in `src/content/writing/`.

The old Living Island is still in the repo (`src/components/`, `src/data/island.ts`, `src/scripts/island.ts`, `src/layouts/Home.astro`). Nothing routes to it.

## What may be said in public

Seven years, never nine. Blinkit: 450 stores. Badho: 20 lakh retailers, 11 states, 1M+ installs, 10+ production agent workflows, and hybrid search from 9% to 28% of DAU in under 100ms with zero LLM calls. Do not add other résumé figures. Do not name assistants. `npm run check` fails the build output if a banned phrase slips in.

## Publish a note

1. Add a Markdown file to `src/content/writing/`:

   ```md
   ---
   title: Title
   description: One line for the list and the share card.
   date: 2026-11-16
   draft: false
   ---

   Words.
   ```

2. A pull request is previewed by Cloudflare. Merging to `main` is what publishes to manmohan.work.

## Local

```sh
npm ci
npm run dev      # http://localhost:4321
npm run build    # outputs dist/
npm run check    # scans dist/ for the public-copy rules
```

## Hosting

Cloudflare Workers, static assets. Build command `npm run build`, deploy command `npx wrangler deploy` (`wrangler.jsonc` serves `dist`). Custom domain `manmohan.work`. Branch pushes get a preview URL; production is `main` only.
