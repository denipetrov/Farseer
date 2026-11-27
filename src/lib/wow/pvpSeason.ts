/**
 * What the leaderboard pages show of a PvP season (`GET /pvp/seasons`): its name, its dates
 * in the region shown, and the title the bracket awards.
 */
import type { PvpBoard, PvpBracket, PvpCutoff, PvpSeason } from '@/api/pvp';
import type { Faction } from '@/styles/palette';

/** `Player vs. Player (Midnight Season 2)` → `Midnight Season 2`; null when unnamed */
export function seasonShortName(name: string | null): string | null {
  if (!name) return null;
  return /^Player vs\.? Player \((.+)\)$/.exec(name.trim())?.[1] ?? name.trim();
}

export interface SeasonDates {
  startsAt: string | null;
  /** Null while it runs */
  endsAt: string | null;
}

/**
 * The season's dates in a region. On World: the first region's start, and the last
 * region's end (none while it still runs in any region).
 */
export function seasonDates(season: PvpSeason, region: PvpBoard): SeasonDates | null {
  const runs =
    region === 'world'
      ? Object.values(season.regions)
      : season.regions[region]
        ? [season.regions[region]]
        : [];
  if (!runs.length) return null;
  const starts = runs.map((r) => r!.startsAt).filter((s): s is string => !!s);
  const ends = runs.map((r) => r!.endsAt);
  return {
    startsAt: starts.length ? starts.reduce((a, b) => (a < b ? a : b)) : null,
    endsAt: ends.some((e) => !e) ? null : ends.reduce((a, b) => (a! > b! ? a : b)),
  };
}

export interface SeasonReward {
  /** `Gladiator: Midnight Season 2`, `Hero of the Horde: Midnight Season 2` */
  title: string;
  /** The rating it takes in the region shown; null on World (each region has its own) */
  rating: number | null;
}

/**
 * The title a bracket awards this season, and the rating it takes: 3v3 Gladiator, RBG Hero
 * of the faction chosen in the header. None for 2v2 (no title) and for Shuffle and Blitz,
 * whose titles are per spec and not in the season list (see ladderReward).
 */
export function seasonReward(
  season: PvpSeason,
  bracket: PvpBracket,
  region: PvpBoard,
  faction: Faction,
): SeasonReward | null {
  if (bracket !== '3v3' && bracket !== 'rbg') return null;
  const runs =
    region === 'world'
      ? Object.values(season.regions)
      : season.regions[region]
        ? [season.regions[region]]
        : [];
  return cutoffReward(
    runs.map((r) => r?.cutoffs[bracket]),
    region,
    faction,
  );
}

/**
 * The title a single Shuffle or Blitz spec ladder awards, from the leaderboard's answer:
 * `cutoff` in a region, else the first of `regionCutoffs` (World: no rating).
 */
export function ladderReward(
  board: { cutoff: PvpCutoff | null; regionCutoffs?: Partial<Record<string, PvpCutoff | null>> },
  region: PvpBoard,
  faction: Faction,
): SeasonReward | null {
  return region === 'world'
    ? cutoffReward(Object.values(board.regionCutoffs ?? {}), region, faction)
    : cutoffReward([board.cutoff], region, faction);
}

/** The first cutoff with a title, for the faction when titles differ by faction */
function cutoffReward(
  cutoffs: readonly (PvpCutoff | null | undefined)[],
  region: PvpBoard,
  faction: Faction,
): SeasonReward | null {
  for (const cutoff of cutoffs) {
    if (!cutoff) continue;
    const own = cutoff.factions ? cutoff.factions[faction] : cutoff;
    if (!own?.title) continue;
    return { title: own.title, rating: region === 'world' ? null : (own.rating ?? null) };
  }
  return null;
}
