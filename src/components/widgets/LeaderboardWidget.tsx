import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useId } from 'react';
import {
  currentSeasonQuery,
  leaderboardQuery,
  PVP_BOARDS,
  type LeaderboardEntry,
  type PvpBoard,
  type PvpBracket,
} from '@/api/pvp';
import { FactionIcon } from '@/components/FactionIcon';
import { GameIcon } from '@/components/GameIcon';
import { HeroTalentIcon } from '@/components/HeroTalentIcon';
import { RaceIcon } from '@/components/RaceIcon';
import { SpecIcon } from '@/components/SpecIcon';
import { UnknownIcon } from '@/components/UnknownIcon';
import { regionLabel } from '@/i18n/labels';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { classColorKey } from '@/lib/wow/classes';
import { factionIconUrl, resolveFaction } from '@/lib/wow/factions';
import { heroTreeIconUrl } from '@/lib/wow/heroTalents';
import { rankOfLadderRow } from '@/lib/wow/pvpRank';
import { raceIconUrl } from '@/lib/wow/races';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { specIconUrl } from '@/lib/wow/specs';
import { WidgetFooter, WidgetFrame, WidgetHeader, WidgetTitle } from './Widget';
import type { WidgetSize } from './WidgetGrid';
import styles from './LeaderboardWidget.module.css';
import { useSite } from '@/lib/site';

/** PvP character pages exist for these regions only (Blizzard's PvP API has no China) */
const CHARACTER_REGIONS = new Set(['us', 'eu', 'kr', 'tw']);

/**
 * What each size adds (the user's design, 2026-11-26):
 * - small: place, spec + hero talent, name, rating, faction;
 * - medium: the race portrait first among the icons, and the win % after the rating.
 */
const DETAILED: Record<WidgetSize, boolean> = { small: false, medium: true, large: true };

/** Brackets whose full name is too long for a small widget (the user, 2026-11-26) */
const SHORT_NAMES: Partial<Record<PvpBracket, MessageKey>> = {
  blitz: 'bracketShort.blitz',
  rbg: 'bracketShort.rbg',
};

/** How many rows each size shows */
const ROWS: Record<WidgetSize, number> = { small: 10, medium: 10, large: 25 };

interface LeaderboardWidgetProps {
  bracket: PvpBracket;
  size?: WidgetSize;
  /** The region it opens on until the visitor picks one for this bracket (then remembered) */
  region?: PvpBoard;
}

/**
 * A PvP ladder's top rows, as a widget (the user's example, 2026-11-26): the bracket's icon
 * and name, a region dropdown, then per row the place, spec and hero talent icons, the name
 * in its class colour (a link to the character), the rating in its PvP rank's colour and the
 * faction, and a link
 * to the full board.
 *
 * Rows are numbered by position. On Shuffle and Blitz, Blizzard's own rank is the rank
 * within the spec ladder (several "1"s on one board), so it is not used here.
 *
 * Sizes add columns (DETAILED): `medium` the race portrait and the win %; `large` will get
 * more.
 */
