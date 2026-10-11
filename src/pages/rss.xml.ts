import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { posts } from '../lib';

export async function GET(context: APIContext) {
  return rss({
    title: 'Manmohan · Writing',
    description: 'Notes on making messy systems legible, for people and for models.',
    site: context.site!,
    items: (await posts()).map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/writing/${p.id}/`,
    })),
  });
}
