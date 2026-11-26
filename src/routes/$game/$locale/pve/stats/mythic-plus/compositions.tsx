import { createFileRoute } from '@tanstack/react-router';
import { MplusStatsPage } from '@/components/pve/MplusPages';

/** The most played Mythic+ group compositions. */
export const Route = createFileRoute('/$game/$locale/pve/stats/mythic-plus/compositions')({
  component: () => <MplusStatsPage stat="compositions" />,
});
