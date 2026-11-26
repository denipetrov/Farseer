/**
 * Rated PvP rank icons (icons/pvp/ranked/rankedpvp_0N.png), from two sources:
 *
 * 1. A past season's title, from the PvP character's `pvpHistory` (Soulseeker's
 *    PvpHistoryEntry): `tier` names the title the season was finished with.
 * 2. A current rating: the band the rating falls in, lifted to Gladiator/Legend
 *    when the character has that title this season, and to Rank 1 when the rating
 *    reaches the ladder's Rank 1 cutoff (season cutoffs from the API).
 *
 * Bands and the title → icon list were supplied by the project owner (2026-11-18).
 * Icons have one look (no modern/classic).
 */
import { iconUrl } from '@/lib/assets';

export type PvpRankId =
  | 'unranked'
  | 'combatant'
  | 'challenger'
  | 'rival'
  | 'duelist'
  | 'elite'
  | 'gladiator'
  | 'rank-one';

export interface PvpRank {
  id: PvpRankId;
  /** English label */
  name: string;
  /** Icon file: rankedpvp_0<icon>.png */
  icon: number;
  /** Lowest current rating in this band; null for ranks a rating alone can't give */
  minRating: number | null;
  /**
   * Text colour for a rating of this rank (leaderboards): the icon's main tone, lightened
   * to read on the dark panels (contrast 5.8–11 : 1 on --color-surface).
   */
  color: string;
}

/** In ascending order. */
export const PVP_RANKS: readonly PvpRank[] = [
  // Colours from each icon (2026-11-26): bronze, silver, gold, ice, blue, purple, gold, orange
  { id: 'unranked', name: 'Unranked', icon: 1, minRating: 0, color: '#b8927f' },
  { id: 'combatant', name: 'Combatant', icon: 2, minRating: 1000, color: '#c3c8d0' },
  { id: 'challenger', name: 'Challenger', icon: 3, minRating: 1400, color: '#e2b85b' },
  { id: 'rival', name: 'Rival', icon: 4, minRating: 1800, color: '#a9cdef' },
  { id: 'duelist', name: 'Duelist', icon: 5, minRating: 2100, color: '#4cb0f0' },
  { id: 'elite', name: 'Elite', icon: 6, minRating: 2300, color: '#b47cf2' },
  // Elite rating plus this season's Gladiator-type title
  { id: 'gladiator', name: 'Gladiator', icon: 7, minRating: null, color: '#ffc53d' },
  // Elite rating at or above the ladder's Rank 1 cutoff
  { id: 'rank-one', name: 'Rank 1', icon: 8, minRating: null, color: '#ff8a24' },
];

const byId = new Map(PVP_RANKS.map((r) => [r.id, r]));
const rank = (id: PvpRankId) => byId.get(id)!;

/**
 * Soulseeker's PvpHistoryEntry.tier → rank. Gladiator, Legend (Solo Shuffle),
 * Strategist (Blitz) and Battle Mender are the season's top titles and share the
 * Gladiator icon; any Rank 1 title (Forged Gladiator, Galactic Legend…) is rank-one.
 */
const HISTORY_TIER: Record<string, PvpRankId> = {
  combatant: 'combatant',
  challenger: 'challenger',
  rival: 'rival',
  duelist: 'duelist',
  elite: 'elite',
  gladiator: 'gladiator',
  legend: 'gladiator',
  strategist: 'gladiator',
  'battle-mender': 'gladiator',
  'rank-one': 'rank-one',
};

/** The parts of a PvpHistoryEntry this file reads. */
export interface PvpHistoryInput {
  tier: string;
  seasonId?: number | null;
  earnedByThisCharacter?: boolean;
}

/** The rank a pvpHistory entry stands for, or null for an unknown tier. */
export function rankOfHistoryEntry(entry: Pick<PvpHistoryInput, 'tier'>): PvpRank | null {
  const id = HISTORY_TIER[entry.tier];
  return id ? rank(id) : null;
}

