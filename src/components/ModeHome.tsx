import { Link } from '@tanstack/react-router';
import { ApiStatus } from '@/components/ApiStatus';
import { Muted, Page, PageTitle, Panel } from '@/components/Page';
import { useI18n } from '@/i18n/useI18n';
import { GAME_MODE_LABELS, type GameMode } from '@/lib/gameMode';

/** Placeholder home of a game mode (`/<lang>/pvp`, `/<lang>/pve`) until its dashboard is built. */
export function ModeHome({ mode }: { mode: GameMode }) {
  const { locale, t } = useI18n();
  return (
    <Page>
      <PageTitle>{GAME_MODE_LABELS[mode]}</PageTitle>
      <Muted>{t(`mode.${mode}.intro`)}</Muted>
      <ApiStatus />
      <Panel>
        <Link to="/$locale/leaderboards" params={{ locale: locale.slug }} search={{ region: 'eu' }}>
          {t('mode.browseLeaderboards')}
        </Link>
      </Panel>
    </Page>
  );
}
