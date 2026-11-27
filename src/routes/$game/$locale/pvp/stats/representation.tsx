import { createFileRoute } from '@tanstack/react-router';
import { RepresentationPage } from '@/components/pvp/RepresentationPage';
import { validateRepresentationSearch } from '@/lib/representation';

/** PvP Stats → Spec Representation (`?bracket&region&rating&role&day`) */
export const Route = createFileRoute('/$game/$locale/pvp/stats/representation')({
  validateSearch: validateRepresentationSearch,
  component: function Page() {
    return <RepresentationPage search={Route.useSearch()} />;
  },
});
