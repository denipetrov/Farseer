import { createFileRoute, notFound } from '@tanstack/react-router';
import { isPvpBracket } from '@/api/pvp';
import { PvpLeaderboardPage } from '@/components/pvp/PvpLeaderboardPage';
import { validateLeaderboardSearch } from '@/lib/leaderboardSearch';
import { isSpecParams } from '@/lib/mplusParams';

/**
 * One class or spec of a PvP ladder: `…/pvp/leaderboards/shuffle/mage/fire`, or
 * `…/shuffle/mage/all` for the whole class (Soulseeker's slugs; its `class=` and `spec=`).
 */
export const Route = createFileRoute('/$game/$locale/pvp/leaderboards/$bracket/$class/$spec')({
  beforeLoad: ({ params }) => {
    if (!isPvpBracket(params.bracket) || !isSpecParams(params)) throw notFound();
  },
  validateSearch: validateLeaderboardSearch,
  component: function SpecLadderPage() {
    const { bracket, class: cls, spec } = Route.useParams();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    if (!isPvpBracket(bracket)) return null;
    return (
      <PvpLeaderboardPage
        bracket={bracket}
        cls={cls}
        spec={spec}
        search={search}
        onSearch={(next) => void navigate({ search: next })}
      />
    );
  },
});
