import type { MessageKey } from '@/i18n/messages';

/**
 * The site's slogans (the user, 2026-11-28): short lines playing on the name and the site
 * (the ladders, ranks, cutoffs, archives). One shows under the home page's wordmark and
 * another beside the footer's logo, picked at random each time the site loads.
 */
export const SLOGANS = [
  'slogan.watch',
  'slogan.chaos',
  'slogan.ladder',
  'slogan.rank',
  'slogan.earned',
  'slogan.meta',
  'slogan.climb',
  'slogan.cutoffs',
  'slogan.repeat',
  'slogan.archives',
] as const satisfies readonly MessageKey[];

export type SloganKey = (typeof SLOGANS)[number];

/** Two different slogans: `random` is in [0, 1), as Math.random gives */
export function pickSlogans(random: () => number = Math.random): {
  hero: SloganKey;
  footer: SloganKey;
} {
  const n = SLOGANS.length;
  const hero = Math.floor(random() * n);
  // Any other one: an offset of 1 to n-1 from the hero's
  const footer = (hero + 1 + Math.floor(random() * (n - 1))) % n;
  return { hero: SLOGANS[hero]!, footer: SLOGANS[footer]! };
}

/** This load's pair: drawn once when the site starts, so it holds while browsing */
export const SITE_SLOGANS = pickSlogans();
