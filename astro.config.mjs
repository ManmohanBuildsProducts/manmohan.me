import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://manmohan.work',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
