import { describe, expect, it } from 'vitest';
import type { PvpHeroTalents } from '@/api/pvp';
import { HERO_TREES, SPEC_HERO_TREES, resolveHeroTree } from '@/lib/wow/heroTalents';
import { SPECS } from '@/lib/wow/specs';
import { heroTalentCards, validateHeroTalentStatsSearch } from './heroTalentStats';

const spec = (s: string, characters: number, trees: [number, string, number][]) => ({
  spec: s,
  specId: null,
  characters,
  covered: trees.reduce((n, [, , c]) => n + c, 0),
  minRating: 2000,
  maxRating: 2500,
  heroTalents: trees.map(([id, name, count]) => ({ id, name, count, share: 0 })),
});

const DATA: PvpHeroTalents = {
  seasonName: null,
  top: 25,
  computedAt: '2026-11-27T00:00:00Z',
  classes: [
    {
      class: 'deathknight',
      classId: 6,
      specs: [
        spec('blood', 0, []),
        spec('frost', 25, [
          [33, 'Deathbringer', 22],
          [40, 'Spellslinger', 1],
        ]),
        spec('unholy', 25, [[31, "San'layn", 25]]),
      ],
    },
    { class: 'priest', classId: 5, specs: [spec('discipline', 20, [[20, 'Oracle', 19]])] },
  ],
};

describe('SPEC_HERO_TREES', () => {
  it('gives every spec two trees of its own class', () => {
    for (const sp of SPECS) {
      const trees = SPEC_HERO_TREES[`${sp.classSlug}/${sp.slug}`];
      expect(trees, sp.slug).toHaveLength(2);
      for (const id of trees!)
        expect(resolveHeroTree(id)?.classSlug, `${sp.slug} ${id}`).toBe(sp.classSlug);
    }
  });

  it('uses every tree', () => {
    const used = new Set(Object.values(SPEC_HERO_TREES).flat());
    expect(HERO_TREES.filter((h) => !used.has(h.id)).map((h) => h.name)).toEqual([]);
  });
});

describe('heroTalentCards', () => {
  it('shows both trees of a spec, the untaken at 0, and leaves out other classes’ trees', () => {
    const [dk] = heroTalentCards(DATA, {});
    // Blood has no players: left out
    expect(dk!.specs.map((s) => s.sp.slug)).toEqual(['frost', 'unholy']);
    expect(dk!.specs[0]!.trees.map((t) => [t.tree.name, t.count, t.share])).toEqual([
      ['Deathbringer', 22, 1],
      ['Rider of the Apocalypse', 0, 0],
    ]);
    expect(dk!.specs[1]!.trees.map((t) => t.tree.name)).toEqual([
      "San'layn",
      'Rider of the Apocalypse',
    ]);
  });

  it('filters by class, spec or role', () => {
    expect(heroTalentCards(DATA, { cls: 'priest' }).map((c) => c.cls.slug)).toEqual(['priest']);
    expect(
      heroTalentCards(DATA, { cls: 'deathknight', spec: 'unholy' })[0]!.specs.map((s) => s.sp.slug),
    ).toEqual(['unholy']);
    expect(heroTalentCards(DATA, { role: 'healer' }).map((c) => c.cls.slug)).toEqual(['priest']);
  });
});

describe('validateHeroTalentStatsSearch', () => {
  it('keeps valid values; a spec needs its class, a role needs none', () => {
    expect(
      validateHeroTalentStatsSearch({
        bracket: '3v3',
        region: 'us',
        top: '25',
        class: 'mage',
        spec: 'fire',
        role: 'tank',
      }),
    ).toEqual({
      bracket: '3v3',
      region: 'us',
      top: 25,
      class: 'mage',
      spec: 'fire',
      role: undefined,
    });
    expect(validateHeroTalentStatsSearch({ top: '30', spec: 'fire', role: 'healer' })).toEqual({
      bracket: undefined,
      region: undefined,
      top: undefined,
      class: undefined,
      spec: undefined,
      role: 'healer',
    });
  });
});
