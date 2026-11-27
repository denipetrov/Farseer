import { Link } from '@tanstack/react-router';
import { PVP_BOARDS, PVP_BRACKETS, type PvpBoard, type PvpBracket } from '@/api/pvp';
import { GameIcon } from '@/components/GameIcon';
import { regionLabel } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { ALL } from '@/lib/mplusParams';
import { useSite } from '@/lib/site';
import { usePreferences } from '@/preferences/PreferencesProvider';
import type { MessageKey } from '@/i18n/messages';
import styles from './LeaderboardTabs.module.css';

const SHORT: Partial<Record<PvpBracket, MessageKey>> = {
  blitz: 'bracketShort.blitz',
  rbg: 'bracketShort.rbg',
};

/**
 * The full leaderboard pages' bar (the user's design, 2026-11-27): the brackets on the
 * left, the regions on the right, in place of the widget's own header.
 *
 * - A bracket keeps the class or spec filter (`3v3/mage/fire` → `shuffle/mage/fire`) and
 *   the region (it becomes that bracket's remembered one too), from page 1.
 * - A region is the old dropdown: remembered for this bracket, page 1.
 */
export function LeaderboardTabs({
  bracket,
  cls,
  spec,
  region,
  onRegion,
}: {
  bracket: PvpBracket;
  cls?: string;
  spec?: string;
  /** The region shown */
  region: PvpBoard;
  onRegion: (region: PvpBoard) => void;
}) {
  const { t } = useI18n();
  const site = useSite();
  const { preferences, setPreference } = usePreferences();
  const search = { region: region === 'world' ? undefined : region };

  return (
    <div className={styles.bar}>
      <nav className={styles.group} aria-label={t('tabs.brackets')}>
        {PVP_BRACKETS.map((b) => {
          const art = iconUrl(`pvp/brackets/${b}`);
          const content = (
            <>
              {art && <GameIcon src={art} label="" shape="round" />}
              {/* The short names ("BG Blitz", "RBG") keep the bar on one line; the full one on hover */}
              <span title={b in SHORT ? t(`bracket.${b}`) : undefined}>
                {t(SHORT[b] ?? `bracket.${b}`)}
              </span>
            </>
          );
          // The region comes along: the next bracket remembers it as its own
          const keepRegion = () =>
            setPreference('pvpBoardRegions', { ...preferences.pvpBoardRegions, [b]: region });
          const current = b === bracket;
          return cls ? (
            <Link
              key={b}
              className={styles.tab}
              to="/$game/$locale/pvp/leaderboards/$bracket/$class/$spec"
              params={{ ...site, bracket: b, class: cls, spec: spec ?? ALL }}
              search={search}
              aria-current={current ? 'page' : undefined}
              onClick={keepRegion}
            >
              {content}
            </Link>
          ) : (
            <Link
              key={b}
              className={styles.tab}
              to="/$game/$locale/pvp/leaderboards/$bracket"
              params={{ ...site, bracket: b }}
              search={search}
              aria-current={current ? 'page' : undefined}
              onClick={keepRegion}
            >
              {content}
            </Link>
          );
        })}
      </nav>
      <div className={styles.group} role="group" aria-label={t('widget.region')}>
        {PVP_BOARDS.map((r) => (
          <button
            key={r}
            type="button"
            className={styles.tab}
            aria-pressed={r === region}
            onClick={() => onRegion(r)}
          >
            {regionLabel(t, r)}
          </button>
        ))}
      </div>
    </div>
  );
}
