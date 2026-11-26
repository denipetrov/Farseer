import { createFileRoute, notFound } from '@tanstack/react-router';
import { useEffect } from 'react';
import { PVP_BOARDS, isPvpBracket, type PvpBoard } from '@/api/pvp';
import { Page, PageTitle } from '@/components/Page';
import { LeaderboardWidget } from '@/components/widgets/LeaderboardWidget';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { useI18n } from '@/i18n/useI18n';
import { usePreferences } from '@/preferences/PreferencesProvider';

/**
 * URL search params are the board's filters. All optional, so links stay clean; read them
 * with their defaults (region `world`, page 1). Invalid values are dropped, not rejected.
 */
export interface LeaderboardSearch {
  region?: PvpBoard;
  page?: number;
}

/** One PvP ladder family: `/<lang>/pvp/leaderboards/2v2`, `3v3`, `shuffle`, `blitz`, `rbg`. */
export const Route = createFileRoute('/$game/$locale/pvp/leaderboards/$bracket')({
  beforeLoad: ({ params }) => {
    if (!isPvpBracket(params.bracket)) throw notFound();
  },
  validateSearch: (search: Record<string, unknown>): LeaderboardSearch => ({
    region: PVP_BOARDS.includes(search.region as PvpBoard)
      ? (search.region as PvpBoard)
      : undefined,
    page: Number(search.page) > 1 ? Math.floor(Number(search.page)) : undefined,
  }),
  component: LeaderboardPage,
});

/**
 * The whole ladder as the large leaderboard widget, 50 rows a page, with page controls above
 * and below. The page is in the URL (`?page=3`, absent on page 1), so a page can be shared
 * and the back button works. The region is the URL's when it names one (a shared link,
 * "View full leaderboard"), else the one last picked for this bracket; a new region goes
 * back to page 1.
 */
function LeaderboardPage() {
  const { bracket } = Route.useParams();
  const { region, page = 1 } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { t } = useI18n();
  const { preferences, setPreference } = usePreferences();

  // A link naming a region (shared, or "View full leaderboard") opens on it, and it becomes
  // the bracket's remembered choice, as a URL's game mode does
  const remembered = isPvpBracket(bracket) ? preferences.pvpBoardRegions[bracket] : undefined;
  useEffect(() => {
    if (isPvpBracket(bracket) && region && region !== remembered) {
      setPreference('pvpBoardRegions', { ...preferences.pvpBoardRegions, [bracket]: region });
    }
  }, [bracket, region, remembered, preferences.pvpBoardRegions, setPreference]);

  if (!isPvpBracket(bracket)) return null;
  return (
    <Page>
      <PageTitle>{t(`bracket.${bracket}`)}</PageTitle>
      <WidgetGrid>
        <LeaderboardWidget
          bracket={bracket}
          size="large"
          region={region}
          fullLink={false}
          page={page}
          // Page 1 and World are left out of the URL
          onPageChange={(next) =>
            void navigate({ search: (prev) => ({ ...prev, page: next > 1 ? next : undefined }) })
          }
          onRegionChange={(next) =>
            void navigate({ search: { region: next === 'world' ? undefined : next } })
          }
        />
      </WidgetGrid>
    </Page>
  );
}
