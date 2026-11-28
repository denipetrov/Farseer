import { createFileRoute } from '@tanstack/react-router';
import { MplusCharactersPage } from '@/components/pve/MplusCharactersPage';
import { validateMplusBoardSearch } from '@/lib/mplusBoard';

/** Every character by Mythic+ score: the current season's board (`?region&class&spec&role&page`) */
export const Route = createFileRoute('/$game/$locale/pve/mythic-plus/characters')({
  validateSearch: validateMplusBoardSearch,
  component: function Page() {
    const navigate = Route.useNavigate();
    return (
      <MplusCharactersPage
        search={Route.useSearch()}
        onSearch={(next) => void navigate({ search: next })}
      />
    );
  },
});
