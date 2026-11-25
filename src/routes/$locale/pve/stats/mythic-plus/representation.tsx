import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { useI18n } from '@/i18n/useI18n';
import { PVE_ICONS } from '@/components/nav/pveNav';

/** Which specs are played in Mythic+, and how much. */
export const Route = createFileRoute('/$locale/pve/stats/mythic-plus/representation')({
  component: function Page() {
    const { t } = useI18n();
    return <ComingSoonPage title={t('nav.representation')} icon={PVE_ICONS.representation} />;
  },
});
