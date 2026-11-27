import { describe, expect, it } from 'vitest';
import { iconUrl } from '@/lib/assets';
import { isNavGroup, navLinks, type NavGroup, type NavLink } from './navTypes';
import { pvpNav } from './pvpNav';

describe('PvP menu', () => {
  // Game names as given (English)
  const items = pvpNav({ game: 'retail', locale: 'en' }, (_kind, _id, fallback) => fallback);
  // PvP is two levels deep: links, and sections of links
  const all = items.flatMap((item): (NavLink | NavGroup)[] =>
    isNavGroup(item) ? [item, ...(item.children as NavLink[])] : [item as NavLink],
  );

  it('has every entry in the designed order', () => {
    expect(items.map((i) => i.id)).toEqual([
      'home',
      'character',
      'leaderboards',
      'stats',
      'fotm',
      'tier-list',
      'archives',
    ]);
  });

  it('every icon is a file that exists', () => {
    for (const entry of all) expect(iconUrl(entry.icon as string), entry.id).toBeDefined();
  });

  it('brackets, Spec Representation and Cutoffs use their own SVGs', () => {
    const icon = (id: string) => all.find((e) => e.id === id)!.icon;
    expect(icon('leaderboards-shuffle')).toBe('pvp/brackets/svg/shuffle');
    expect(icon('representation')).toBe('nav/spec-representation');
    expect(icon('cutoffs')).toBe('nav/cutoffs');
  });

  it('opens each bracket and class as a page, classes A–Z inside, their specs inside them', () => {
    const shuffle = (items.find((i) => i.id === 'leaderboards') as NavGroup).children.find(
      (i) => i.id === 'leaderboards-shuffle',
    ) as NavGroup;
    expect(shuffle.link?.to).toBe('/$game/$locale/pvp/leaderboards/$bracket');
    expect(shuffle.link?.params).toMatchObject({ bracket: 'shuffle' });
    expect(shuffle.children.map((c) => c.id.replace('leaderboards-shuffle-', ''))).toEqual([
      'deathknight',
      'demonhunter',
      'druid',
      'evoker',
      'hunter',
      'mage',
      'monk',
      'paladin',
      'priest',
      'rogue',
      'shaman',
      'warlock',
      'warrior',
    ]);
    const mage = shuffle.children.find((c) => c.id === 'leaderboards-shuffle-mage') as NavGroup;
    expect(mage.link?.params).toMatchObject({ bracket: 'shuffle', class: 'mage', spec: 'all' });
    expect((mage.children as NavLink[]).map((l) => l.link.params)).toEqual(
      ['arcane', 'fire', 'frost'].map((spec) =>
        expect.objectContaining({ bracket: 'shuffle', class: 'mage', spec }),
      ),
    );
  });

  it("counts a bracket's own page among the Leaderboards' links", () => {
    const ids = navLinks(items).map((l) => l.id);
    expect(ids).toContain('leaderboards-3v3');
    expect(ids).toContain('leaderboards-3v3-mage-fire');
  });

  it('lists the brackets Solo Shuffle, 3v3, 2v2, Blitz, RBG', () => {
    const brackets = (items.find((i) => i.id === 'leaderboards') as NavGroup).children;
    expect(brackets.map((b) => b.id)).toEqual([
      'leaderboards-shuffle',
      'leaderboards-3v3',
      'leaderboards-2v2',
      'leaderboards-blitz',
      'leaderboards-rbg',
    ]);
  });
});
