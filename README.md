# manmohan.work

Personal site for Manmohan Singh Charan. Static Astro site: a one-page home, plus `/writing`.

## Add a post

1. Add a Markdown file under `src/content/writing/`, for example `src/content/writing/my-post.md`:

   ```md
   ---
   title: My post
   description: One line that shows on the list and in share cards.
   pubDate: 2026-10-20
   draft: false
   ---

   Words here.
   ```

2. Set `draft: false`. Posts default to draft, so a file that omits `draft` stays off the site.
3. Merge to `main`. Cloudflare builds the site and the post is live at `manmohan.work/writing/my-post`. It also lands in `/rss.xml` and the sitemap.

Drafts never appear on the home page, the writing index, the RSS feed, the sitemap, or as built pages.

You can do this from the GitHub website (Add file → Create new file) with no local setup. Merging to `main` deploys the live site.

## Local

Needs Node 22.12 or newer.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs dist/
```

## Hosting

Cloudflare Workers static assets, connected to this repo. Build command `npm run build`, deploy command `npx wrangler deploy` (reads `wrangler.jsonc`, serves `dist`). Custom domain `manmohan.work`.

`public/_headers` sets a long cache on hashed `/_astro/*` files and on `/fonts/*`.
