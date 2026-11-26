import { createFileRoute } from '@tanstack/react-router';
import { MplusStatsPage } from '@/components/pve/MplusPages';

/** Which specs are played in Mythic+, and how much. */
export const Route = createFileRoute('/$game/$locale/pve/stats/mythic-plus/representation')({
  component: () => <MplusStatsPage stat="representation" />,
});
