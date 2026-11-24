import { createFileRoute, redirect } from '@tanstack/react-router';
import { readPreferences } from '@/preferences/storage';

/** `/` has no page of its own: it opens the home of the mode the user last chose (PvP by default). */
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: `/${readPreferences().gameMode}`, replace: true });
  },
});
