import { SPECIALIZATIONS } from '@denipetrov/spirit-link/constants';
import { describe, expect, it } from 'vitest';
import { iconNames } from '@/lib/assets';
import { CLASSES, resolveClass } from './classes';
import { SPECS, classFolder, resolveSpec, specIconUrl } from './specs';

describe('resolveSpec', () => {
  it.each(SPECS.map((sp) => [sp.classSlug, sp.slug, sp.id, sp.name] as const))(
    '%s %s (id %i)',
    (cls, slug, id, name) => {
      expect(resolveSpec(id)?.slug).toBe(slug); // Mythic+ specId
      expect(resolveSpec(slug, cls)?.id).toBe(id); // PvP boards: class + spec slugs
      expect(resolveSpec(name, cls)?.id).toBe(id); // specName / activeSpecName + class
      expect(resolveSpec({ id, name })?.slug).toBe(slug); // Blizzard activeSpec
    },
  );

  it('needs the class for a name shared by two classes', () => {
    expect(resolveSpec('holy')).toBeNull();
    expect(resolveSpec('Holy', 'Priest')?.id).toBe(257);
    expect(resolveSpec('holy', 2)?.id).toBe(65);
    expect(resolveSpec('Frost', { id: 6, name: 'Death Knight' })?.id).toBe(251);
  });

  it('reads Shuffle and Blitz ladder names', () => {
    expect(resolveSpec('shuffle-mage-fire')?.id).toBe(63);
    expect(resolveSpec('blitz-priest-holy')?.id).toBe(257);
    expect(resolveSpec('shuffle-mage-bard')).toBeNull();
  });

  it('prefers the id over a localised name', () => {
    expect(resolveSpec({ id: 63, name: 'Feu' }, 'mage')?.slug).toBe('fire');
  });

  it('returns null for unknown or missing data', () => {
    for (const input of [null, undefined, '', 999, 'Bard', { id: null, name: null }, {}]) {
      expect(resolveSpec(input, 'mage')).toBeNull();
    }
    expect(resolveSpec('fire', 'paladin')).toBeNull();
  });

  it('has 40 specs with unique ids, and every class has some', () => {
    expect(SPECS).toHaveLength(40);
    expect(new Set(SPECS.map((sp) => sp.id)).size).toBe(40);
    for (const c of CLASSES) expect(SPECS.some((sp) => sp.classSlug === c.slug)).toBe(true);
  });

  it("is spirit-link's list, with Soulseeker's slugs", () => {
    for (const s of SPECIALIZATIONS) {
      const sp = resolveSpec(s.id)!;
      expect(sp).toMatchObject({ name: s.name, role: s.role, subRole: s.subRole });
      expect(resolveClass(sp.classSlug)?.id).toBe(s.classId);
    }
    // Soulseeker's slugs, as on the ladders
    expect(resolveSpec(253)?.slug).toBe('beastmastery');
    expect(resolveSpec(1480)?.slug).toBe('devourer');
  });
});

describe('spec icons', () => {
  it('every spec has its icon, and every file is a spec', () => {
    for (const sp of SPECS) expect(specIconUrl(sp.id)).toBeDefined();
    for (const c of CLASSES) {
      const slugs = new Set(SPECS.filter((sp) => sp.classSlug === c.slug).map((sp) => sp.slug));
      expect(iconNames(`specs/${classFolder(c)}`).filter((n) => !slugs.has(n))).toEqual([]);
    }
  });

  it('resolves to the class folder', () => {
    expect(specIconUrl(250)).toMatch(/specs\/death-knight\/blood\.png/);
    expect(specIconUrl('beastmastery', 'hunter')).toMatch(/specs\/hunter\/beastmastery\.png/);
    expect(specIconUrl('Holy', 'Paladin')).toMatch(/specs\/paladin\/holy\.png/);
  });
});
