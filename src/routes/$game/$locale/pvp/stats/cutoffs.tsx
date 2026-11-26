import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { useI18n } from '@/i18n/useI18n';

export const Route = createFileRoute('/$game/$locale/pvp/stats/cutoffs')({
  component: function Page() {
    const { t } = useI18n();
    return <ComingSoonPage title={t('nav.cutoffs')} icon="nav/cutoffs" />;
  },
});
