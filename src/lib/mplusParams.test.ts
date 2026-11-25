import { describe, expect, it } from 'vitest';
import { isClassRoleParams, isSpecParams, validateArchiveSearch } from './mplusParams';

describe('Mythic+ URL checks', () => {
  it('accepts a spec of the class, and a role the class plays', () => {
    expect(isSpecParams({ class: 'mage', spec: 'fire' })).toBe(true);
    expect(isSpecParams({ class: 'mage', spec: 'holy' })).toBe(false);
    expect(isClassRoleParams({ class: 'druid', role: 'melee' })).toBe(true);
    expect(isClassRoleParams({ class: 'mage', role: 'tank' })).toBe(false);
  });

  it('accepts "all" for the whole class, and only for a real class', () => {
    expect(isSpecParams({ class: 'mage', spec: 'all' })).toBe(true);
    expect(isClassRoleParams({ class: 'druid', role: 'all' })).toBe(true);
    expect(isSpecParams({ class: 'nope', spec: 'all' })).toBe(false);
    expect(isClassRoleParams({ class: 'nope', role: 'all' })).toBe(false);
  });

  it('keeps a well-formed season and drops anything else', () => {
    expect(validateArchiveSearch({ season: 'season-tww-3' })).toEqual({ season: 'season-tww-3' });
    expect(validateArchiveSearch({})).toEqual({ season: undefined });
    for (const bad of ['Season 3', '<x>', 7, 'a'.repeat(60)]) {
      expect(validateArchiveSearch({ season: bad }).season).toBeUndefined();
    }
  });
});
