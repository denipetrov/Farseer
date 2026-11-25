import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { useI18n } from '@/i18n/useI18n';
import { PVE_ICONS } from '@/components/nav/pveNav';

/** The most played Mythic+ group compositions. */
export const Route = createFileRoute('/$locale/pve/stats/mythic-plus/compositions')({
  component: function Page() {
    const { t } = useI18n();
    return <ComingSoonPage title={t('nav.compositions')} icon={PVE_ICONS.compositions} />;
  },
});
