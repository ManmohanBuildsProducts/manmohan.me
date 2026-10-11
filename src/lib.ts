import { getCollection } from 'astro:content';

export async function posts() {
  const all = await getCollection('writing', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const fmt = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
