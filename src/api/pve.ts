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
import BOSS_ICONS from '@/data/bossIcons.json';
import type { GameNamesResponse } from './gameNames';
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

/** PvE boards' regions: one of Raider.io's, or `world` for all of them together. */
export type PveBoard = PveRegion | 'world';

/** A character's best run in one dungeon, as stored (`dungeonRuns[]`) */
export interface MplusDungeonRun {
  dungeon: { id: number; name: string; slug: string; shortName: string | null };
  keystoneRunId: number;
  mythicLevel: number;
  score: number;
  clearTimeMs: number;
  /** Negative when over time */
  timeRemainingMs: number;
  /** 0 when depleted (over time); 1–3 when timed */
  numChests: number;
  completedAt: string;
  specId: number | null;
  role: string | null;
}

/** One row of `GET /pve/mplus-leaderboard` */
export interface MplusLeaderboardEntry {
  rank: number;
  characterName: string;
  realmName: string;
  realmSlug: string;
  region: PveRegion;
  faction: string | null;
  mythicScore: number;
  /** Before Rankwarden's latest write; null on a first write and on archived seasons */
  previousMythicScore?: number | null;
  /** False when a dungeon of the season has no run: the score is then a partial sum */
  isFullyCovered?: boolean;
  profile?: {
    classId: number | null;
    className: string | null;
    specId: number | null;
    specName: string | null;
    raceId: number | null;
    raceName: string | null;
    level: number | null;
    role: string | null;
  } | null;
  dungeonRuns?: MplusDungeonRun[];
}

export interface MplusLeaderboardResponse {
  region: PveBoard;
  season: string;
  current: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  entries: MplusLeaderboardEntry[];
}

export interface MplusLeaderboardParams {
  region?: PveBoard;
  /** A season slug, or `current` */
  season?: string;
  /** Soulseeker's class slug; with `spec`, one spec's board */
  class?: string;
  spec?: string;
  /** `dps`, `healer`, `tank`, or `melee` / `ranged` (sent as `subRole`); not with a spec */
  role?: string;
  page?: number;
  pageSize?: number;
}

export const mplusLeaderboardQuery = ({
  region = 'world',
  season = 'current',
  class: cls,
  spec,
  role,
  page = 1,
  pageSize = 50,
}: MplusLeaderboardParams = {}) =>
  queryOptions({
    queryKey: ['pve', 'mplus-leaderboard', region, season, cls, spec, role, page, pageSize],
    queryFn: ({ signal }) =>
      api.get<MplusLeaderboardResponse>(
        '/pve/mplus-leaderboard',
        {
          region,
          season,
          class: cls,
          spec,
          role: role === 'tank' || role === 'healer' || role === 'dps' ? role : undefined,
          subRole: role === 'melee' || role === 'ranged' ? role : undefined,
          page,
          pageSize,
        },
        signal,
      ),
    staleTime: 60_000,
  });

/** A guild as the PvE boards name it. Fields other than `id` are null for a guild not stored. */
export interface PveGuildRef {
  id: number;
  name: string | null;
  faction: string | null;
  logo: string | null;
  realm: string | null;
  realmSlug: string | null;
  region: PveRegion | null;
}

/** `GET /pve/raid`: one raid's top hundred guilds. Only what the site reads so far. */
export interface RaidBoardResponse {
  region: PveBoard;
  difficulty: 'mythic' | 'heroic' | 'normal';
  raid: { slug: string; name: string; icon: string | null; encounters: RaidEncounter[] };
  updatedAt: string | null;
  guilds: { rank: number; regionRank?: number; guild: PveGuildRef }[];
}

export interface RaidBoardParams {
  /** A catalogue raid, or `current` (the tier's main raid) */
  raidSlug: string;
  region?: Exclude<PveBoard, 'cn'>;
  difficulty?: RaidBoardResponse['difficulty'];
}

export const raidBoardQuery = ({
  raidSlug,
  region = 'world',
  difficulty = 'mythic',
}: RaidBoardParams) =>
  queryOptions({
    queryKey: ['pve', 'raid', raidSlug, region, difficulty],
    queryFn: ({ signal }) =>
      api.get<RaidBoardResponse>('/pve/raid', { raidSlug, region, difficulty }, signal),
    staleTime: 5 * 60_000,
  });

/**
 * Icons for raids the catalogue has none for (Raider.io sends null before Battle for
 * Azeroth), by raid slug: the names the user gave (2026-11-25) and their pattern, each
 * checked on Raider.io's image server.
 */
export const RAID_ICON_FALLBACK: Readonly<Record<string, string>> = {
  'the-emerald-nightmare': 'achievement_emeraldnightmare',
  'trial-of-valor': 'achievement_raid_trialofvalor',
  'the-nighthold': 'achievement_thenighthold',
  'tomb-of-sargeras': 'achievement_raid_tombofsargeras',
  'antorus-the-burning-throne': 'achievement_raid_argusraid',
};

/**
 * A raid's icon on Raider.io's image server: the catalogue's `icon` (an icon name or a
 * numeric file id, both served under the same path), else `RAID_ICON_FALLBACK`. Null when
 * neither has one: show the unknown icon.
 */
export function raidIconUrl(raid: Pick<Raid, 'slug' | 'icon'>): string | null {
  return gameIconUrl(raid.icon ?? RAID_ICON_FALLBACK[raid.slug]);
}

/**
 * A boss's icon (its "Mythic: <boss>" achievement's) on Raider.io's image server, from
 * `src/data/bossIcons.json`, which `scripts/boss-icons.mjs` builds (by `<raid>/<boss>` slug).
 * Null for a boss without one (Blackrock Depths, a few others): show the unknown icon.
 */
export function bossIconUrl(raid: Pick<Raid, 'slug'>, boss: Pick<RaidEncounter, 'slug'>) {
  return gameIconUrl((BOSS_ICONS as Record<string, string>)[`${raid.slug}/${boss.slug}`]);
}

/** A game icon by its name (`achievement_zone_azjkahet`) or file id, as Raider.io serves it */
const gameIconUrl = (icon: string | undefined | null): string | null =>
  icon ? `https://cdn.raiderio.net/images/wow/icons/large/${encodeURIComponent(icon)}.jpg` : null;

/** A raid's name in the page's language (`/i18n/names`), else Raider.io's English one. */
export const raidName = (names: GameNamesResponse | undefined, raid: Raid): string =>
  names?.raids[raid.slug]?.name || raid.name;

/** A boss's name in the page's language, else Raider.io's English one. */
export const bossName = (
  names: GameNamesResponse | undefined,
  raid: Raid,
  boss: RaidEncounter,
): string => names?.raids[raid.slug]?.bosses[boss.slug] || boss.name;
