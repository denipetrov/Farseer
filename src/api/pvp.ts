/**
 * Soulseeker's PvP boards. Only what the site uses so far; extend the types as pages read
 * more of each answer (Soulseeker's `src/pvp/**\/*.types.ts` are the source).
 */
import { queryOptions, useQuery } from '@tanstack/react-query';
import type { PvpBoard, PvpBracket } from '@/lib/pvpBoards';
import { api } from '.';

export {
  PVP_BOARDS,
  PVP_BRACKETS,
  isPvpBoard,
  isPvpBracket,
  type PvpBoard,
  type PvpBracket,
} from '@/lib/pvpBoards';

/** `GET /pvp/cutoffs`: here only the season it describes (the current one). */
export interface CutoffsSeason {
  seasonId: number;
  /** As Blizzard names it: `Player vs. Player (Midnight Season 2)` */
  seasonName: string | null;
}

export const currentSeasonQuery = (region: PvpBoard = 'world', bracket: PvpBracket = 'shuffle') =>
  queryOptions({
    queryKey: ['pvp', 'cutoffs', region, bracket, 'season'],
    queryFn: ({ signal }) => api.get<CutoffsSeason>('/pvp/cutoffs', { region, bracket }, signal),
    staleTime: 10 * 60_000,
  });

/** A title cutoff (Soulseeker's `Cutoff`): one for everyone, or per faction (RBG's Hero) */
export interface PvpCutoff {
  rating: number | null;
  /** `Gladiator: Midnight Season 2`; null when the title is per faction */
  title: string | null;
  achievementId: number | null;
  /** Per faction when the factions' titles differ (RBG's Hero of the Alliance / Horde) */
  factions: Partial<
    Record<'alliance' | 'horde', { rating: number; title: string; achievementId: number }>
  > | null;
}

/** The ladders that award a title, the ones `GET /pvp/cutoffs` takes (2v2 has none) */
export const TITLE_BRACKETS = ['3v3', 'rbg', 'shuffle', 'blitz'] as const;
export type TitleBracket = (typeof TITLE_BRACKETS)[number];
export const isTitleBracket = (v: string): v is TitleBracket =>
  (TITLE_BRACKETS as readonly string[]).includes(v);

/** A spec in `GET /pvp/cutoffs`, in one region: how many of it reach the title */
export interface PvpSpecCutoff {
  /** Null (with `spec`) on 3v3 and RBG for the characters Rankwarden has not identified yet */
  class: string | null;
  spec: string | null;
  classId: number | null;
  specId: number | null;
  /** Characters at or above the cutoff */
  count: number;
  /** Shuffle and Blitz: the spec ladder's own cutoff (3v3 and RBG have one for all) */
  cutoff?: PvpCutoff | null;
}

/** `GET /pvp/cutoffs?region=&bracket=`: the title cutoffs and who reaches them */
export interface PvpCutoffs {
  seasonName: string | null;
  /** The season is over: the cutoffs no longer move */
  final: boolean;
  /** When Rankwarden last read the cutoffs from Blizzard */
  rewardsFetchedAt: string | null;
  /** 3v3 and RBG: the ladder's one cutoff; null on Shuffle and Blitz (per spec) */
  cutoff: PvpCutoff | null;
  /** Characters at or above the cutoff, every spec together */
  total: number;
  specs: PvpSpecCutoff[];
}

/** The regions cutoffs exist for: Blizzard sets them per region, so not World */
export type CutoffRegion = Exclude<PvpBoard, 'world'>;
export const CUTOFF_REGIONS: readonly CutoffRegion[] = ['us', 'eu', 'kr', 'tw'];
export const isCutoffRegion = (v: unknown): v is CutoffRegion =>
  (CUTOFF_REGIONS as readonly unknown[]).includes(v);

/**
 * A title ladder's cutoffs in one region (not World: Blizzard sets cutoffs per region), with
 * every spec. One request; a page's class or role filter is applied to it, so changing the
 * filter costs nothing.
 */
