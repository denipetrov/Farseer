import { createFileRoute } from '@tanstack/react-router';
import { MplusStatsPage } from '@/components/pve/MplusPages';
import { validateArchiveSearch } from '@/lib/mplusParams';

/** Score cutoffs of an archived season (`?season=<slug>`): each season in `/pve/mplus-seasons` has its own. */
export const Route = createFileRoute('/$locale/pve/mythic-plus/archives/stats/cutoffs')({
  validateSearch: validateArchiveSearch,
  component: () => <MplusStatsPage stat="cutoffs" archive />,
});
