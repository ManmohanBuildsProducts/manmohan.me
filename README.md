# manmohan.work

Personal site. The home page is the Living Island (`src/pages/index.astro`), drawn in SVG. Ages, villagers, and islands live in `src/data/island.ts`. `/writing` is an Astro blog.

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
