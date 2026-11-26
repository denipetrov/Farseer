import { createFileRoute, redirect } from '@tanstack/react-router';
import { readPreferences } from '@/preferences/storage';

/** `/retail/de` has no page of its own: it opens the home of the mode last chosen (PvP by default). */
export const Route = createFileRoute('/$game/$locale/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      href: `/${params.game}/${params.locale}/${readPreferences().gameMode}`,
      replace: true,
    });
  },
});
