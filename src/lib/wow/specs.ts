/**
 * Specializations, and the mapping from API spec data to spec icons.
 *
 * The API describes a spec in several shapes, depending on the source:
 *   PvP boards, cutoffs, tiers   spec: "fire", specId: 63              (+ class: "mage")
 *   PvP ladder names             bracket: "shuffle-mage-fire"
 *   Mythic+ boards, search       specId: 63, specName: "Fire"
 *   PvP character, Blizzard      activeSpec: { id: 63, name: "Fire" }
 *   PvE character                activeSpecId: 63, activeSpecName: "Fire"
 *
 * Every answer that names a spec also carries Blizzard's id (`specId`,
 * `activeSpecId`), so the id is the normal path. A spec name or slug alone is
 * ambiguous (holy, frost, restoration, protection belong to two classes each),
 * so it needs the class.
 *
 * The spec list, ids, roles and sub-roles come from spirit-link's
 * `SPECIALIZATIONS`, the list Soulseeker and Rankwarden share, so a spec added
 * there arrives here with a package update. The slug is Soulseeker's: the name,
 * letters only (`Beast Mastery` → `beastmastery`).
 *
 * Icons have one look: icons/specs/<class-folder>/<spec slug>.png, where the class
 * folder is the class name in kebab case (`death-knight`).
 */
import { SPECIALIZATIONS, SpecRole, SpecSubRole } from '@denipetrov/spirit-link/constants';
import { iconUrl } from '@/lib/assets';
import { resolveClass, type ClassInput, type ClassSlug, type WowClass } from '@/lib/wow/classes';

export { SpecRole, SpecSubRole };

export interface Spec {
  /** Soulseeker's slug: letters only (`beastmastery`) */
  slug: string;
  /** English display name */
  name: string;
  /** Blizzard specialization id */
  id: number;
  classSlug: ClassSlug;
  /** Group role: `tank`, `healer` or `dps` */
  role: SpecRole;
  /** `melee` or `ranged` for damage dealers; null for tanks and healers */
  subRole: SpecSubRole | null;
}

/** Letters only, lowercase: "Beast Mastery" → "beastmastery" */
const fold = (v: string) => v.toLowerCase().replace(/[^a-z]/g, '');

export const SPECS: readonly Spec[] = SPECIALIZATIONS.map((sp) => {
  const cls = resolveClass(sp.classId);
  if (!cls) throw new Error(`spirit-link spec ${sp.id} has unknown class id ${sp.classId}`);
  return {
    slug: fold(sp.name),
    name: sp.name,
    id: sp.id,
    classSlug: cls.slug,
    role: sp.role,
    subRole: sp.subRole,
  };
});

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
