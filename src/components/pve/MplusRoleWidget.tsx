import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useId } from 'react';
import { mplusSeasonsQuery } from '@/api/pve';
import { RoleIcon } from '@/components/RoleIcon';
import { WidgetFooter, WidgetHeader, WidgetTitle } from '@/components/widgets/Widget';
import { regionLabel, roleText } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { MPLUS_BOARDS, liveSeason } from '@/lib/mplusBoard';
import { useSite } from '@/lib/site';
import { roleKindOfSlug } from '@/lib/wow/roles';
import { usePreferences } from '@/preferences/PreferencesProvider';
import type { MplusRegion, MplusWidgetRole } from '@/preferences/storage';
import { MplusLeaderboard } from './MplusLeaderboard';
import styles from './MplusRoleWidget.module.css';

/**
 * One role's Mythic+ top 10 on the PvE home (the user, 2026-11-28: Melee DPS, Ranged DPS,
 * Healers and Tanks, two by two): the board's compact version (MplusLeaderboard medium)
 * under the role's icon and name, with a region dropdown (remembered per role, as the PvP
 * widgets' per bracket) and a link to the full board on that role and region.
 */
export function MplusRoleWidget({ role }: { role: MplusWidgetRole }) {
  const { t } = useI18n();
  const site = useSite();
  const selectId = useId();
  const { preferences, setPreference } = usePreferences();
  const region = preferences.mplusBoardRegions[role] ?? 'world';
  const season = liveSeason(useQuery(mplusSeasonsQuery()).data?.seasons, region);
  // "Melee DPS", "Ranged DPS", "Healers", "Tanks" (the user's names: the board's people)
  const title =
    role === 'healer'
      ? t('tier.role.healer')
      : role === 'tank'
        ? t('tier.role.tank')
        : roleText(t, roleKindOfSlug(role)!);

  return (
    <MplusLeaderboard
      size="medium"
      label={title}
      region={region}
      role={role}
      dungeons={season?.dungeons ?? []}
      season={season}
      header={
        <WidgetHeader>
          <WidgetTitle>
            {role === 'melee' || role === 'ranged' ? (
              <RoleIcon role="dps" subRole={role} />
            ) : (
              <RoleIcon role={role} />
            )}
            <span>{title}</span>
          </WidgetTitle>
          <label htmlFor={selectId} className="sr-only">
            {t('widget.region')}
          </label>
          <select
            id={selectId}
            className={styles.regionSelect}
            value={region}
            onChange={(e) =>
              setPreference('mplusBoardRegions', {
                ...preferences.mplusBoardRegions,
                [role]: e.target.value as MplusRegion,
              })
            }
          >
            {MPLUS_BOARDS.map((r) => (
              <option key={r} value={r}>
                {regionLabel(t, r)}
              </option>
            ))}
          </select>
        </WidgetHeader>
      }
      footer={
        <WidgetFooter>
          <span className={styles.fullLink}>
            <Link
              to="/$game/$locale/pve/mythic-plus/characters"
              params={site}
              search={{ role, region: region === 'world' ? undefined : region }}
            >
              {t('widget.viewFullLeaderboard')}
              <span aria-hidden>→</span>
            </Link>
          </span>
        </WidgetFooter>
      }
    />
  );
}
