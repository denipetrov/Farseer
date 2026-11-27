import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useEffect, useId, useRef } from 'react';
import {
  currentSeasonQuery,
  leaderboardQuery,
  PVP_BOARDS,
  type LeaderboardEntry,
  type PvpBoard,
  type PvpBracket,
  type LadderRole,
} from '@/api/pvp';
import { ClassIcon } from '@/components/ClassIcon';
import { FactionIcon } from '@/components/FactionIcon';
import { GameIcon } from '@/components/GameIcon';
import { HeroTalentIcon } from '@/components/HeroTalentIcon';
import { NavGlyph } from '@/components/NavGlyph';
import { Pagination } from '@/components/Pagination';
import { PvpTalentSlot } from '@/components/PvpTalentSlot';
import { RaceIcon } from '@/components/RaceIcon';
import { SpecIcon } from '@/components/SpecIcon';
import { UnknownIcon } from '@/components/UnknownIcon';
import { regionLabel } from '@/i18n/labels';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { cx } from '@/lib/cx';
import { lastReachablePage } from '@/lib/pagination';
import { useSite } from '@/lib/site';
import { classColorKey, classIconUrl } from '@/lib/wow/classes';
import { factionIconUrl } from '@/lib/wow/factions';
import { heroTreeIconUrl } from '@/lib/wow/heroTalents';
import { PVP_RANKS, pvpRankIconUrl, rankOfLadderRow } from '@/lib/wow/pvpRank';
import { raceIconUrl } from '@/lib/wow/races';
import { realmLabel } from '@/lib/wow/regions';
import { specIconUrl } from '@/lib/wow/specs';
import { rowLoadoutCode, rowPvpTalents, wowheadTalentUrl } from '@/lib/wow/talents';
import { winRateTier } from '@/lib/wow/winRate';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { WidgetFooter, WidgetFrame, WidgetHeader, WidgetTitle } from './Widget';
import type { WidgetSize } from './WidgetGrid';
import styles from './LeaderboardWidget.module.css';

/** PvP character pages exist for these regions only (Blizzard's PvP API has no China) */
const CHARACTER_REGIONS = new Set(['us', 'eu', 'kr', 'tw']);

type Column =
  'place' | 'player' | 'rating' | 'won' | 'lost' | 'winRate' | 'faction' | 'pvpTalents' | 'talents';

/**
 * The columns of each size, in order (the user's design, 2026-11-26):
 * - small: place, class + spec + hero talent icons and name, rating, faction;
 * - medium: adds the race portrait before the spec, and the win % after the rating;
 * - large: the faction last, as on the other sizes (the user, 2026-11-27); adds the realm beside the
 *   name, a trend arrow before the rating (against the previous rating, which is on hover:
 *   its own column went, 2026-11-27), wins and losses before the win %, the PvP talents and
 *   a talent loadout button at the end; its column titles are shown.
 */
const COLUMNS: Record<WidgetSize, readonly Column[]> = {
  small: ['place', 'player', 'rating', 'faction'],
  medium: ['place', 'player', 'rating', 'winRate', 'faction'],
  large: [
    'place',
    'player',
    'rating',
    'won',
    'lost',
    'winRate',
    'pvpTalents',
    'talents',
    'faction',
  ],
};

/**
 * A finished season's ladder (the archives; the user, 2026-11-27): Soulseeker's archived rows
 * have no class, spec, race, talents or previous rating, so the large board shrinks to the
 * place, the name (and realm), the rating, wins, losses, win % and faction.
 */
const ARCHIVE_COLUMNS: readonly Column[] = [
  'place',
  'player',
  'rating',
  'won',
  'lost',
  'winRate',
  'faction',
];

const HEADINGS: Record<Column, MessageKey> = {
  place: 'widget.rank',
  player: 'widget.player',
  rating: 'widget.rating',
  won: 'widget.won',
  lost: 'widget.lost',
  winRate: 'widget.winRate',
  faction: 'widget.faction',
  pvpTalents: 'widget.pvpTalents',
  talents: 'widget.talents',
};

/** Brackets whose full name is too long for a small widget (the user, 2026-11-26) */
const SHORT_NAMES: Partial<Record<PvpBracket, MessageKey>> = {
  blitz: 'bracketShort.blitz',
  rbg: 'bracketShort.rbg',
};

