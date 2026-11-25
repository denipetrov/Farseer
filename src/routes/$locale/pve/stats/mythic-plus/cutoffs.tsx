import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { useI18n } from '@/i18n/useI18n';
import { PVE_ICONS } from '@/components/nav/pveNav';

/** The season's Mythic+ score cutoffs: titles and the top 0.1% / 1%. */
export const Route = createFileRoute('/$locale/pve/stats/mythic-plus/cutoffs')({
  component: function Page() {
    const { t } = useI18n();
    return <ComingSoonPage title={t('nav.cutoffs')} icon={PVE_ICONS.cutoffs} />;
  },
});
