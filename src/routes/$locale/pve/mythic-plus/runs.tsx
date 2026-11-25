import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { useI18n } from '@/i18n/useI18n';
import { PVE_ICONS } from '@/components/nav/pveNav';

/** The best timed runs of the season. */
export const Route = createFileRoute('/$locale/pve/mythic-plus/runs')({
  component: function Page() {
    const { t } = useI18n();
    return <ComingSoonPage title={t('nav.mplusRuns')} icon={PVE_ICONS.mplusRuns} />;
  },
});
