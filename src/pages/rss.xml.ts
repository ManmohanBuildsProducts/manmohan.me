import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { posts } from '../lib';

export async function GET(context: APIContext) {
  const site = context.site ?? new URL('https://manmohan.work');
  return rss({
    title: 'Manmohan Singh Charan · Writing',
    description: 'Notes on building products with AI, and what I learn along the way.',
    site,
    items: (await posts()).map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: `/writing/${p.id}/`,
    })),
  });
}
