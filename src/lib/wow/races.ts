/**
 * Playable races, and the mapping from API race/gender data to race icons.
 *
 * The API describes race in several shapes, depending on the source:
 *   PvP leaderboard         race: "Night Elf",                 gender: "female"
 *   PvP character, Blizzard race: { id: 4, name: "Night Elf" }, gender: "FEMALE" | { type: "FEMALE" }
 *   Mythic+ boards          raceId: 4, raceName: "Night Elf",  no gender
 *   PvE character, search   race / raceName: "Night Elf",      gender: "male" | absent
 *
 * The race id is preferred: it is Blizzard's and does not depend on the locale.
 * Names are English (Soulseeker answers en_US) and are matched loosely ("Mag'har Orc",
 * "magharorc" and "maghar-orc" are the same).
 *
 * Ids are complete as of Midnight Season 2 (checked against Rankwarden's data on
 * 2026-11-17). Faction-specific variants share one race: Pandaren 24/25/26,
 * Dracthyr 52/70, Earthen 84/85, Haranir 86/91.
 */
import { ASSET_STYLES, styledAssetUrl, type AssetStyle } from '@/lib/assets';

export type Gender = 'male' | 'female';

export type RaceSlug =
  | 'human'
  | 'orc'
  | 'dwarf'
  | 'nightelf'
  | 'undead'
  | 'tauren'
  | 'gnome'
  | 'troll'
  | 'goblin'
  | 'bloodelf'
  | 'draenei'
  | 'worgen'
  | 'pandaren'
  | 'nightborne'
  | 'highmountain'
  | 'voidelf'
  | 'lightforged'
  | 'zandalaritroll'
  | 'kultiranhuman'
  | 'darkirondwarf'
  | 'vulpera'
  | 'maghar'
  | 'mechagnome'
  | 'dracthyr'
  | 'earthen'
  | 'haranir';

export interface Race {
  slug: RaceSlug;
  /** English display name, as the API sends it */
  name: string;
  /** Blizzard race ids */
  ids: readonly number[];
  /** Icon file base name per style, when it differs from `slug` */
  iconName?: Partial<Record<AssetStyle, string>>;
}

export const RACES: readonly Race[] = [
  { slug: 'human', name: 'Human', ids: [1] },
  { slug: 'orc', name: 'Orc', ids: [2] },
  { slug: 'dwarf', name: 'Dwarf', ids: [3] },
  { slug: 'nightelf', name: 'Night Elf', ids: [4] },
  { slug: 'undead', name: 'Undead', ids: [5] },
  { slug: 'tauren', name: 'Tauren', ids: [6] },
  { slug: 'gnome', name: 'Gnome', ids: [7] },
  { slug: 'troll', name: 'Troll', ids: [8] },
  { slug: 'goblin', name: 'Goblin', ids: [9] },
  { slug: 'bloodelf', name: 'Blood Elf', ids: [10] },
  { slug: 'draenei', name: 'Draenei', ids: [11] },
  { slug: 'worgen', name: 'Worgen', ids: [22] },
  { slug: 'pandaren', name: 'Pandaren', ids: [24, 25, 26], iconName: { modern: 'panda' } },
  { slug: 'nightborne', name: 'Nightborne', ids: [27] },
  { slug: 'highmountain', name: 'Highmountain Tauren', ids: [28] },
  { slug: 'voidelf', name: 'Void Elf', ids: [29] },
  { slug: 'lightforged', name: 'Lightforged Draenei', ids: [30] },
  { slug: 'zandalaritroll', name: 'Zandalari Troll', ids: [31] },
  { slug: 'kultiranhuman', name: 'Kul Tiran', ids: [32] },
  { slug: 'darkirondwarf', name: 'Dark Iron Dwarf', ids: [34] },
  { slug: 'vulpera', name: 'Vulpera', ids: [35] },
  { slug: 'maghar', name: "Mag'har Orc", ids: [36] },
  { slug: 'mechagnome', name: 'Mechagnome', ids: [37] },
  { slug: 'dracthyr', name: 'Dracthyr', ids: [52, 70] },
  { slug: 'earthen', name: 'Earthen', ids: [84, 85] },
  { slug: 'haranir', name: 'Haranir', ids: [86, 91] },
];

/** Letters only, lowercase: "Mag'har Orc" → "magharorc" */
const fold = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

const byId = new Map<number, Race>();
const byName = new Map<string, Race>();
for (const race of RACES) {
  race.ids.forEach((id) => byId.set(id, race));
  byName.set(fold(race.name), race);
  byName.set(race.slug, race);
}

/** Every shape the API uses for a race. */
export type RaceInput =
  number | string | { id?: number | null; name?: string | null } | null | undefined;

/** Every shape the API uses for a gender. */
export type GenderInput = string | { type?: string | null } | null | undefined;

/** The race behind any API race value, or null if unknown. */
export function resolveRace(input: RaceInput): Race | null {
  if (input == null) return null;
  if (typeof input === 'number') return byId.get(input) ?? null;
  if (typeof input === 'string') {
    const asId = Number(input);
    if (input.trim() !== '' && Number.isInteger(asId)) return byId.get(asId) ?? null;
    return byName.get(fold(input)) ?? null;
  }
  return (
    (input.id != null ? byId.get(input.id) : undefined) ??
    (input.name ? byName.get(fold(input.name)) : undefined) ??
    null
  );
}

/** "male" | "MALE" | { type: "MALE" } → "male"; anything else → null. */
export function resolveGender(input: GenderInput): Gender | null {
  const raw = typeof input === 'string' ? input : input?.type;
  const g = raw?.trim().toLowerCase();
  return g === 'male' || g === 'female' ? g : null;
}

export interface RaceIconOptions {
  style: AssetStyle;
  /**
   * Used when the data has no gender (Mythic+ boards). Every icon is gendered,
   * so one must be picked; pass null to get no icon instead.
   */
  fallbackGender?: Gender | null;
}

/**
 * Icon URL for an API race + gender, in the chosen style (falling back to the
 * other style when that one has no file). Undefined when the race is unknown,
 * or the gender is unknown and `fallbackGender` is null.
 */
export function raceIconUrl(
  race: RaceInput,
  gender: GenderInput,
  { style, fallbackGender = 'male' }: RaceIconOptions,
): string | undefined {
  const r = resolveRace(race);
  const g = resolveGender(gender) ?? fallbackGender;
  if (!r || !g) return undefined;

  // The file name can differ per style (Pandaren is "panda" in modern), so the
  // fallback to the other style asks for that style's own name.
  const fileName = (s: AssetStyle) => `${r.iconName?.[s] ?? r.slug}-${g}`;
  const other = ASSET_STYLES.find((s) => s !== style)!;
  return (
    styledAssetUrl('races', style, fileName(style)) ??
    styledAssetUrl('races', other, fileName(other))
  );
}
