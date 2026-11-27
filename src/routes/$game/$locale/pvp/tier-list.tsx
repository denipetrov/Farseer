import { createFileRoute } from '@tanstack/react-router';
import { PVP_BOARDS, isPvpBracket, type PvpBoard, type PvpBracket } from '@/api/pvp';
import { TierListPage } from '@/components/tierList/TierListPage';
import { PvpTierList } from '@/components/widgets/TierLists';

/** `?bracket=` (Solo Shuffle when absent) and `?region=` (World when absent) */
interface TierListSearch {
  bracket?: PvpBracket;
  region?: PvpBoard;
}

/** The PvP tier list: one bracket's specs in tiers S to D, in a region or the world. */
export const Route = createFileRoute('/$game/$locale/pvp/tier-list')({
  validateSearch: (search: Record<string, unknown>): TierListSearch => ({
    bracket: isPvpBracket(search.bracket) ? search.bracket : undefined,
    region: PVP_BOARDS.includes(search.region as PvpBoard)
      ? (search.region as PvpBoard)
      : undefined,
  }),
  component: function Page() {
    const { bracket = 'shuffle', region = 'world' } = Route.useSearch();
    return (
      <TierListPage active={bracket} region={region}>
        <PvpTierList bracket={bracket} region={region} />
      </TierListPage>
    );
  },
});
