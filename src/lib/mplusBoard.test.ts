import { describe, expect, it } from 'vitest';
import type { MplusDungeon, MplusDungeonRun } from '@/api/pve';
import {
  clock,
  mplusSeasonName,
  runState,
  runsBySeasonDungeon,
  scoreTier,
  tierCutoffs,
  validateMplusBoardSearch,
} from './mplusBoard';

const dungeon = (id: number, slug: string): MplusDungeon => ({
  id,
  slug,
  name: slug,
  shortName: null,
  challengeModeId: null,
  keystoneTimerSeconds: null,
  iconUrl: null,
  backgroundImageUrl: null,
  expansionIds: [],
});
const run = (id: number, slug: string, level: number, chests = 1): MplusDungeonRun => ({
  dungeon: { id, slug, name: slug, shortName: null },
  keystoneRunId: id * 10,
  mythicLevel: level,
  score: 500,
  clearTimeMs: 1_700_000,
  timeRemainingMs: chests ? 100_000 : -30_000,
  numChests: chests,
  completedAt: '2026-11-22T17:26:35.000Z',
  specId: null,
  role: null,
});

describe('runsBySeasonDungeon', () => {
  it("lines runs up with the season's dungeons, null where there is none", () => {
    const season = [dungeon(1, 'a'), dungeon(2, 'b'), dungeon(3, 'c')];
    const rows = runsBySeasonDungeon(season, [run(3, 'c', 20), run(99, 'a', 24)]);
    // 'a' matches by slug (other id), 'b' has no run, 'c' by id
    expect(rows.map((r) => r?.mythicLevel ?? null)).toEqual([24, null, 20]);
    expect(runsBySeasonDungeon(season, undefined)).toEqual([null, null, null]);
  });
});

describe('clock and runState', () => {
  it('writes a time as the game does', () => {
    expect(clock(1_707_932)).toBe('28:28');
    expect(clock(-30_000)).toBe('0:30');
    expect(clock(3_734_000)).toBe('1:02:14');
  });

  it('tells timed from depleted', () => {
    expect(runState(run(1, 'a', 20, 2))).toBe('timed');
    expect(runState(run(1, 'a', 20, 0))).toBe('depleted');
  });
});

describe('validateMplusBoardSearch', () => {
  it('keeps valid values, a spec only with its class, a role only without one', () => {
    expect(
      validateMplusBoardSearch({
        region: 'cn',
        page: '3',
        class: 'mage',
        spec: 'fire',
        role: 'tank',
      }),
    ).toEqual({ region: 'cn', page: 3, class: 'mage', spec: 'fire', role: undefined });
    expect(
      validateMplusBoardSearch({ region: 'mars', page: '1', spec: 'fire', role: 'healer' }),
    ).toEqual({
      region: undefined,
      page: undefined,
      class: undefined,
      spec: undefined,
      role: 'healer',
    });
  });
});

describe('tierCutoffs and scoreTier', () => {
  const band = (minScore: number) => ({
    quantile: null,
    minScore,
    populationCount: null,
    populationFraction: null,
    totalPopulation: null,
  });
  const season = {
    cutoffs: {
      us: {
        status: 'ok' as const,
        updatedAt: null,
        keystones: {},
        quantiles: {
          p999: { score: null, alliance: null, horde: null, all: band(4092.77) },
          p990: { score: null, alliance: null, horde: null, all: band(3806.18) },
        },
      },
    },
  };

  it("reads a region's top 0.1% and top 1% cutoffs, both factions together", () => {
    expect(tierCutoffs(season, 'us')).toEqual({ p999: 4092.77, p990: 3806.18 });
    expect(tierCutoffs(season, 'eu')).toBeNull();
    expect(tierCutoffs(undefined, 'us')).toBeNull();
  });

  it('gives the best tier a score reaches', () => {
    const cutoffs = tierCutoffs(season, 'us');
    expect(scoreTier(4100, cutoffs)).toBe('p999');
    expect(scoreTier(4092.77, cutoffs)).toBe('p999');
    expect(scoreTier(3900, cutoffs)).toBe('p990');
    expect(scoreTier(3806, cutoffs)).toBeNull();
    expect(scoreTier(4500, null)).toBeNull();
  });
});

describe('mplusSeasonName', () => {
  it("writes the expansion's name in full", () => {
    expect(mplusSeasonName({ name: 'MN Season 2', expansionId: 11 })).toBe('Midnight Season 2');
    expect(mplusSeasonName({ name: 'TWW Season 3 • With Pre Patch', expansionId: 10 })).toBe(
      'The War Within Season 3 • With Pre Patch',
    );
    expect(mplusSeasonName({ name: 'BFA Season 1', expansionId: 7 })).toBe(
      'Battle for Azeroth Season 1',
    );
    expect(mplusSeasonName({ name: 'Season 7.3', expansionId: 6 })).toBe('Legion Season 7.3');
  });

  it('keeps the name as sent for an expansion it does not know', () => {
    expect(mplusSeasonName({ name: 'XX Season 1', expansionId: 12 })).toBe('XX Season 1');
  });
});
