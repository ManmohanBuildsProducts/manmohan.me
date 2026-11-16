import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { person } from '../data/site';
import { posts } from '../lib';

export async function GET(context: APIContext) {
  return rss({
    title: 'Manmohan Singh Charan',
    description: person.sentence,
    site: context.site!,
    items: (await posts()).map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/writing/${p.id}/`,
    })),
  });
}
