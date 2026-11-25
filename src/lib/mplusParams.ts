/**
 * URL checks shared by the current and archived Mythic+ pages
 * (`/<lang>/pve/mythic-plus/…` and `/<lang>/pve/mythic-plus/archives/…`).
 */
import { resolveClass } from '@/lib/wow/classes';
import { classRoleKinds, roleSlug } from '@/lib/wow/roles';
import { resolveSpec } from '@/lib/wow/specs';

/**
 * The menu's "All" row under a class, in place of a spec or a role: the whole class's board
 * (Soulseeker's `class=` alone). No spec or role has this slug.
 */
export const ALL = 'all';

/** `mage` / `fire`: a spec of that class, by Soulseeker's slugs; or `mage` / `all`. */
export const isSpecParams = (p: { class: string; spec: string }) =>
  p.spec === ALL ? !!resolveClass(p.class) : !!resolveSpec(p.spec, p.class);

/** `druid` / `melee`: a role (`tank`, `healer`, `melee`, `ranged`) the class plays; or `all`. */
export const isClassRoleParams = (p: { class: string; role: string }) =>
  p.role === ALL
    ? !!resolveClass(p.class)
    : classRoleKinds(p.class).some((k) => roleSlug(k) === p.role);

/**
 * An archive page's search params: the season, by its slug (`season-tww-3`). Optional, so a
 * link without one opens the page's default (the latest finished season); a malformed value
 * is dropped. Whether the season exists is for the page to check against the catalogue.
 */
export interface ArchiveSearch {
  season?: string;
}

export const validateArchiveSearch = (search: Record<string, unknown>): ArchiveSearch => ({
  season:
    typeof search.season === 'string' && /^[a-z0-9-]{1,48}$/.test(search.season)
      ? search.season
      : undefined,
});
