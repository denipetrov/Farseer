/**
 * Specializations, and the mapping from API spec data to spec icons.
 *
 * The API describes a spec in several shapes, depending on the source:
 *   PvP boards, cutoffs, stats   class: "mage", spec: "fire"          (Soulseeker slugs)
 *   PvP ladder names             bracket: "shuffle-mage-fire"
 *   Mythic+ boards               specId: 63, specName: "Fire"
 *   PvP character, Blizzard      activeSpec: { id: 63, name: "Fire" }
 *   PvE character                activeSpecName: "Fire" (with class: "Mage")
 *
 * The id is unique and preferred. A spec name or slug alone is ambiguous (holy,
 * frost, restoration, protection belong to two classes each), so it needs the class.
 * Ids are Soulseeker's SPEC_IDS (checked against Rankwarden's data, 2026-11-04).
 *
 * Icons have one look: icons/specs/<class-folder>/<spec slug>.jpg, where the class
 * folder is the class name in kebab case (`death-knight`).
 */
import { iconUrl } from '@/lib/assets';
import { resolveClass, type ClassInput, type ClassSlug, type WowClass } from '@/lib/wow/classes';

export type SpecRole = 'tank' | 'healer' | 'dps';

export interface Spec {
  /** Soulseeker's slug: letters only (`beastmastery`) */
  slug: string;
  /** English display name */
  name: string;
  /** Blizzard specialization id */
  id: number;
  classSlug: ClassSlug;
  role: SpecRole;
}

const s = (classSlug: ClassSlug, slug: string, name: string, id: number, role: SpecRole): Spec => ({
  classSlug,
  slug,
  name,
  id,
  role,
});

export const SPECS: readonly Spec[] = [
  s('deathknight', 'blood', 'Blood', 250, 'tank'),
  s('deathknight', 'frost', 'Frost', 251, 'dps'),
  s('deathknight', 'unholy', 'Unholy', 252, 'dps'),
  s('demonhunter', 'havoc', 'Havoc', 577, 'dps'),
  s('demonhunter', 'vengeance', 'Vengeance', 581, 'tank'),
  s('demonhunter', 'devourer', 'Devourer', 1480, 'dps'),
  s('druid', 'balance', 'Balance', 102, 'dps'),
  s('druid', 'feral', 'Feral', 103, 'dps'),
  s('druid', 'guardian', 'Guardian', 104, 'tank'),
  s('druid', 'restoration', 'Restoration', 105, 'healer'),
  s('evoker', 'devastation', 'Devastation', 1467, 'dps'),
  s('evoker', 'preservation', 'Preservation', 1468, 'healer'),
  s('evoker', 'augmentation', 'Augmentation', 1473, 'dps'),
  s('hunter', 'beastmastery', 'Beast Mastery', 253, 'dps'),
  s('hunter', 'marksmanship', 'Marksmanship', 254, 'dps'),
  s('hunter', 'survival', 'Survival', 255, 'dps'),
  s('mage', 'arcane', 'Arcane', 62, 'dps'),
  s('mage', 'fire', 'Fire', 63, 'dps'),
  s('mage', 'frost', 'Frost', 64, 'dps'),
  s('monk', 'brewmaster', 'Brewmaster', 268, 'tank'),
  s('monk', 'windwalker', 'Windwalker', 269, 'dps'),
  s('monk', 'mistweaver', 'Mistweaver', 270, 'healer'),
  s('paladin', 'holy', 'Holy', 65, 'healer'),
  s('paladin', 'protection', 'Protection', 66, 'tank'),
  s('paladin', 'retribution', 'Retribution', 70, 'dps'),
  s('priest', 'discipline', 'Discipline', 256, 'healer'),
  s('priest', 'holy', 'Holy', 257, 'healer'),
  s('priest', 'shadow', 'Shadow', 258, 'dps'),
  s('rogue', 'assassination', 'Assassination', 259, 'dps'),
  s('rogue', 'outlaw', 'Outlaw', 260, 'dps'),
  s('rogue', 'subtlety', 'Subtlety', 261, 'dps'),
  s('shaman', 'elemental', 'Elemental', 262, 'dps'),
  s('shaman', 'enhancement', 'Enhancement', 263, 'dps'),
  s('shaman', 'restoration', 'Restoration', 264, 'healer'),
  s('warlock', 'affliction', 'Affliction', 265, 'dps'),
  s('warlock', 'demonology', 'Demonology', 266, 'dps'),
  s('warlock', 'destruction', 'Destruction', 267, 'dps'),
  s('warrior', 'arms', 'Arms', 71, 'dps'),
  s('warrior', 'fury', 'Fury', 72, 'dps'),
  s('warrior', 'protection', 'Protection', 73, 'tank'),
];

/** Letters only, lowercase: "Beast Mastery" → "beastmastery" */
const fold = (v: string) => v.toLowerCase().replace(/[^a-z]/g, '');

const byId = new Map(SPECS.map((sp) => [sp.id, sp]));
const byClassAndName = new Map(SPECS.map((sp) => [`${sp.classSlug}/${sp.slug}`, sp]));

/** The icon folder of a class: its name in kebab case (`Death Knight` → `death-knight`). */
export const classFolder = (c: WowClass) => c.name.toLowerCase().replace(/[^a-z]+/g, '-');

/** Every shape the API uses for a spec. */
export type SpecInput =
  number | string | { id?: number | null; name?: string | null } | null | undefined;

/**
 * The spec behind any API spec value, or null if unknown. An id resolves alone;
 * a name or slug needs the class (any class shape), since names repeat across classes.
 * A ladder name (`shuffle-mage-fire`) carries its own class.
 */
export function resolveSpec(input: SpecInput, cls?: ClassInput): Spec | null {
  if (input == null) return null;
  if (typeof input === 'number') return byId.get(input) ?? null;

  if (typeof input === 'string') {
    const asId = Number(input);
    if (input.trim() !== '' && Number.isInteger(asId)) return byId.get(asId) ?? null;

    const ladder = /^(?:shuffle|blitz)-([a-z]+)-([a-z]+)$/.exec(input);
    if (ladder) return byClassAndName.get(`${ladder[1]}/${ladder[2]}`) ?? null;

    const c = resolveClass(cls);
    return c ? (byClassAndName.get(`${c.slug}/${fold(input)}`) ?? null) : null;
  }

  return (
    (input.id != null ? byId.get(input.id) : undefined) ??
    (input.name ? resolveSpec(input.name, cls) : null) ??
    null
  );
}

/** The class a spec belongs to. */
export const classOfSpec = (sp: Spec): WowClass => resolveClass(sp.classSlug)!;

/** Icon URL for an API spec value (see `resolveSpec`), or undefined if unknown. */
export function specIconUrl(input: SpecInput, cls?: ClassInput): string | undefined {
  const sp = resolveSpec(input, cls);
  return sp ? iconUrl(`specs/${classFolder(classOfSpec(sp))}/${sp.slug}`) : undefined;
}
