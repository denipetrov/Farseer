import { createFileRoute } from '@tanstack/react-router';
import { ModeHome } from '@/components/ModeHome';
import { PveHomeRole } from '@/components/pve/PveHomeRole';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';

/**
 * The PvE home: each role's Mythic+ tier list over its top 10, two by two (the user,
 * 2026-11-28): Melee DPS and Ranged DPS, then Healers and Tanks.
 */
export const Route = createFileRoute('/$game/$locale/pve/')({
  component: () => (
    <ModeHome mode="pve">
      <WidgetGrid>
        <PveHomeRole role="melee" />
        <PveHomeRole role="ranged" />
        <PveHomeRole role="healer" />
        <PveHomeRole role="tank" />
      </WidgetGrid>
    </ModeHome>
  ),
});
