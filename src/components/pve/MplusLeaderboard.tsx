import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import {
  mplusLeaderboardQuery,
  type MplusDungeon,
  type MplusDungeonRun,
  type MplusLeaderboardEntry,
  type MplusSeason,
  type PveBoard,
} from '@/api/pve';
import { ClassIcon } from '@/components/ClassIcon';
import { FactionIcon } from '@/components/FactionIcon';
import { Pagination } from '@/components/Pagination';
import { RaceIcon } from '@/components/RaceIcon';
import { SpecIcon } from '@/components/SpecIcon';
import { UnknownIcon } from '@/components/UnknownIcon';
import { WidgetFrame } from '@/components/widgets/Widget';
import { useI18n } from '@/i18n/useI18n';
import { cx } from '@/lib/cx';
import {
  clock,
  runState,
  runsBySeasonDungeon,
  scoreTier,
  tierCutoffs,
  type ScoreTier,
} from '@/lib/mplusBoard';
import { iconUrl } from '@/lib/assets';
import { regionLabel } from '@/i18n/labels';
import { lastReachablePage } from '@/lib/pagination';
import { useSite } from '@/lib/site';
import { classColorKey, classIconUrl } from '@/lib/wow/classes';
import { factionIconUrl } from '@/lib/wow/factions';
import { raceIconUrl } from '@/lib/wow/races';
import { scoreColor } from '@/lib/wow/mplusScoreColor';
import { specIconUrl } from '@/lib/wow/specs';
import { usePreferences } from '@/preferences/PreferencesProvider';
import styles from './MplusLeaderboard.module.css';

/** Rows a page: the full board's 50, a home widget's 10 */
const ROWS = { large: 50, medium: 10 } as const;

/**
 * The Mythic+ character board, large (the user's design, 2026-11-28): the PvP board's
 * look without what Mythic+ lacks (hero talents, wins and losses), and a tile per season
 * dungeon instead: its art, the key level on it, the run's details on hover.
 *
 * Columns: place, player (race, class and spec icons, the name in the class colour linking
 * to the PvE character page, the realm), dungeons, score (its trend against the previous
 * one; coloured on the season's scale: mplusScoreColor.ts), faction. Paged 50 a page,
 * controls above and below.
 *
 * `size="medium"` is the home page's widget (the user, 2026-11-28): the top 10, no dungeon
 * tiles, realm or paging, the column titles for screen readers only; its owner gives the
 * header and footer (MplusRoleWidget).
 */
