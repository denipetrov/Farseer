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
