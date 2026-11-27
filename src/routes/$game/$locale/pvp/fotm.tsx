import { createFileRoute } from '@tanstack/react-router';
import { FotmPage } from '@/components/pvp/FotmPage';
import { validateFotmSearch } from '@/lib/fotm';

/** PvP → FOTM: each spec's share by day over the last month (`?bracket&region&rating&role`) */
export const Route = createFileRoute('/$game/$locale/pvp/fotm')({
  validateSearch: validateFotmSearch,
  component: function Page() {
    return <FotmPage search={Route.useSearch()} />;
  },
});
