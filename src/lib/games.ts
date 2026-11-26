/**
 * The World of Warcraft games the site covers. Each is the first segment of every page's
 * address: `/retail/en/pvp/…`, `/forever/en/pvp/…` (the user's choice, 2026-11-26).
 *
 * Only Retail has data so far. Forever is defined so the routing, links and a future
 * toggle are ready; while it is not `enabled`, its addresses redirect to the same page on
 * Retail (`__root.tsx`). Turning it on is setting `enabled: true` and adding the toggle.
 */
export const GAMES = [
  { slug: 'retail', name: 'Retail', enabled: true },
  { slug: 'forever', name: 'Forever', enabled: false },
] as const;

export type GameSlug = (typeof GAMES)[number]['slug'];

/** The game an address without one opens on */
export const DEFAULT_GAME: GameSlug = 'retail';

export const isGameSlug = (v: unknown): v is GameSlug =>
  typeof v === 'string' && GAMES.some((g) => g.slug === v);

/** Whether a game's pages can be opened yet */
export const isGameEnabled = (slug: GameSlug): boolean =>
  GAMES.find((g) => g.slug === slug)?.enabled ?? false;
