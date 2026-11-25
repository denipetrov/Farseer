import { createFileRoute } from '@tanstack/react-router';
import { MplusStatsPage } from '@/components/pve/MplusPages';
import { validateArchiveSearch } from '@/lib/mplusParams';

/** Spec Representation of an archived season (`?season=<slug>`). */
export const Route = createFileRoute('/$locale/pve/mythic-plus/archives/stats/representation')({
  validateSearch: validateArchiveSearch,
  component: () => <MplusStatsPage stat="representation" archive />,
});
