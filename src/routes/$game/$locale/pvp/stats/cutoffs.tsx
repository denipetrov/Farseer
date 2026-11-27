import { createFileRoute } from '@tanstack/react-router';
import { isCutoffRegion, isTitleBracket, type CutoffRegion, type TitleBracket } from '@/api/pvp';
import { CutoffsPage } from '@/components/pvp/CutoffsPage';
import { usePreferences } from '@/preferences/PreferencesProvider';

/** `?bracket=` (Solo Shuffle when absent) and `?region=` (no World: cutoffs are per region) */
interface CutoffsSearch {
  bracket?: TitleBracket;
  region?: CutoffRegion;
}

/** PvP Stats → Cutoffs: a ladder's Rank One cutoffs in a region */
export const Route = createFileRoute('/$game/$locale/pvp/stats/cutoffs')({
  validateSearch: (search: Record<string, unknown>): CutoffsSearch => ({
    bracket:
      typeof search.bracket === 'string' && isTitleBracket(search.bracket)
        ? search.bracket
        : undefined,
    region: isCutoffRegion(search.region) ? search.region : undefined,
  }),
  component: function Page() {
    const search = Route.useSearch();
    const bracket = search.bracket ?? 'shuffle';
    // The region last picked for the bracket's leaderboard, unless World; else US
    const remembered = usePreferences().preferences.pvpBoardRegions[bracket];
    const region = search.region ?? (isCutoffRegion(remembered) ? remembered : 'us');
    return <CutoffsPage bracket={bracket} region={region} />;
  },
});
