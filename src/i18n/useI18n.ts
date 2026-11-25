import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { useMemo } from 'react';
import { gameNamesQuery, type GameNamesResponse } from '@/api/gameNames';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { DEFAULT_LOCALE, localeBySlug, resolveLocaleSlug, type Locale } from './locales';
import { translator, type Translate } from './messages';

/** A translated game name by id or slug, or the English fallback the caller already has. */
export type GameName = (
  kind: 'classes' | 'specs' | 'races' | 'heroTalents' | 'affixes' | 'dungeons',
  key: string | number | null | undefined,
  fallback: string,
) => string;

export interface I18n {
  locale: Locale;
  /** The front end's own text (`messages/<slug>.json`) */
  t: Translate;
  /** Game names from `/i18n/names`, by id or slug; English until they arrive */
  name: GameName;
  names: GameNamesResponse | undefined;
}

/**
 * The current language, its text and its game names.
 *
 * The language is the URL's first segment (`/de/pvp`); outside a language route (the `/`
 * redirect, the not-found page of an unknown path) it is the remembered one, else English.
 * Messages are loaded by the `$locale` route before it renders, so `t` never shows a flash
 * of English. Game names are fetched in the background; until they arrive, and for anything
 * Blizzard has no name for, the English name from our own tables is used.
 */
export function useI18n(): I18n {
  const params = useParams({ strict: false });
  const { preferences } = usePreferences();
  const slug =
    resolveLocaleSlug((params as { locale?: string }).locale) ??
    preferences.locale ??
    DEFAULT_LOCALE.slug;
  const locale = localeBySlug(slug);

  const { data: names } = useQuery(gameNamesQuery(locale.code));

  return useMemo<I18n>(
    () => ({
      locale,
      t: translator(locale.slug),
      names,
      name: (kind, key, fallback) => (key != null && names?.[kind][String(key)]) || fallback,
    }),
    [locale, names],
  );
}
