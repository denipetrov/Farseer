import { Link } from '@tanstack/react-router';
import { PVP_BOARDS, PVP_BRACKETS, type PvpBoard, type PvpBracket } from '@/api/pvp';
import type { PveBoard } from '@/api/pve';
import { PVE_TIER_REGIONS } from '@/api/tierList';
import { GameIcon } from '@/components/GameIcon';
import { tabBar } from '@/components/tabBar';
import { regionLabel } from '@/i18n/labels';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { useSite } from '@/lib/site';

const SHORT: Partial<Record<PvpBracket, MessageKey>> = {
  blitz: 'bracketShort.blitz',
  rbg: 'bracketShort.rbg',
};

/**
 * The standalone tier list pages' bar (the user's design, 2026-11-27).
 * - PvP: its brackets on the left (each opens `/pvp/tier-list?bracket=`, the region kept),
 *   the regions on the right.
 * - Mythic+: the regions only (China included); it has a single list.
 * PvP and PvE are separate modes, so neither bar links to the other (the user, 2026-11-27).
 */
export function TierListTabs({
  active,
  region,
}: {
  active: PvpBracket | 'mplus';
  region: PvpBoard | PveBoard;
}) {
  const { t } = useI18n();
  const site = useSite();
  const pvpRegion = (PVP_BOARDS as readonly string[]).includes(region)
    ? (region as PvpBoard)
    : 'world';

  return (
    <div className={tabBar.bar}>
      {active !== 'mplus' && (
        <nav className={tabBar.group} aria-label={t('tabs.brackets')}>
          {PVP_BRACKETS.map((b) => {
            const art = iconUrl(`pvp/brackets/${b}`);
            return (
              <Link
                key={b}
                className={tabBar.tab}
                to="/$game/$locale/pvp/tier-list"
                params={site}
                // A key left out (World) must be absent from the URL too, or World is marked current
                activeOptions={{ explicitUndefined: true }}
                search={{ bracket: b, region: pvpRegion === 'world' ? undefined : pvpRegion }}
                aria-current={b === active ? 'page' : undefined}
              >
                {art && <GameIcon src={art} label="" shape="round" />}
                <span title={b in SHORT ? t(`bracket.${b}`) : undefined}>
                  {t(SHORT[b] ?? `bracket.${b}`)}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
      <nav className={tabBar.group} aria-label={t('widget.region')}>
        {(active === 'mplus' ? PVE_TIER_REGIONS : PVP_BOARDS).map((r) =>
          active === 'mplus' ? (
            <Link
              key={r}
              className={tabBar.tab}
              to="/$game/$locale/pve/tier-list"
              params={site}
              // A key left out (World) must be absent from the URL too, or World is marked current
              activeOptions={{ explicitUndefined: true }}
              search={{ region: r === 'world' ? undefined : (r as PveBoard) }}
              aria-current={r === region ? 'page' : undefined}
            >
              {regionLabel(t, r)}
            </Link>
          ) : (
            <Link
              key={r}
              className={tabBar.tab}
              to="/$game/$locale/pvp/tier-list"
              params={site}
              // A key left out (World) must be absent from the URL too, or World is marked current
              activeOptions={{ explicitUndefined: true }}
              search={{ bracket: active, region: r === 'world' ? undefined : (r as PvpBoard) }}
              aria-current={r === region ? 'page' : undefined}
            >
              {regionLabel(t, r)}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
