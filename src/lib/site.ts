import { useParams } from '@tanstack/react-router';
import { useI18n } from '@/i18n/useI18n';
import type { LocaleSlug } from '@/i18n/locales';
import { DEFAULT_GAME, isGameSlug, type GameSlug } from './games';

/**
 * Where a page is: its game and language, the two segments every address starts with
 * (`/retail/en/…`). Pass it as a link's params: `params: site`, or with the route's own
 * params, `params: { ...site, bracket }`.
 */
export interface SiteParams {
  game: GameSlug;
  locale: LocaleSlug;
}

/** The current page's game and language (the default game outside a game's pages). */
export function useSite(): SiteParams {
  const params = useParams({ strict: false }) as { game?: string };
  const { locale } = useI18n();
  return { game: isGameSlug(params.game) ? params.game : DEFAULT_GAME, locale: locale.slug };
}
