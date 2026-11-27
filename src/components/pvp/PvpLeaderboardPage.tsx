import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { isLadderRole, isTitleBracket, type PvpBoard, type PvpBracket } from '@/api/pvp';
import { GameIcon } from '@/components/GameIcon';
import { Page, PageTitle } from '@/components/Page';
import { LeaderboardWidget } from '@/components/widgets/LeaderboardWidget';
import { IconFilter } from '@/components/widgets/IconFilter';
import { PvpTierList } from '@/components/widgets/TierLists';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { classSpecRoleTree } from '@/components/widgets/filterTrees';
import { useI18n } from '@/i18n/useI18n';
import type { LeaderboardSearch } from '@/lib/leaderboardSearch';
import { iconUrl } from '@/lib/assets';
import { ALL } from '@/lib/mplusParams';
import { resolveClass } from '@/lib/wow/classes';
import { resolveSpec } from '@/lib/wow/specs';
import { roleKindOfSlug } from '@/lib/wow/roles';
import { roleText } from '@/i18n/labels';
import { useSite } from '@/lib/site';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { LeaderboardTabs } from './LeaderboardTabs';
import { RankOneCutoffs } from './RankOneCutoffs';
import { SeasonInfo } from './SeasonInfo';
import styles from './PvpLeaderboardPage.module.css';

/**
 * A whole ladder as the large leaderboard widget, 50 rows a page, with page controls above
 * and below: the bracket (`/pvp/leaderboards/shuffle`), or one class or spec in it
 * (`…/shuffle/mage/fire`, `…/shuffle/mage/all`). The page is in the URL (`?page=3`, absent
 * on page 1), so it can be shared and the back button works. The region is the URL's when
 * it names one (a shared link, "View full leaderboard"), else the one last picked for this
 * bracket; a new region goes back to page 1.
 */
export function PvpLeaderboardPage({
  bracket,
  cls,
  spec,
  search,
  onSearch,
}: {
  bracket: PvpBracket;
  /** Soulseeker's class slug, for a class or spec board */
  cls?: string;
  /** Soulseeker's spec slug, or `all` for the whole class */
  spec?: string;
  search: LeaderboardSearch;
  onSearch: (next: LeaderboardSearch) => void;
}) {
  const { region, page = 1 } = search;
  // A role is a bracket page's filter only (Soulseeker never pairs one with a spec)
  const role = cls ? undefined : search.role;
  const { t, name } = useI18n();
  const { preferences, setPreference } = usePreferences();
  const site = useSite();
  const navigate = useNavigate();
  const tree = useMemo(() => classSpecRoleTree(name, t), [name, t]);

  // A link naming a region (shared, or "View full leaderboard") opens on it, and it becomes
  // the bracket's remembered choice, as a URL's game mode does
  const remembered = preferences.pvpBoardRegions[bracket];
  useEffect(() => {
    if (region && region !== remembered) {
      setPreference('pvpBoardRegions', { ...preferences.pvpBoardRegions, [bracket]: region });
    }
  }, [bracket, region, remembered, preferences.pvpBoardRegions, setPreference]);

  // "Solo Shuffle · Mage · Fire": the class and spec in the page's language
  const c = cls ? resolveClass(cls) : undefined;
  const s = c && spec && spec !== ALL ? resolveSpec(spec, c.slug) : undefined;
  const title = [
    t(`bracket.${bracket}`),
    c && name('classes', c.id, c.name),
    s && name('specs', s.id, s.name),
    role && roleText(t, roleKindOfSlug(role)!),
  ]
    .filter(Boolean)
    .join(' · ');
  const bracketArt = iconUrl(`pvp/brackets/${bracket}`);

  // The region shown: as the widget reads it (this bracket's remembered one, else the URL's)
  const shownRegion = remembered ?? region ?? 'world';
  const pickRegion = (next: PvpBoard) => {
    setPreference('pvpBoardRegions', { ...preferences.pvpBoardRegions, [bracket]: next });
    // Page 1 and World are left out of the URL
    onSearch({ region: next === 'world' ? undefined : next, role });
  };

  return (
    <Page className={styles.page}>
      <div className={styles.headingRow}>
        {/* The bracket's icon beside the heading: the widget's own header is off here */}
        <PageTitle className={styles.title}>
          {bracketArt && <GameIcon src={bracketArt} label="" shape="round" />}
          <span>{title}</span>
        </PageTitle>
        <SeasonInfo
          bracket={bracket}
          region={shownRegion}
          cls={c?.slug}
          spec={s?.slug}
          page={page}
        />
      </div>
      {/* The page's own gap spaces it from the heading and the filter */}
      <LeaderboardTabs
        bracket={bracket}
        cls={c?.slug}
        spec={s?.slug}
        role={role}
        region={shownRegion}
        onRegion={pickRegion}
      />
      <WidgetGrid dense>
        {/* Below the bar, above the filter (the user, 2026-11-27): the bracket's tier list in
            the region shown; the page's bar is its bracket menu */}
        <PvpTierList bracket={bracket} region={shownRegion} compact />
        {/* Class → spec, or a role beside the classes: each pick opens that ladder (the menu's
            pages, a role as `?role=`), × the whole bracket. One pick in the top row. */}
        <IconFilter
          options={tree}
          value={c ? (s ? [c.slug, s.slug] : [c.slug]) : role ? [role] : []}
          levels={[t('filter.classOrRole'), t('filter.spec')]}
          label={t('filter.leaderboard')}
          onChange={([first, spec]) =>
            void (first && !isLadderRole(first)
              ? navigate({
                  to: '/$game/$locale/pvp/leaderboards/$bracket/$class/$spec',
                  params: { ...site, bracket, class: first, spec: spec ?? ALL },
                  search: { region },
                })
              : navigate({
                  to: '/$game/$locale/pvp/leaderboards/$bracket',
                  params: { ...site, bracket },
                  search: { region, role: isLadderRole(first) ? first : undefined },
                }))
          }
        />
        <LeaderboardWidget
          bracket={bracket}
          cls={c?.slug}
          spec={s?.slug}
          role={role}
          size="large"
          region={region}
          header={false}
          fullLink={false}
          page={page}
          // Page 1 is left out of the URL
          onPageChange={(next) => onSearch({ ...search, page: next > 1 ? next : undefined })}
        />
        {/* Below the ladder (the user, 2026-11-27): the Rank One cutoffs of a ladder with a
            title (not 2v2), and not on World: Blizzard sets the cutoffs per region */}
        {isTitleBracket(bracket) && shownRegion !== 'world' && (
          <RankOneCutoffs
            bracket={bracket}
            region={shownRegion}
            cls={c?.slug}
            spec={s?.slug}
            role={role}
          />
        )}
      </WidgetGrid>
    </Page>
  );
}
