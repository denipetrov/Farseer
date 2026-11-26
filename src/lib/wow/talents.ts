/**
 * Talent loadouts: the code of the loadout a leaderboard row was played with, and the
 * Wowhead talent calculator that shows it.
 */
import type { LocaleSlug } from '@/i18n/locales';

interface LoadoutRow {
  specId?: number | null;
  spec?: string | null;
  talentLoadouts?: readonly {
    specId: number | null;
    spec: string | null;
    talentLoadoutCode: string | null;
  }[];
}

/**
 * The loadout code of the row's spec (the spec of the ladder on Shuffle and Blitz, the
 * active spec elsewhere), by spec id, else by spec slug. Null when there is none.
 */
export function rowLoadoutCode(row: LoadoutRow): string | null {
  const loadouts = row.talentLoadouts ?? [];
  const match =
    (row.specId != null && loadouts.find((l) => l.specId === row.specId)) ||
    (row.spec != null && loadouts.find((l) => l.spec === row.spec)) ||
    null;
  return match?.talentLoadoutCode || null;
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
