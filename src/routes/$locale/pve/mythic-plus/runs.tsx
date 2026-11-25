import { createFileRoute } from '@tanstack/react-router';
import { MplusBoardPage } from '@/components/pve/MplusPages';

/** The best timed runs: the current season's board. */
export const Route = createFileRoute('/$locale/pve/mythic-plus/runs')({
  component: () => <MplusBoardPage board="runs" />,
});
