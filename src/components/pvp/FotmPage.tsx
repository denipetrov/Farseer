import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  PVP_BOARDS,
  PVP_BRACKETS,
  specRepresentationHistoryQuery,
  type PvpBoard,
  type PvpBracket,
  type RepresentationRating,
} from '@/api/pvp';
import { GameIcon } from '@/components/GameIcon';
import { Page, PageTitle } from '@/components/Page';
import { tabBar } from '@/components/tabBar';
import { WidgetFrame, WidgetHeader, WidgetTitle } from '@/components/widgets/Widget';
import { regionLabel } from '@/i18n/labels';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { DEV_MOCKS_AVAILABLE, readMockFotm, writeMockFotm } from '@/lib/devMocks';
import {
  fotmItemName,
  fotmSeries,
  type FotmMode,
  type FotmSearch,
  type FotmSeries,
} from '@/lib/fotm';
import { useSite } from '@/lib/site';
import { classColorKey } from '@/lib/wow/classes';
import type { TierRole } from '@/lib/wow/tierRoles';
import { FotmChart, FotmIcon } from './FotmChart';
import { RatingSelect, RoleTabs } from './StatsControls';
import styles from './FotmPage.module.css';

const SHORT: Partial<Record<PvpBracket, MessageKey>> = {
  blitz: 'bracketShort.blitz',
  rbg: 'bracketShort.rbg',
};

/** Lines shown at first: the most played on the newest day (the user, 2026-11-27: 15) */
const TOP = 15;

interface View {
  bracket: PvpBracket;
  region: PvpBoard;
  rating: RepresentationRating;
  role: TierRole;
  mode: FotmMode;
}

/**
 * PvP → FOTM (the user, 2026-11-27): each spec's share of the players at or above a rating,
 * day by day over the last month (`GET /pvp/spec-representation/history`, one request), a
 * line per spec in its class colour (FotmChart).
 *
 * - The heading, the bracket and region bar, the rating and role controls (shared with
 *   Spec Representation: StatsControls). Everything is in the URL.
 * - Under the chart, the legend: every spec in the filter, most played today first, each a
 *   toggle for its line (the top 8 shown at first; "Top 8", "All"); hovering one picks out
 *   its line. Shares are within the role filter, so a role's lines add up to 100%.
 */
export function FotmPage({ search }: { search: FotmSearch }) {
  const view: View = {
    bracket: search.bracket ?? 'shuffle',
    region: search.region ?? 'world',
    rating: search.rating ?? 2100,
    role: search.role ?? 'all',
    mode: search.view === 'hero' ? 'hero' : 'specs',
  };
  // Localhost only: a mocked full month instead of the real history (off by default)
  const [mock, setMock] = useState(readMockFotm);
  const pickMock = (on: boolean) => {
    writeMockFotm(on);
    setMock(on);
  };
  // A new board starts again from its top 15
  return (
    <FotmBoard key={Object.values(view).join('-')} view={view} mock={mock} onMock={pickMock} />
  );
}

