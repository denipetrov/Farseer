import { createFileRoute, notFound } from '@tanstack/react-router';
import { isPvpBracket, type PvpBoard } from '@/api/pvp';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { useI18n } from '@/i18n/useI18n';

const REGIONS = ['world', 'us', 'eu', 'kr', 'tw'] as const satisfies readonly PvpBoard[];

/**
 * URL search params are the board's filters. All optional, so links stay clean; read them
 * with their defaults (region `world`, page 1). Invalid values are dropped, not rejected.
 */
export interface LeaderboardSearch {
  region?: PvpBoard;
  page?: number;
}

/** One PvP ladder family: `/<lang>/pvp/leaderboards/2v2`, `3v3`, `shuffle`, `blitz`, `rbg`. */
export const Route = createFileRoute('/$locale/pvp/leaderboards/$bracket')({
  beforeLoad: ({ params }) => {
    if (!isPvpBracket(params.bracket)) throw notFound();
  },
  validateSearch: (search: Record<string, unknown>): LeaderboardSearch => ({
    region: REGIONS.includes(search.region as PvpBoard) ? (search.region as PvpBoard) : undefined,
    page: Number(search.page) > 1 ? Math.floor(Number(search.page)) : undefined,
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { bracket } = Route.useParams();
  const { t } = useI18n();
  if (!isPvpBracket(bracket)) return null;
  return <ComingSoonPage title={t(`bracket.${bracket}`)} icon={`pvp/brackets/svg/${bracket}`} />;
}
