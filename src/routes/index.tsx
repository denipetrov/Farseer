import { createFileRoute, redirect } from '@tanstack/react-router';
import { preferredLocale } from '@/i18n/preferredLocale';
import { DEFAULT_GAME } from '@/lib/games';
import { readPreferences } from '@/preferences/storage';

/**
 * `/` has no page of its own: it opens the home of the mode last chosen (PvP by default), in
 * the default game (Retail), in the language last chosen, else the browser's, else English:
 * `/retail/de/pvp`.
 */
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      href: `/${DEFAULT_GAME}/${preferredLocale()}/${readPreferences().gameMode}`,
      replace: true,
    });
  },
});
