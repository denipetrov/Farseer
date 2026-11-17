import { describe, expect, it } from 'vitest';
import { ASSET_STYLES, hasStyledAsset, styledAssetNames } from '@/lib/assets';
import { palette } from '@/styles/palette';
import { CLASSES, classColorVar, classIconUrl, resolveClass } from './classes';

describe('resolveClass', () => {
  // Every (classId, className, class slug) in Rankwarden's data, 2026-11-17
  it.each([
    [1, 'Warrior', 'warrior'],
    [2, 'Paladin', 'paladin'],
    [3, 'Hunter', 'hunter'],
    [4, 'Rogue', 'rogue'],
    [5, 'Priest', 'priest'],
    [6, 'Death Knight', 'deathknight'],
    [7, 'Shaman', 'shaman'],
    [8, 'Mage', 'mage'],
    [9, 'Warlock', 'warlock'],
    [10, 'Monk', 'monk'],
    [11, 'Druid', 'druid'],
    [12, 'Demon Hunter', 'demonhunter'],
    [13, 'Evoker', 'evoker'],
  ])('id %i / "%s" → %s', (id, name, slug) => {
    expect(resolveClass(id)?.slug).toBe(slug); // Mythic+ classId
    expect(resolveClass(name)?.slug).toBe(slug); // className, Raider.io
    expect(resolveClass(slug)?.slug).toBe(slug); // PvP leaderboards and stats
    expect(resolveClass({ id, name })?.slug).toBe(slug); // Blizzard profile
  });

  it('prefers the id over the name (names are localised)', () => {
    expect(resolveClass({ id: 6, name: 'Chevalier de la mort' })?.slug).toBe('deathknight');
    expect(resolveClass({ id: 999, name: 'Mage' })?.slug).toBe('mage');
  });

  it('matches names loosely', () => {
    expect(resolveClass('DEMON HUNTER')?.slug).toBe('demonhunter');
    expect(resolveClass('death-knight')?.slug).toBe('deathknight');
    expect(resolveClass('13')?.slug).toBe('evoker');
  });

  it('returns null for unknown or missing data (not-enriched PvP rows have class: null)', () => {
    for (const input of [null, undefined, '', 'Bard', 0, 14, { id: null, name: null }, {}]) {
      expect(resolveClass(input)).toBeNull();
    }
  });
});

describe('class icons', () => {
  it.each(ASSET_STYLES)('every class has a %s icon', (style) => {
    const missing = CLASSES.filter((c) => !hasStyledAsset('classes', style, c.slug));
    expect(missing.map((c) => c.slug)).toEqual([]);
  });

  it.each(ASSET_STYLES)('every %s file belongs to a class (no misspelt names)', (style) => {
    const slugs = new Set<string>(CLASSES.map((c) => c.slug));
    expect(styledAssetNames('classes', style).filter((n) => !slugs.has(n))).toEqual([]);
  });

  it('resolves to the file of the chosen style', () => {
    expect(classIconUrl('Death Knight', { style: 'modern' })).toMatch(/modern\/deathknight\.png/);
    expect(classIconUrl(6, { style: 'classic' })).toMatch(/classic\/deathknight\.jpg/);
  });

  it('gives nothing for an unknown class', () => {
    expect(classIconUrl(null, { style: 'modern' })).toBeUndefined();
  });
});

describe('classColorVar', () => {
  it('points at an existing class colour token for every class', () => {
    for (const c of CLASSES) expect(palette.class).toHaveProperty(c.colorKey);
    expect(classColorVar('deathknight')).toBe('var(--color-class-death-knight)');
    expect(classColorVar(12)).toBe('var(--color-class-demon-hunter)');
    expect(classColorVar('Mage')).toBe('var(--color-class-mage)');
    expect(classColorVar('Bard')).toBeUndefined();
  });
});
