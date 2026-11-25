import { describe, expect, it } from 'vitest';
import { iconUrl } from '@/lib/assets';
import { isNavGroup, pvpNav } from './pvpNav';

describe('PvP menu', () => {
  const items = pvpNav('en');
  const all = items.flatMap((item) => (isNavGroup(item) ? [item, ...item.children] : [item]));

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
    for (const entry of all) expect(iconUrl(entry.icon), entry.id).toBeDefined();
  });

  it('brackets, Spec Representation and Cutoffs use their own SVGs', () => {
    const icon = (id: string) => all.find((e) => e.id === id)!.icon;
    expect(icon('leaderboards-shuffle')).toBe('pvp/brackets/svg/shuffle');
    expect(icon('representation')).toBe('nav/spec-representation');
    expect(icon('cutoffs')).toBe('nav/cutoffs');
  });
});
