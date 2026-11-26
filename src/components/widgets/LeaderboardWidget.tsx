import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useId } from 'react';
import styled from 'styled-components';
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
import { classColorVar } from '@/lib/wow/classes';
import { factionColorVars, factionIconUrl } from '@/lib/wow/factions';
import { heroTreeIconUrl } from '@/lib/wow/heroTalents';
import { rankOfLadderRow } from '@/lib/wow/pvpRank';
import { raceIconUrl } from '@/lib/wow/races';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { specIconUrl } from '@/lib/wow/specs';
import {
  WidgetFooter,
  WidgetFrame,
  WidgetHeader,
  WidgetTitle,
  type WidgetSize,
} from './WidgetGrid';

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
    <WidgetFrame data-size={size} aria-label={title}>
      <WidgetHeader>
        <WidgetTitle>
          {/* Centre content uses the coloured game art (the user, 2026-11-26), not the menu glyphs */}
          {bracketArt && <GameIcon src={bracketArt} label="" shape="round" />}
          <span title={shown === title ? undefined : title}>{shown}</span>
        </WidgetTitle>
        <label htmlFor={selectId} className="sr-only">
          {t('widget.region')}
        </label>
        <RegionSelect
          id={selectId}
          value={region}
          onChange={(e) => setRegion(e.target.value as PvpBoard)}
        >
          {PVP_BOARDS.map((r) => (
            <option key={r} value={r}>
              {regionLabel(t, r)}
            </option>
          ))}
        </RegionSelect>
      </WidgetHeader>

      {failed ? (
        <Message role="alert">{t('widget.unavailable')}</Message>
      ) : entries && entries.length === 0 ? (
        <Message>{t('widget.empty')}</Message>
      ) : (
        <Table
          aria-busy={!entries || board.isFetching}
          data-stale={board.isPlaceholderData || undefined}
        >
          {/* Fixed widths for place, rating and faction; the player takes the rest */}
          <colgroup>
            <col style={{ width: '2.5rem' }} />
            <col />
            <col style={{ width: '4.25rem' }} />
            {detailed && <col style={{ width: '3.75rem' }} />}
            <col style={{ width: '3rem' }} />
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
                  <Row
                    key={`${entry.region}-${entry.characterId}-${entry.bracket}`}
                    // The line under a character in its faction's trim: Alliance gold, Horde silver
                    style={{ borderBottomColor: factionColorVars(entry.faction)?.trim }}
                  >
                    <Place>{i + 1}</Place>
                    <PlayerCell entry={entry} withRace={detailed} />
                    {/* In its rank's colour (pvpRank.ts): Duelist blue, Elite purple, Rank 1 orange… */}
                    <Rating style={{ color: rankOfLadderRow(entry).color }}>
                      {entry.rating.toLocaleString(locale.htmlLang)}
                    </Rating>
                    {detailed && <WinRate entry={entry} />}
                    <FactionCell entry={entry} />
                  </Row>
                ))
              : Array.from({ length: ROWS[size] }, (_, i) => (
                  <Row key={i} aria-hidden>
                    <Place>{i + 1}</Place>
                    <td colSpan={detailed ? 4 : 3}>
                      <Skeleton />
                    </td>
                  </Row>
                ))}
          </tbody>
        </Table>
      )}

      <WidgetFooter>
        {/* A plain Link keeps the router's types; FullLink styles the <a> it renders */}
        <FullLink>
          <Link
            to="/$locale/pvp/leaderboards/$bracket"
            params={{ locale: locale.slug, bracket }}
            search={region === 'world' ? {} : { region }}
          >
            {t('widget.viewFullLeaderboard')}
            <span aria-hidden>→</span>
          </Link>
        </FullLink>
      </WidgetFooter>
    </WidgetFrame>
  );
}

