import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { useI18n } from '@/i18n/useI18n';
import { PVE_ICONS } from '@/components/nav/pveNav';

/** The Mythic+ tier list: specs ranked by their results. */
export const Route = createFileRoute('/$locale/pve/tier-list')({
  component: function Page() {
    const { t } = useI18n();
    return <ComingSoonPage title={t('nav.tierList')} icon={PVE_ICONS.tierList} />;
  },
});
