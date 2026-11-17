import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://manmohan.work',
  trailingSlash: 'ignore',
  // HTML whitespace keeps the spaces between inline links and labels.
  compressHTML: true,
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
