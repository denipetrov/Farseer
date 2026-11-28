import { useQuery } from '@tanstack/react-query';
import { linkOptions } from '@tanstack/react-router';
import type { PvpBoard, PvpBracket } from '@/api/pvp';
import type { PveBoard } from '@/api/pve';
import { pveTierListQuery, pvpTierListQuery } from '@/api/tierList';
import { regionLabel } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { useSite } from '@/lib/site';
import type { MessageKey } from '@/i18n/messages';
import type { TierRole } from '@/lib/wow/tierRoles';
import { TierListWidget } from './TierListWidget';

/** Names too long for a small widget (as the ladders do) */
const SHORT: Partial<Record<PvpBracket, MessageKey>> = {
  blitz: 'bracketShort.blitz',
  rbg: 'bracketShort.rbg',
};

/**
 * A PvP bracket's tier list (`/pvp/tier-list`) in a region; each spec links to its ladder
 * on that bracket (`…/leaderboards/<bracket>/<class>/<spec>`).
 */
export function PvpTierList({
  bracket,
  region,
  compact,
  mini,
}: {
  bracket: PvpBracket;
  region: PvpBoard;
  /** Smaller, for the leaderboard pages */
  compact?: boolean;
  /** The home page's icon-only version at this width, linking to the full list */
  mini?: 'small' | 'medium';
}) {
  const { t, locale } = useI18n();
  const site = useSite();
  const list = useQuery(pvpTierListQuery(region, bracket));
  return (
    <TierListWidget
      // On the home page it names its bracket: "Solo Shuffle Tier List" ("RBG" when small)
      title={
        mini
          ? t('tier.pageTitle', {
              bracket: t(
                mini === 'small' && SHORT[bracket] ? SHORT[bracket] : `bracket.${bracket}`,
              ),
            })
          : t('nav.tierList')
      }
      list={list.data}
      status={list.status}
      regionName={regionLabel(t, region)}
      floor={t('tier.floorRating', {
        min: (list.data?.minRating ?? 1500).toLocaleString(locale.htmlLang),
      })}
      averageTitle={t('tier.averageRating')}
      compact={compact}
      mini={
        mini && {
          size: mini,
          fullLink: linkOptions({
            to: '/$game/$locale/pvp/tier-list',
            params: site,
            search: { bracket, region: region === 'world' ? undefined : region },
          }),
        }
      }
      linkFor={(s) =>
        linkOptions({
          to: '/$game/$locale/pvp/leaderboards/$bracket/$class/$spec',
          params: { ...site, bracket, class: s.class, spec: s.spec },
          search: region === 'world' ? {} : { region },
        })
      }
    />
  );
}

/**
 * The Mythic+ tier list (`/pve/tier-list`) in a region, as the PvP one: full on its page,
 * `compact` above the Mythic+ board, `mini` on the PvE home above each role's board (one
 * role's specs: `role`, the user, 2026-11-28). Each spec links to the Mythic+ board filtered
 * to it (`mythic-plus/characters?class&spec`): the per-spec pages are not built yet.
 */
export function PveTierList({
  region,
  compact,
  mini,
  role,
  roleName,
}: {
  region: PveBoard;
  /** Smaller, for the Mythic+ board page */
  compact?: boolean;
  /** The home page's icon-only version at this width, linking to the full list */
  mini?: 'small' | 'medium';
  /** One role's specs only (the home's role boards) */
  role?: TierRole;
  /** That role's name, for the mini title ("Healers Tier List") */
  roleName?: string;
}) {
  const { t, locale } = useI18n();
  const site = useSite();
  const list = useQuery(pveTierListQuery(region));
  return (
    <TierListWidget
      title={mini && roleName ? t('tier.pageTitle', { bracket: roleName }) : t('nav.tierList')}
      compact={compact}
      role={role}
      pve
      mini={
        mini && {
          size: mini,
          fullLink: linkOptions({
            to: '/$game/$locale/pve/tier-list',
            params: site,
            search: { region: region === 'world' ? undefined : region },
          }),
        }
      }
      list={list.data}
      status={list.status}
      regionName={regionLabel(t, region)}
      floor={t('tier.floorScore', {
        min: (list.data?.minScore ?? 2000).toLocaleString(locale.htmlLang),
      })}
      averageTitle={t('tier.averageScore')}
      linkFor={(s) =>
        linkOptions({
          to: '/$game/$locale/pve/mythic-plus/characters',
          params: site,
          search: {
            class: s.class,
            spec: s.spec,
            region: region === 'world' ? undefined : region,
          },
        })
      }
    />
  );
}
