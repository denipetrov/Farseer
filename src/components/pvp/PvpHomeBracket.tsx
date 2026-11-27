import type { PvpBracket } from '@/api/pvp';
import { LeaderboardWidget } from '@/components/widgets/LeaderboardWidget';
import { PvpTierList } from '@/components/widgets/TierLists';
import { usePreferences } from '@/preferences/PreferencesProvider';
import styles from './PvpHomeBracket.module.css';

/**
 * One bracket on the PvP home: its tier list above its ladder (the user, 2026-11-27), at
 * the ladder's width, in one grid cell so the pair stays together when the grid wraps. The
 * tier list follows the region the ladder shows (the bracket's remembered one), and moves
 * with it when the ladder's region dropdown changes it.
 */
export function PvpHomeBracket({
  bracket,
  size,
}: {
  bracket: PvpBracket;
  size: 'small' | 'medium';
}) {
  const region = usePreferences().preferences.pvpBoardRegions[bracket] ?? 'world';
  return (
    <div className={styles.column} data-size={size}>
      <PvpTierList bracket={bracket} region={region} mini={size} />
      <LeaderboardWidget bracket={bracket} size={size} />
    </div>
  );
}
