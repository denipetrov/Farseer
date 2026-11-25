import { createFileRoute } from '@tanstack/react-router';
import { MplusStatsPage } from '@/components/pve/MplusPages';
import { validateArchiveSearch } from '@/lib/mplusParams';

/** Compositions of an archived season (`?season=<slug>`). */
export const Route = createFileRoute('/$locale/pve/mythic-plus/archives/stats/compositions')({
  validateSearch: validateArchiveSearch,
  component: () => <MplusStatsPage stat="compositions" archive />,
});
