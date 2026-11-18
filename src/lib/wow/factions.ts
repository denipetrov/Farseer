/**
 * Factions, and the mapping from API faction data to faction emblems.
 *
 * Every character, guild and leaderboard row carries the faction as a lowercase
 * string ("horde" | "alliance"). Raw Blizzard data uses { type: "HORDE", name: "Horde" },
 * and Pandaren before choosing a side are "NEUTRAL"; both are accepted, neutral maps
 * to null.
 *
 * Don't derive faction from race: the race ids of two-faction races are inconsistent
 * in the data (Pandaren 24 appears on both sides; Dracthyr and Haranir ids don't
 * follow the documented split).
 */
import { styledAssetUrl, type AssetStyle } from '@/lib/assets';
import type { Faction } from '@/styles/palette';

export interface FactionInfo {
  slug: Faction;
  name: string;
}

export const FACTIONS: readonly FactionInfo[] = [
  { slug: 'horde', name: 'Horde' },
  { slug: 'alliance', name: 'Alliance' },
];

/** Every shape the API uses for a faction. */
export type FactionInput =
  string | { type?: string | null; name?: string | null } | null | undefined;

/** The faction behind any API faction value, or null if unknown or neutral. */
export function resolveFaction(input: FactionInput): FactionInfo | null {
  const raw = typeof input === 'string' ? input : (input?.type ?? input?.name);
  const key = raw?.trim().toLowerCase();
  return FACTIONS.find((f) => f.slug === key) ?? null;
}

/**
 * Emblem URL for an API faction value, in the chosen style (falling back to the
 * other style when that one has no file). Undefined when the faction is unknown.
 */
export function factionIconUrl(input: FactionInput, { style }: { style: AssetStyle }) {
  const f = resolveFaction(input);
  return f ? styledAssetUrl('factions', style, f.slug) : undefined;
}

/**
 * CSS vars for a faction's own colours, independent of the user's chosen faction:
 * `color` is its accent (red/blue), `trim` its frame metal (silver/gold).
 */
export function factionColorVars(input: FactionInput) {
  const f = resolveFaction(input);
  return f ? { color: `var(--color-${f.slug})`, trim: `var(--color-${f.slug}-trim)` } : undefined;
}
