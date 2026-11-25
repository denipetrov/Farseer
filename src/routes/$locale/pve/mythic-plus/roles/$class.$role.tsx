import { createFileRoute, notFound } from '@tanstack/react-router';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { PVE_ICONS } from '@/components/nav/pveNav';
import { roleText } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { resolveClass } from '@/lib/wow/classes';
import { classRoleKinds, roleKindOfSlug, roleSlug } from '@/lib/wow/roles';

/**
 * One class in one role on the Mythic+ board: `/<lang>/pve/mythic-plus/roles/druid/melee`.
 * The role is `tank`, `healer`, `melee` or `ranged`, and must be one the class plays.
 */
export const Route = createFileRoute('/$locale/pve/mythic-plus/roles/$class/$role')({
  beforeLoad: ({ params }) => {
    const plays = classRoleKinds(params.class).some((k) => roleSlug(k) === params.role);
    if (!plays) throw notFound();
  },
  component: ClassRolePage,
});

function ClassRolePage() {
  const params = Route.useParams();
  const { t, name } = useI18n();
  const cls = resolveClass(params.class);
  const role = roleKindOfSlug(params.role);
  if (!cls || !role) return null;
  return (
    <ComingSoonPage
      title={`${name('classes', cls.id, cls.name)} · ${roleText(t, role)}`}
      subtitle={`${t('nav.mythicPlus')} · ${t('nav.mplusClassRoles')}`}
      icon={PVE_ICONS.mplusClassRoles}
    />
  );
}
