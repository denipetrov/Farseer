import { describe, expect, it } from 'vitest';
import { iconNames } from '@/lib/assets';
import { CLASSES } from './classes';
import { HERO_TREES, heroTreeFile, heroTreeIconUrl, resolveHeroTree } from './heroTalents';
import { classFolder } from './specs';

describe('resolveHeroTree', () => {
  it.each(HERO_TREES.map((h) => [h.name, h.id] as const))('"%s" (id %i)', (name, id) => {
    expect(resolveHeroTree(name)?.id).toBe(id); // PvP boards: heroTalents
    expect(resolveHeroTree(id)?.name).toBe(name);
    expect(resolveHeroTree({ id, name })?.id).toBe(id); // Blizzard heroTalentTree
  });

  it('matches names loosely and prefers the id', () => {
    expect(resolveHeroTree('sanlayn')?.id).toBe(31);
    expect(resolveHeroTree('ELUNES CHOSEN')?.id).toBe(24);
    expect(resolveHeroTree({ id: 31, name: 'San’layn (localised)' })?.id).toBe(31);
  });

  it('returns null for unknown or missing data (Mythic+ has heroTalents: null)', () => {
    for (const input of [null, undefined, '', 'Bard', 999, { id: null, name: null }, {}]) {
      expect(resolveHeroTree(input)).toBeNull();
    }
  });

  it('has unique ids and names', () => {
    expect(new Set(HERO_TREES.map((h) => h.id)).size).toBe(HERO_TREES.length);
    expect(new Set(HERO_TREES.map((h) => h.name)).size).toBe(HERO_TREES.length);
  });
});

describe('hero talent icons', () => {
  it('builds file names from tree names', () => {
    const file = (name: string) => heroTreeFile(resolveHeroTree(name)!);
    expect(file("San'layn")).toBe('sanlayn');
    expect(file("Elune's Chosen")).toBe('elunes-chosen');
    expect(file('Fel-Scarred')).toBe('fel-scarred');
    expect(file('Rider of the Apocalypse')).toBe('rider-of-the-apocalypse');
  });

  it('every tree has its icon, and every file is a tree of that class', () => {
    for (const h of HERO_TREES) expect(heroTreeIconUrl(h.id)).toBeDefined();
    for (const c of CLASSES) {
      const files = new Set(
        HERO_TREES.filter((h) => h.classSlug === c.slug).map((h) => heroTreeFile(h)),
      );
      expect(iconNames(`hero-talents/${classFolder(c)}`).filter((n) => !files.has(n))).toEqual([]);
    }
  });

  it('resolves to the class folder', () => {
    expect(heroTreeIconUrl('Trickster')).toMatch(/hero-talents\/rogue\/trickster\.png/);
    expect(heroTreeIconUrl({ id: 126, name: 'Void-Scarred' })).toMatch(
      /hero-talents\/demon-hunter\/void-scarred\.png/,
    );
  });
});
