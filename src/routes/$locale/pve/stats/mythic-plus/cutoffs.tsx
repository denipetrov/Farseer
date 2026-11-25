import { createFileRoute } from '@tanstack/react-router';
import { MplusStatsPage } from '@/components/pve/MplusPages';

/** The season's Mythic+ score cutoffs: titles and the top 0.1% / 1%. */
export const Route = createFileRoute('/$locale/pve/stats/mythic-plus/cutoffs')({
  component: () => <MplusStatsPage stat="cutoffs" />,
});
