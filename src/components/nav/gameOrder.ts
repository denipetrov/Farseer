import { CLASSES } from '@/lib/wow/classes';
import { classRoleKinds, roleLabel, type RoleKind } from '@/lib/wow/roles';
import { SPECS, type Spec } from '@/lib/wow/specs';

/**
 * The menus list classes, specs and roles A–Z by their English names (the user's choice,
 * 2026-11-26), in every language, so the order never moves when the language changes.
 * Shared by the PvE and PvP menus.
 */
export const byEnglishName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, 'en');

export const CLASSES_AZ = [...CLASSES].sort(byEnglishName);

export const specsAz = (classSlug: string): Spec[] =>
  SPECS.filter((sp) => sp.classSlug === classSlug).sort(byEnglishName);

/** A class's roles: Healer, Melee DPS, Ranged DPS, Tank */
export const rolesAz = (classSlug: string): RoleKind[] =>
  classRoleKinds(classSlug).sort((a, b) => roleLabel(a).localeCompare(roleLabel(b), 'en'));
