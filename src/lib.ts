import { getCollection } from 'astro:content';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function posts() {
  const all = await getCollection('writing', ({ data }) => !data.draft);
  return all.sort((a, b) => {
    const byDate = b.data.pubDate.getTime() - a.data.pubDate.getTime();
    if (byDate !== 0) return byDate;
    return a.data.title.localeCompare(b.data.title);
  });
}

/** YYYY-MM-DD in UTC, matching a date-only pubDate. */
export function isoDate(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** "8 Dec 2026" */
export function fmt(d: Date) {
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
