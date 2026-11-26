/**
 * Soulseeker's PvP boards. Only what the site uses so far; extend the types as pages read
 * more of each answer (Soulseeker's `src/pvp/**\/*.types.ts` are the source).
 */
import { queryOptions } from '@tanstack/react-query';
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
}

export interface LeaderboardResponse {
  region: PvpBoard;
  seasonId: number;
  bracket: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  entries: LeaderboardEntry[];
}

export interface LeaderboardParams {
  region: PvpBoard;
  seasonId: number;
  bracket: PvpBracket;
  page?: number;
  pageSize?: number;
}

export const leaderboardQuery = ({
  region,
  seasonId,
  bracket,
  page = 1,
  pageSize = 50,
}: LeaderboardParams) =>
  queryOptions({
    queryKey: ['pvp', 'leaderboard', region, seasonId, bracket, page, pageSize],
    queryFn: ({ signal }) =>
      api.get<LeaderboardResponse>(
        '/pvp/leaderboard',
        { region, seasonId, bracket, page, pageSize },
        signal,
      ),
    staleTime: 60_000,
  });
