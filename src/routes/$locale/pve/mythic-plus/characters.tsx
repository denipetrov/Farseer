import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { useI18n } from '@/i18n/useI18n';
import { PVE_ICONS } from '@/components/nav/pveNav';

/** Every character of the season by Mythic+ score. */
export const Route = createFileRoute('/$locale/pve/mythic-plus/characters')({
  component: function Page() {
    const { t } = useI18n();
    return <ComingSoonPage title={t('nav.mplusCharacters')} icon={PVE_ICONS.mplusCharacters} />;
  },
});
