import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useId, useMemo } from 'react';
import { PVP_BOARDS, isLadderRole, pvpSeasonsQuery, type PvpBracket } from '@/api/pvp';
import { GameIcon } from '@/components/GameIcon';
import { Page, PageTitle } from '@/components/Page';
import { tabBar } from '@/components/tabBar';
import { IconFilter } from '@/components/widgets/IconFilter';
import { LeaderboardWidget } from '@/components/widgets/LeaderboardWidget';
import { WidgetFrame } from '@/components/widgets/Widget';
import { classSpecRoleTree } from '@/components/widgets/filterTrees';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { regionLabel } from '@/i18n/labels';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import {
  archiveBrackets,
  archiveFiltered,
  archiveSeasons,
  resolveArchive,
  type ArchiveSearch,
} from '@/lib/archive';
import { iconUrl } from '@/lib/assets';
import { useSite } from '@/lib/site';
import { seasonLabel } from '@/lib/wow/pvpSeason';
import { SeasonInfo } from './SeasonInfo';
import styles from './ArchivesPage.module.css';

const SHORT: Partial<Record<PvpBracket, MessageKey>> = {
  blitz: 'bracketShort.blitz',
  rbg: 'bracketShort.rbg',
};

/**
 * The PvP archives (the user's design, 2026-11-27): a finished season's ladder, as the
 * leaderboard pages show the live one, simplified to what Soulseeker keeps of it.
 *
 * - The heading (the bracket's icon and "3v3 Arena Archive"), and beside it the season's
 *   facts with a **dropdown of the finished seasons** in place of its name.
 * - A bar: the brackets that season has (Shuffle from season 34, Blitz from 38) and the
 *   regions.
 * - On Shuffle and Blitz the class -> spec / role filter (the user, 2026-11-27): they are
 *   archived per spec ladder, which Soulseeker serves by spec or by role, so the filter
 *   opens on DPS and a class picked alone asks for its spec. 2v2, 3v3 and RBG have none
 *   (archived rows there have no class).
 * - The large board with ARCHIVE_COLUMNS: place, name, rating, wins, losses, win %,
 *   faction. No tier list.
 *
 * Everything is in the URL (`?season=41&bracket=shuffle&role=healer&region=eu&page=2`), so
 * a view can be shared; each change but the page goes back to page 1.
 */
export function ArchivesPage({
  search,
  onSearch,
}: {
  search: ArchiveSearch;
  onSearch: (next: ArchiveSearch) => void;
}) {
  const { t, name } = useI18n();
  const site = useSite();
  const tree = useMemo(() => classSpecRoleTree(name, t), [name, t]);
  const selectId = useId();
  const seasons = useQuery(pvpSeasonsQuery());
  const list = seasons.data ? archiveSeasons(seasons.data.seasons) : [];
  const shown = seasons.data ? resolveArchive(search, seasons.data.seasons) : null;
  const region = search.region ?? 'world';
  const page = search.page ?? 1;

  if (!shown) {
    return (
      <Page className={styles.page}>
        <PageTitle className={styles.title}>{t('nav.archives')}</PageTitle>
        {seasons.isError && <p role="alert">{t('widget.unavailable')}</p>}
      </Page>
    );
  }

  const { seasonId, bracket, cls, spec, role } = shown;
  const art = iconUrl(`pvp/brackets/${bracket}`);
  // A link to this page with some of the view changed (page 1); World is left out
  const to = (next: Partial<ArchiveSearch>) => ({
    to: '/$game/$locale/pvp/archives' as const,
    params: site,
    // A key left out (World's region) must be absent from the URL too, or World would be
    // marked current beside the region picked
    activeOptions: { explicitUndefined: true },
    search: {
      season: seasonId,
      bracket,
      class: cls,
      spec,
      role,
      region: region === 'world' ? undefined : region,
      ...next,
    },
  });

  return (
    <Page className={styles.page}>
      <div className={styles.headingRow}>
        <PageTitle className={styles.title}>
          {art && <GameIcon src={art} label="" shape="round" />}
          <span>{t('archive.pageTitle', { bracket: t(`bracket.${bracket}`) })}</span>
        </PageTitle>
        <SeasonInfo
          bracket={bracket}
          region={region}
          page={page}
          seasonId={seasonId}
          picker={
            <>
              <label htmlFor={selectId} className="sr-only">
                {t('season.label')}
              </label>
              <select
                id={selectId}
                className={styles.seasonSelect}
                value={seasonId}
                onChange={(e) =>
                  onSearch({ season: Number(e.target.value), bracket, role, region: search.region })
                }
              >
                {list.map((s) => (
                  <option key={s.seasonId} value={s.seasonId}>
                    {seasonLabel(s) ?? t('season.unnamed', { id: s.seasonId })}
                  </option>
                ))}
              </select>
            </>
          }
        />
      </div>

      <div className={tabBar.bar} data-dense>
        <nav className={tabBar.group} aria-label={t('tabs.brackets')}>
          {archiveBrackets(seasonId).map((b) => {
            const bArt = iconUrl(`pvp/brackets/${b}`);
            return (
              <Link
                key={b}
                className={tabBar.tab}
                {...to({ bracket: b })}
                aria-current={b === bracket ? 'page' : undefined}
              >
                {bArt && <GameIcon src={bArt} label="" shape="round" />}
                <span title={SHORT[b] ? t(`bracket.${b}`) : undefined}>
                  {t(SHORT[b] ?? `bracket.${b}`)}
                </span>
              </Link>
            );
          })}
        </nav>
        <nav className={tabBar.group} aria-label={t('widget.region')}>
          {PVP_BOARDS.map((r) => (
            <Link
              key={r}
              className={tabBar.tab}
              {...to({ region: r === 'world' ? undefined : r })}
              aria-current={r === region ? 'page' : undefined}
            >
              {regionLabel(t, r)}
            </Link>
          ))}
        </nav>
      </div>

      <WidgetGrid dense>
        {archiveFiltered(bracket) && (
          <IconFilter
            options={tree}
            value={cls ? (spec ? [cls, spec] : [cls]) : role ? [role] : []}
            levels={[t('filter.classOrRole'), t('filter.spec')]}
            label={t('filter.leaderboard')}
            // A class with its spec, a role, or x (back to DPS); page 1
            onChange={([first, sp]) =>
              onSearch({
                season: seasonId,
                bracket,
                region: search.region,
                ...(first && !isLadderRole(first)
                  ? { class: first, spec: sp }
                  : { role: isLadderRole(first) ? first : undefined }),
              })
            }
          />
        )}
        {cls && !spec ? (
          // Archived ladders are per spec: a class alone has no board of its own
          <WidgetFrame size="large" className={styles.pickSpec}>
            <p>{t('archive.pickSpec')}</p>
          </WidgetFrame>
        ) : (
          <LeaderboardWidget
            // A new board is a new widget: no stale paging
            key={`${seasonId}-${bracket}-${cls}-${spec}-${role}-${region}`}
            bracket={bracket}
            cls={cls}
            spec={spec}
            role={role}
            size="large"
            region={region}
            header={false}
            fullLink={false}
            archiveSeason={seasonId}
            page={page}
            onPageChange={(next) => onSearch({ ...search, page: next > 1 ? next : undefined })}
          />
        )}
      </WidgetGrid>
    </Page>
  );
}
