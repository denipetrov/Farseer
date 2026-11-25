import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { useI18n } from '@/i18n/useI18n';

export const Route = createFileRoute('/$locale/pvp/archives')({
  component: function Page() {
    const { t } = useI18n();
    return <ComingSoonPage title={t('nav.archives')} icon="nav/archives" />;
  },
});
