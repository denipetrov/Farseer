import { describe, expect, it } from 'vitest';
import { rowLoadoutCode, rowPvpTalents, wowheadSpellUrl, wowheadTalentUrl } from './talents';
import { wowheadIconUrl } from './wowheadSpell';

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

describe('PvP talents', () => {
  const iceForm = { slot: 2, id: 5561, name: 'Ice Form', spellId: 198144 };
  const ring = { slot: 4, id: 5490, name: 'Ring of Fire', spellId: 353082 };
  const row = (pvpTalents?: (typeof iceForm)[]) => ({
    specId: 64,
    talentLoadouts: [{ spec: 'frost', specId: 64, talentLoadoutCode: 'X', pvpTalents }],
  });

  it("fills the game's slots 2, 3 and 4 in order, empty slots null", () => {
    expect(rowPvpTalents(row([ring, iceForm]))).toEqual([iceForm, null, ring]);
    const third = { ...ring, slot: 3 };
    expect(rowPvpTalents(row([iceForm, third, ring]))).toEqual([iceForm, third, ring]);
  });

  it('never shows more than three, placing an unknown slot number in a free place', () => {
    const odd = { ...ring, slot: 1 };
    expect(rowPvpTalents(row([odd, iceForm]))).toEqual([iceForm, odd, null]);
    const all = [1, 2, 3, 4].map((slot) => ({ ...ring, slot }));
    expect(rowPvpTalents(row(all))).toHaveLength(3);
  });

  it('is three empty slots with no data yet', () => {
    expect(rowPvpTalents(row([]))).toEqual([null, null, null]);
    expect(rowPvpTalents(row())).toEqual([null, null, null]);
    expect(rowPvpTalents({ specId: 64 })).toEqual([null, null, null]);
  });

  it('links the spell on Wowhead, and takes only plain icon names', () => {
    expect(wowheadSpellUrl(198144, 'fr')).toBe('https://fr.wowhead.com/spell=198144');
    expect(wowheadIconUrl('ability_mage_iceform')).toBe(
      'https://wow.zamimg.com/images/wow/icons/large/ability_mage_iceform.jpg',
    );
    expect(wowheadIconUrl('../x"')).toBeUndefined();
  });
});
