import { useQuery } from '@tanstack/react-query';
import { linkOptions } from '@tanstack/react-router';
import type { PvpBoard, PvpBracket } from '@/api/pvp';
import type { PveBoard } from '@/api/pve';
import { pveTierListQuery, pvpTierListQuery } from '@/api/tierList';
import { regionLabel } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { useSite } from '@/lib/site';
import type { MessageKey } from '@/i18n/messages';
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
 * The Mythic+ tier list (`/pve/tier-list`) in a region; each spec links to its Mythic+
 * board (`…/mythic-plus/specs/<class>/<spec>`).
 */
export function PveTierList({ region }: { region: PveBoard }) {
  const { t, locale } = useI18n();
  const site = useSite();
  const list = useQuery(pveTierListQuery(region));
  return (
    <TierListWidget
      title={t('nav.tierList')}
      list={list.data}
      status={list.status}
      regionName={regionLabel(t, region)}
      floor={t('tier.floorScore', {
        min: (list.data?.minScore ?? 2000).toLocaleString(locale.htmlLang),
      })}
      averageTitle={t('tier.averageScore')}
      linkFor={(s) =>
        linkOptions({
          to: '/$game/$locale/pve/mythic-plus/specs/$class/$spec',
          params: { ...site, class: s.class, spec: s.spec },
        })
      }
    />
  );
}
