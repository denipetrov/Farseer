import { readPreferences } from '@/preferences/storage';
import { DEFAULT_LOCALE, localeFromBrowser, type LocaleSlug } from './locales';

/**
 * The language for a URL that names none (`/`, `/pvp`, an old link): the one last chosen,
 * else the browser's when it is one of ours, else English. Read outside React (redirects).
 */
export function preferredLocale(): LocaleSlug {
  return (
    readPreferences().locale ??
    (typeof navigator !== 'undefined' ? localeFromBrowser(navigator.languages ?? []) : null) ??
    DEFAULT_LOCALE.slug
  );
}
