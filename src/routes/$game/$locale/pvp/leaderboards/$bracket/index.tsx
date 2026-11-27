import { createFileRoute, notFound } from '@tanstack/react-router';
import { isPvpBracket } from '@/api/pvp';
import { PvpLeaderboardPage } from '@/components/pvp/PvpLeaderboardPage';
import { validateLeaderboardSearch } from '@/lib/leaderboardSearch';

/** One PvP ladder family: `/<game>/<lang>/pvp/leaderboards/2v2`, `3v3`, `shuffle`, `blitz`, `rbg`. */
export const Route = createFileRoute('/$game/$locale/pvp/leaderboards/$bracket/')({
  beforeLoad: ({ params }) => {
    if (!isPvpBracket(params.bracket)) throw notFound();
  },
  validateSearch: validateLeaderboardSearch,
  component: function BracketPage() {
    const { bracket } = Route.useParams();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    if (!isPvpBracket(bracket)) return null;
    return (
      <PvpLeaderboardPage
        bracket={bracket}
        search={search}
        onSearch={(next) => void navigate({ search: next })}
      />
    );
  },
});
