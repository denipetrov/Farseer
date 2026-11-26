import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { gameNamesQuery } from '@/api/gameNames';
import { DEFAULT_LOCALE, localeBySlug, resolveLocaleSlug } from '@/i18n/locales';
import { loadMessages } from '@/i18n/messages';
import { usePreferences } from '@/preferences/PreferencesProvider';

/**
 * Every page lives under its game and language: `/retail/en/pvp`, `/retail/de/pve/…`.
 *
 * - Addresses are made canonical by the root route before this runs (`canonicalPath`: a
 *   missing game or language, another spelling of a language, a game not open yet).
 * - Before rendering, the language's own text is loaded (no flash of English); its game
 *   names (`/i18n/names`) are fetched in the background, English until they arrive.
 * - The URL's language is remembered and set as `<html lang>`.
 */
export const Route = createFileRoute('/$game/$locale')({
  beforeLoad: ({ params }) => {
    // The root route has made the address canonical already
    const slug = resolveLocaleSlug(params.locale) ?? DEFAULT_LOCALE.slug;
    return { locale: localeBySlug(slug) };
  },
  loader: async ({ context }) => {
    void context.queryClient.prefetchQuery(gameNamesQuery(context.locale.code));
    await loadMessages(context.locale.slug);
  },
  component: LocaleLayout,
});

function LocaleLayout() {
  const { locale } = Route.useRouteContext();
  const { preferences, setPreference } = usePreferences();

  useEffect(() => {
    document.documentElement.lang = locale.htmlLang;
    if (preferences.locale !== locale.slug) setPreference('locale', locale.slug);
  }, [locale, preferences.locale, setPreference]);

  return <Outlet />;
}
