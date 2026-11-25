import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { useI18n } from '@/i18n/useI18n';

export const Route = createFileRoute('/$locale/pvp/fotm')({
  component: function Page() {
    const { t } = useI18n();
    return (
      <ComingSoonPage
        title={t('nav.fotm')}
        subtitle={t('fotm.subtitle')}
        icon="nav/flavour-of-the-month"
      />
    );
  },
});
