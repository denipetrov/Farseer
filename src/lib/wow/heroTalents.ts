/**
 * Hero talent trees, and the mapping from API data to hero talent icons.
 *
 * The API describes a tree in two shapes:
 *   PvP boards, search, PvE page     heroTalents: "Trickster", heroTalentId: 51
 *   PvP character (Blizzard), stats  heroTalentTree / activeHeroTalentTree: { id: 51, name: "Trickster" }
 * Mythic+ characters always have heroTalents: null (and heroTalentId: null).
 *
 * The id is preferred (Blizzard's, which Raider.io shares; names are localised on
 * /pvp/character with a locale). Names are matched loosely ("San'layn" = "sanlayn").
 * Every tree name is unique across classes. Ids checked against Rankwarden's
 * characters, 2026-11-19.
 *
 * Icons have one look: icons/hero-talents/<class-folder>/<tree-file>.png, where
 * the file is the name in kebab case without apostrophes ("san-layn" → "sanlayn").
 */
import { iconUrl } from '@/lib/assets';
import { resolveClass, type ClassSlug, type WowClass } from '@/lib/wow/classes';
import { classFolder } from '@/lib/wow/specs';

export interface HeroTree {
  id: number;
  /** English display name */
  name: string;
  classSlug: ClassSlug;
}

const t = (id: number, name: string, classSlug: ClassSlug): HeroTree => ({ id, name, classSlug });

export const HERO_TREES: readonly HeroTree[] = [
  t(18, 'Voidweaver', 'priest'),
  t(19, 'Archon', 'priest'),
  t(20, 'Oracle', 'priest'),
  t(21, 'Druid of the Claw', 'druid'),
  t(22, 'Wildstalker', 'druid'),
  t(23, 'Keeper of the Grove', 'druid'),
  t(24, "Elune's Chosen", 'druid'),
  t(31, "San'layn", 'deathknight'),
  t(32, 'Rider of the Apocalypse', 'deathknight'),
  t(33, 'Deathbringer', 'deathknight'),
  t(34, 'Fel-Scarred', 'demonhunter'),
  t(35, 'Aldrachi Reaver', 'demonhunter'),
  t(124, 'Annihilator', 'demonhunter'),
  t(126, 'Void-Scarred', 'demonhunter'),
  t(36, 'Scalecommander', 'evoker'),
  t(37, 'Flameshaper', 'evoker'),
  t(38, 'Chronowarden', 'evoker'),
  t(39, 'Sunfury', 'mage'),
  t(40, 'Spellslinger', 'mage'),
  t(41, 'Frostfire', 'mage'),
  t(42, 'Sentinel', 'hunter'),
  t(43, 'Pack Leader', 'hunter'),
  t(44, 'Dark Ranger', 'hunter'),
  t(48, 'Templar', 'paladin'),
  t(49, 'Lightsmith', 'paladin'),
  t(50, 'Herald of the Sun', 'paladin'),
  t(51, 'Trickster', 'rogue'),
  t(52, 'Fatebound', 'rogue'),
  t(53, 'Deathstalker', 'rogue'),
  t(54, 'Totemic', 'shaman'),
  t(55, 'Stormbringer', 'shaman'),
  t(56, 'Farseer', 'shaman'),
  t(57, 'Soul Harvester', 'warlock'),
  t(58, 'Hellcaller', 'warlock'),
  t(59, 'Diabolist', 'warlock'),
  t(60, 'Slayer', 'warrior'),
  t(61, 'Mountain Thane', 'warrior'),
  t(62, 'Colossus', 'warrior'),
  t(64, 'Conduit of the Celestials', 'monk'),
  t(65, 'Shado-Pan', 'monk'),
  t(66, 'Master of Harmony', 'monk'),
];

/** Letters only, lowercase: "San'layn" → "sanlayn" */
const fold = (v: string) => v.toLowerCase().replace(/[^a-z]/g, '');

const byId = new Map(HERO_TREES.map((h) => [h.id, h]));
const byName = new Map(HERO_TREES.map((h) => [fold(h.name), h]));

/** Every shape the API uses for a hero talent tree. */
export type HeroTreeInput =
  number | string | { id?: number | null; name?: string | null } | null | undefined;

/** The tree behind any API value, or null if unknown or absent. */
export function resolveHeroTree(input: HeroTreeInput): HeroTree | null {
  if (input == null) return null;
  if (typeof input === 'number') return byId.get(input) ?? null;
  if (typeof input === 'string') return byName.get(fold(input)) ?? null;
  return (
    (input.id != null ? byId.get(input.id) : undefined) ??
    (input.name ? byName.get(fold(input.name)) : undefined) ??
    null
  );
}

/** The class a tree belongs to. */
export const classOfHeroTree = (h: HeroTree): WowClass => resolveClass(h.classSlug)!;

/** Icon file name: "Elune's Chosen" → "elunes-chosen", "Fel-Scarred" → "fel-scarred" */
export const heroTreeFile = (h: HeroTree) =>
  h.name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z]+/g, '-');

/** Icon URL for an API hero talent value, or undefined if unknown. */
export function heroTreeIconUrl(input: HeroTreeInput): string | undefined {
  const h = resolveHeroTree(input);
  return h
    ? iconUrl(`hero-talents/${classFolder(classOfHeroTree(h))}/${heroTreeFile(h)}`)
    : undefined;
}

/**
 * The two hero talent trees each spec can take (`<class>/<spec>` slugs → tree ids), so a
 * tree nobody picked still shows at 0 (the hero talents page; the user, 2026-11-27). From
 * the game's tree list, checked against Rankwarden's data on every bracket (2026-11-27).
 */
export const SPEC_HERO_TREES: Readonly<Record<string, readonly [number, number]>> = {
  'deathknight/blood': [31, 33],
  'deathknight/frost': [33, 32],
  'deathknight/unholy': [31, 32],
  'demonhunter/havoc': [35, 34],
  'demonhunter/vengeance': [124, 35],
  'demonhunter/devourer': [126, 124],
  'druid/balance': [23, 24],
  'druid/feral': [22, 21],
  'druid/guardian': [24, 21],
  'druid/restoration': [23, 22],
  'evoker/augmentation': [36, 38],
  'evoker/devastation': [36, 37],
  'evoker/preservation': [37, 38],
  'hunter/beastmastery': [43, 44],
  'hunter/marksmanship': [42, 44],
  'hunter/survival': [42, 43],
  'mage/arcane': [39, 40],
  'mage/fire': [39, 41],
  'mage/frost': [40, 41],
  'monk/brewmaster': [65, 66],
  'monk/mistweaver': [64, 66],
  'monk/windwalker': [65, 64],
  'paladin/holy': [50, 49],
  'paladin/protection': [49, 48],
  'paladin/retribution': [48, 50],
  'priest/discipline': [18, 20],
  'priest/holy': [19, 20],
  'priest/shadow': [18, 19],
  'rogue/assassination': [53, 52],
  'rogue/outlaw': [51, 52],
  'rogue/subtlety': [51, 53],
  'shaman/elemental': [55, 56],
  'shaman/enhancement': [55, 54],
  'shaman/restoration': [56, 54],
  'warlock/affliction': [57, 58],
  'warlock/demonology': [59, 57],
  'warlock/destruction': [59, 58],
  'warrior/arms': [60, 62],
  'warrior/fury': [60, 61],
  'warrior/protection': [61, 62],
};
