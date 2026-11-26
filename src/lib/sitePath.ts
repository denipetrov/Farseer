import { resolveLocaleSlug, type LocaleSlug } from '@/i18n/locales';
import { DEFAULT_GAME, isGameEnabled, isGameSlug } from './games';

/**
 * The canonical form of an address: `/<game>/<language>/…` (the user's choice, 2026-11-26).
 * Null when it already is one, or for `/` (the index route opens the home).
 *
 * - `/en/pvp/…` (an old link, from before the game) → `/retail/en/pvp/…`
 * - `/pvp/…`, `/character/…` (no game, no language) → `/retail/<preferred>/pvp/…`
 * - `/forever/en/…` while Forever is off → `/retail/en/…`
 * - `/retail/de_DE/…`, `/retail/kr/…` (another spelling of a language) → its slug
 * - `/retail` alone, or `/retail/pvp/…` (no language) → the preferred one put in
 *
 * `preferred` is the language to use when the address names none.
 */
export function canonicalPath(pathname: string, preferred: LocaleSlug): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  let [first, ...rest] = segments as [string, ...string[]];
  let changed = false;

  if (isGameSlug(first)) {
    if (!isGameEnabled(first)) {
      first = DEFAULT_GAME;
      changed = true;
    }
  } else {
    // No game: the default one, in front of everything (the language is checked next)
    rest = [first, ...rest];
    first = DEFAULT_GAME;
    changed = true;
  }

  const locale = rest[0] ? resolveLocaleSlug(rest[0]) : null;
  if (!locale) {
    rest = [preferred, ...rest];
    changed = true;
  } else if (locale !== rest[0]) {
    rest = [locale, ...rest.slice(1)];
    changed = true;
  }

  if (!changed) return null;
  const trailing = pathname.endsWith('/') && rest.length > 1 ? '/' : '';
  return `/${[first, ...rest].join('/')}${trailing}`;
}
