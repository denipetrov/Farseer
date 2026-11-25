import { SPECIALIZATIONS } from '@denipetrov/spirit-link/constants';
import { describe, expect, it } from 'vitest';
import { iconNames } from '@/lib/assets';
import {
  ROLE_KINDS,
  classRoleKinds,
  roleKindOfSlug,
  roleSlug,
  resolveRole,
  resolveRoleKind,
  resolveSubRole,
  roleIconFile,
  roleIconUrl,
  roleLabel,
  roleOfSpec,
  specRoleIconUrl,
  specsMatching,
} from './roles';

describe('resolveRole / resolveSubRole', () => {
  it('reads every spelling the API uses', () => {
    expect(resolveRole('tank')).toBe('tank'); // Soulseeker filters, Raider.io roster
    expect(resolveRole('TANK')).toBe('tank'); // PvE activeSpecRole
    expect(resolveRole('HEALING')).toBe('healer');
    expect(resolveRole('healer')).toBe('healer');
    expect(resolveRole('DPS')).toBe('dps');
    expect(resolveSubRole('melee')).toBe('melee');
    expect(resolveSubRole(' RANGED ')).toBe('ranged');
  });

  it('returns null for unknown or missing data', () => {
    for (const v of [null, undefined, '', 'support', 'constructor', 'toString']) {
      expect(resolveRole(v)).toBeNull();
      expect(resolveSubRole(v)).toBeNull();
    }
  });

  it('keeps role and sub-role consistent', () => {
    expect(resolveRoleKind(null, 'melee')).toEqual({ role: 'dps', subRole: 'melee' });
    expect(resolveRoleKind('dps', null)).toEqual({ role: 'dps', subRole: null });
    expect(resolveRoleKind('tank', 'ranged')).toEqual({ role: 'tank', subRole: null });
    expect(resolveRoleKind(null, null)).toBeNull();
  });
});

describe('roleOfSpec', () => {
  it('follows spirit-link for every spec', () => {
    for (const sp of SPECIALIZATIONS) {
      expect(roleOfSpec(sp.id)).toEqual({ role: sp.role, subRole: sp.subRole });
    }
  });

  it('reads any spec shape', () => {
    expect(roleOfSpec('survival', 'hunter')).toEqual({ role: 'dps', subRole: 'melee' });
    expect(roleOfSpec('shuffle-demonhunter-devourer')).toEqual({ role: 'dps', subRole: 'ranged' });
    expect(roleOfSpec({ id: 65, name: 'Sagrado' })).toEqual({ role: 'healer', subRole: null });
    expect(roleOfSpec('holy')).toBeNull(); // ambiguous without the class
  });
});

describe('specsMatching', () => {
  const ids = (f: Parameters<typeof specsMatching>[0]) => specsMatching(f).map((sp) => sp.id);

  it('narrows by role, sub-role and class', () => {
    expect(ids({ role: 'tank' })).toHaveLength(6);
    expect(ids({ role: 'healer' })).toHaveLength(7);
    expect(ids({ class: 'hunter', subRole: 'melee' })).toEqual([255]);
    expect(ids({ class: 'Demon Hunter', role: 'dps', subRole: 'ranged' })).toEqual([1480]);
    expect(ids({ class: 6, role: 'TANK' })).toEqual([250]);
  });

  it('is empty when the class has no such spec', () => {
    expect(ids({ class: 'priest', role: 'tank' })).toEqual([]);
    expect(ids({ class: 'mage', subRole: 'melee' })).toEqual([]);
    expect(ids({ class: 'bard', role: 'dps' })).toEqual([]);
  });

  it('a sub-role implies dps, and melee + ranged make up all dps', () => {
    const melee = ids({ subRole: 'melee' });
    const ranged = ids({ subRole: 'ranged' });
    expect([...melee, ...ranged].sort()).toEqual(ids({ role: 'dps' }).sort());
  });
});

describe('role icons', () => {
  it('maps each role to its file', () => {
    expect(ROLE_KINDS.map(roleIconFile)).toEqual([
      'tank',
      'healer',
      'dps',
      'dps-melee',
      'dps-ranged',
    ]);
    expect(ROLE_KINDS.map(roleLabel)).toEqual(['Tank', 'Healer', 'DPS', 'Melee DPS', 'Ranged DPS']);
  });

  it('every role has its icon, and every file is a role', () => {
    // Files that aren't a role: `all` is the "every role" icon (e.g. a filter's reset option).
    const KNOWN_EXTRA = ['all'];
    for (const k of ROLE_KINDS) expect(roleIconUrl(k.role, k.subRole)).toBeDefined();
    expect(iconNames('roles').sort()).toEqual(
      [...ROLE_KINDS.map(roleIconFile), ...KNOWN_EXTRA].sort(),
    );
  });

  it('resolves API values and specs to icons', () => {
    expect(roleIconUrl('HEALING')).toMatch(/roles\/healer\.png/);
    expect(roleIconUrl('dps', 'ranged')).toMatch(/roles\/dps-ranged\.png/);
    expect(roleIconUrl(null, 'melee')).toMatch(/roles\/dps-melee\.png/);
    expect(roleIconUrl('support')).toBeUndefined();
    expect(specRoleIconUrl(255)).toMatch(/roles\/dps-melee\.png/); // Survival
    expect(specRoleIconUrl(1473)).toMatch(/roles\/dps-ranged\.png/); // Augmentation
    expect(specRoleIconUrl('blood', 'deathknight')).toMatch(/roles\/tank\.png/);
  });
});

describe('class roles', () => {
  const slugs = (cls: string) => classRoleKinds(cls).map(roleSlug);

  it('lists what each class plays, damage split into melee and ranged', () => {
    expect(slugs('druid')).toEqual(['tank', 'healer', 'melee', 'ranged']);
    expect(slugs('mage')).toEqual(['ranged']);
    expect(slugs('hunter')).toEqual(['melee', 'ranged']);
    expect(slugs('paladin')).toEqual(['tank', 'healer', 'melee']);
    expect(slugs('evoker')).toEqual(['healer', 'ranged']);
    expect(slugs('nope')).toEqual([]);
  });

  it('reads a role back from its URL segment', () => {
    expect(roleKindOfSlug('melee')).toEqual({ role: 'dps', subRole: 'melee' });
    expect(roleKindOfSlug('tank')).toEqual({ role: 'tank', subRole: null });
    expect(roleKindOfSlug('dps-melee')).toBeNull();
  });
});
