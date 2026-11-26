import { describe, expect, it } from 'vitest';
import { rowLoadoutCode, wowheadTalentUrl } from './talents';

const loadouts = [
  { spec: 'windwalker', specId: 269, talentLoadoutCode: 'WW-CODE' },
  { spec: 'mistweaver', specId: 270, talentLoadoutCode: 'MW-CODE' },
];

describe('talent loadouts', () => {
  it("picks the row's spec, by id then by slug", () => {
    expect(rowLoadoutCode({ specId: 270, talentLoadouts: loadouts })).toBe('MW-CODE');
    expect(rowLoadoutCode({ spec: 'windwalker', talentLoadouts: loadouts })).toBe('WW-CODE');
  });

  it('is null without a matching loadout or code', () => {
    expect(rowLoadoutCode({ specId: 268, talentLoadouts: loadouts })).toBeNull();
    expect(rowLoadoutCode({ specId: 270 })).toBeNull();
    expect(
      rowLoadoutCode({
        specId: 270,
        talentLoadouts: [{ spec: null, specId: 270, talentLoadoutCode: '' }],
      }),
    ).toBeNull();
  });

  it("opens Wowhead's calculator, in the site's language", () => {
    expect(wowheadTalentUrl('CwPAkX', 'en')).toBe(
      'https://www.wowhead.com/talent-calc/blizzard/CwPAkX',
    );
    expect(wowheadTalentUrl('CwPAkX', 'de')).toBe(
      'https://de.wowhead.com/talent-calc/blizzard/CwPAkX',
    );
  });
});
