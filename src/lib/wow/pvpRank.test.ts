import { describe, expect, it } from 'vitest';
import { iconNames } from '@/lib/assets';
import {
  PVP_RANKS,
  bestRankInSeason,
  pvpRankIconUrl,
  rankForRating,
  rankOfHistoryEntry,
  type PvpHistoryInput,
} from './pvpRank';

const SEASON = 42;
const entry = (tier: string, seasonId = SEASON, earnedByThisCharacter = true): PvpHistoryInput => ({
  tier,
  seasonId,
  earnedByThisCharacter,
});

describe('rankForRating: bands', () => {
  it.each([
    [null, 'unranked'],
    [0, 'unranked'],
    [999, 'unranked'],
    [1000, 'combatant'],
    [1399, 'combatant'],
    [1400, 'challenger'],
    [1799, 'challenger'],
    [1800, 'rival'],
    [2099, 'rival'],
    [2100, 'duelist'],
    [2299, 'duelist'],
    [2300, 'elite'],
    [3100, 'elite'],
  ])('rating %s → %s', (rating, id) => {
    expect(rankForRating({ rating }).id).toBe(id);
  });
});

describe('rankForRating: above 2300', () => {
  it("is Gladiator with this season's Gladiator-type title", () => {
    for (const tier of ['gladiator', 'legend', 'strategist', 'battle-mender']) {
      expect(rankForRating({ rating: 2400, seasonId: SEASON, history: [entry(tier)] }).id).toBe(
        'gladiator',
      );
    }
  });

  it("stays Elite with only an older season's title, a lower title, or another character's", () => {
    const rating = 2400;
    expect(rankForRating({ rating, seasonId: SEASON, history: [entry('gladiator', 41)] }).id).toBe(
      'elite',
    );
    expect(rankForRating({ rating, seasonId: SEASON, history: [entry('duelist')] }).id).toBe(
      'elite',
    );
    expect(
      rankForRating({ rating, seasonId: SEASON, history: [entry('gladiator', SEASON, false)] }).id,
    ).toBe('elite');
    expect(rankForRating({ rating, history: [entry('gladiator')] }).id).toBe('elite'); // no season
  });

  it('is Rank 1 at or above the Rank 1 cutoff, with or without the title', () => {
    expect(rankForRating({ rating: 2982, rankOneCutoff: 2982 }).id).toBe('rank-one');
    expect(rankForRating({ rating: 2981, rankOneCutoff: 2982 }).id).toBe('elite');
    expect(
      rankForRating({
        rating: 3000,
        rankOneCutoff: 2982,
        seasonId: SEASON,
        history: [entry('gladiator')],
      }).id,
    ).toBe('rank-one');
  });

  it('never gives Rank 1 or Gladiator below 2300', () => {
    expect(rankForRating({ rating: 2250, rankOneCutoff: 2200 }).id).toBe('duelist');
    expect(
      rankForRating({ rating: 2250, seasonId: SEASON, history: [entry('gladiator')] }).id,
    ).toBe('duelist');
  });
});

describe('pvpHistory', () => {
  it.each([
    ['combatant', 2],
    ['challenger', 3],
    ['rival', 4],
    ['duelist', 5],
    ['elite', 6],
    ['gladiator', 7],
    ['legend', 7],
    ['strategist', 7],
    ['battle-mender', 7],
    ['rank-one', 8],
  ])('tier %s → rankedpvp_0%i', (tier, icon) => {
    expect(rankOfHistoryEntry({ tier })?.icon).toBe(icon);
  });

  it('returns null for an unknown tier', () => {
    expect(rankOfHistoryEntry({ tier: 'hero' })).toBeNull();
  });

  it("picks a season's best entry", () => {
    const history = [entry('duelist'), entry('rank-one', 41), entry('elite'), entry('rival')];
    expect(bestRankInSeason(history, SEASON)?.id).toBe('elite');
    expect(bestRankInSeason(history, 41)?.id).toBe('rank-one');
    expect(bestRankInSeason(history, 40)).toBeNull();
    expect(bestRankInSeason(null, SEASON)).toBeNull();
  });

  it('can include titles another character of the account earned', () => {
    const history = [entry('gladiator', SEASON, false)];
    expect(bestRankInSeason(history, SEASON)).toBeNull();
    expect(bestRankInSeason(history, SEASON, { ownOnly: false })?.id).toBe('gladiator');
  });
});

describe('rank icons', () => {
  it('every rank has its icon, and every file is used', () => {
    for (const r of PVP_RANKS) {
      expect(pvpRankIconUrl(r)).toMatch(new RegExp(`rankedpvp_0${r.icon}\\.png`));
    }
    const used = new Set(PVP_RANKS.map((r) => `rankedpvp_0${r.icon}`));
    expect(iconNames('pvp/ranked').filter((n) => !used.has(n))).toEqual([]);
  });
});
