# manmohan.me

Personal site. Home page is a hand-built WebGL deck (`public/index.html`); `/writing` is an Astro blog.

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

2. Commit and push to `main`. Cloudflare Pages rebuilds and the post is live at `manmohan.me/writing/my-post/` in a minute or two. It also lands in `/rss.xml` and the sitemap.

You can do this from the GitHub website (Add file → Create new file) with no local setup.

## Local

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs dist/
```

## Hosting

Cloudflare Workers (static assets), connected to this repo. Build command `npm run build`, deploy command `npx wrangler deploy` (reads `wrangler.jsonc`, serves `dist`). Custom domain `manmohan.me`.

## Home page source

`public/index.html` is a build output. Its source (`src.html` + `build.py`, which injects the Survey of India outline) lives in the project files; rebuild there and copy the result here.
