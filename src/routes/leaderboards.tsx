import { createFileRoute } from '@tanstack/react-router';
import { Page, PageTitle, Panel, Muted } from '@/components/Page';

export const REGIONS = ['us', 'eu', 'kr', 'tw'] as const;
export type Region = (typeof REGIONS)[number];

/** URL search params act as the filters for the leaderboard data. All optional → clean URLs. */
export interface LeaderboardSearch {
  region?: Region;
  realm?: string;
  page?: number;
}

const DEFAULTS = { region: 'eu', page: 1 } as const satisfies LeaderboardSearch;

export const Route = createFileRoute('/leaderboards')({
  // Drop anything invalid so it falls back to the default
  validateSearch: (search: Record<string, unknown>): LeaderboardSearch => ({
    region: REGIONS.includes(search.region as Region) ? (search.region as Region) : undefined,
    realm: typeof search.realm === 'string' && search.realm ? search.realm : undefined,
    page: Number(search.page) > 1 ? Math.floor(Number(search.page)) : undefined,
  }),
  component: LeaderboardsPage,
});

function LeaderboardsPage() {
  const search = Route.useSearch();
  const filters = {
    region: search.region ?? DEFAULTS.region,
    realm: search.realm,
    page: search.page ?? DEFAULTS.page,
  };

  return (
    <Page>
      <PageTitle>Leaderboards</PageTitle>
      <Panel>
        <Muted>Active filters (from URL):</Muted>
        <pre>{JSON.stringify(filters, null, 2)}</pre>
      </Panel>
    </Page>
  );
}
