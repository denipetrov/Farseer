import { createFileRoute } from '@tanstack/react-router';
import { ModeHome } from '@/components/ModeHome';
import { LeaderboardWidget } from '@/components/widgets/LeaderboardWidget';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';

/**
 * The PvP home (the user's layout, 2026-11-26): Solo Shuffle and 3v3 as medium boards, then
 * 2v2, Blitz and RBG as small ones.
 */
export const Route = createFileRoute('/$game/$locale/pvp/')({
  component: () => (
    <ModeHome mode="pvp">
      <WidgetGrid>
        <LeaderboardWidget bracket="shuffle" size="medium" />
        <LeaderboardWidget bracket="3v3" size="medium" />
        <LeaderboardWidget bracket="2v2" size="small" />
        <LeaderboardWidget bracket="blitz" size="small" />
        <LeaderboardWidget bracket="rbg" size="small" />
      </WidgetGrid>
    </ModeHome>
  ),
});
