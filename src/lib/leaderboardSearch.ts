import { PVP_BOARDS, type PvpBoard } from '@/api/pvp';

/**
 * URL search params of a ladder page: its filters. All optional, so links stay clean; read
 * them with their defaults (region `world`, page 1). Invalid values are dropped, not rejected.
 */
export interface LeaderboardSearch {
  region?: PvpBoard;
  page?: number;
}

export const validateLeaderboardSearch = (search: Record<string, unknown>): LeaderboardSearch => ({
  region: PVP_BOARDS.includes(search.region as PvpBoard) ? (search.region as PvpBoard) : undefined,
  page: Number(search.page) > 1 ? Math.floor(Number(search.page)) : undefined,
});