export function LeaderboardWidget({
  bracket,
  size = 'small',
  region: initialRegion = 'world',
}: LeaderboardWidgetProps) {
  const { t, locale } = useI18n();
  const site = useSite();
  // The region last picked for this bracket is remembered (preference `pvpBoardRegions`), so
  // it stays after navigating or reloading, and every widget of the bracket shows it
  const { preferences, setPreference } = usePreferences();
  const region = preferences.pvpBoardRegions[bracket] ?? initialRegion;
  const setRegion = (next: PvpBoard) =>
    setPreference('pvpBoardRegions', { ...preferences.pvpBoardRegions, [bracket]: next });
  const selectId = useId();

  // Season ids are global: the World board's current season is every region's
  const season = useQuery(currentSeasonQuery('world'));
  const board = useQuery({
    ...leaderboardQuery({
      region,
      seasonId: season.data?.seasonId ?? 0,
      bracket,
      pageSize: ROWS[size],
    }),
    enabled: !!season.data,
    // Keep the previous region's rows on screen while the next one loads
    placeholderData: (previous) => previous,
  });

  const detailed = DETAILED[size];
  const title = t(`bracket.${bracket}`);
  // A small widget has no room for "Battleground Blitz": its short name ("BG Blitz", "RBG")
  const shown = size === 'small' && bracket in SHORT_NAMES ? t(SHORT_NAMES[bracket]!) : title;
  const bracketArt = iconUrl(`pvp/brackets/${bracket}`);
  const failed = season.isError || board.isError;
  const entries = board.data?.entries;

  return (
    <WidgetFrame size={size} aria-label={title}>
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

      {failed ? (
        <p className={styles.message} role="alert">
          {t('widget.unavailable')}
        </p>
      ) : entries && entries.length === 0 ? (
        <p className={styles.message}>{t('widget.empty')}</p>
      ) : (
        <table
          className={styles.table}
          aria-busy={!entries || board.isFetching}
          data-stale={board.isPlaceholderData || undefined}
        >
          {/* Fixed widths for place, rating and faction; the player takes the rest */}
          <colgroup>
            <col className={styles.colPlace} />
            <col />
            <col className={styles.colRating} />
            {detailed && <col className={styles.colWinRate} />}
            <col className={styles.colFaction} />
          </colgroup>
          <thead className="sr-only">
            <tr>
              <th scope="col">{t('widget.rank')}</th>
              <th scope="col">{t('widget.player')}</th>
              <th scope="col">{t('widget.rating')}</th>
              {detailed && <th scope="col">{t('widget.winRate')}</th>}
              <th scope="col">{t('widget.faction')}</th>
            </tr>
          </thead>
          <tbody>
            {entries
              ? entries.map((entry, i) => (
                  <tr
                    key={`${entry.region}-${entry.characterId}-${entry.bracket}`}
                    className={styles.row}
                    // The line under a character in its faction's trim: Alliance gold, Horde silver
                    data-faction-line={resolveFaction(entry.faction)?.slug}
                  >
                    <td className={styles.place}>{i + 1}</td>
                    <PlayerCell entry={entry} withRace={detailed} />
                    {/* In its rank's colour (pvpRank.ts): Duelist blue, Elite purple, Rank 1 orange… */}
                    <td className={styles.rating} data-rank={rankOfLadderRow(entry).id}>
                      {entry.rating.toLocaleString(locale.htmlLang)}
                    </td>
                    {detailed && <WinRate entry={entry} />}
                    <FactionCell entry={entry} />
                  </tr>
                ))
              : Array.from({ length: ROWS[size] }, (_, i) => (
                  <tr key={i} className={styles.row} aria-hidden>
                    <td className={styles.place}>{i + 1}</td>
                    <td colSpan={detailed ? 4 : 3}>
                      <span className={styles.skeleton} />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      )}

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
    </WidgetFrame>
  );
}

/** Spec and hero talent icons, then the name in the class colour (a link when it can be one) */
function PlayerCell({ entry, withRace }: { entry: LeaderboardEntry; withRace: boolean }) {
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

  return (
    <td>
      <span className={styles.player}>
        <span className={styles.icons}>
          {withRace &&
            (raceIconUrl(race, gender, { style, faction: entry.faction }) ? (
              <RaceIcon race={race} gender={gender} faction={entry.faction} />
            ) : (
              <UnknownIcon label={t('unknown.race')} />
            ))}
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
      </span>
    </td>
  );
}

/** Wins over games played (rounds, on Shuffle), whole percent; the record on hover */
function WinRate({ entry }: { entry: LeaderboardEntry }) {
  const { t, locale } = useI18n();
  const { won, lost } = entry;
  if (won == null || lost == null || won + lost === 0) return <td className={styles.rate}>–</td>;
  const rate = new Intl.NumberFormat(locale.htmlLang, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(won / (won + lost));
  return (
    <td className={styles.rate} title={t('widget.record', { won, lost })}>
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
