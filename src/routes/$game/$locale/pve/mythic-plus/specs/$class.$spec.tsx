import { createFileRoute, notFound } from '@tanstack/react-router';
import { SpecBoardPage } from '@/components/pve/MplusPages';
import { isSpecParams } from '@/lib/mplusParams';

/** One spec's Mythic+ board, the current season's: `…/specs/mage/fire` (Soulseeker's slugs). */
export const Route = createFileRoute('/$game/$locale/pve/mythic-plus/specs/$class/$spec')({
  beforeLoad: ({ params }) => {
    if (!isSpecParams(params)) throw notFound();
  },
  component: function Page() {
    const { class: cls, spec } = Route.useParams();
    return <SpecBoardPage cls={cls} spec={spec} />;
  },
});
