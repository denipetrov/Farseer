/**
 * Soulseeker's PvE catalogue: every raid (`GET /pve/raids`) and every Mythic+ season with its
 * dungeons, cutoffs and the affixes (`GET /pve/mplus-seasons`). Both are small, change
 * rarely and feed the PvE sidebar and many pages, so they are fetched once the visitor is on
 * the PvE side (`usePveCatalogue`, mounted in the root layout) and read from the cache
 * everywhere else with `useQuery(raidsQuery())` / `useQuery(mplusSeasonsQuery())`.
 *
 * Types mirror Soulseeker's `CatalogueRaid` (`src/seasons/pve-catalogue.service.ts`) and
 * `src/pve/mplus-seasons/mplus-seasons.types.ts`. Names arrive in English; translate them
 * with `/i18n/names` (raids and bosses by slug, dungeons by slug, affixes by id).
 */
import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '.';

/** A PvE region key in `starts` / `ends` / `cutoffs`. */
export type PveRegion = 'us' | 'eu' | 'kr' | 'tw' | 'cn';

/** Per region, ISO 8601. A region the raid or season never ran in is absent. */
type Starts = Partial<Record<PveRegion, string>>;
/** Per region; null while it is still open there (Raider.io's `2030-01-01` placeholder). */
type Ends = Partial<Record<PveRegion, string | null>>;

export interface RaidEncounter {
  id: number;
  slug: string;
  name: string;
}

export interface Raid {
  slug: string;
  name: string;
  /** `NP`; null where Raider.io gives none */
  shortName: string | null;
  /** Raider.io's expansion id: 10 = The War Within, 11 = Midnight */
  expansionId: number;
  /**
   * As Raider.io names it: an icon name (`inv_1215_raid_achievement_kithix`) or, on some
   * raids, a numeric file id (`8039569`). Null before Battle for Azeroth.
   */
  icon: string | null;
  starts: Starts;
  ends: Ends;
  /** Bosses in order */
  encounters: RaidEncounter[];
}

export interface RaidsResponse {
  /** Newest expansion first, then the latest to open within it */
  raids: Raid[];
}

/** One faction, or both together (`all`), at one cutoff */
export interface MplusCutoffBand {
  /** The quantile reached, 0–1 */
  quantile: number | null;
  /** The lowest Mythic+ score that reaches the cutoff */
  minScore: number | null;
  populationCount: number | null;
  populationFraction: number | null;
  totalPopulation: number | null;
}

export interface MplusCutoff {
  /** The title's own threshold (2000 for Keystone Master); null for the top-percent cutoffs */
  score: number | null;
  alliance: MplusCutoffBand | null;
  horde: MplusCutoffBand | null;
  /** Both factions: the figure to show unless a faction is being compared */
  all: MplusCutoffBand | null;
}

/** A season's cutoffs in one region */
export interface MplusRegionCutoffs {
  /** `ok`: read. `missing`: Raider.io has none. `failed` / `unavailable`: not read. */
  status: 'ok' | 'missing' | 'failed' | 'unavailable';
  updatedAt: string | null;
  /** Title cutoffs, `keystoneExplorer` … `keystoneMyth`; a title the season didn't award is absent */
  keystones: Partial<Record<string, MplusCutoff>>;
  /** `p999` (top 0.1%) and `p990` (top 1%) */
  quantiles: Partial<Record<string, MplusCutoff>>;
}

/** `slug` and `name` are null only for a dungeon Soulseeker lacks (none today) */
export interface MplusDungeon {
  id: number;
  slug: string | null;
  name: string | null;
  shortName: string | null;
  challengeModeId: number | null;
  keystoneTimerSeconds: number | null;
  iconUrl: string | null;
  backgroundImageUrl: string | null;
  /** Every expansion whose seasons ran it */
  expansionIds: number[];
}

export interface MplusSeason {
  slug: string;
  name: string;
  shortName: string | null;
  /** Raider.io's expansion id: 10 = The War Within, 11 = Midnight */
  expansionId: number;
  /** Blizzard's season id: 0 for all of Legion */
  blizzardSeasonId: number | null;
  starts: Starts;
  ends: Ends;
  /** In the season's own order; a dungeon runs in several seasons, so it repeats */
  dungeons: MplusDungeon[];
  /** Empty for a season without cutoffs (before TWW 3) */
  cutoffs: Partial<Record<PveRegion, MplusRegionCutoffs>>;
}

export interface MplusAffix {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  /** A game icon name, e.g. `ability_toughness` */
  icon: string | null;
}

export interface MplusSeasonsResponse {
  /** Newest expansion first, then the latest to open within it */
  seasons: MplusSeason[];
  /** Every affix seen, by id; not linked to seasons */
  affixes: MplusAffix[];
}

export const raidsQuery = () =>
  queryOptions({
    queryKey: ['pve', 'raids'],
    queryFn: ({ signal }) => api.get<RaidsResponse>('/pve/raids', undefined, signal),
    // Soulseeker is up to a day behind Rankwarden, and raids change a few times an expansion
    staleTime: 6 * 60 * 60_000,
    gcTime: 24 * 60 * 60_000,
  });

export const mplusSeasonsQuery = () =>
  queryOptions({
    queryKey: ['pve', 'mplus-seasons'],
    queryFn: ({ signal }) => api.get<MplusSeasonsResponse>('/pve/mplus-seasons', undefined, signal),
    // Soulseeker keeps it an hour: a live season's cutoffs move every M+ pass
    staleTime: 30 * 60_000,
    gcTime: 24 * 60 * 60_000,
  });

/**
 * Fetches the PvE catalogue while the visitor is on the PvE side, and keeps it cached when
 * they switch to PvP. Mounted once, in the root layout; anything that needs the data reads
 * the same queries (they are shared, not fetched twice).
 */
export function usePveCatalogue(enabled: boolean) {
  const raids = useQuery({ ...raidsQuery(), enabled });
  const mplusSeasons = useQuery({ ...mplusSeasonsQuery(), enabled });
  return { raids, mplusSeasons };
}

/**
 * Whether a raid or season is running in a region at `now`: it has opened there and has no
 * end yet.
 */
export function isRunningIn(
  entry: { starts: Starts; ends: Ends },
  region: PveRegion,
  now: Date = new Date(),
): boolean {
  const starts = entry.starts[region];
  return starts !== undefined && Date.parse(starts) <= now.getTime() && !entry.ends[region];
}
