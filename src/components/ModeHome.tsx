import { Link } from '@tanstack/react-router';
import { ApiStatus } from '@/components/ApiStatus';
import { Muted, Page, PageTitle, Panel } from '@/components/Page';
import { GAME_MODE_LABELS, type GameMode } from '@/lib/gameMode';

const INTRO: Record<GameMode, string> = {
  pvp: 'Arena and battleground ladders, cutoffs, tier lists and PvP characters.',
  pve: 'Mythic+ and raid rankings, runs, characters and guilds.',
};

/** Placeholder home of a game mode (`/pvp`, `/pve`) until its dashboard is built. */
export function ModeHome({ mode }: { mode: GameMode }) {
  return (
    <Page>
      <PageTitle>{GAME_MODE_LABELS[mode]}</PageTitle>
      <Muted>{INTRO[mode]}</Muted>
      <ApiStatus />
      <Panel>
        <Link to="/leaderboards" search={{ region: 'eu' }}>
          Browse leaderboards →
        </Link>
      </Panel>
    </Page>
  );
}