export const pvpCutoffsQuery = (region: Exclude<PvpBoard, 'world'>, bracket: TitleBracket) =>
  queryOptions({
    queryKey: ['pvp', 'cutoffs', region, bracket, 'specs'],
    queryFn: ({ signal }) => api.get<PvpCutoffs>('/pvp/cutoffs', { region, bracket }, signal),
    // Rankwarden reads the cutoffs a few times a day
    staleTime: 10 * 60_000,
  });

/**
 * The ratings Rankwarden writes spec representation snapshots at
 * (`REPRESENTATION_MIN_RATINGS` in spirit-link): the only ones the endpoint takes.
 */
export const REPRESENTATION_RATINGS = [1500, 1800, 2100, 2300, 2700] as const;
export type RepresentationRating = (typeof REPRESENTATION_RATINGS)[number];
export const isRepresentationRating = (v: unknown): v is RepresentationRating =>
  (REPRESENTATION_RATINGS as readonly unknown[]).includes(v);

/** A spec in a representation snapshot */
export interface RepresentedSpec {
  class: string;
  spec: string;
  classId: number | null;
  specId: number | null;
  /** Players of the spec at or above the rating */
  count: number;
  /** Of the snapshot's `classified` (0–1) */
  share: number;
  heroTalentsClassified: number;
  heroTalents: { id: number; name: string; count: number; share: number }[];
}

/** `GET /pvp/spec-representation`: one day's spec shares at a rating */
export interface SpecRepresentation {
  /** The UTC day answered (`YYYY-MM-DD`): with `date=latest`, the newest stored */
  date: string;
  computedAt: string;
  /** Players at or above the rating */
  total: number;
  /** Of them, those whose spec is known */
  classified: number;
  /** Most played first */
  specs: RepresentedSpec[];
  /** With `getEarliestDate`: the first day with specs named; null when none */
  earliestDate?: string | null;
}

/**
 * A spec representation snapshot (`GET /pvp/spec-representation`): `latest` (with the
 * first day there is data for) or a UTC day. A day without a snapshot is a 404.
 * (The 31-day `/history` endpoint is the FOTM page's: the user, 2026-11-27.)
 */
export const specRepresentationQuery = (
  region: PvpBoard,
  bracket: PvpBracket,
  rating: RepresentationRating,
  date: string,
) =>
  queryOptions({
    queryKey: ['pvp', 'spec-representation', region, bracket, rating, date],
    queryFn: ({ signal }) =>
      api.get<SpecRepresentation>(
        '/pvp/spec-representation',
        date === 'latest'
          ? { region, bracket, rating, date, getEarliestDate: true }
          : { region, bracket, rating, date },
        signal,
      ),
    // Rankwarden writes a day once; the latest moves at most daily
    staleTime: date === 'latest' ? 10 * 60_000 : Infinity,
  });

/** `GET /pvp/spec-representation/history`: the last 31 UTC days, today included */
export interface SpecRepresentationHistory {
  /** The window, for the axis (`YYYY-MM-DD`) */
  from: string;
  to: string;
  /**
   * Only days with a snapshot, oldest first (Rankwarden may miss a day, and deletes those
   * before the season). A spec nobody played that day is absent from its `specs`.
   */
  days: (Omit<SpecRepresentation, 'earliestDate'> & { date: string })[];
}

/** A month of spec shares at a rating: the FOTM page's (the user, 2026-11-27) */
export const specRepresentationHistoryQuery = (
  region: PvpBoard,
  bracket: PvpBracket,
  rating: RepresentationRating,
  /** Localhost only: a mocked full month (`lib/devMocks.ts`); its own cache entry */
  mock = false,
) =>
  queryOptions({
    queryKey: ['pvp', 'spec-representation', 'history', region, bracket, rating, mock],
    queryFn: async ({ signal }) => {
      const real = await api.get<SpecRepresentationHistory>(
        '/pvp/spec-representation/history',
        { region, bracket, rating },
        signal,
      );
      // The localhost toggle's mocked month (api/mocks/fotmHistory.ts); dev builds only
      if (import.meta.env.DEV && mock) {
        const { mockFotmHistory } = await import('./mocks/fotmHistory');
        return mockFotmHistory(real, `${region}-${bracket}-${rating}`);
      }
      return real;
    },
    // Rankwarden writes a day once a day
    staleTime: 10 * 60_000,
  });

