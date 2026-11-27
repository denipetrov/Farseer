import { useEffect } from 'react';
import type { PvpBracket } from '@/api/pvp';
import { Page, PageTitle } from '@/components/Page';
import { LeaderboardWidget } from '@/components/widgets/LeaderboardWidget';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { useI18n } from '@/i18n/useI18n';
import type { LeaderboardSearch } from '@/lib/leaderboardSearch';
import { ALL } from '@/lib/mplusParams';
import { resolveClass } from '@/lib/wow/classes';
import { resolveSpec } from '@/lib/wow/specs';
import { usePreferences } from '@/preferences/PreferencesProvider';

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
  const { t, name } = useI18n();
  const { preferences, setPreference } = usePreferences();

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
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Page>
      <PageTitle>{title}</PageTitle>
      <WidgetGrid>
        <LeaderboardWidget
          bracket={bracket}
          cls={c?.slug}
          spec={s?.slug}
          size="large"
          region={region}
          fullLink={false}
          page={page}
          // Page 1 and World are left out of the URL
          onPageChange={(next) => onSearch({ ...search, page: next > 1 ? next : undefined })}
          onRegionChange={(next) => onSearch({ region: next === 'world' ? undefined : next })}
        />
      </WidgetGrid>
    </Page>
  );
}
