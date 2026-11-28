import { describe, expect, it } from 'vitest';
import type { RepresentedSpec } from '@/api/pvp';
import {
  dayStatus,
  daysBefore,
  niceAxis,
  representationColumns,
  shownSpecs,
  validateRepresentationSearch,
} from './representation';

const spec = (cls: string, sp: string, count: number): RepresentedSpec => ({
  class: cls,
  spec: sp,
  classId: null,
  specId: null,
  count,
  share: 0,
  heroTalentsClassified: 0,
  heroTalents: [],
});
const SPECS = [
  spec('mage', 'fire', 56),
  spec('rogue', 'subtlety', 70),
  spec('evoker', 'preservation', 72),
  spec('paladin', 'protection', 2),
  spec('mage', 'bogus', 9),
];

describe('daysBefore', () => {
  it('counts back UTC days across months', () => {
    expect(daysBefore('2026-11-27', 7)).toBe('2026-11-20');
    expect(daysBefore('2026-11-27', 30)).toBe('2026-10-28');
    expect(daysBefore('2026-03-01', 1)).toBe('2026-02-28');
  });
});

describe('validateRepresentationSearch', () => {
  it('keeps valid values and drops the rest', () => {
    expect(
      validateRepresentationSearch({
        bracket: '3v3',
        region: 'us',
        rating: '2100',
        role: 'melee',
        day: '15',
      }),
    ).toEqual({ bracket: '3v3', region: 'us', rating: 2100, role: 'melee', day: 15 });
    expect(
      validateRepresentationSearch({
        bracket: 'x',
        region: 'cn',
        rating: '2000',
        role: 'all',
        day: '0',
      }),
    ).toEqual({
      bracket: undefined,
      region: undefined,
      rating: undefined,
      role: undefined,
      day: undefined,
    });
  });
});

describe('shownSpecs and representationColumns', () => {
  it('sorts the known specs, most first, and filters by role', () => {
    expect(shownSpecs(SPECS, 'all').map((s) => s.entry.count)).toEqual([72, 70, 56, 2]);
    expect(shownSpecs(SPECS, 'healer').map((s) => s.sp.slug)).toEqual(['preservation']);
  });

  it('splits into melee, ranged, healer and tank columns', () => {
    const cols = representationColumns(shownSpecs(SPECS, 'all'), 'all');
    expect(cols.map((c) => [c.column, c.players])).toEqual([
      ['melee', 70],
      ['ranged', 56],
      ['healer', 72],
      ['tank', 2],
    ]);
    expect(representationColumns(shownSpecs(SPECS, 'dps'), 'dps').map((c) => c.column)).toEqual([
      'melee',
      'ranged',
    ]);
  });
});

describe('niceAxis', () => {
  it('rounds the top up to a tidy step', () => {
    expect(niceAxis(72)).toEqual({ top: 80, ticks: [0, 20, 40, 60, 80] });
    expect(niceAxis(243)).toEqual({ top: 250, ticks: [0, 50, 100, 150, 200, 250] });
    expect(niceAxis(3)).toEqual({ top: 3, ticks: [0, 1, 2, 3] });
  });
});

describe('dayStatus', () => {
  const AVAILABLE = ['2026-11-04', '2026-11-21', '2026-11-27', '2026-11-28'];

  it('is on when Soulseeker lists the day, off when it does not', () => {
    expect(dayStatus(7, '2026-11-28', AVAILABLE, '2026-08-18T15:00:00Z')).toEqual({
      date: '2026-11-21',
      off: null,
    });
    expect(dayStatus(15, '2026-11-28', AVAILABLE, '2026-08-18T15:00:00Z')).toEqual({
      date: '2026-11-13',
      off: 'noSnapshot',
    });
  });

  it('is off before the season started, whatever the list says', () => {
    // The season started 8 days before the newest snapshot: 7 days ago is in it, 15 is not
    expect(dayStatus(7, '2026-11-28', AVAILABLE, '2026-11-20T15:00:00Z').off).toBeNull();
    expect(dayStatus(15, '2026-11-28', AVAILABLE, '2026-11-20T15:00:00Z').off).toBe('beforeSeason');
    expect(dayStatus(30, '2026-11-28', AVAILABLE, '2026-11-20T15:00:00Z').off).toBe('beforeSeason');
  });

  it('keeps today on, and every day on without a list (an older Soulseeker)', () => {
    expect(dayStatus(0, '2026-11-28', [], '2026-12-01T00:00:00Z').off).toBeNull();
    expect(dayStatus(30, '2026-11-28', undefined, null).off).toBeNull();
  });
});
