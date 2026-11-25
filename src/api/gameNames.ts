/**
 * `GET /i18n/names?locale=de_DE`: game names in one language, from Blizzard's Game Data,
 * to translate what Raider.io (and so most PvE answers) sends in English.
 *
 * Names are keyed the way every other answer identifies things: classes, specs, races,
 * hero talent trees and affixes by Blizzard id; dungeons, raids and bosses by slug. A name
 * Blizzard has no entry for is left out: keep the English name. Soulseeker rebuilds them
 * about once a week (`builtAt`). Types mirror Soulseeker's `game-names.types.ts`.
 */
import { queryOptions } from '@tanstack/react-query';
import type { LocaleCode } from '@/i18n/locales';
import { api } from '.';

export interface GameNamesResponse {
  locale: LocaleCode;
  /** When the names were read from Blizzard */
  builtAt: string;
  /** By Blizzard class id (`classId`) */
  classes: Record<string, string>;
  /** By Blizzard spec id (`specId`) */
  specs: Record<string, string>;
  /** By Blizzard race id (`raceId`) */
  races: Record<string, string>;
  /** By Blizzard hero talent tree id (`heroTalentId`) */
  heroTalents: Record<string, string>;
  /** By keystone affix id */
  affixes: Record<string, string>;
  /** By dungeon slug */
  dungeons: Record<string, string>;
  /** By raid slug, each with its bosses by boss slug */
  raids: Record<string, { name: string | null; bosses: Record<string, string> }>;
}

export const gameNamesQuery = (locale: LocaleCode) =>
  queryOptions({
    queryKey: ['i18n', 'names', locale],
    queryFn: ({ signal }) => api.get<GameNamesResponse>('/i18n/names', { locale }, signal),
    // Names change about once a week: one fetch per language per visit is plenty
    staleTime: 60 * 60_000,
    gcTime: 24 * 60 * 60_000,
  });
