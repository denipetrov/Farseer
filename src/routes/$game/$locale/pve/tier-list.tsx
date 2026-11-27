import { createFileRoute } from '@tanstack/react-router';
import type { PveBoard } from '@/api/pve';
import { PVE_TIER_REGIONS } from '@/api/tierList';
import { TierListPage } from '@/components/tierList/TierListPage';
import { PveTierList } from '@/components/widgets/TierLists';

/** `?region=`: World when absent */
interface TierListSearch {
  region?: PveBoard;
}

/** The Mythic+ tier list: the current season's specs in tiers S to D. */
export const Route = createFileRoute('/$game/$locale/pve/tier-list')({
  validateSearch: (search: Record<string, unknown>): TierListSearch => ({
    region: PVE_TIER_REGIONS.includes(search.region as PveBoard)
      ? (search.region as PveBoard)
      : undefined,
  }),
  component: function Page() {
    const { region = 'world' } = Route.useSearch();
    return (
      <TierListPage active="mplus" region={region}>
        <PveTierList region={region} />
      </TierListPage>
    );
  },
});