/** How many rows each size shows (a page, on the large size) */
const ROWS: Record<WidgetSize, number> = { small: 10, medium: 10, large: 50 };

interface LeaderboardWidgetProps {
  bracket: PvpBracket;
  /** One class's rows only (Soulseeker's slug); with `spec`, one spec's */
  cls?: string;
  spec?: string;
  /** One role's rows only (`tank`, `healer`, `melee`, `ranged`); not with a spec */
  role?: LadderRole;
  size?: WidgetSize;
  /** The region it opens on until the visitor picks one for this bracket (then remembered) */
  region?: PvpBoard;
  /**
   * The bracket's icon, name and region dropdown. Off on the full leaderboard pages, whose
   * heading and bracket/region bar say the same (the user, 2026-11-27).
   */
  header?: boolean;
  /** The "View full leaderboard" link; off on the full leaderboard page itself */
  fullLink?: boolean;
  /** The page shown (1-based), when the widget pages through the board */
  page?: number;
  /**
   * Turns paging on: controls above and below the rows (the full leaderboard page, which
   * keeps the page in its URL).
   */
  onPageChange?: (page: number) => void;
  /** A region was picked (after it is remembered): the full page puts it in its URL, page 1 */
  onRegionChange?: (region: PvpBoard) => void;
  /**
   * A finished season's ladder (the archives page): its rows have no icons or trend, the
   * columns are ARCHIVE_COLUMNS, and the region is `region` as given (the page's URL), not
   * the one remembered for the live ladder.
   */
  archiveSeason?: number;
}

/**
 * A PvP ladder's top rows, as a widget (the user's example, 2026-11-26): the bracket's icon
 * and name, a region dropdown, then one row per character (COLUMNS: what each size shows),
 * and a link to the full board.
 *
 * Rows are numbered by position. On Shuffle and Blitz, Blizzard's own rank is the rank
 * within the spec ladder (several "1"s on one board), so it is not used here.
 */
