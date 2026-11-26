import { createFileRoute } from '@tanstack/react-router';
import { MplusBoardPage } from '@/components/pve/MplusPages';
import { validateArchiveSearch } from '@/lib/mplusParams';

/** Every character by Mythic+ score: an archived season's (`?season=<slug>`) board. */
export const Route = createFileRoute('/$game/$locale/pve/mythic-plus/archives/characters')({
  validateSearch: validateArchiveSearch,
  component: () => <MplusBoardPage board="characters" archive />,
});
