/**
 * The last page that can be loaded: Soulseeker serves no page that starts past row
 * `maxRow` (200,000 on its boards; a 400 otherwise), though its PvP `totalPages` counts
 * every row (World Solo Shuffle: 265,120 rows, 5,303 pages of 50, page 4,000 the last).
 */
export const lastReachablePage = (totalPages: number, pageSize: number, maxRow = 200_000) =>
  Math.max(1, Math.min(totalPages, Math.floor((maxRow - 1) / pageSize) + 1));

/** One entry of a page list: a page number, or a gap ("…") between distant pages */
export type PageItem = number | 'gap';

/**
 * The pages to offer around the current one: always the first and last, the current one
 * with `around` neighbours each side, and a gap where pages are skipped. A gap never hides a
 * single page (1 … 3 is written 1 2 3).
 *
 *   pageWindow(6, 120)  → 1 … 4 5 6 7 8 … 120
 *   pageWindow(2, 5)    → 1 2 3 4 5
 */
export function pageWindow(page: number, totalPages: number, around = 2): PageItem[] {
  if (totalPages <= 1) return [1];
  const from = Math.max(1, page - around);
  const to = Math.min(totalPages, page + around);
  const items: PageItem[] = [];

  if (from > 1) items.push(1);
  if (from === 3) items.push(2);
  else if (from > 3) items.push('gap');

  for (let p = from; p <= to; p++) items.push(p);

  if (to === totalPages - 2) items.push(totalPages - 1);
  else if (to < totalPages - 2) items.push('gap');
  if (to < totalPages) items.push(totalPages);
  return items;
}
