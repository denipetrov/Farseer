import { ApiStatus } from '@/components/ApiStatus';
import { Muted, Page, PageTitle } from '@/components/Page';
import { useI18n } from '@/i18n/useI18n';
import { GAME_MODE_LABELS, type GameMode } from '@/lib/gameMode';

/**
 * Placeholder home of a game mode (`/<lang>/pvp`, `/<lang>/pve`) until its dashboard is
 * built. Its pages are reached from the left menu.
 */
export function ModeHome({ mode }: { mode: GameMode }) {
  const { t } = useI18n();
  return (
    <Page>
      <PageTitle>{GAME_MODE_LABELS[mode]}</PageTitle>
      <Muted>{t(`mode.${mode}.intro`)}</Muted>
      <ApiStatus />
    </Page>
  );
}
