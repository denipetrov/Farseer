import type { ReactNode } from 'react';
import { ApiStatus } from '@/components/ApiStatus';
import { Muted, Page, PageTitle } from '@/components/Page';
import { useI18n } from '@/i18n/useI18n';
import { GAME_MODE_LABELS, type GameMode } from '@/lib/gameMode';

/**
 * Home of a game mode (`/<lang>/pvp`, `/<lang>/pve`): its title and intro, then its widgets
 * (`children`) as they are built. Its pages are reached from the left menu.
 */
export function ModeHome({ mode, children }: { mode: GameMode; children?: ReactNode }) {
  const { t } = useI18n();
  return (
    <Page>
      <PageTitle>{GAME_MODE_LABELS[mode]}</PageTitle>
      <Muted>{t(`mode.${mode}.intro`)}</Muted>
      {children}
      <ApiStatus />
    </Page>
  );
}
