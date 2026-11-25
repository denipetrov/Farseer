import { createFileRoute, redirect } from '@tanstack/react-router';
import { readPreferences } from '@/preferences/storage';

/** `/de` has no page of its own: it opens the home of the mode last chosen (PvP by default). */
export const Route = createFileRoute('/$locale/')({
  beforeLoad: ({ params }) => {
    throw redirect({ href: `/${params.locale}/${readPreferences().gameMode}`, replace: true });
  },
});
