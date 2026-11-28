import { PveTierList } from '@/components/widgets/TierLists';
import { roleText } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { roleKindOfSlug } from '@/lib/wow/roles';
import { usePreferences } from '@/preferences/PreferencesProvider';
import type { MplusWidgetRole } from '@/preferences/storage';
import { MplusRoleWidget } from './MplusRoleWidget';
import styles from './PveHomeRole.module.css';

/**
 * One role on the PvE home (the user, 2026-11-28), as a bracket on the PvP home: that role's
 * specs on the Mythic+ tier list (mini, icon only) above its top-10 board, at the board's
 * width, in the region the board shows (moving with its dropdown). One grid cell, two rows
 * (subgrid), so the lists side by side share a height and the boards start level.
 */
export function PveHomeRole({ role }: { role: MplusWidgetRole }) {
  const { t } = useI18n();
  const region = usePreferences().preferences.mplusBoardRegions[role] ?? 'world';
  // "Melee DPS", "Ranged DPS", "Healers", "Tanks", as the board's title
  const name =
    role === 'healer'
      ? t('tier.role.healer')
      : role === 'tank'
        ? t('tier.role.tank')
        : roleText(t, roleKindOfSlug(role)!);
  return (
    // data-size: the grid places it as a medium widget (half the width)
    <div className={styles.column} data-size="medium">
      <PveTierList region={region} mini="medium" role={role} roleName={name} />
      <MplusRoleWidget role={role} />
    </div>
  );
}
