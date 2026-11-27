import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  currentSeasonQuery,
  leaderboardQuery,
  pvpSeasonsQuery,
  type PvpBoard,
  type PvpBracket,
} from '@/api/pvp';
import { useI18n } from '@/i18n/useI18n';
import { lastReachablePage } from '@/lib/pagination';
import { ladderReward, seasonDates, seasonLabel, seasonReward } from '@/lib/wow/pvpSeason';
import { usePreferences } from '@/preferences/PreferencesProvider';
import styles from './SeasonInfo.module.css';

/**
 * The live PvP season, under a leaderboard page's heading (the user's request, 2026-11-27,
 * from `GET /pvp/seasons`): its name, its start and end in the region shown (World: the
 * first start, the last end), and the title the bracket awards with the rating it takes
 * there (3v3 Gladiator, RBG Hero of the faction chosen in the header). Nothing while the
 * list loads or if it fails: the board does not depend on it.
 *
 * Shuffle and Blitz award a title per spec, which the season list leaves out: on one spec's
 * ladder it comes from the leaderboard's own answer (`cutoff`, World `regionCutoffs`). The
 * query is the board's, with the same parameters, so it is one shared request.
 */
export function SeasonInfo({
  bracket,
  region,
  cls,
  spec,
  page,
  seasonId,
  picker,
}: {
  bracket: PvpBracket;
  region: PvpBoard;
  /** The class and spec of a spec ladder page (Soulseeker's slugs) */
  cls?: string;
  spec?: string;
  /** The board's page, so the query is the board's own */
  page: number;
  /** A finished season (the archives) instead of the live one */
  seasonId?: number;
  /** Shown in place of the season's name: the archives' season dropdown */
  picker?: ReactNode;
}) {
  const { t, locale } = useI18n();
  const { faction } = usePreferences().preferences;
  const seasons = useQuery(pvpSeasonsQuery());
  const season = seasons.data?.seasons.find((s) =>
    seasonId != null ? s.seasonId === seasonId : s.current,
  );

  // One spec's Shuffle or Blitz ladder: its title is in the board's answer
  const specLadder =
    seasonId == null && (bracket === 'shuffle' || bracket === 'blitz') && !!cls && !!spec;
  const current = useQuery({ ...currentSeasonQuery('world'), enabled: specLadder });
  const board = useQuery({
    // The LeaderboardWidget's parameters exactly (large size: 50 a page)
    ...leaderboardQuery({
      region,
      seasonId: current.data?.seasonId ?? 0,
      bracket,
      class: cls,
      spec,
      page: Math.min(page, lastReachablePage(Infinity, 50)),
      pageSize: 50,
    }),
    enabled: specLadder && !!current.data,
  });
  if (!season) return null;

  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale.htmlLang, { dateStyle: 'medium' }).format(new Date(iso));
  const dates = seasonDates(season, region);
  const reward = specLadder
    ? board.data && ladderReward(board.data, region, faction)
    : seasonReward(season, bracket, region, faction);
  const name = seasonLabel(season) ?? t('season.unnamed', { id: season.seasonId });

  return (
    <dl className={styles.facts}>
      <div>
        <dt>{t('season.label')}</dt>
        <dd>{picker ?? name}</dd>
      </div>
      {dates?.startsAt && (
        <div>
          <dt>{t('season.started')}</dt>
          <dd>
            <time dateTime={dates.startsAt}>{date(dates.startsAt)}</time>
          </dd>
        </div>
      )}
      {dates && (
        <div>
          <dt>{t(seasonId != null ? 'season.endedPast' : 'season.ended')}</dt>
          <dd>
            {dates.endsAt ? (
              <time dateTime={dates.endsAt}>{date(dates.endsAt)}</time>
            ) : (
              <span className={styles.live}>{t('season.ongoing')}</span>
            )}
          </dd>
        </div>
      )}
      {reward && (
        <div>
          <dt>{t('season.reward')}</dt>
          <dd>
            <span className={styles.title}>{reward.title}</span>
            {reward.rating != null && (
              <span className={styles.rating}>
                {t('season.cutoff', { rating: reward.rating.toLocaleString(locale.htmlLang) })}
              </span>
            )}
          </dd>
        </div>
      )}
    </dl>
  );
}
