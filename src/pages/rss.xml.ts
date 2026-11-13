import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { posts } from '../lib';

export async function GET(context: APIContext) {
  return rss({
    title: 'Manmohan Singh Charan · Notes',
    description: 'Notes by Manmohan Singh Charan on agents, search, and shipping products.',
    site: context.site!,
    items: (await posts()).map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/writing/${p.id}/`,
    })),
  });
}
