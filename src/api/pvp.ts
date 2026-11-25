/**
 * Soulseeker's PvP boards. Only what the site uses so far; extend the types as pages read
 * more of each answer (Soulseeker's `src/pvp/**\/*.types.ts` are the source).
 */
import { queryOptions } from '@tanstack/react-query';
import { api } from '.';

/** Ladder families, in the game's order. Each has its own leaderboard page. */
export const PVP_BRACKETS = ['2v2', '3v3', 'shuffle', 'blitz', 'rbg'] as const;
export type PvpBracket = (typeof PVP_BRACKETS)[number];
export const isPvpBracket = (v: unknown): v is PvpBracket =>
  typeof v === 'string' && (PVP_BRACKETS as readonly string[]).includes(v);

/** A PvP board's region: one of Blizzard's, or `world` for all of them together. */
export type PvpBoard = 'us' | 'eu' | 'kr' | 'tw' | 'world';

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

/** One row of a ladder. */
export interface LeaderboardEntry {
  region: string;
  characterName: string;
  realmSlug: string;
  /** The spec ladder on Shuffle and Blitz (`shuffle-monk-mistweaver`), else the family */
  bracket: string;
  rating: number;
  rank: number;
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