function FotmBoard({
  view,
  mock,
  onMock,
}: {
  view: View;
  mock: boolean;
  onMock: (on: boolean) => void;
}) {
  const { t, name, locale } = useI18n();
  const site = useSite();
  const navigate = useNavigate();
  const { bracket, region, rating, role, mode } = view;
  const history = useQuery(specRepresentationHistoryQuery(region, bracket, rating, mock));
  const [picked, setPicked] = useState<readonly string[] | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [pinned, setPinned] = useState<ReadonlySet<string>>(new Set());

  const all = history.data ? fotmSeries(history.data, role, mode) : null;
  const shown = new Set(picked ?? all?.series.slice(0, TOP).map((s) => s.key) ?? []);
  const lines = all?.series.filter((s) => shown.has(s.key)) ?? [];
  // "Top N": as many as are shown now, at most 15 (the user, 2026-11-27); 15 when none are
  const topCount = Math.min(all?.series.length ?? 0, shown.size ? Math.min(shown.size, TOP) : TOP);
  const topKeys = all?.series.slice(0, topCount).map((s) => s.key) ?? [];
  const isTop = shown.size === topCount && topKeys.every((k) => shown.has(k));
  const isAll = !!all && shown.size === all.series.length;
  // The lines pinned (clicked), while they are shown
  const pins = new Set([...pinned].filter((k) => shown.has(k)));
  const togglePin = (key: string) =>
    setPinned((p) => {
      const next = new Set(p);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  const toggle = (key: string) =>
    setPicked(shown.has(key) ? [...shown].filter((k) => k !== key) : [...shown, key]);

  const art = iconUrl(`pvp/brackets/${bracket}`);
  const dayText = (iso: string) =>
    new Intl.DateTimeFormat(locale.htmlLang, { dateStyle: 'medium', timeZone: 'UTC' }).format(
      new Date(`${iso}T00:00:00Z`),
    );
  const pct = (n: number) =>
    n.toLocaleString(locale.htmlLang, { style: 'percent', maximumFractionDigits: 1 });
  const itemName = (s: FotmSeries) => fotmItemName(s.item, name, t, true);

  const to = (next: Partial<View>) => {
    const s = { ...view, ...next };
    return {
      to: '/$game/$locale/pvp/fotm' as const,
      params: site,
      search: {
        bracket: s.bracket === 'shuffle' ? undefined : s.bracket,
        region: s.region === 'world' ? undefined : s.region,
        rating: s.rating === 2100 ? undefined : s.rating,
        role: s.role === 'all' ? undefined : s.role,
        view: s.mode === 'hero' ? 'hero' : undefined,
      } satisfies FotmSearch,
      // A key left out must be absent from the URL too, or its tab is marked current
      activeOptions: { explicitUndefined: true },
    };
  };

  return (
    <Page className={styles.page}>
      <PageTitle className={styles.title}>
        {art && <GameIcon src={art} label="" shape="round" />}
        <span>{t('fotm.pageTitle', { bracket: t(`bracket.${bracket}`) })}</span>
      </PageTitle>

      <div className={tabBar.bar} data-dense>
        <nav className={tabBar.group} aria-label={t('tabs.brackets')}>
          {PVP_BRACKETS.map((b) => {
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
              {...to({ region: r })}
              aria-current={r === region ? 'page' : undefined}
            >
              {regionLabel(t, r)}
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.controls}>
        <RatingSelect
          rating={rating}
          onPick={(r) => {
            const { to: path, params, search } = to({ rating: r });
            void navigate({ to: path, params, search });
          }}
        />
        <RoleTabs role={role} linkFor={(r) => to({ role: r })} />
        {/* Lines per spec, or per hero talent tree (the user, 2026-11-27) */}
        <nav className={tabBar.group} aria-label={t('fotm.view')}>
          {(['specs', 'hero'] as const).map((m) => (
            <Link
              key={m}
              className={tabBar.tab}
              {...to({ mode: m })}
              aria-current={m === mode ? 'page' : undefined}
            >
              {t(m === 'specs' ? 'fotm.specs' : 'fotm.heroTalents')}
            </Link>
          ))}
        </nav>
        {/* Dev builds on localhost only: never shown, nor built, in production. English only. */}
        {DEV_MOCKS_AVAILABLE && (
          <label className={styles.devToggle}>
            <input type="checkbox" checked={mock} onChange={(e) => onMock(e.target.checked)} />
            Mocked data (localhost)
          </label>
        )}
      </div>

      <WidgetFrame size="large" aria-label={t('fotm.chartLabel')}>
        <WidgetHeader className={styles.header}>
          <WidgetTitle className={styles.chartTitle}>
            {t(mode === 'hero' ? 'fotm.chartLabelHero' : 'fotm.chartLabel')}
          </WidgetTitle>
          <span className={styles.meta}>
            {[
              `${rating.toLocaleString(locale.htmlLang)}+`,
              regionLabel(t, region),
              history.data && `${dayText(history.data.from)} – ${dayText(history.data.to)}`,
              history.data &&
                t('fotm.daysWithData', {
                  days: history.data.days.length,
                  of: all?.dates.length ?? 0,
                }),
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </WidgetHeader>
        <div className={styles.body}>
          {history.isError ? (
            <p className={styles.message} role="alert">
              {t('fotm.unavailable')}
            </p>
          ) : !all ? (
            <div className={styles.skeleton} aria-busy />
          ) : all.series.length === 0 ? (
            <p className={styles.message}>{t('rep.noSpecs')}</p>
          ) : (
            <FotmChart
              dates={all.dates}
              series={lines}
              hoveredKey={highlight}
              onHighlight={setHighlight}
              pinned={pins}
              onPin={togglePin}
            />
          )}
        </div>

        {all && all.series.length > 0 && (
          <div className={styles.legend}>
            <div className={styles.legendTools}>
              <span>
                {t(mode === 'hero' ? 'fotm.legendHero' : 'fotm.legend', {
                  shown: lines.length,
                  total: all.series.length,
                })}
              </span>
              {/* Each pressed while the lines shown are exactly its pick */}
              <button
                type="button"
                className={styles.tool}
                aria-pressed={isTop}
                onClick={() => setPicked(topKeys)}
              >
                {t('fotm.top', { count: topCount })}
              </button>
              <button
                type="button"
                className={styles.tool}
                aria-pressed={isAll}
                onClick={() => setPicked(all.series.map((s) => s.key))}
              >
                {t('fotm.all')}
              </button>
              <button
                type="button"
                className={styles.tool}
                aria-pressed={shown.size === 0}
                onClick={() => setPicked([])}
              >
                {t('fotm.none')}
              </button>
            </div>
            {/* Every spec in the filter, most played today first: a toggle for its line */}
            <ul className={styles.chips}>
              {all.series.map((s) => (
                <li key={s.key}>
                  <button
                    type="button"
                    className={styles.chip}
                    data-class-color={classColorKey(s.classSlug)}
                    aria-pressed={shown.has(s.key)}
                    onClick={() => toggle(s.key)}
                    onMouseEnter={() => shown.has(s.key) && setHighlight(s.key)}
                    onMouseLeave={() => setHighlight(null)}
                    onFocus={() => shown.has(s.key) && setHighlight(s.key)}
                    onBlur={() => setHighlight(null)}
                  >
                    <FotmIcon item={s.item} />
                    <span className={styles.chipName}>{itemName(s)}</span>
                    <span className={styles.chipShare}>{pct(s.latest)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </WidgetFrame>
    </Page>
  );
}
