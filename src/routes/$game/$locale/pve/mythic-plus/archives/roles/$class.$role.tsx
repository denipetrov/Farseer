import { createFileRoute, notFound } from '@tanstack/react-router';
import { ClassRoleBoardPage } from '@/components/pve/MplusPages';
import { isClassRoleParams, validateArchiveSearch } from '@/lib/mplusParams';

/**
 * One class in one role on the Mythic+ board, an archived season's (`?season=<slug>`): `…/roles/druid/melee`. The role
 * is `tank`, `healer`, `melee` or `ranged`, and must be one the class plays.
 */
export const Route = createFileRoute('/$game/$locale/pve/mythic-plus/archives/roles/$class/$role')({
  beforeLoad: ({ params }) => {
    if (!isClassRoleParams(params)) throw notFound();
  },
  validateSearch: validateArchiveSearch,
  component: function Page() {
    const { class: cls, role } = Route.useParams();
    return <ClassRoleBoardPage cls={cls} role={role} archive />;
  },
});
