import { describe, expect, it } from 'vitest';
import { iconUrl } from '@/lib/assets';
import { isNavGroup, type NavGroup, type NavLink } from './navTypes';
import { pvpNav } from './pvpNav';

describe('PvP menu', () => {
  const items = pvpNav({ game: 'retail', locale: 'en' });
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
});
