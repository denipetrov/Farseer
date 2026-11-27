/**
 * Soulseeker's tier lists (`src/pvp/tier-list/`, `src/pve/tier-list/`): every spec of the
 * current season scored from 0 to 100 and cut into tiers S to D. PvP and PvE share the spec
 * shape (`TierListSpec`), so one widget draws both.
 *
 * Scoring (Soulseeker's SKILLS.md, "PvP tier list"): top-tier density 45 points (the top
 * 250 / 500 / 1,000 / 2,500 / 5,000 rows, weighted 30/25/20/15/10 %, each band against
 * the spec that leads it), representation 35 and average rating 20 (rows at or above the
 * floor, ranked by order; the average taken with 50 more players at the floor). Tier lines
 * at 10 / 35 / 65 / 90 % of the list, each moved up to 2 specs to the widest score gap.
 */
import { queryOptions } from '@tanstack/react-query';
import type { PvpBoard, PvpBracket } from '@/lib/pvpBoards';
import { api } from '.';
import type { PveBoard } from './pve';

/** The Mythic+ list's regions: Raider.io's, China included */
export const PVE_TIER_REGIONS: readonly PveBoard[] = ['world', 'us', 'eu', 'kr', 'tw', 'cn'];

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D';
export const TIERS: readonly Tier[] = ['S', 'A', 'B', 'C', 'D'];

/** One spec's place on a tier list, with what each factor gave it */
export interface TierListSpec {
  /** Slugs, as on the ladders: `warrior`, `arms` */
  class: string;
  classId: number | null;
  spec: string;
  specId: number | null;
  tier: Tier;
  /** 0–100; the list is ordered by it */
  score: number;
  /** The spec's rows in the top 250 … 5,000; `score` out of 45 */
  topDensity: {
    top250: number;
    top500: number;
    top1000: number;
    top2500: number;
    top5000: number;
    score: number;
  };
  /** Rows at or above the floor; `score` out of 35 */
  representation: { count: number; share: number; score: number };
  /** Their mean, and the mean with 50 more at the floor (what ranks it); `score` out of 20 */
  averageRating: { value: number | null; adjusted: number | null; score: number };
}

/** What both lists share */
export interface TierList {
  region: string;
  seasonName: string | null;
  /** Reused for an hour */
  computedAt: string;
  /** Rows the density read (the top 5,000), and how many have a known spec */
  topRows: number;
  topClassified: number;
  /** Rows at or above the floor with a known spec */
  classified: number;
  /** Best first */
  specs: TierListSpec[];
}

export interface PvpTierList extends TierList {
  bracket: string;
  seasonId: number;
  /** The floor: 1500 */
  minRating: number;
}

export interface PveTierList extends TierList {
  season: string;
  /** The floor: 2000, Keystone Master, over fully covered characters */
  minScore: number;
}

export const pvpTierListQuery = (region: PvpBoard, bracket: PvpBracket) =>
  queryOptions({
    queryKey: ['pvp', 'tier-list', region, bracket],
    queryFn: ({ signal }) => api.get<PvpTierList>('/pvp/tier-list', { region, bracket }, signal),
    // Soulseeker recomputes it hourly
    staleTime: 30 * 60_000,
  });

export const pveTierListQuery = (region: PveBoard) =>
  queryOptions({
    queryKey: ['pve', 'tier-list', region],
    queryFn: ({ signal }) => api.get<PveTierList>('/pve/tier-list', { region }, signal),
    staleTime: 30 * 60_000,
  });
