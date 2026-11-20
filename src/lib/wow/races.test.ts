import { describe, expect, it } from 'vitest';
import { ASSET_STYLES, hasStyledAsset, iconNames, styledAssetNames } from '@/lib/assets';
import {
  RACES,
  raceCrestUrl,
  raceIconFileName,
  raceIconUrl,
  resolveGender,
  resolveRace,
  type Gender,
} from './races';

const GENDERS: Gender[] = ['male', 'female'];

/**
 * Icons not drawn yet. The mapper falls back to the other style for these.
 * Remove an entry once its file is added; the coverage test fails until you do.
 */
const KNOWN_MISSING = new Set(['modern/bloodelf-male', 'modern/bloodelf-female']);

/** Files on disk that no race maps to, on purpose. */
const KNOWN_EXTRA = new Set([
  // Dracthyr's humanoid form. The API does not say which form a character is
  // in, so these are not used by the mapper.
  'classic/dracthyr-visage-male-alliance',
  'classic/dracthyr-visage-male-horde',
  'classic/dracthyr-visage-female-alliance',
  'classic/dracthyr-visage-female-horde',
]);

/** Every portrait file a race needs in one style: one per gender, and per faction for a race both factions play. */
const fileNames = (slug: string, style: 'modern' | 'classic') => {
  const race = RACES.find((r) => r.slug === slug)!;
  const factions = race.faction ? [race.faction] : (['alliance', 'horde'] as const);
  return GENDERS.flatMap((g) => factions.map((f) => raceIconFileName(race, style, g, f)));
};

describe('resolveRace', () => {
  // Every (raceId, raceName) pair in Rankwarden's data, 2026-11-17
  it.each([
    [1, 'Human', 'human'],
    [2, 'Orc', 'orc'],
    [3, 'Dwarf', 'dwarf'],
    [4, 'Night Elf', 'nightelf'],
    [5, 'Undead', 'undead'],
    [6, 'Tauren', 'tauren'],
    [7, 'Gnome', 'gnome'],
    [8, 'Troll', 'troll'],
    [9, 'Goblin', 'goblin'],
    [10, 'Blood Elf', 'bloodelf'],
    [11, 'Draenei', 'draenei'],
    [22, 'Worgen', 'worgen'],
    [24, 'Pandaren', 'pandaren'],
    [25, 'Pandaren', 'pandaren'],
    [26, 'Pandaren', 'pandaren'],
    [27, 'Nightborne', 'nightborne'],
    [28, 'Highmountain Tauren', 'highmountain'],
    [29, 'Void Elf', 'voidelf'],
    [30, 'Lightforged Draenei', 'lightforged'],
    [31, 'Zandalari Troll', 'zandalaritroll'],
    [32, 'Kul Tiran', 'kultiranhuman'],
    [34, 'Dark Iron Dwarf', 'darkirondwarf'],
    [35, 'Vulpera', 'vulpera'],
    [36, "Mag'har Orc", 'maghar'],
    [37, 'Mechagnome', 'mechagnome'],
    [52, 'Dracthyr', 'dracthyr'],
    [70, 'Dracthyr', 'dracthyr'],
    [84, 'Earthen', 'earthen'],
    [85, 'Earthen', 'earthen'],
    [86, 'Haranir', 'haranir'],
    [91, 'Haranir', 'haranir'],
  ])('id %i / "%s" → %s', (id, name, slug) => {
    expect(resolveRace(id)?.slug).toBe(slug); // Mythic+ raceId
    expect(resolveRace(name)?.slug).toBe(slug); // PvP leaderboard, search, Raider.io
    expect(resolveRace({ id, name })?.slug).toBe(slug); // Blizzard profile
  });

  it('prefers the id over the name (names are localised)', () => {
    expect(resolveRace({ id: 36, name: "Orc mag'har" })?.slug).toBe('maghar');
    expect(resolveRace({ id: 999, name: 'Night Elf' })?.slug).toBe('nightelf');
  });

  it('matches names loosely', () => {
    expect(resolveRace('MAGHAR ORC')?.slug).toBe('maghar');
    expect(resolveRace('kul-tiran')?.slug).toBe('kultiranhuman');
    expect(resolveRace('darkirondwarf')?.slug).toBe('darkirondwarf');
    expect(resolveRace('36')?.slug).toBe('maghar');
  });

  it('returns null for unknown or missing data', () => {
    for (const input of [null, undefined, '', 'Murloc', 999, { id: null, name: null }, {}]) {
      expect(resolveRace(input)).toBeNull();
    }
  });
});

describe('resolveGender', () => {
  it('accepts every API shape', () => {
    expect(resolveGender('male')).toBe('male');
    expect(resolveGender('FEMALE')).toBe('female');
    expect(resolveGender({ type: 'MALE' })).toBe('male');
    expect(resolveGender(' Female ')).toBe('female');
  });

  it('returns null when unknown', () => {
    for (const input of [null, undefined, '', 'other', { type: null }, {}]) {
      expect(resolveGender(input)).toBeNull();
    }
  });
});

