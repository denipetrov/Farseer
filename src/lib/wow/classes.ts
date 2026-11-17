/**
 * Playable classes, and the mapping from API class data to class icons and colours.
 *
 * The API describes class in several shapes, depending on the source:
 *   PvP leaderboards, stats   class: "deathknight"                (Soulseeker slug)
 *   Mythic+ boards            classId: 6, className: "Death Knight"
 *   PvP character, Blizzard   class: { id: 6, name: "Death Knight" }
 *   PvE character, search     class / className: "Death Knight"
 *   Not enriched yet          class: null
 *
 * The id is preferred when there is one; names and slugs are matched loosely
 * ("Death Knight", "deathknight" and "death-knight" are the same).
 * Ids checked against Rankwarden's data on 2026-11-17.
 */
import { styledAssetUrl, type AssetStyle } from '@/lib/assets';
import type { palette } from '@/styles/palette';

export type ClassSlug =
  | 'warrior'
  | 'paladin'
  | 'hunter'
  | 'rogue'
  | 'priest'
  | 'deathknight'
  | 'shaman'
  | 'mage'
  | 'warlock'
  | 'monk'
  | 'druid'
  | 'demonhunter'
  | 'evoker';

type PaletteClassKey = keyof typeof palette.class;

export interface WowClass {
  /** Soulseeker's slug; also the icon file name */
  slug: ClassSlug;
  /** English display name, as the API sends it */
  name: string;
  /** Blizzard class id */
  id: number;
  /** Key in `palette.class` */
  colorKey: PaletteClassKey;
}

export const CLASSES: readonly WowClass[] = [
  { slug: 'warrior', name: 'Warrior', id: 1, colorKey: 'warrior' },
  { slug: 'paladin', name: 'Paladin', id: 2, colorKey: 'paladin' },
  { slug: 'hunter', name: 'Hunter', id: 3, colorKey: 'hunter' },
  { slug: 'rogue', name: 'Rogue', id: 4, colorKey: 'rogue' },
  { slug: 'priest', name: 'Priest', id: 5, colorKey: 'priest' },
  { slug: 'deathknight', name: 'Death Knight', id: 6, colorKey: 'deathKnight' },
  { slug: 'shaman', name: 'Shaman', id: 7, colorKey: 'shaman' },
  { slug: 'mage', name: 'Mage', id: 8, colorKey: 'mage' },
  { slug: 'warlock', name: 'Warlock', id: 9, colorKey: 'warlock' },
  { slug: 'monk', name: 'Monk', id: 10, colorKey: 'monk' },
  { slug: 'druid', name: 'Druid', id: 11, colorKey: 'druid' },
  { slug: 'demonhunter', name: 'Demon Hunter', id: 12, colorKey: 'demonHunter' },
  { slug: 'evoker', name: 'Evoker', id: 13, colorKey: 'evoker' },
];

/** Letters only, lowercase: "Death Knight" → "deathknight" */
const fold = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

const byId = new Map<number, WowClass>();
const byName = new Map<string, WowClass>();
for (const c of CLASSES) {
  byId.set(c.id, c);
  byName.set(fold(c.name), c); // also covers the slug: fold(name) === slug for every class
}

/** Every shape the API uses for a class. */
export type ClassInput =
  number | string | { id?: number | null; name?: string | null } | null | undefined;

/** The class behind any API class value, or null if unknown. */
export function resolveClass(input: ClassInput): WowClass | null {
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

/**
 * Icon URL for an API class value, in the chosen style (falling back to the
 * other style when that one has no file). Undefined when the class is unknown.
 */
export function classIconUrl(input: ClassInput, { style }: { style: AssetStyle }) {
  const c = resolveClass(input);
  return c ? styledAssetUrl('classes', style, c.slug) : undefined;
}

/**
 * The class colour as a CSS var reference (`var(--color-class-death-knight)`),
 * so it can be overridden like any token. Undefined when the class is unknown.
 */
export function classColorVar(input: ClassInput): string | undefined {
  const c = resolveClass(input);
  if (!c) return undefined;
  const kebab = c.colorKey.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  return `var(--color-class-${kebab})`;
}