export function LeaderboardWidget({
  bracket,
  cls,
  spec,
  role,
  size = 'small',
  region: initialRegion = 'world',
  header = true,
  fullLink = true,
  page = 1,
  onPageChange,
  onRegionChange,
  archiveSeason,
}: LeaderboardWidgetProps) {
  const { t, locale } = useI18n();
  const site = useSite();
  // The region last picked for this bracket is remembered (preference `pvpBoardRegions`), so
  // it stays after navigating or reloading, and every widget of the bracket shows it
  const { preferences, setPreference } = usePreferences();
  const region =
    archiveSeason != null ? initialRegion : (preferences.pvpBoardRegions[bracket] ?? initialRegion);
  const setRegion = (next: PvpBoard) => {
    setPreference('pvpBoardRegions', { ...preferences.pvpBoardRegions, [bracket]: next });
    onRegionChange?.(next);
  };
  const selectId = useId();
  const frameRef = useRef<HTMLElement>(null);

  // Season ids are global: the World board's current season is every region's
  const season = useQuery({ ...currentSeasonQuery('world'), enabled: archiveSeason == null });
  const seasonId = archiveSeason ?? season.data?.seasonId;
  const board = useQuery({
    ...leaderboardQuery({
      region,
      seasonId: seasonId ?? 0,
      bracket,
      class: cls,
      spec,
      role,
      // Never past the last page Soulseeker serves, whatever the URL asks for
      page: onPageChange ? Math.min(page, lastReachablePage(Infinity, ROWS[size])) : 1,
      pageSize: ROWS[size],
    }),
    enabled: seasonId != null,
    // Keep the previous region's rows on screen while the next one loads
    placeholderData: (previous) => previous,
  });

  const archived = archiveSeason != null;
  const columns = archived ? ARCHIVE_COLUMNS : COLUMNS[size];
  const title = t(`bracket.${bracket}`);
  // A small widget has no room for "Battleground Blitz": its short name ("BG Blitz", "RBG")
  const shown = size === 'small' && bracket in SHORT_NAMES ? t(SHORT_NAMES[bracket]!) : title;
  const bracketArt = iconUrl(`pvp/brackets/${bracket}`);
  const failed = season.isError || board.isError;
  const entries = board.data?.entries;
  // Rows are numbered on from earlier pages: page 2 starts at 51
  const offset = onPageChange ? (page - 1) * ROWS[size] : 0;
  // Soulseeker serves rows up to 200,000 only: the last page offered is the last it serves
  const lastPage = board.data ? lastReachablePage(board.data.totalPages, ROWS[size]) : null;

  // A page past the end (an old or edited link) moves back to the last one
  useEffect(() => {
    if (onPageChange && lastPage != null && page > lastPage) onPageChange(lastPage);
  }, [onPageChange, lastPage, page]);
  const paging =
    onPageChange &&
    board.data &&
    ((where: 'top' | 'bottom') => (
      <Pagination
        page={page}
        totalPages={lastPage!}
        total={board.data!.total}
        onChange={(next) => {
          onPageChange(next);
          // From the bottom controls, back up to the board's first row
          if (where === 'bottom') frameRef.current?.scrollIntoView({ block: 'start' });
        }}
      />
    ));

  return (
    <WidgetFrame ref={frameRef} size={size} aria-label={title} className={styles.frame}>
      {header && (
        <WidgetHeader>
          <WidgetTitle>
            {/* Centre content uses the coloured game art (the user, 2026-11-26), not the menu glyphs */}
            {bracketArt && <GameIcon src={bracketArt} label="" shape="round" />}
            <span title={shown === title ? undefined : title}>{shown}</span>
          </WidgetTitle>
          <label htmlFor={selectId} className="sr-only">
            {t('widget.region')}
          </label>
          <select
            className={styles.regionSelect}
            id={selectId}
            value={region}
            onChange={(e) => setRegion(e.target.value as PvpBoard)}
          >
            {PVP_BOARDS.map((r) => (
              <option key={r} value={r}>
                {regionLabel(t, r)}
              </option>
            ))}
          </select>
        </WidgetHeader>
      )}

      {paging && paging('top')}

      {failed ? (
        <p className={styles.message} role="alert">
          {t('widget.unavailable')}
        </p>
      ) : entries && entries.length === 0 ? (
        <p className={styles.message}>{t('widget.empty')}</p>
      ) : (
        // The large table scrolls sideways on narrow screens instead of squeezing its columns
        <div className={styles.scroll} data-size={size}>
          <table
            className={styles.table}
            data-size={size}
            aria-busy={!entries || board.isFetching}
            data-stale={board.isPlaceholderData || undefined}
          >
            {/* Fixed widths per column; the player takes the rest */}
            <colgroup>
              {columns.map((c) => (
                <col key={c} className={styles[`col-${c}`]} />
              ))}
            </colgroup>
            {/* Column titles: shown on the large size, for screen readers on the others */}
            <thead className={size === 'large' ? styles.head : 'sr-only'}>
              <tr>
                {columns.map((c) => (
                  <th key={c} scope="col" className={styles[`th-${c}`]}>
                    {c === 'place' ? (
                      // The narrow place column shows "#"; screen readers hear "Rank"
                      <>
                        <span aria-hidden>#</span>
                        <span className="sr-only">{t(HEADINGS[c])}</span>
                      </>
                    ) : (
                      t(HEADINGS[c])
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries
                ? entries.map((entry, i) => (
                    <tr
                      key={`${entry.region}-${entry.characterId}-${entry.bracket}`}
                      className={styles.row}
                    >
                      {columns.map((c) => (
                        <Cell
                          key={c}
                          column={c}
                          entry={entry}
                          place={offset + i + 1}
                          size={size}
                          archived={archived}
                        />
                      ))}
                    </tr>
                  ))
                : Array.from({ length: ROWS[size] }, (_, i) => (
                    <tr key={i} className={styles.row} aria-hidden>
                      <td className={styles.place}>
                        {(offset + i + 1).toLocaleString(locale.htmlLang)}
                      </td>
                      <td colSpan={columns.length - 1}>
                        <span className={styles.skeleton} />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {paging && <div className={styles.pagingBottom}>{paging('bottom')}</div>}

      {fullLink && (
        <WidgetFooter>
          {/* A plain Link keeps the router's types; the class styles the <a> it renders */}
          <span className={styles.fullLink}>
            <Link
              to="/$game/$locale/pvp/leaderboards/$bracket"
              params={{ ...site, bracket }}
              search={region === 'world' ? {} : { region }}
            >
              {t('widget.viewFullLeaderboard')}
              <span aria-hidden>→</span>
            </Link>
          </span>
        </WidgetFooter>
      )}
    </WidgetFrame>
  );
}

const RANK_ONE_BADGE = pvpRankIconUrl(PVP_RANKS.find((r) => r.id === 'rank-one')!);

/**
 * The place of a character in Rank 1 range (the same test that colours the rating orange:
 * rankOfLadderRow), written on the Rank 1 emblem as the game shows it: plain digits, no
 * thousands separator, to fit the shield.
 */
function RankOnePlace({ place }: { place: number }) {
  const digits = String(place);
  if (!RANK_ONE_BADGE) return <>{digits}</>;
  return (
    <span className={styles.badge} data-digits={Math.min(digits.length, 5)}>
      <img src={RANK_ONE_BADGE} alt="" draggable={false} />
      <span className={styles.badgeNumber}>{digits}</span>
    </span>
  );
}

function Cell({
  column,
  entry,
  place,
  size,
  archived,
}: {
  column: Column;
  entry: LeaderboardEntry;
  place: number;
  size: WidgetSize;
  /** A finished season's row: no icons, no trend (archived rows have neither) */
  archived: boolean;
}) {
  const { locale } = useI18n();
  const number = (n: number | null | undefined) =>
    n == null ? '–' : n.toLocaleString(locale.htmlLang);

  switch (column) {
    case 'place':
      return (
        <td className={styles.place}>
          {rankOfLadderRow(entry).id === 'rank-one' ? (
            <RankOnePlace place={place} />
          ) : (
            number(place)
          )}
        </td>
      );
    case 'player':
      return (
        <PlayerCell
          entry={entry}
          withIcons={!archived}
          withRace={size !== 'small'}
          withRealm={size === 'large'}
        />
      );
    case 'rating':
      return (
        // In its rank's colour (pvpRank.ts): Duelist blue, Elite purple, Rank 1 orange…
        <td className={styles.rating} data-rank={rankOfLadderRow(entry).id}>
          {size === 'large' && !archived && <Trend entry={entry} />}
          {number(entry.rating)}
        </td>
      );
    case 'won':
      return <td className={cx(styles.number, styles.won)}>{number(entry.won)}</td>;
    case 'lost':
      return <td className={cx(styles.number, styles.lost)}>{number(entry.lost)}</td>;
    case 'winRate':
      return <WinRate entry={entry} />;
    case 'faction':
      return <FactionCell entry={entry} />;
    case 'pvpTalents':
      return <PvpTalentsCell entry={entry} />;
    case 'talents':
      return <TalentsCell entry={entry} />;
  }
}

/**
 * Race (medium and up), spec and hero talent icons, then the name in the class colour (a
 * link when it can be one), and on the large size the realm beside it.
 */
function PlayerCell({
  entry,
  withIcons,
  withRace,
  withRealm,
}: {
  entry: LeaderboardEntry;
  /** Off on a finished season's rows, which have no class, spec or race */
  withIcons: boolean;
  withRace: boolean;
  withRealm: boolean;
}) {
  const { t } = useI18n();
  const site = useSite();
  const { assetStyle: style } = usePreferences().preferences;
  const race = entry.raceId ?? entry.race;
  const gender = entry.gender ?? undefined;
  const cls = entry.classId ?? entry.class;
  const spec = entry.specId ?? entry.spec;
  const hero = entry.heroTalentId ?? entry.heroTalents;
  const name = entry.characterName ?? t('widget.unnamed');
  const classColor = classColorKey(cls);
  const linkable = entry.characterName && entry.realmSlug && CHARACTER_REGIONS.has(entry.region);
  const realm = entry.realmName ?? (entry.realmSlug ? realmLabel(entry.realmSlug) : null);

  return (
    <td>
      <span className={styles.player}>
        {withIcons && (
          <span className={styles.icons}>
            {withRace &&
              (raceIconUrl(race, gender, { style, faction: entry.faction }) ? (
                <RaceIcon race={race} gender={gender} faction={entry.faction} />
              ) : (
                <UnknownIcon label={t('unknown.race')} />
              ))}
            {/* The class before the spec, on every size (the user, 2026-11-27) */}
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
            {heroTreeIconUrl(hero) ? (
              <HeroTalentIcon tree={hero} />
            ) : (
              <UnknownIcon label={t('unknown.heroTalent')} />
            )}
          </span>
        )}
        {linkable ? (
          <span className={styles.nameLink}>
            <Link
              to="/$game/$locale/pvp/character/$region/$realm/$name"
              params={{
                ...site,
                region: entry.region,
                realm: entry.realmSlug!,
                name: entry.characterName!,
              }}
              data-class-color={classColor}
            >
              {name}
            </Link>
          </span>
        ) : (
          <span className={styles.name} data-class-color={classColor}>
            {name}
          </span>
        )}
        {withRealm && realm && <span className={styles.realm}>{realm}</span>}
      </span>
    </td>
  );
}

/**
 * The rating against the previous one: green arrow up, red arrow down, or a grey line when
 * unchanged or unknown (a first appearance); by how much on hover.
 */
function Trend({ entry }: { entry: LeaderboardEntry }) {
  const { t, locale } = useI18n();
  const previous = entry.previousRating;
  const diff = previous == null ? 0 : entry.rating - previous;
  const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';
  const fmt = (n: number) => n.toLocaleString(locale.htmlLang);
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

/** Wins over games played (rounds, on Shuffle), whole percent; the record on hover */
function WinRate({ entry }: { entry: LeaderboardEntry }) {
  const { t, locale } = useI18n();
  const { won, lost } = entry;
  if (won == null || lost == null || won + lost === 0) return <td className={styles.rate}>–</td>;
  const ratio = won / (won + lost);
  const rate = new Intl.NumberFormat(locale.htmlLang, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(ratio);
  return (
    <td
      className={styles.rate}
      data-tier={winRateTier(ratio)}
      title={t('widget.record', { won, lost })}
    >
      {rate}
    </td>
  );
}

/** The character's faction, in the visitor's icon style; the unknown icon when absent */
function FactionCell({ entry }: { entry: LeaderboardEntry }) {
  const { t } = useI18n();
  const { assetStyle: style } = usePreferences().preferences;
  return (
    <td className={styles.faction}>
      {factionIconUrl(entry.faction, { style }) ? (
        <FactionIcon faction={entry.faction} />
      ) : (
        <UnknownIcon label={t('unknown.faction')} />
      )}
    </td>
  );
}

/** The PvP talents of the row's spec, one slot each (empty slots in the game's green) */
function PvpTalentsCell({ entry }: { entry: LeaderboardEntry }) {
  const classColor = classColorKey(entry.classId ?? entry.class);
  return (
    <td className={styles.pvpTalents}>
      <span className={styles.pvpTalentSlots}>
        {rowPvpTalents(entry).map((talent, i) => (
          <PvpTalentSlot key={i} talent={talent} classColor={classColor} />
        ))}
      </span>
    </td>
  );
}

/**
 * The talent loadout of the row's spec, on Wowhead's talent calculator in a new tab (the
 * user's request, 2026-11-26), as the external-link icon (`nav/external`); its name and
 * hover text say what it opens. Without a loadout yet (the character not enriched), the
 * button is shown disabled, so the column keeps its shape.
 */
function TalentsCell({ entry }: { entry: LeaderboardEntry }) {
  const { t, locale } = useI18n();
  const code = rowLoadoutCode(entry);
  const name = entry.characterName ?? t('widget.unnamed');
  return (
    <td className={styles.talents}>
      {code ? (
        <a
          className={styles.talentButton}
          href={wowheadTalentUrl(code, locale.slug)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('widget.loadoutLink', { name })}
          title={t('widget.loadoutLink', { name })}
        >
          <NavGlyph icon="nav/external" />
        </a>
      ) : (
        <span
          className={styles.talentButton}
          role="img"
          aria-disabled
          aria-label={t('widget.noLoadout')}
          title={t('widget.noLoadout')}
        >
          <NavGlyph icon="nav/external" />
        </span>
      )}
    </td>
  );
}
