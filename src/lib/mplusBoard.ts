import {
  isRunningIn,
  type MplusDungeon,
  type MplusDungeonRun,
  type MplusSeason,
  type PveBoard,
  type PveRegion,
} from '@/api/pve';
import { isLadderRole, type LadderRole } from '@/api/pvp';
import { resolveClass } from '@/lib/wow/classes';
import { resolveSpec } from '@/lib/wow/specs';

/**
 * The Mythic+ character board (the user's design, 2026-11-28): Soulseeker's
 * `/pve/mplus-leaderboard`, one row per character with a tile per season dungeon.
 */

/** The PvE boards' regions, World first: Raider.io covers China too */
export const MPLUS_BOARDS: readonly PveBoard[] = ['world', 'us', 'eu', 'kr', 'tw', 'cn'];

/** The page's URL: all optional, invalid values dropped */
export interface MplusBoardSearch {
  region?: PveBoard;
  page?: number;
  /** The filter: a class (with `spec`, one spec), or a role */
  class?: string;
  spec?: string;
  role?: LadderRole;
}

export const validateMplusBoardSearch = (search: Record<string, unknown>): MplusBoardSearch => {
  const cls =
    typeof search.class === 'string' && resolveClass(search.class) ? search.class : undefined;
  return {
    region: MPLUS_BOARDS.includes(search.region as PveBoard)
      ? (search.region as PveBoard)
      : undefined,
    page: Number(search.page) > 1 ? Math.floor(Number(search.page)) : undefined,
    class: cls,
    spec:
      cls && typeof search.spec === 'string' && resolveSpec(search.spec, cls)
        ? search.spec
        : undefined,
    // Soulseeker takes a role or a class, not both with a spec: a role only without a class
    role: !cls && isLadderRole(search.role) ? search.role : undefined,
  };
};

/**
 * A character's runs lined up with the season's dungeons, in the season's order: its best
 * run in each, or null where it has none (then its score is a partial sum). Runs match by
 * dungeon id, else by slug.
 */
export function runsBySeasonDungeon(
  dungeons: readonly MplusDungeon[],
  runs: readonly MplusDungeonRun[] | undefined,
): (MplusDungeonRun | null)[] {
  return dungeons.map(
    (d) =>
      runs?.find((r) => r.dungeon.id === d.id) ??
      runs?.find((r) => d.slug != null && r.dungeon.slug === d.slug) ??
      null,
  );
}

/** A duration as the game shows it: `28:27`, or `1:02:14` past an hour */
export function clock(ms: number): string {
  const total = Math.round(Math.abs(ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** A run's state for its tile: timed (with its chests, 1–3) or depleted (over time) */
export const runState = (run: MplusDungeonRun): 'depleted' | 'timed' =>
  run.numChests > 0 ? 'timed' : 'depleted';

/** The top-percent tiers Raider.io gives cutoffs for: top 0.1% (`p999`) and top 1% (`p990`) */
export type ScoreTier = 'p999' | 'p990';

/**
 * A region's top-percent cutoffs this season (the lowest score in each, both factions
 * together), or null when the season has none read there. On World a character is judged
 * by its own region's: Raider.io sets cutoffs per region.
 */
export function tierCutoffs(
  season: Pick<MplusSeason, 'cutoffs'> | undefined,
  region: PveRegion,
): Record<ScoreTier, number | null> | null {
  const q = season?.cutoffs[region]?.quantiles;
  if (!q) return null;
  const p999 = q.p999?.all?.minScore ?? null;
  const p990 = q.p990?.all?.minScore ?? null;
  return p999 == null && p990 == null ? null : { p999, p990 };
}

/** The best tier a score reaches, or null below the top 1% (or without cutoffs) */
export function scoreTier(
  score: number,
  cutoffs: Record<ScoreTier, number | null> | null,
): ScoreTier | null {
  if (!cutoffs) return null;
  if (cutoffs.p999 != null && score >= cutoffs.p999) return 'p999';
  if (cutoffs.p990 != null && score >= cutoffs.p990) return 'p990';
  return null;
}

/**
 * The live season of a board: the region's own; on World the newest any region is on
 * (Soulseeker's `current`, the catalogue's first)
 */
export function liveSeason(
  seasons: readonly MplusSeason[] | undefined,
  region: PveBoard,
): MplusSeason | undefined {
  if (!seasons) return undefined;
  return region === 'world' ? seasons[0] : seasons.find((s) => isRunningIn(s, region));
}

/** Raider.io's expansion ids → their names (as Blizzard writes them, in English) */
const EXPANSIONS: Readonly<Record<number, string>> = {
  6: 'Legion',
  7: 'Battle for Azeroth',
  8: 'Shadowlands',
  9: 'Dragonflight',
  10: 'The War Within',
  11: 'Midnight',
};

/**
 * A season's full name (the user, 2026-11-28): Soulseeker's `MN Season 2` → `Midnight Season
 * 2`, `TWW Season 3 • With Pre Patch` → `The War Within Season 3 • With Pre Patch`, Legion's
 * `Season 7.3` → `Legion Season 7.3`. An expansion it doesn't know keeps the name as sent.
 */
export function mplusSeasonName(season: Pick<MplusSeason, 'name' | 'expansionId'>): string {
  const expansion = EXPANSIONS[season.expansionId];
  if (!expansion) return season.name;
  const m = /^(?:[A-Z]+\s+)?(Season\b.*)$/.exec(season.name.trim());
  return m ? `${expansion} ${m[1]}` : season.name;
}
