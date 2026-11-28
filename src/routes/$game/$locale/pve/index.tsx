import { createFileRoute } from '@tanstack/react-router';
import { ModeHome } from '@/components/ModeHome';
import { MplusRoleWidget } from '@/components/pve/MplusRoleWidget';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';

/**
 * The PvE home: the Mythic+ top 10 of each role, two by two (the user, 2026-11-28): Melee
 * DPS and Ranged DPS, then Healers and Tanks.
 */
export const Route = createFileRoute('/$game/$locale/pve/')({
  component: () => (
    <ModeHome mode="pve">
      <WidgetGrid>
        <MplusRoleWidget role="melee" />
        <MplusRoleWidget role="ranged" />
        <MplusRoleWidget role="healer" />
        <MplusRoleWidget role="tank" />
      </WidgetGrid>
    </ModeHome>
  ),
});
