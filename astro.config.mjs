import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://manmohan.me',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
