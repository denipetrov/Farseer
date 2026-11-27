import { describe, expect, it } from 'vitest';
import type { PvpSeason } from '@/api/pvp';
import { archiveBrackets, archiveSeasons, resolveArchive, validateArchiveSearch } from './archive';

const season = (seasonId: number, current = false): PvpSeason => ({
  seasonId,
  name: null,
  current,
  regions: {},
});
const SEASONS = [season(42, true), season(41), season(37), season(30), season(26), season(22)];

describe('archiveSeasons', () => {
  it('keeps the finished seasons with ladders, newest first', () => {
    expect(
      archiveSeasons([season(30), season(42, true), season(41), season(26)]).map((s) => s.seasonId),
    ).toEqual([41, 30]);
  });
});

describe('archiveBrackets', () => {
  it('has Shuffle from season 34 and Blitz from 38', () => {
    expect(archiveBrackets(30)).toEqual(['3v3', '2v2', 'rbg']);
    expect(archiveBrackets(37)).toEqual(['shuffle', '3v3', '2v2', 'rbg']);
    expect(archiveBrackets(41)).toEqual(['shuffle', '3v3', '2v2', 'blitz', 'rbg']);
  });
});

describe('validateArchiveSearch', () => {
  it('drops what is not valid', () => {
    expect(
      validateArchiveSearch({
        season: '26',
        bracket: 'arena',
        region: 'cn',
        role: 'support',
        class: 'bard',
        spec: 'fire',
        page: '1',
      }),
    ).toEqual({
      season: undefined,
      bracket: undefined,
      region: undefined,
      class: undefined,
      spec: undefined,
      role: undefined,
      page: undefined,
    });
    expect(
      validateArchiveSearch({
        season: '41',
        bracket: 'blitz',
        region: 'eu',
        role: 'melee',
        class: 'mage',
        spec: 'fire',
        page: '3',
      }),
    ).toEqual({
      season: 41,
      bracket: 'blitz',
      region: 'eu',
      class: 'mage',
      spec: 'fire',
      role: 'melee',
      page: 3,
    });
  });
});

describe('resolveArchive', () => {
  it('opens on the newest finished season and 3v3', () => {
    expect(resolveArchive({}, SEASONS)).toEqual({ seasonId: 41, bracket: '3v3' });
  });

  it('falls back to 3v3 when the season has no such ladder', () => {
    expect(resolveArchive({ season: 30, bracket: 'shuffle', role: 'healer' }, SEASONS)).toEqual({
      seasonId: 30,
      bracket: '3v3',
    });
  });

  it('opens Shuffle and Blitz on DPS, and takes their class, spec or role', () => {
    expect(resolveArchive({ season: 41, bracket: 'blitz' }, SEASONS)?.role).toBe('dps');
    expect(resolveArchive({ season: 41, bracket: 'shuffle', role: 'melee' }, SEASONS)?.role).toBe(
      'melee',
    );
    expect(
      resolveArchive(
        { season: 41, bracket: 'shuffle', class: 'mage', spec: 'fire', role: 'tank' },
        SEASONS,
      ),
    ).toEqual({ seasonId: 41, bracket: 'shuffle', cls: 'mage', spec: 'fire' });
    expect(resolveArchive({ season: 41, bracket: 'shuffle', class: 'mage' }, SEASONS)).toEqual({
      seasonId: 41,
      bracket: 'shuffle',
      cls: 'mage',
      spec: undefined,
    });
  });

  it('takes no filter on 2v2, 3v3 and RBG', () => {
    expect(
      resolveArchive(
        { season: 41, bracket: 'rbg', class: 'mage', spec: 'fire', role: 'tank' },
        SEASONS,
      ),
    ).toEqual({
      seasonId: 41,
      bracket: 'rbg',
    });
  });

  it('ignores the live season and unknown ones', () => {
    expect(resolveArchive({ season: 42 }, SEASONS)?.seasonId).toBe(41);
    expect(resolveArchive({}, [season(42, true)])).toBeNull();
  });
});