/** A spec in `GET /pvp/hero-talents`: the trees its top players take */
export interface HeroTalentsSpec {
  spec: string;
  specId: number | null;
  /** Its top players read (at most `top`: fewer when the ladder is smaller) */
  characters: number;
  /** Of them, those whose tree is known (the rest are not enriched yet) */
  covered: number;
  minRating: number | null;
  maxRating: number | null;
  /** Most played first; `share` of `covered`. Trees nobody took are absent. */
  heroTalents: { id: number; name: string; count: number; share: number }[];
}

/** `GET /pvp/hero-talents?region&bracket&top`: every class, every spec, the current season */
export interface PvpHeroTalents {
  seasonName: string | null;
  top: number;
  computedAt: string;
  classes: { class: string; classId: number | null; specs: HeroTalentsSpec[] }[];
}

/** The "Top N per spec" choices (Soulseeker takes 1–500) */
export const HERO_TALENT_TOPS = [10, 25, 50, 100, 250, 500] as const;
export type HeroTalentTop = (typeof HERO_TALENT_TOPS)[number];

/** Which hero talent trees each spec's top `top` players take (the hero talents page) */
export const pvpHeroTalentsQuery = (region: PvpBoard, bracket: PvpBracket, top: HeroTalentTop) =>
  queryOptions({
    queryKey: ['pvp', 'hero-talents', region, bracket, top],
    queryFn: ({ signal }) =>
      api.get<PvpHeroTalents>('/pvp/hero-talents', { region, bracket, top }, signal),
    // Soulseeker keeps it 15 minutes
    staleTime: 15 * 60_000,
  });

/** A Blizzard region's run of a season, in `GET /pvp/seasons` */
export interface PvpSeasonRegion {
  startsAt: string | null;
  /** Null while it runs, and for the oldest seasons Blizzard has no dates for */
  endsAt: string | null;
  current: boolean;
  /** The cutoffs are final: the season is archived there */
  final: boolean;
  rewardsFetchedAt: string | null;
  /** The ladders with one cutoff for everyone; 2v2 has no title, Shuffle and Blitz are per spec */
  cutoffs: { '3v3': PvpCutoff | null; rbg: PvpCutoff | null };
}

/** A season in `GET /pvp/seasons` (Soulseeker dc443c8): one id, shared by every region */
export interface PvpSeason {
  /** Blizzard's id: 42 is Midnight Season 2 */
  seasonId: number;
  /** `Player vs. Player (Midnight Season 2)`; null for seasons Blizzard left unnamed (40, 37, 33…) */
  name: string | null;
  /** Live in at least one region */
  current: boolean;
  regions: Partial<Record<'us' | 'eu' | 'kr' | 'tw', PvpSeasonRegion>>;
}

export const pvpSeasonsQuery = () =>
  queryOptions({
    queryKey: ['pvp', 'seasons'],
    queryFn: ({ signal }) => api.get<{ seasons: PvpSeason[] }>('/pvp/seasons', undefined, signal),
    // Soulseeker keeps it an hour; the live season's cutoffs move through the day
    staleTime: 30 * 60_000,
    gcTime: 24 * 60 * 60_000,
  });

/**
 * Fetches the PvP seasons while the visitor is on the PvP side (the user's request,
 * 2026-11-27), and keeps them cached when they switch to PvE. Mounted once, in the root
 * layout, as the PvE catalogue is; pages read the same query.
 */
export function usePvpSeasons(enabled: boolean) {
  return useQuery({ ...pvpSeasonsQuery(), enabled });
}