describe('race icons', () => {
  it.each(ASSET_STYLES)('every race and gender has a %s icon (or is a known gap)', (style) => {
    const missing = RACES.flatMap((r) =>
      fileNames(r.slug, style).map((name) => `${style}/${name}`),
    ).filter((key) => {
      const [, name] = key.split('/');
      return !hasStyledAsset('races', style, name!) && !KNOWN_MISSING.has(key);
    });
    expect(missing).toEqual([]);
  });

  it('known gaps are still gaps (remove them from KNOWN_MISSING once added)', () => {
    for (const key of KNOWN_MISSING) {
      const [style, name] = key.split('/') as ['modern' | 'classic', string];
      expect(hasStyledAsset('races', style, name)).toBe(false);
    }
  });

  it.each(ASSET_STYLES)('every %s file belongs to a race (no misspelt names)', (style) => {
    const expected = new Set(RACES.flatMap((r) => fileNames(r.slug, style)));
    const orphans = styledAssetNames('races', style).filter(
      (name) => !expected.has(name) && !KNOWN_EXTRA.has(`${style}/${name}`),
    );
    expect(orphans).toEqual([]);
  });

  it('resolves to the file of the chosen style', () => {
    expect(raceIconUrl(4, 'female', { style: 'modern' })).toMatch(/modern\/nightelf-female\.png/);
    expect(raceIconUrl(4, 'female', { style: 'classic' })).toMatch(/classic\/nightelf-female\.png/);
  });

  it('uses per-style file names (Pandaren is "panda" in modern)', () => {
    expect(raceIconUrl(25, 'male', { style: 'modern' })).toMatch(
      /modern\/panda-male-alliance\.png/,
    );
    expect(raceIconUrl(25, 'male', { style: 'classic' })).toMatch(
      /classic\/pandaren-male-alliance\.png/,
    );
  });

  it("picks a two-faction race's portrait by faction (Alliance when unknown or neutral)", () => {
    expect(raceIconUrl(52, 'female', { style: 'modern', faction: 'horde' })).toMatch(
      /modern\/dracthyr-female-horde\.png/,
    );
    expect(raceIconUrl(86, 'male', { style: 'classic', faction: { type: 'HORDE' } })).toMatch(
      /classic\/haranir-male-horde\.png/,
    );
    expect(raceIconUrl(84, 'male', { style: 'modern', faction: 'alliance' })).toMatch(
      /earthen-male-alliance\.png/,
    );
    expect(raceIconUrl(24, 'male', { style: 'modern', faction: 'NEUTRAL' })).toMatch(
      /panda-male-alliance\.png/,
    );
    expect(raceIconUrl(24, 'male', { style: 'modern' })).toMatch(/panda-male-alliance\.png/);
  });

  it('ignores the faction for a single-faction race', () => {
    expect(raceIconUrl(2, 'male', { style: 'modern', faction: 'alliance' })).toMatch(
      /modern\/orc-male\.png/,
    );
  });

  it('falls back to the other style when an icon is missing', () => {
    expect(raceIconUrl('Blood Elf', 'MALE', { style: 'modern' })).toMatch(
      /classic\/bloodelf-male\.png/,
    );
  });

  it('uses fallbackGender when the data has none (Mythic+)', () => {
    expect(raceIconUrl(3, undefined, { style: 'modern' })).toMatch(/dwarf-male/);
    expect(raceIconUrl(3, null, { style: 'modern', fallbackGender: 'female' })).toMatch(
      /dwarf-female/,
    );
    expect(raceIconUrl(3, null, { style: 'modern', fallbackGender: null })).toBeUndefined();
  });

  it('gives nothing for an unknown race', () => {
    expect(raceIconUrl('Murloc', 'male', { style: 'modern' })).toBeUndefined();
  });
});

describe('race crests', () => {
  const FACTIONS = ['alliance', 'horde'] as const;
  const crestFile = (slug: string) => {
    const r = RACES.find((x) => x.slug === slug)!;
    return `${r.crestName ?? r.slug}-crest`;
  };

  it.each(FACTIONS)('every race %s can play has a crest in that folder', (faction) => {
    const missing = RACES.filter((r) => !r.faction || r.faction === faction)
      .map((r) => crestFile(r.slug))
      .filter((file) => !iconNames(`races/crests/${faction}`).includes(file));
    expect(missing).toEqual([]);
  });

  it.each(FACTIONS)('every %s crest belongs to a race of that faction', (faction) => {
    const expected = new Set(
      RACES.filter((r) => !r.faction || r.faction === faction).map((r) => crestFile(r.slug)),
    );
    expect(iconNames(`races/crests/${faction}`).filter((n) => !expected.has(n))).toEqual([]);
  });

  it('maps every race shape, with per-race file names', () => {
    expect(raceCrestUrl(5)).toMatch(/crests\/horde\/forsaken-crest\.png/);
    expect(raceCrestUrl('Dark Iron Dwarf')).toMatch(/crests\/alliance\/darkiron-crest\.png/);
    expect(raceCrestUrl({ id: 31, name: 'Zandalari Troll' })).toMatch(
      /crests\/horde\/zandalari-crest\.png/,
    );
  });

  it("uses a single-faction race's own folder, whatever the faction says", () => {
    expect(raceCrestUrl('Orc', 'alliance')).toMatch(/crests\/horde\/orc-crest\.png/);
  });

  it('uses the given faction for two-faction races, and works without one', () => {
    expect(raceCrestUrl(24, 'horde')).toMatch(/crests\/horde\/pandaren-crest\.png/);
    expect(raceCrestUrl(24, { type: 'ALLIANCE' })).toMatch(/crests\/alliance\/pandaren-crest\.png/);
    expect(raceCrestUrl('Dracthyr')).toMatch(/crests\/\w+\/dracthyr-crest\.png/);
  });

  it('gives nothing for an unknown race', () => {
    expect(raceCrestUrl('Murloc', 'horde')).toBeUndefined();
  });
});