export function MplusLeaderboard({
  region,
  dungeons,
  season,
  cls,
  spec,
  role,
  page = 1,
  onPageChange,
  size = 'large',
  label,
  header,
  footer,
}: {
  region: PveBoard;
  /** The season's dungeons, in its order: the tiles' columns */
  dungeons: readonly MplusDungeon[];
  /** The season shown: its top 0.1% / 1% cutoffs badge the places */
  season: MplusSeason | undefined;
  cls?: string;
  spec?: string;
  role?: string;
  page?: number;
  /** Turns paging on (the full board) */
  onPageChange?: (page: number) => void;
  size?: 'large' | 'medium';
  /** The frame's name for screen readers (the full board: "All Characters") */
  label?: string;
  /** Above and below the rows (the home widget's title bar and full-board link) */
  header?: ReactNode;
  footer?: ReactNode;
}) {
  const { t, locale } = useI18n();
  const frame = useRef<HTMLElement>(null);
  const large = size === 'large';
  const pageSize = ROWS[size];
  const board = useQuery({
    ...mplusLeaderboardQuery({
      region,
      class: cls,
      spec,
      role,
      page: Math.min(page, lastReachablePage(Infinity, pageSize)),
      pageSize,
    }),
    // The previous rows stay while the next page or filter loads
    placeholderData: (previous) => previous,
  });
  const entries = board.data?.entries;
  // The season's best score anywhere (World #1, current season): the score colours' top, so
  // they move with the season (mplusScoreColor.ts). The same query as the character page's.
  const top = useQuery(mplusLeaderboardQuery({ pageSize: 1 })).data?.entries[0]?.mythicScore;
  const lastPage = board.data ? lastReachablePage(board.data.totalPages, pageSize) : null;
  const offset = (page - 1) * pageSize;

  // A page past the end (an old or edited link) moves back to the last one
  useEffect(() => {
    if (onPageChange && lastPage != null && lastPage > 0 && page > lastPage) onPageChange(lastPage);
  }, [lastPage, page, onPageChange]);

  const paging = (where: 'top' | 'bottom') =>
    onPageChange && board.data && lastPage ? (
      <Pagination
        page={page}
        totalPages={lastPage}
        total={board.data.total}
        onChange={(next) => {
          onPageChange(next);
          if (where === 'bottom') frame.current?.scrollIntoView({ block: 'start' });
        }}
      />
    ) : null;

  return (
    <WidgetFrame ref={frame} size={size} aria-label={label ?? t('nav.mplusCharacters')}>
      {header}
      {paging('top')}
      {board.isError ? (
        <p className={styles.message} role="alert">
          {t('widget.unavailable')}
        </p>
      ) : entries && entries.length === 0 ? (
        <p className={styles.message}>{t('widget.empty')}</p>
      ) : (
        <div className={styles.scroll}>
          <table
            className={styles.table}
            data-size={size}
            aria-busy={!entries || board.isFetching}
            data-stale={board.isPlaceholderData || undefined}
          >
            <colgroup>
              <col className={styles.colPlace} />
              <col />
              {large && <col className={styles.colDungeons} />}
              <col className={styles.colScore} />
              <col className={styles.colFaction} />
            </colgroup>
            {/* Column titles: shown on the full board, for screen readers on a widget */}
            <thead className={large ? styles.head : 'sr-only'}>
              <tr>
                <th scope="col">
                  <span aria-hidden>#</span>
                  <span className="sr-only">{t('widget.rank')}</span>
                </th>
                <th scope="col" className={styles.thPlayer}>
                  {t('widget.player')}
                </th>
                {large && (
                  <th scope="col">
                    {/* Each dungeon's icon over its tiles; the name on hover */}
                    <span className={styles.tiles}>
                      {dungeons.map((d) => (
                        <span key={d.id} className={styles.headTile} title={d.name ?? undefined}>
                          {d.iconUrl && <img src={d.iconUrl} alt="" loading="lazy" />}
                          {/* Its short name under the icon (the user, 2026-11-28): AOF, BV… */}
                          <span className={styles.headShort}>{d.shortName ?? d.name ?? '?'}</span>
                          <span className="sr-only">{d.name}</span>
                        </span>
                      ))}
                    </span>
                    <span className="sr-only">{t('mplus.dungeons')}</span>
                  </th>
                )}
                <th scope="col">{t('mplus.score')}</th>
                <th scope="col">{t('widget.faction')}</th>
              </tr>
            </thead>
            <tbody>
              {entries
                ? entries.map((entry, i) => (
                    <Row
                      key={`${entry.region}-${entry.realmSlug}-${entry.characterName}`}
                      entry={entry}
                      place={offset + i + 1}
                      dungeons={dungeons}
                      top={top}
                      season={season}
                      compact={!large}
                    />
                  ))
                : Array.from({ length: large ? 12 : pageSize }, (_, i) => (
                    <tr key={i} className={styles.row} aria-hidden>
                      <td className={styles.place}>
                        {(offset + i + 1).toLocaleString(locale.htmlLang)}
                      </td>
                      <td colSpan={large ? 4 : 3}>
                        <span className={styles.skeleton} />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.pagingBottom}>{paging('bottom')}</div>
      {footer}
    </WidgetFrame>
  );
}

function Row({
  entry,
  place,
  dungeons,
  top,
  season,
  compact,
}: {
  entry: MplusLeaderboardEntry;
  place: number;
  dungeons: readonly MplusDungeon[];
  season: MplusSeason | undefined;
  /** A home widget's row: no realm, no dungeon tiles */
  compact: boolean;
  /** The season's best score (World #1): the colour scale's top */
  top: number | undefined;
}) {
  const { t, locale } = useI18n();
  const site = useSite();
  const { assetStyle: style } = usePreferences().preferences;
  const p = entry.profile;
  const cls = p?.classId ?? p?.className;
  const spec = p?.specId ?? p?.specName;
  const race = p?.raceId ?? p?.raceName;
  const faction = entry.faction ?? undefined;
  const runs = runsBySeasonDungeon(dungeons, entry.dungeonRuns);

  return (
    <tr className={styles.row}>
      <td className={styles.place}>
        <TierPlace place={place} entry={entry} season={season} />
      </td>
      <td>
        <span className={styles.player}>
          <span className={styles.icons}>
            {raceIconUrl(race, undefined, { style, faction }) ? (
              <RaceIcon race={race} gender={undefined} faction={faction} />
            ) : (
              <UnknownIcon label={t('unknown.race')} />
            )}
            {classIconUrl(cls, { style }) ? (
              <ClassIcon cls={cls} />
            ) : (
              <UnknownIcon label={t('unknown.class')} />
            )}
            {specIconUrl(spec, cls) ? (
              <SpecIcon spec={spec} cls={cls} />
            ) : (
              <UnknownIcon label={t('unknown.spec')} />
            )}
          </span>
          <span className={styles.nameLink}>
            <Link
              to="/$game/$locale/pve/character/$region/$realm/$name"
              params={{
                ...site,
                region: entry.region,
                realm: entry.realmSlug,
                name: entry.characterName,
              }}
              data-class-color={classColorKey(cls)}
            >
              {entry.characterName}
            </Link>
          </span>
          {!compact && <span className={styles.realm}>{entry.realmName}</span>}
        </span>
      </td>
      {!compact && (
        <td>
          <span className={styles.tiles}>
            {runs.map((run, i) => (
              <DungeonTile key={dungeons[i]!.id} dungeon={dungeons[i]!} run={run} />
            ))}
          </span>
        </td>
      )}
      {/* In its colour on the season's scale (--score-color: from the data) */}
      <td
        className={styles.score}
        style={{ '--score-color': scoreColor(entry.mythicScore, top) } as CSSProperties}
      >
        <Trend score={entry.mythicScore} previous={entry.previousMythicScore} />
        <span className={styles.scoreValue}>
          {entry.mythicScore.toLocaleString(locale.htmlLang, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
        {entry.isFullyCovered === false && (
          <span
            className={styles.partial}
            title={t('mplus.partial')}
            aria-label={t('mplus.partial')}
          >
            *
          </span>
        )}
      </td>
      <td className={styles.faction}>
        {factionIconUrl(faction, { style }) ? (
          <FactionIcon faction={faction} />
        ) : (
          <UnknownIcon label={t('unknown.faction')} />
        )}
      </td>
    </tr>
  );
}

const TIER_ICONS: Record<ScoreTier, string | undefined> = {
  p999: iconUrl('pve/ranks/zeropointonepercent'),
  p990: iconUrl('pve/ranks/onepercent'),
};

/**
 * A place: on its tier's shield when the score reaches the top 0.1% (gold) or top 1%
 * (silver) of the character's own region this season (the user, 2026-11-28; the PvP
 * board's Rank 1 badge, same drawing), else the plain number
 */
function TierPlace({
  place,
  entry,
  season,
}: {
  place: number;
  entry: MplusLeaderboardEntry;
  season: MplusSeason | undefined;
}) {
  const { t, locale } = useI18n();
  const cutoffs = tierCutoffs(season, entry.region);
  const tier = scoreTier(entry.mythicScore, cutoffs);
  const src = tier ? TIER_ICONS[tier] : undefined;
  const number = place.toLocaleString(locale.htmlLang);
  if (!tier || !src) return <>{number}</>;
  const digits = String(place);
  const label = t(tier === 'p999' ? 'mplus.top01' : 'mplus.top1', {
    region: regionLabel(t, entry.region),
    score: cutoffs![tier]!.toLocaleString(locale.htmlLang, { maximumFractionDigits: 1 }),
  });
  return (
    <span className={styles.badge} data-digits={Math.min(digits.length, 5)} title={label}>
      <img src={src} alt="" draggable={false} />
      <span className={styles.badgeNumber}>{digits}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * A dungeon's tile: its art with the key level on it (timed bright, depleted muted), or a
 * dash where the character has no run; the run's details on hover and for screen readers
 */
function DungeonTile({ dungeon, run }: { dungeon: MplusDungeon; run: MplusDungeonRun | null }) {
  const { t, locale } = useI18n();
  const name = dungeon.name ?? dungeon.shortName ?? '';
  if (!run) {
    const label = t('mplus.noRun', { dungeon: name });
    return (
      <span className={styles.tile} data-state="none" title={label} aria-label={label} role="img">
        –
      </span>
    );
  }
  const state = runState(run);
  const label = [
    `${name} +${run.mythicLevel}`,
    state === 'timed'
      ? t('mplus.timed', { chests: run.numChests, left: clock(run.timeRemainingMs) })
      : t('mplus.depleted', { over: clock(run.timeRemainingMs) }),
    t('mplus.runScore', {
      score: run.score.toLocaleString(locale.htmlLang, { maximumFractionDigits: 1 }),
    }),
  ].join(' · ');
  return (
    <span className={styles.tile} data-state={state} title={label} aria-label={label} role="img">
      {dungeon.iconUrl && <img src={dungeon.iconUrl} alt="" loading="lazy" draggable={false} />}
      <span className={styles.level} aria-hidden>
        {run.mythicLevel}
      </span>
    </span>
  );
}

/** The score against the previous one: up green, down red, a line when unchanged or unknown */
function Trend({ score, previous }: { score: number; previous: number | null | undefined }) {
  const { t, locale } = useI18n();
  const diff = previous == null ? 0 : score - previous;
  const direction = diff > 0.05 ? 'up' : diff < -0.05 ? 'down' : 'same';
  const fmt = (n: number) => n.toLocaleString(locale.htmlLang, { maximumFractionDigits: 1 });
  const label =
    direction === 'same'
      ? t('widget.trendSame')
      : t(direction === 'up' ? 'widget.trendUp' : 'widget.trendDown', {
          diff: fmt(Math.abs(diff)),
          previous: fmt(previous!),
        });
  return (
    <span
      className={cx(styles.trend, styles[`trend-${direction}`])}
      role="img"
      aria-label={label}
      title={label}
    />
  );
}
