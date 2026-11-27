import { createFileRoute } from '@tanstack/react-router';
import { ArchivesPage } from '@/components/pvp/ArchivesPage';
import { validateArchiveSearch } from '@/lib/archive';

/** PvP Archives: a finished season's ladder (`?season&bracket&role&region&page`) */
export const Route = createFileRoute('/$game/$locale/pvp/archives')({
  validateSearch: validateArchiveSearch,
  component: function Page() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    return <ArchivesPage search={search} onSearch={(next) => void navigate({ search: next })} />;
  },
});
