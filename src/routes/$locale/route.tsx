import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';
import { gameNamesQuery } from '@/api/gameNames';
import { DEFAULT_LOCALE, localeBySlug, resolveLocaleSlug } from '@/i18n/locales';
import { loadMessages } from '@/i18n/messages';
import { usePreferences } from '@/preferences/PreferencesProvider';

/**
 * Every page lives under its language: `/en/pvp`, `/de/character/eu/draenor/name`.
 *
 * - A known spelling that isn't the slug (`/de_DE/…`, `/de-de/…`, `/kr/…`) is redirected
 *   to the slug.
 * - A first segment that names no language (`/pvp`, `/character/…`, an old link) is the
 *   root route's job: it puts the preferred language in front of the whole path.
 * - Before rendering, the language's own text is loaded (no flash of English); its game
 *   names (`/i18n/names`) are fetched in the background, English until they arrive.
 * - The URL's language is remembered and set as `<html lang>`.
 */
export const Route = createFileRoute('/$locale')({
  beforeLoad: ({ params, location }) => {
    // The root route already put a language in front of paths that name none
    const slug = resolveLocaleSlug(params.locale) ?? DEFAULT_LOCALE.slug;
    const rest = location.pathname.split('/').slice(2).join('/');
    if (slug !== params.locale) {
      throw redirect({ href: `/${slug}/${rest}${location.searchStr}`, replace: true });
    }
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
