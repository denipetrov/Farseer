import { createFileRoute } from '@tanstack/react-router';
import { MplusBoardPage } from '@/components/pve/MplusPages';

/** Every character by Mythic+ score: the current season's board. */
export const Route = createFileRoute('/$game/$locale/pve/mythic-plus/characters')({
  component: () => <MplusBoardPage board="characters" />,
});
