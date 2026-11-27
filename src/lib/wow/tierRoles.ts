/**
 * The tier list's role filter (the user's design, 2026-11-27): All, DPS, Healers, Melee,
 * Ranged, Tanks. Melee and Ranged are the damage dealers of that reach.
 */
import { resolveSpec } from './specs';

export const TIER_ROLES = ['all', 'dps', 'healer', 'melee', 'ranged', 'tank'] as const;
export type TierRole = (typeof TIER_ROLES)[number];

/** Whether a tier list spec (`class`, `spec` slugs) falls under a role filter */
export function specInRole(entry: { class: string; spec: string }, role: TierRole): boolean {
  if (role === 'all') return true;
  const sp = resolveSpec(entry.spec, entry.class);
  if (!sp) return false;
  if (role === 'dps' || role === 'healer' || role === 'tank') return sp.role === role;
  return sp.role === 'dps' && sp.subRole === role;
}
