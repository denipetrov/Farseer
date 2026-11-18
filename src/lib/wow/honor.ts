/**
 * Honor level badges: the PvP badge a character shows for its honor level.
 *
 * The API sends `honor: { level, honorableKills } | null` on the PvP character
 * (Blizzard's pvp-summary `honor_level`); either value can be null. Levels go
 * well past the last threshold (2000 is seen).
 *
 * A badge is earned at its threshold and kept until the next one; below the
 * first threshold there is none. Icons have one look (no modern/classic):
 * icons/pvp/honor/pvptier-<tier>.png.
 *
 * Thresholds supplied by the project owner (2026-11-18). Tiers 22–33 exist as
 * files but have no known threshold yet, so they are never shown.
 */
import { iconUrl } from '@/lib/assets';

export interface HonorBadge {
  /** Icon number: pvptier-<tier>.png */
  tier: number;
  /** Lowest honor level that shows this badge */
  minLevel: number;
}

/** Sorted by `minLevel`, ascending. */
export const HONOR_BADGES: readonly HonorBadge[] = [
  { tier: 1, minLevel: 5 },
  { tier: 2, minLevel: 10 },
  { tier: 3, minLevel: 15 },
  { tier: 4, minLevel: 20 },
  { tier: 5, minLevel: 25 },
  { tier: 6, minLevel: 30 },
  { tier: 7, minLevel: 40 },
  { tier: 8, minLevel: 50 },
  { tier: 9, minLevel: 60 },
  { tier: 10, minLevel: 70 },
  { tier: 11, minLevel: 80 },
  { tier: 12, minLevel: 90 },
  { tier: 13, minLevel: 100 },
  { tier: 14, minLevel: 125 },
  { tier: 15, minLevel: 150 },
  { tier: 16, minLevel: 175 },
  { tier: 17, minLevel: 200 },
  { tier: 18, minLevel: 250 },
  { tier: 19, minLevel: 300 },
  { tier: 20, minLevel: 400 },
  { tier: 21, minLevel: 500 },
];

/** Every shape the API uses: the level itself, or the `honor` object. */
export type HonorInput = number | { level?: number | null } | null | undefined;

const levelOf = (input: HonorInput): number | null => {
  const level = typeof input === 'number' ? input : input?.level;
  return typeof level === 'number' && Number.isFinite(level) ? level : null;
};

/** The badge for an honor level, or null below the first threshold or with no data. */
export function resolveHonorBadge(input: HonorInput): HonorBadge | null {
  const level = levelOf(input);
  if (level == null) return null;
  let badge: HonorBadge | null = null;
  for (const b of HONOR_BADGES) {
    if (level < b.minLevel) break;
    badge = b;
  }
  return badge;
}

/** Badge icon URL for an honor level, or undefined when there is no badge. */
export function honorBadgeUrl(input: HonorInput): string | undefined {
  const badge = resolveHonorBadge(input);
  return badge ? iconUrl(`pvp/honor/pvptier-${badge.tier}`) : undefined;
}

/** The honor level as a number, for labels ("Honor level 250"). */
export const honorLevel = levelOf;
