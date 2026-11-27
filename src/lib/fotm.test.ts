import { describe, expect, it } from 'vitest';
import type { RepresentedSpec, SpecRepresentationHistory } from '@/api/pvp';
import { daysBetween, fotmSeries, spreadLabels, validateFotmSearch } from './fotm';

const spec = (
  cls: string,
  sp: string,
  count: number,
  heroTalents: RepresentedSpec['heroTalents'] = [],
): RepresentedSpec => ({
  class: cls,
  spec: sp,
  classId: null,
  specId: null,
  count,
  share: 0,
  heroTalentsClassified: heroTalents.reduce((n, h) => n + h.count, 0),
  heroTalents,
});
const hero = (id: number, name: string, count: number) => ({ id, name, count, share: 0 });
const day = (date: string, specs: RepresentedSpec[]) => ({
  date,
  computedAt: `${date}T10:00:00Z`,
  total: 100,
  classified: 100,
  specs,
});

const HISTORY: SpecRepresentationHistory = {
  from: '2026-11-24',
  to: '2026-11-27',
  days: [
    day('2026-11-24', [spec('mage', 'fire', 30), spec('priest', 'discipline', 10)]),
    // 25th missing: no snapshot
    day('2026-11-26', [spec('mage', 'fire', 20), spec('priest', 'discipline', 20)]),
    day('2026-11-27', [spec('priest', 'discipline', 30), spec('mage', 'fire', 10)]),
  ],
};

describe('daysBetween', () => {
  it('lists every day, both ends included', () => {
    expect(daysBetween('2026-10-30', '2026-11-02')).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ]);
  });
});

describe('validateFotmSearch', () => {
  it('takes the representation filters, without a day', () => {
    expect(validateFotmSearch({ bracket: '3v3', rating: '2700', day: '7', view: 'x' })).toEqual({
      bracket: '3v3',
      region: undefined,
      rating: 2700,
      role: undefined,
      view: undefined,
    });
    expect(validateFotmSearch({ view: 'hero' }).view).toBe('hero');
  });
});

describe('fotmSeries', () => {
  it('makes a line per spec over every day, a gap where no snapshot was taken', () => {
    const { dates, series } = fotmSeries(HISTORY, 'all');
    expect(dates).toHaveLength(4);
    // Discipline leads on the newest day
    expect(series.map((s) => s.key)).toEqual(['priest-discipline', 'mage-fire']);
    expect(series[1]!.points.map((p) => p && p.share)).toEqual([0.75, null, 0.5, 0.25]);
    expect(series[0]!.latest).toBe(0.75);
  });

  it('counts shares within the role filter, and a missing spec as 0', () => {
    const { series } = fotmSeries(
      { ...HISTORY, days: [day('2026-11-27', [spec('priest', 'discipline', 30)])] },
      'healer',
    );
    expect(series.map((s) => [s.key, s.latest])).toEqual([['priest-discipline', 1]]);
    const all = fotmSeries(
      {
        ...HISTORY,
        days: [...HISTORY.days.slice(0, 1), day('2026-11-27', [spec('priest', 'discipline', 5)])],
      },
      'all',
    );
    expect(all.series.find((s) => s.key === 'mage-fire')!.points[3]).toEqual({
      count: 0,
      share: 0,
    });
  });
});

describe('fotmSeries, hero talents', () => {
  it("sums a tree over its class's specs, shares of every tree in the filter", () => {
    const history: SpecRepresentationHistory = {
      from: '2026-11-27',
      to: '2026-11-27',
      days: [
        day('2026-11-27', [
          spec('priest', 'discipline', 30, [hero(20, 'Oracle', 25), hero(18, 'Voidweaver', 5)]),
          spec('priest', 'holy', 10, [hero(20, 'Oracle', 10)]),
          spec('mage', 'fire', 60, [hero(39, 'Sunfury', 60)]),
        ]),
      ],
    };
    const all = fotmSeries(history, 'all', 'hero').series;
    expect(all.map((s) => [s.key, s.points[0]!.count, s.latest])).toEqual([
      ['hero-39', 60, 0.6],
      ['hero-20', 35, 0.35],
      ['hero-18', 5, 0.05],
    ]);
    expect(all[1]!.classSlug).toBe('priest');
    expect(fotmSeries(history, 'healer', 'hero').series.map((s) => s.key)).toEqual([
      'hero-20',
      'hero-18',
    ]);
  });
});

describe('spreadLabels', () => {
  it('keeps labels a gap apart and inside the plot', () => {
    expect(spreadLabels([50, 52, 200], 20, 300)).toEqual([50, 70, 200]);
    expect(spreadLabels([295, 298], 20, 300)).toEqual([280, 300]);
  });
});
