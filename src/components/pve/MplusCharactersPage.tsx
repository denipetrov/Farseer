import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { mplusSeasonsQuery, type PveBoard } from '@/api/pve';
import { isLadderRole } from '@/api/pvp';
import { GameIcon } from '@/components/GameIcon';
import { Page, PageTitle } from '@/components/Page';
import { tabBar } from '@/components/tabBar';
import { IconFilter } from '@/components/widgets/IconFilter';
import { PveTierList } from '@/components/widgets/TierLists';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { classSpecRoleTree } from '@/components/widgets/filterTrees';
import { regionLabel } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { MPLUS_BOARDS, liveSeason, type MplusBoardSearch } from '@/lib/mplusBoard';
import { useSite } from '@/lib/site';
import { MplusLeaderboard } from './MplusLeaderboard';
import { MplusSeasonInfo } from './MplusSeasonInfo';
import styles from './MplusCharactersPage.module.css';

/**
 * Mythic+ → Leaderboards → All Characters (the user, 2026-11-28): every character by
 * Mythic+ score this season, from `/pve/mplus-leaderboard`, on the large board
 * (MplusLeaderboard). Above it: the heading with the season's facts (MplusSeasonInfo: name,
 * dates, the region's top 0.1% and 1% scores), the region bar (World and the
 * five Raider.io regions, China included) and the leaderboard's class → spec / role filter.
 * Everything is in the URL (`?region=eu&class=mage&spec=fire&page=2`).
 */
export function MplusCharactersPage({
  search,
  onSearch,
}: {
  search: MplusBoardSearch;
  onSearch: (next: MplusBoardSearch) => void;
}) {
  const { t, name } = useI18n();
  const site = useSite();
  const tree = useMemo(() => classSpecRoleTree(name, t), [name, t]);
  const region = search.region ?? 'world';
  const page = search.page ?? 1;
  const { class: cls, spec, role } = search;

  // The live season: the region's own, on World the newest any region is on (Soulseeker's
  // `current`); its dungeons are the board's tile columns
  const season = liveSeason(useQuery(mplusSeasonsQuery()).data?.seasons, region);
  const art = iconUrl('game-modes/mplus');

  const linkFor = (r: PveBoard) => ({
    to: '/$game/$locale/pve/mythic-plus/characters' as const,
    params: site,
    search: { ...search, region: r === 'world' ? undefined : r, page: undefined },
    // A key left out must be absent from the URL too, or its tab is marked current
    activeOptions: { explicitUndefined: true },
  });

  return (
    <Page className={styles.page}>
      <div className={styles.headingRow}>
        <PageTitle className={styles.title}>
          {art && <GameIcon src={art} label="" shape="round" />}
          <span>{t('mplus.boardTitle')}</span>
        </PageTitle>
        {season && <MplusSeasonInfo season={season} region={region} />}
      </div>

      <div className={tabBar.bar} data-dense>
        <nav className={tabBar.group} aria-label={t('widget.region')}>
          {MPLUS_BOARDS.map((r) => (
            <Link
              key={r}
              className={tabBar.tab}
              {...linkFor(r)}
              aria-current={r === region ? 'page' : undefined}
            >
              {regionLabel(t, r)}
            </Link>
          ))}
        </nav>
      </div>

      <WidgetGrid dense>
        {/* Below the bar, above the filter, as on the PvP boards: the region's tier list */}
        <PveTierList region={region} compact />
        <IconFilter
          options={tree}
          value={cls ? (spec ? [cls, spec] : [cls]) : role ? [role] : []}
          levels={[t('filter.classOrRole'), t('filter.spec')]}
          label={t('filter.leaderboard')}
          onChange={([first, sp]) =>
            onSearch({
              region: search.region,
              ...(first && !isLadderRole(first)
                ? { class: first, spec: sp }
                : { role: isLadderRole(first) ? first : undefined }),
            })
          }
        />
        <MplusLeaderboard
          region={region}
          dungeons={season?.dungeons ?? []}
          season={season}
          cls={cls}
          spec={spec}
          role={role}
          page={page}
          // Page 1 is left out of the URL
          onPageChange={(next) => onSearch({ ...search, page: next > 1 ? next : undefined })}
        />
      </WidgetGrid>
    </Page>
  );
}
