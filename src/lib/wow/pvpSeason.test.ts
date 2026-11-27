import { describe, expect, it } from 'vitest';
import type { PvpSeason } from '@/api/pvp';
import { ladderReward, seasonDates, seasonLabel, seasonReward, seasonShortName } from './pvpSeason';

const glad = (rating: number) => ({
  rating,
  title: 'Gladiator: Midnight Season 2',
  achievementId: 1,
  factions: null,
});
const hero = (rating: number) => ({
  rating,
  title: null,
  achievementId: null,
  factions: {
    alliance: { rating, title: 'Hero of the Alliance: Midnight Season 2', achievementId: 2 },
    horde: { rating, title: 'Hero of the Horde: Midnight Season 2', achievementId: 3 },
  },
});
const run = (startsAt: string | null, endsAt: string | null, g: number) => ({
  startsAt,
  endsAt,
  current: !endsAt,
  final: !!endsAt,
  rewardsFetchedAt: null,
  cutoffs: { '3v3': glad(g), rbg: hero(g - 400) },
});

const live: PvpSeason = {
  seasonId: 42,
  name: 'Player vs. Player (Midnight Season 2)',
  current: true,
  regions: {
    us: run('2026-08-18T15:00:00.000Z', null, 2858),
    eu: run('2026-08-19T04:00:00.000Z', null, 2900),
  },
};
const past: PvpSeason = {
  seasonId: 41,
  name: null,
  current: false,
  regions: {
    us: run('2026-03-17T15:00:00.000Z', '2026-08-11T05:00:00.000Z', 3154),
    eu: run('2026-03-18T04:00:00.000Z', '2026-08-11T20:00:00.000Z', 3100),
  },
};

describe('PvP season details', () => {
  it("shortens Blizzard's name, and has none for unnamed seasons", () => {
    expect(seasonShortName('Player vs. Player (Midnight Season 2)')).toBe('Midnight Season 2');
    expect(seasonShortName('Season 9')).toBe('Season 9');
    expect(seasonShortName(null)).toBeNull();
  });

  it('names an unnamed season after its Gladiator title', () => {
    const unnamed = {
      ...live,
      name: null,
      regions: {
        us: {
          ...live.regions.us!,
          cutoffs: {
            '3v3': { ...glad(2400), title: 'Sinful Gladiator: Shadowlands Season 1' },
            rbg: null,
          },
        },
      },
    };
    expect(seasonLabel(unnamed)).toBe('Shadowlands Season 1');
    expect(seasonLabel({ ...unnamed, regions: {} })).toBeNull();
    expect(seasonLabel(live)).toBe('Midnight Season 2');
  });

  it("gives a region's dates, and World's first start and last end", () => {
    expect(seasonDates(live, 'eu')).toEqual({ startsAt: '2026-08-19T04:00:00.000Z', endsAt: null });
    expect(seasonDates(live, 'world')).toEqual({
      startsAt: '2026-08-18T15:00:00.000Z',
      endsAt: null,
    });
    expect(seasonDates(past, 'world')).toEqual({
      startsAt: '2026-03-17T15:00:00.000Z',
      endsAt: '2026-08-11T20:00:00.000Z',
    });
    expect(seasonDates(live, 'kr')).toBeNull();
  });

  it('names the 3v3 and RBG titles, with the rating in a region only', () => {
    expect(seasonReward(live, '3v3', 'eu', 'horde')).toEqual({
      title: 'Gladiator: Midnight Season 2',
      rating: 2900,
    });
    expect(seasonReward(live, '3v3', 'world', 'horde')?.rating).toBeNull();
    expect(seasonReward(live, 'rbg', 'us', 'alliance')).toEqual({
      title: 'Hero of the Alliance: Midnight Season 2',
      rating: 2458,
    });
  });

  it('has no title for 2v2, Shuffle or Blitz', () => {
    for (const b of ['2v2', 'shuffle', 'blitz'] as const) {
      expect(seasonReward(live, b, 'eu', 'horde')).toBeNull();
    }
  });

  it("names a spec ladder's title from the board's own cutoff", () => {
    const legend = {
      rating: 2700,
      title: 'Legend: Midnight Season 2',
      achievementId: 9,
      factions: null,
    };
    expect(ladderReward({ cutoff: legend }, 'eu', 'horde')).toEqual({
      title: 'Legend: Midnight Season 2',
      rating: 2700,
    });
    // World: from the regions' cutoffs, with no rating
    expect(
      ladderReward({ cutoff: null, regionCutoffs: { us: null, eu: legend } }, 'world', 'horde'),
    ).toEqual({ title: 'Legend: Midnight Season 2', rating: null });
    // Per faction, and none when the board has no cutoff
    expect(ladderReward({ cutoff: hero(2400) }, 'us', 'horde')?.title).toBe(
      'Hero of the Horde: Midnight Season 2',
    );
    expect(ladderReward({ cutoff: null }, 'eu', 'horde')).toBeNull();
  });
});
