import { createFileRoute } from '@tanstack/react-router';
import { ModeHome } from '@/components/ModeHome';
import { PvpHomeBracket } from '@/components/pvp/PvpHomeBracket';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';

/**
 * The PvP home (the user's layout, 2026-11-26): Solo Shuffle and 3v3 as medium boards, then
 * 2v2, Blitz and RBG as small ones; each with its tier list above it (2026-11-27).
 */
export const Route = createFileRoute('/$game/$locale/pvp/')({
  component: () => (
    <ModeHome mode="pvp">
      <WidgetGrid>
        <PvpHomeBracket bracket="shuffle" size="medium" />
        <PvpHomeBracket bracket="3v3" size="medium" />
        <PvpHomeBracket bracket="2v2" size="small" />
        <PvpHomeBracket bracket="blitz" size="small" />
        <PvpHomeBracket bracket="rbg" size="small" />
      </WidgetGrid>
    </ModeHome>
  ),
});
