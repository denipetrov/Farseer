import { createFileRoute, notFound } from '@tanstack/react-router';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { PVE_ICONS } from '@/components/nav/pveNav';
import { useI18n } from '@/i18n/useI18n';
import { classOfSpec, resolveSpec } from '@/lib/wow/specs';

/** One spec's Mythic+ board: `/<lang>/pve/mythic-plus/specs/mage/fire` (Soulseeker's slugs). */
export const Route = createFileRoute('/$locale/pve/mythic-plus/specs/$class/$spec')({
  beforeLoad: ({ params }) => {
    if (!resolveSpec(params.spec, params.class)) throw notFound();
  },
  component: SpecPage,
});

function SpecPage() {
  const params = Route.useParams();
  const { t, name } = useI18n();
  const spec = resolveSpec(params.spec, params.class);
  if (!spec) return null;
  const cls = classOfSpec(spec);
  return (
    <ComingSoonPage
      title={`${name('specs', spec.id, spec.name)} · ${name('classes', cls.id, cls.name)}`}
      subtitle={`${t('nav.mythicPlus')} · ${t('nav.mplusSpecs')}`}
      icon={PVE_ICONS.mplusSpecs}
    />
  );
}