/** Spec and hero talent icons, then the name in the class colour (a link when it can be one) */
function PlayerCell({ entry, withRace }: { entry: LeaderboardEntry; withRace: boolean }) {
  const { t, locale } = useI18n();
  const { assetStyle: style } = usePreferences().preferences;
  const race = entry.raceId ?? entry.race;
  const gender = entry.gender ?? undefined;
  const cls = entry.classId ?? entry.class;
  const spec = entry.specId ?? entry.spec;
  const hero = entry.heroTalentId ?? entry.heroTalents;
  const name = entry.characterName ?? t('widget.unnamed');
  const color = classColorVar(cls) ?? 'var(--color-text-highlight)';
  const linkable = entry.characterName && entry.realmSlug && CHARACTER_REGIONS.has(entry.region);

  return (
    <td>
      <Player>
        <Icons>
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
        </Icons>
        {linkable ? (
          <NameLink>
            <Link
              to="/$locale/pvp/character/$region/$realm/$name"
              params={{
                locale: locale.slug,
                region: entry.region,
                realm: entry.realmSlug!,
                name: entry.characterName!,
              }}
              style={{ color }}
            >
              {name}
            </Link>
          </NameLink>
        ) : (
          <Name style={{ color }}>{name}</Name>
        )}
      </Player>
    </td>
  );
}

/** Wins over games played (rounds, on Shuffle), whole percent; the record on hover */
function WinRate({ entry }: { entry: LeaderboardEntry }) {
  const { t, locale } = useI18n();
  const { won, lost } = entry;
  if (won == null || lost == null || won + lost === 0) return <Rate>–</Rate>;
  const rate = new Intl.NumberFormat(locale.htmlLang, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(won / (won + lost));
  return <Rate title={t('widget.record', { won, lost })}>{rate}</Rate>;
}

/** The character's faction, in the visitor's icon style; the unknown icon when absent */
function FactionCell({ entry }: { entry: LeaderboardEntry }) {
  const { t } = useI18n();
  const { assetStyle: style } = usePreferences().preferences;
  return (
    <Faction>
      {factionIconUrl(entry.faction, { style }) ? (
        <FactionIcon faction={entry.faction} />
      ) : (
        <UnknownIcon label={t('unknown.faction')} />
      )}
    </Faction>
  );
}

const RegionSelect = styled.select`
  flex: none;
  max-width: 9rem;
  padding: var(--space-1) var(--space-6) var(--space-1) var(--space-2);
  border: 1px solid var(--color-trim-muted);
  border-radius: var(--radius-md);
  background: var(--color-bg-sunken)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23a3a3a3' stroke-width='1.6'/%3E%3C/svg%3E")
    no-repeat right var(--space-2) center / 10px 6px;
  color: var(--color-text-muted);
  font: inherit;
  font-size: var(--font-size-sm);
  appearance: none;
  cursor: pointer;

  &:hover {
    color: var(--color-text-highlight);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }
`;

/**
 * Fixed layout (widths in the <colgroup>): the place, rating and faction keep their widths
 * and the player column takes the rest, so a long name is shortened (…) instead of pushing
 * the numbers out of the frame.
 */
const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
  transition: opacity var(--transition-fast);

  &[data-stale] {
    opacity: 0.55;
  }
`;

const Row = styled.tr`
  height: 52px;
  border-bottom: 1px solid var(--color-border-muted);

  &:last-child {
    border-bottom: 0;
  }

  > td {
    padding: 0 6px;
    vertical-align: middle;
  }

  > td:first-child {
    padding-left: var(--space-4);
  }

  > td:last-child {
    padding-right: var(--space-4);
  }
`;

const Place = styled.td`
  color: var(--color-text-subtle);
`;

const Player = styled.span`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
`;

const Icons = styled.span`
  display: flex;
  flex: none;
  gap: 2px;
`;

const nameStyles = `
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Name = styled.span`
  ${nameStyles}
`;

const NameLink = styled.span`
  display: flex;
  min-width: 0;

  > a {
    ${nameStyles}
  }

  > a:hover {
    text-decoration: underline;
  }
`;

const Rating = styled.td`
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
`;

const Rate = styled.td`
  color: var(--color-text-subtle);
  font-size: var(--font-size-sm);
  text-align: right;
  white-space: nowrap;
`;

const Faction = styled.td`
  text-align: right;

  > * {
    display: inline-flex;
    vertical-align: middle;
  }
`;

const Skeleton = styled.span`
  display: block;
  height: 14px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-raised);
`;

const Message = styled.p`
  margin: 0;
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-muted);
  text-align: center;
`;

const FullLink = styled.span`
  > a {
    display: inline-flex;
    gap: var(--space-2);
    align-items: center;
    color: var(--color-accent-strong);
    font-weight: 600;
  }

  > a:hover {
    color: var(--color-accent-hover);
    text-decoration: underline;
  }
`;