/** One row of a ladder (Soulseeker's `src/pvp/leaderboard/leaderboard.types.ts`). */
export interface LeaderboardEntry {
  region: string;
  characterId: number;
  /** Null when Blizzard gives no name: show "Unknown player", with no link */
  characterName: string | null;
  realmSlug: string | null;
  /** The spec ladder on Shuffle and Blitz (`shuffle-monk-mistweaver`), else the family */
  bracket: string;
  rating: number;
  /**
   * Blizzard's rank on the row's own ladder. On an all-specs Shuffle or Blitz board that is
   * the rank within the spec, not the place on this board: number such boards by position.
   */
  rank: number | null;
  /** Games (rounds, on Shuffle) this season */
  played: number | null;
  won: number | null;
  lost: number | null;
  /** At or above the title cutoff of its own ladder and region */
  inTitleRange: boolean;
  /** The rating before Rankwarden's latest write; null on a first appearance (current season only) */
  previousRating?: number | null;
  faction: string | null;
  class?: string | null;
  classId?: number | null;
  spec?: string | null;
  specId?: number | null;
  heroTalents?: string | null;
  heroTalentId?: number | null;
  race?: string | null;
  raceId?: number | null;
  gender?: string | null;
  /** The realm's display name (`Tarren Mill`); `realmSlug` is the slug */
  realmName?: string | null;
  /** The active loadout of each spec the character has one for; empty before enrichment */
  talentLoadouts?: LeaderboardTalentLoadout[];
}

/** One spec's active talent loadout */
export interface LeaderboardTalentLoadout {
  /** Soulseeker's spec slug (`mistweaver`) */
  spec: string | null;
  specId: number | null;
  heroTalents: string | null;
  heroTalentId: number | null;
  /** The in-game export string, as Wowhead's talent calculator reads it */
  talentLoadoutCode: string | null;
  /**
   * The spec's chosen PvP talents in slot order, empty slots left out (Soulseeker 671cb4b,
   * 2026-11-27); `[]` until Rankwarden refetches the character. `id` differs by spec for one
   * talent, `spellId` does not.
   */
  pvpTalents?: LeaderboardPvpTalent[];
}

/** One chosen PvP talent */
export interface LeaderboardPvpTalent {
  slot: number;
  id: number;
  name: string;
  spellId: number | null;
}

export interface LeaderboardResponse {
  region: PvpBoard;
  seasonId: number;
  bracket: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  /**
   * The board's title cutoff: set on 3v3, RBG and one spec's Shuffle or Blitz ladder in a
   * region; null on 2v2, on a Shuffle or Blitz board of several specs, and on World.
   */
  cutoff: PvpCutoff | null;
  /** World only: each region's cutoff for the board */
  regionCutoffs?: Partial<Record<'us' | 'eu' | 'kr' | 'tw', PvpCutoff | null>>;
  entries: LeaderboardEntry[];
}

/**
 * A ladder's role filter, A–Z by English name: DPS (every damage dealer), Healer, Melee DPS,
 * Ranged DPS, Tank (DPS added by the user, 2026-11-27)
 */
export const LADDER_ROLES = ['dps', 'healer', 'melee', 'ranged', 'tank'] as const;
export type LadderRole = (typeof LADDER_ROLES)[number];
export const isLadderRole = (v: unknown): v is LadderRole =>
  typeof v === 'string' && (LADDER_ROLES as readonly string[]).includes(v);

export interface LeaderboardParams {
  region: PvpBoard;
  seasonId: number;
  bracket: PvpBracket;
  /** One class's rows only (Soulseeker's slug, `mage`) */
  class?: string;
  /** One spec's rows only (`fire`); needs `class` */
  spec?: string;
  /**
   * One role's rows only: `tank`, `healer`, `dps` (Soulseeker's `role`) or `melee`, `ranged` (its
   * `subRole`, damage dealers of that reach). Never with `spec`.
   */
  role?: LadderRole;
  page?: number;
  pageSize?: number;
}

export const leaderboardQuery = ({
  region,
  seasonId,
  bracket,
  class: cls,
  spec,
  role,
  page = 1,
  pageSize = 50,
}: LeaderboardParams) =>
  queryOptions({
    queryKey: ['pvp', 'leaderboard', region, seasonId, bracket, cls, spec, role, page, pageSize],
    queryFn: ({ signal }) =>
      api.get<LeaderboardResponse>(
        '/pvp/leaderboard',
        {
          region,
          seasonId,
          bracket,
          class: cls,
          spec,
          // Tank, healer and dps are roles; melee and ranged are damage dealers' sub-roles
          role: role === 'tank' || role === 'healer' || role === 'dps' ? role : undefined,
          subRole: role === 'melee' || role === 'ranged' ? role : undefined,
          page,
          pageSize,
        },
        signal,
      ),
    staleTime: 60_000,
  });
