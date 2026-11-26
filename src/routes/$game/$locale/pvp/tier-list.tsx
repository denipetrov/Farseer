import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { useI18n } from '@/i18n/useI18n';

export const Route = createFileRoute('/$game/$locale/pvp/tier-list')({
  component: function Page() {
    const { t } = useI18n();
    return <ComingSoonPage title={t('nav.tierList')} icon="nav/tier-list" />;
  },
});
