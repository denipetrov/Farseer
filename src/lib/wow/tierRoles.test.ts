import { describe, expect, it } from 'vitest';
import { SPECS } from './specs';
import { TIER_ROLES, specInRole } from './tierRoles';

const count = (role: (typeof TIER_ROLES)[number]) =>
  SPECS.filter((sp) => specInRole({ class: sp.classSlug, spec: sp.slug }, role)).length;

describe('tier list role filter', () => {
  it('splits the specs: tanks, healers, and damage into melee and ranged', () => {
    expect(count('all')).toBe(SPECS.length);
    expect(count('tank') + count('healer') + count('dps')).toBe(SPECS.length);
    expect(count('melee') + count('ranged')).toBe(count('dps'));
  });

  it('places known specs', () => {
    const is = (cls: string, spec: string) =>
      TIER_ROLES.filter((r) => r !== 'all' && specInRole({ class: cls, spec }, r));
    expect(is('priest', 'discipline')).toEqual(['healer']);
    expect(is('warrior', 'fury')).toEqual(['dps', 'melee']);
    expect(is('mage', 'fire')).toEqual(['dps', 'ranged']);
    expect(is('druid', 'guardian')).toEqual(['tank']);
  });

  it('leaves out a spec it does not know, but keeps it under All', () => {
    expect(specInRole({ class: 'bard', spec: 'lute' }, 'dps')).toBe(false);
    expect(specInRole({ class: 'bard', spec: 'lute' }, 'all')).toBe(true);
  });
});
