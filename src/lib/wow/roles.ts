/**
 * Group roles and DPS sub-roles, the mapping from specs and API data to them,
 * and their icons.
 *
 * Roles and sub-roles are spirit-link's (`SpecRole`, `SpecSubRole`), the values
 * Soulseeker's `role` / `subRole` filters take and echo back:
 *   role      tank | healer | dps
 *   subRole   melee | ranged          (damage dealers only; null for tanks and healers)
 *
 * The API also spells a role Raider.io's way on the PvE character:
 *   activeSpecRole: "TANK" | "HEALING" | "DPS"
 *
 * Each spec's role comes from spirit-link's `SPECIALIZATIONS` (see `specs.ts`).
 *
 * Icons have one look: icons/roles/<file>.png
 *   tank, healer, dps (no sub-role known), dps-melee, dps-ranged
 */
import { iconUrl } from '@/lib/assets';
import type { ClassInput } from '@/lib/wow/classes';
import { resolveClass } from '@/lib/wow/classes';
import {
  SPECS,
  SpecRole,
  SpecSubRole,
  resolveSpec,
  type Spec,
  type SpecInput,
} from '@/lib/wow/specs';

export { SpecRole, SpecSubRole };

/** `tank`, `healer`, `dps`, in the order filters show them. */
export const ROLES: readonly SpecRole[] = [SpecRole.Tank, SpecRole.Healer, SpecRole.Dps];
/** `melee`, `ranged`. */
export const SUB_ROLES: readonly SpecSubRole[] = [SpecSubRole.Melee, SpecSubRole.Ranged];

/** A role, narrowed to a sub-role when it is known. */
export interface RoleKind {
  role: SpecRole;
  /** Only with role dps; null when unknown or not a damage dealer */
  subRole: SpecSubRole | null;
}

/** Every role a filter or a label can show, in display order. */
export const ROLE_KINDS: readonly RoleKind[] = [
  { role: SpecRole.Tank, subRole: null },
  { role: SpecRole.Healer, subRole: null },
  { role: SpecRole.Dps, subRole: null },
  { role: SpecRole.Dps, subRole: SpecSubRole.Melee },
  { role: SpecRole.Dps, subRole: SpecSubRole.Ranged },
];

const ROLE_ALIASES: ReadonlyMap<string, SpecRole> = new Map([
  ['tank', SpecRole.Tank],
  ['healer', SpecRole.Healer],
  ['healing', SpecRole.Healer], // Raider.io's activeSpecRole
  ['heal', SpecRole.Healer],
  ['dps', SpecRole.Dps],
  ['damage', SpecRole.Dps],
]);

/** "tank" | "HEALING" | "DPS" | … → the role, or null if unknown or absent. */
export function resolveRole(input: string | null | undefined): SpecRole | null {
  return (input && ROLE_ALIASES.get(input.trim().toLowerCase())) || null;
}

/** "melee" | "RANGED" → the sub-role, or null if unknown or absent. */
export function resolveSubRole(input: string | null | undefined): SpecSubRole | null {
  const v = input?.trim().toLowerCase();
  return SUB_ROLES.find((s) => s === v) ?? null;
}

/**
 * A role and sub-role from API values, kept consistent: a sub-role implies dps
 * and is dropped for tanks and healers. Null when neither is known.
 */
export function resolveRoleKind(
  role: string | null | undefined,
  subRole?: string | null,
): RoleKind | null {
  const sub = resolveSubRole(subRole);
  const r = resolveRole(role) ?? (sub ? SpecRole.Dps : null);
  if (!r) return null;
  return { role: r, subRole: r === SpecRole.Dps ? sub : null };
}

/** The role and sub-role of a spec (any API spec shape; see `resolveSpec`), or null. */
export function roleOfSpec(spec: SpecInput, cls?: ClassInput): RoleKind | null {
  const sp = resolveSpec(spec, cls);
  return sp ? { role: sp.role, subRole: sp.subRole } : null;
}

/**
 * The specs a role filter names, as Soulseeker reads its own `role` / `subRole`
 * filters: every spec of `class` (or of every class) of that role, and of that
 * sub-role when given. A sub-role implies dps. Empty when the class has no such
 * spec (a priest has no tank), which Soulseeker answers with 400.
 */
export function specsMatching(filter: {
  class?: ClassInput;
  role?: string | null;
  subRole?: string | null;
}): Spec[] {
  const kind = resolveRoleKind(filter.role, filter.subRole);
  const cls = filter.class != null ? resolveClass(filter.class) : null;
  if (filter.class != null && !cls) return [];
  return SPECS.filter(
    (sp) =>
      (!cls || sp.classSlug === cls.slug) &&
      (!kind || sp.role === kind.role) &&
      (!kind?.subRole || sp.subRole === kind.subRole),
  );
}

/** Display name: "Tank", "Healer", "DPS", "Melee DPS", "Ranged DPS". */
export function roleLabel({ role, subRole }: RoleKind): string {
  if (role === SpecRole.Tank) return 'Tank';
  if (role === SpecRole.Healer) return 'Healer';
  if (subRole === SpecSubRole.Melee) return 'Melee DPS';
  if (subRole === SpecSubRole.Ranged) return 'Ranged DPS';
  return 'DPS';
}

/** Icon file: tank, healer, dps, dps-melee, dps-ranged. */
export const roleIconFile = ({ role, subRole }: RoleKind): string =>
  role === SpecRole.Dps && subRole ? `dps-${subRole}` : role;

/**
 * Icon URL for an API role and optional sub-role (any spelling `resolveRoleKind`
 * reads). Undefined when the role is unknown.
 */
export function roleIconUrl(
  role: string | null | undefined,
  subRole?: string | null,
): string | undefined {
  const kind = resolveRoleKind(role, subRole);
  return kind ? iconUrl(`roles/${roleIconFile(kind)}`) : undefined;
}

/** Icon URL for a spec's role, with its melee/ranged split. Undefined if the spec is unknown. */
export function specRoleIconUrl(spec: SpecInput, cls?: ClassInput): string | undefined {
  const kind = roleOfSpec(spec, cls);
  return kind ? iconUrl(`roles/${roleIconFile(kind)}`) : undefined;
}

/** A role as one URL segment: `tank`, `healer`, `dps`, or a sub-role (`melee`, `ranged`). */
export type RoleSlug = 'tank' | 'healer' | 'dps' | 'melee' | 'ranged';

export const roleSlug = ({ role, subRole }: RoleKind): RoleSlug => subRole ?? role;

/** `melee` → dps / melee; `tank` → tank; anything else → null. */
export const roleKindOfSlug = (slug: string): RoleKind | null =>
  ROLE_KINDS.find((k) => roleSlug(k) === slug) ?? null;

/**
 * The roles a class plays, in display order: tank, healer, then damage split into melee and
 * ranged (a druid: tank, healer, melee, ranged; a mage: ranged). Empty for an unknown class.
 */
export function classRoleKinds(cls: ClassInput): RoleKind[] {
  const specs = specsMatching({ class: cls });
  return ROLE_KINDS.filter(
    (k) =>
      // Plain "dps" is never listed: damage is always split into melee and ranged
      !(k.role === SpecRole.Dps && !k.subRole) &&
      specs.some((sp) => sp.role === k.role && (!k.subRole || sp.subRole === k.subRole)),
  );
}
