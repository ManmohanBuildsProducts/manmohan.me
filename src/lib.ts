import { getCollection } from 'astro:content';

export async function posts() {
  const all = await getCollection('writing', ({ data }) => !data.draft);
  return all.sort((a, b) => {
    const byDate = b.data.date.valueOf() - a.data.date.valueOf();
    if (byDate !== 0) return byDate;
    return a.data.title.localeCompare(b.data.title);
  });
}

export const fmt = (d: Date) =>
  d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
