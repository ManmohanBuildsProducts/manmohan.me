# manmohan.work

Personal site. The home page is the Living Island (`src/pages/index.astro`), a 3D diorama. Ages and the chronicle live in `src/data/island.ts`. The detail cards live in `src/data/dossiers.ts`. `/writing` is an Astro blog.

## Island models

The buildings, trees, rocks, cart, crates, and scaffold pieces are CC0 models, repacked into `public/models/island.glb` and `public/models/villager.glb` (meshopt geometry, KTX2 textures). `scripts/pack-island.mjs` is the packer. Villagers are not named.

- KayKit Medieval Builder Pack by Kay Lousberg, [CC0](https://creativecommons.org/publicdomain/zero/1.0/). https://kaylousberg.itch.io/kaykit-medieval-builder-pack
- Fantasy Town Kit, Nature Kit, and Survival Kit by Kenney, [CC0](https://creativecommons.org/publicdomain/zero/1.0/). https://kenney.nl
- Animated Human by Quaternius, [CC0](https://creativecommons.org/publicdomain/zero/1.0/). https://quaternius.com

## Publish a post

1. Add a Markdown file to `src/content/writing/`, e.g. `my-post.md`:

   ```md
   ---
   title: My post
   description: One line that shows on the list and in share cards.
   date: 2026-10-20
   draft: false
   ---

   Words here.
   ```

2. Commit and push to `main`. Cloudflare Pages rebuilds and the post is live at `manmohan.work/writing/my-post/` in a minute or two. It also lands in `/rss.xml` and the sitemap.

You can do this from the GitHub website (Add file → Create new file) with no local setup.

## Local

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs dist/
```

## Hosting

Cloudflare Workers (static assets), connected to this repo. Build command `npm run build`, deploy command `npx wrangler deploy` (reads `wrangler.jsonc`, serves `dist`). Custom domain `manmohan.work`.

## Home page

Edit `src/data/island.ts` to add an age or a fog island. The scene, the chronicle, and the age rules all read that file. `npm run dev` serves the page at http://localhost:4321.
