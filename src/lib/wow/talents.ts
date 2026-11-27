/**
 * Talent loadouts: the code of the loadout a leaderboard row was played with, and the
 * Wowhead talent calculator that shows it.
 */
import type { LocaleSlug } from '@/i18n/locales';

interface Loadout {
  specId: number | null;
  spec: string | null;
  talentLoadoutCode: string | null;
  pvpTalents?: readonly PvpTalent[];
}

interface LoadoutRow {
  specId?: number | null;
  spec?: string | null;
  talentLoadouts?: readonly Loadout[];
}

export interface PvpTalent {
  slot: number;
  id: number;
  name: string;
  spellId: number | null;
}

/**
 * The loadout of the row's spec (the spec of the ladder on Shuffle and Blitz, the active
 * spec elsewhere), by spec id, else by spec slug. Null when there is none.
 */
function rowLoadout(row: LoadoutRow): Loadout | null {
  const loadouts = row.talentLoadouts ?? [];
  return (
    (row.specId != null && loadouts.find((l) => l.specId === row.specId)) ||
    (row.spec != null && loadouts.find((l) => l.spec === row.spec)) ||
    null
  );
}

/** The loadout code of the row's spec; null when there is none */
export function rowLoadoutCode(row: LoadoutRow): string | null {
  return rowLoadout(row)?.talentLoadoutCode || null;
}

/**
 * The game's three PvP talent slots, by Blizzard's slot number: 2, 3 and 4 (every stored
 * loadout on the live ladders, 2026-11-27; there is no slot 1).
 */
export const PVP_TALENT_SLOTS: readonly number[] = [2, 3, 4];

/**
 * The row's spec's PvP talents, always three entries, one per slot in order: the talent,
 * or null for an empty slot or when nothing is known yet. A talent with a slot number
 * outside 2–4 (should Blizzard renumber) takes the first free place, so it is still shown
 * and the row never grows past three.
 */
export function rowPvpTalents(row: LoadoutRow): (PvpTalent | null)[] {
  const talents = [...(rowLoadout(row)?.pvpTalents ?? [])].sort((a, b) => a.slot - b.slot);
  const places = PVP_TALENT_SLOTS.map((n) => talents.find((t) => t.slot === n) ?? null);
  for (const t of talents.filter((t) => !PVP_TALENT_SLOTS.includes(t.slot))) {
    const free = places.indexOf(null);
    if (free === -1) break;
    places[free] = t;
  }
  return places;
}

/** Wowhead in the site's language (`de.wowhead.com`); English is `www` */
const WOWHEAD_HOST: Record<LocaleSlug, string> = {
  en: 'www',
  es: 'es',
  pt: 'pt',
  fr: 'fr',
  de: 'de',
  ru: 'ru',
  ko: 'ko',
  cn: 'cn',
};

/**
 * Wowhead's talent calculator for an in-game loadout code (the user's example, 2026-11-26):
 * `https://www.wowhead.com/talent-calc/blizzard/<code>`. The code goes in as it is: it is
 * already URL-safe, and Wowhead reads it unescaped.
 */
export const wowheadTalentUrl = (code: string, locale: LocaleSlug): string =>
  `https://${WOWHEAD_HOST[locale]}.wowhead.com/talent-calc/blizzard/${code}`;

/** A spell's page on Wowhead in the site's language (a PvP talent's tooltip and details) */
export const wowheadSpellUrl = (spellId: number, locale: LocaleSlug): string =>
  `https://${WOWHEAD_HOST[locale]}.wowhead.com/spell=${spellId}`;