/**
 * The best rank in a season's history entries (a season can hold several:
 * Duelist, then Elite, then Gladiator). Null when the season has none.
 */
export function bestRankInSeason(
  history: readonly PvpHistoryInput[] | null | undefined,
  seasonId: number,
  { ownOnly = true }: { ownOnly?: boolean } = {},
): PvpRank | null {
  let best: PvpRank | null = null;
  for (const entry of history ?? []) {
    if (entry.seasonId !== seasonId) continue;
    if (ownOnly && entry.earnedByThisCharacter === false) continue;
    const r = rankOfHistoryEntry(entry);
    if (r && (!best || r.icon > best.icon)) best = r;
  }
  return best;
}

export interface RatingRankInput {
  /** The ladder's current rating; null or absent counts as unranked */
  rating: number | null | undefined;
  /** The character's pvpHistory, to see if it holds this season's Gladiator-type title */
  history?: readonly PvpHistoryInput[] | null;
  /** The current season id (the PvP character answer's `seasonId`) */
  seasonId?: number | null;
  /** This ladder's Rank 1 cutoff rating from the season data; null when unknown */
  rankOneCutoff?: number | null;
}

/**
 * The rank for a current rating:
 *   < 1000 Unranked · 1000 Combatant · 1400 Challenger · 1800 Rival · 2100 Duelist
 *   2300+: Rank 1 at or above the Rank 1 cutoff; else Gladiator with this season's
 *   title earned by this character; else Elite.
 */
export function rankForRating({
  rating,
  history,
  seasonId,
  rankOneCutoff,
}: RatingRankInput): PvpRank {
  const r = typeof rating === 'number' && Number.isFinite(rating) ? rating : 0;
  const band = [...PVP_RANKS].reverse().find((x) => x.minRating != null && r >= x.minRating)!;
  if (band.id !== 'elite') return band;

  if (rankOneCutoff != null && r >= rankOneCutoff) return rank('rank-one');
  const season = seasonId != null ? bestRankInSeason(history, seasonId) : null;
  if (season && season.icon >= rank('gladiator').icon) return season;
  return band;
}

/**
 * When a leaderboard row with an Elite rating counts as this season's Gladiator-type title
 * (Gladiator, Legend, Strategist): this many wins this season, or a rating at least this
 * high. Rows carry no title history, so this stands in for it: the user's rule (2026-11-26).
 */
export const GLADIATOR_ROW_WINS = 150;
export const GLADIATOR_ROW_RATING = 2650;

/**
 * The rank of a leaderboard row (Soulseeker's LeaderboardEntry), from an Elite rating (2300+)
 * upwards:
 * - Rank 1 when `inTitleRange` (rating at or above its own region's title cutoff, which is
 *   the Rank 1 title: "Venomous Gladiator: Midnight Season 2"). Only from Elite, as
 *   `rankForRating` does with a cutoff: a tiny ladder's cutoff can sit far below 2300
 *   (Korea 3v3: 576).
 * - Else Gladiator with at least GLADIATOR_ROW_WINS wins this season, or a rating of at least
 *   GLADIATOR_ROW_RATING (the row has no title history; the character page has the real one).
 * - Else Elite. Below 2300, the rating's band.
 */
export function rankOfLadderRow(row: {
  rating: number;
  inTitleRange?: boolean;
  won?: number | null;
}): PvpRank {
  const band = rankForRating({ rating: row.rating });
  if (band.id !== 'elite') return band;
  if (row.inTitleRange) return rank('rank-one');
  if ((row.won ?? 0) >= GLADIATOR_ROW_WINS || row.rating >= GLADIATOR_ROW_RATING) {
    return rank('gladiator');
  }
  return band;
}

/** Icon URL for a rank. */
export function pvpRankIconUrl(r: PvpRank): string | undefined {
  return iconUrl(`pvp/ranked/rankedpvp_${String(r.icon).padStart(2, '0')}`);
}
