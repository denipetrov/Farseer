import { createFileRoute, redirect } from '@tanstack/react-router';
import { preferredLocale } from '@/i18n/preferredLocale';
import { readPreferences } from '@/preferences/storage';

/**
 * `/` has no page of its own: it opens the home of the mode last chosen (PvP by default), in
 * the language last chosen, else the browser's, else English: `/de/pvp`.
 */
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      href: `/${preferredLocale()}/${readPreferences().gameMode}`,
      replace: true,
    });
  },
});
