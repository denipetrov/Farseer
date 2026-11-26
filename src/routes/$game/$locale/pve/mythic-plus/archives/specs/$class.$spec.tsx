import { createFileRoute, notFound } from '@tanstack/react-router';
import { SpecBoardPage } from '@/components/pve/MplusPages';
import { isSpecParams, validateArchiveSearch } from '@/lib/mplusParams';

/** One spec's Mythic+ board, an archived season's (`?season=<slug>`): `…/specs/mage/fire` (Soulseeker's slugs). */
export const Route = createFileRoute('/$game/$locale/pve/mythic-plus/archives/specs/$class/$spec')({
  beforeLoad: ({ params }) => {
    if (!isSpecParams(params)) throw notFound();
  },
  validateSearch: validateArchiveSearch,
  component: function Page() {
    const { class: cls, spec } = Route.useParams();
    return <SpecBoardPage cls={cls} spec={spec} archive />;
  },
});
