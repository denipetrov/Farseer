import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import {
  PVP_BOARDS,
  PVP_BRACKETS,
  specRepresentationQuery,
  type PvpBoard,
  type PvpBracket,
  type RepresentationRating,
  type RepresentedSpec,
} from '@/api/pvp';
import { ApiError } from '@/api/errors';
import { ClassIcon } from '@/components/ClassIcon';
import { GameIcon } from '@/components/GameIcon';
import { HeroTalentIcon } from '@/components/HeroTalentIcon';
import { Page, PageTitle } from '@/components/Page';
import { RoleIcon } from '@/components/RoleIcon';
import { SpecIcon } from '@/components/SpecIcon';
import { tabBar } from '@/components/tabBar';
import { WidgetFrame, WidgetHeader, WidgetTitle } from '@/components/widgets/Widget';
import { regionLabel } from '@/i18n/labels';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import {
  REPRESENTATION_DAYS,
  daysBefore,
  representationColumns,
  shownSpecs,
  type RepresentationColumn,
  type RepresentationDay,
  type RepresentationSearch,
} from '@/lib/representation';
import { useSite } from '@/lib/site';
import { classColorKey } from '@/lib/wow/classes';
import { classOfSpec } from '@/lib/wow/specs';
import type { TierRole } from '@/lib/wow/tierRoles';
import { SpecBarChart } from './SpecBarChart';
import { RatingSelect, RoleTabs } from './StatsControls';
import styles from './RepresentationPage.module.css';

/** The page's view, its defaults filled in (the URL leaves them out) */
interface View {
  bracket: PvpBracket;
  region: PvpBoard;
  rating: RepresentationRating;
  role: TierRole;
  day: RepresentationDay;
}

const SHORT: Partial<Record<PvpBracket, MessageKey>> = {
  blitz: 'bracketShort.blitz',
  rbg: 'bracketShort.rbg',
};

const COLUMN_LABEL: Record<RepresentationColumn, MessageKey> = {
  melee: 'tier.role.melee',
  ranged: 'tier.role.ranged',
  healer: 'tier.role.healer',
  tank: 'tier.role.tank',
};

/** The columns' stacks: Tanks sit under Healers, as in the user's example */
const STACKS: readonly (readonly RepresentationColumn[])[] = [
  ['melee'],
  ['ranged'],
  ['healer', 'tank'],
];

/**
 * PvP Stats → Spec Representation (the user's design, 2026-11-27): who plays what at or
 * above a rating, on one day, from `GET /pvp/spec-representation` (one snapshot a day;
 * the 31-day history is the FOTM page's).
 *
 * - The heading, the bracket and region bar, then the page's own controls: the rating
 *   (Rankwarden's snapshot ratings, 1500+ to 2700+), the role (icons, as the tier list's)
 *   and the day (today, 7, 15 and 30 days before; days before the first with specs named
 *   are off).
 * - The bar chart (SpecBarChart), "3,991 of 5,007 ranked players" (the rest have no known
 *   spec yet), then a column per role (Tanks under Healers), each spec's players, its share
 *   of the column and a bar against the column's most.
 *
 * Everything is in the URL (`?bracket=3v3&region=us&rating=2100&role=healer&day=7`).
 */
export function RepresentationPage({ search }: { search: RepresentationSearch }) {
  const { t, name, locale } = useI18n();
  const site = useSite();
  const navigate = useNavigate();
  const bracket = search.bracket ?? 'shuffle';
  const region = search.region ?? 'world';
  const rating = search.rating ?? 2100;
  const role: TierRole = search.role ?? 'all';
  const day: RepresentationDay = search.day ?? 0;

  const latest = useQuery(specRepresentationQuery(region, bracket, rating, 'latest'));
  const date = latest.data && day ? daysBefore(latest.data.date, day) : null;
  const past = useQuery({
    ...specRepresentationQuery(region, bracket, rating, date ?? 'latest'),
    enabled: !!date,
    // A day without a snapshot is a 404: not worth retrying
    retry: (n, e) => !(e instanceof ApiError && e.status === 404) && n < 2,
  });
  const snapshot = day ? past : latest;
  const data = snapshot.data;
  const missing = snapshot.error instanceof ApiError && snapshot.error.status === 404;

  const num = (n: number) => n.toLocaleString(locale.htmlLang);
  const pct = (n: number) =>
    n.toLocaleString(locale.htmlLang, { style: 'percent', maximumFractionDigits: 2 });
  const dateText = (iso: string) =>
    new Intl.DateTimeFormat(locale.htmlLang, { dateStyle: 'medium', timeZone: 'UTC' }).format(
      new Date(`${iso}T00:00:00Z`),
    );
  const art = iconUrl(`pvp/brackets/${bracket}`);
  const shown = data ? shownSpecs(data.specs, role) : [];
  const columns = representationColumns(shown, role);

  // A link to this page with part of the view changed; defaults are left out of the URL
  const to = (next: Partial<View>) => {
    const s: View = { bracket, region, rating, role, day, ...next };
    const search: RepresentationSearch = {
      bracket: s.bracket === 'shuffle' ? undefined : s.bracket,
      region: s.region === 'world' ? undefined : s.region,
      rating: s.rating === 2100 ? undefined : s.rating,
      role: s.role === 'all' ? undefined : s.role,
      day: s.day === 0 ? undefined : s.day,
    };
    return {
      to: '/$game/$locale/pvp/stats/representation' as const,
      params: site,
      search,
      // A key left out must be absent from the URL too, or its tab is marked current
      activeOptions: { explicitUndefined: true },
    };
  };

  return (
    <Page className={styles.page}>
      <PageTitle className={styles.title}>
        {art && <GameIcon src={art} label="" shape="round" />}
        <span>{t('rep.pageTitle', { bracket: t(`bracket.${bracket}`) })}</span>
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

      {/* The page's controls: rating, role, day */}
      <div className={styles.controls}>
        <RatingSelect
          rating={rating}
          onPick={(r) => {
            const { to: path, params, search: next } = to({ rating: r });
            void navigate({ to: path, params, search: next });
          }}
        />
        <RoleTabs role={role} linkFor={(r) => to({ role: r })} />
        <nav className={tabBar.group} aria-label={t('rep.day')}>
          {REPRESENTATION_DAYS.map((d) => {
            const label = d ? t('rep.daysAgo', { days: d }) : t('rep.today');
            const iso = latest.data ? daysBefore(latest.data.date, d) : null;
            // Off before the first day with specs named (or with none at all)
            const off =
              !!latest.data &&
              (!latest.data.earliestDate || (!!iso && iso < latest.data.earliestDate));
            return off ? (
              <span key={d} className={tabBar.tab} aria-disabled title={t('rep.noData')}>
                {label}
              </span>
            ) : (
              <Link
                key={d}
                className={tabBar.tab}
                {...to({ day: d })}
                aria-current={d === day ? 'page' : undefined}
                title={iso ? dateText(iso) : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <WidgetFrame size="large" aria-label={t('nav.representation')}>
        <WidgetHeader className={styles.chartHeader}>
          <WidgetTitle className={styles.chartTitle}>{t('nav.representation')}</WidgetTitle>
          <span className={styles.chartMeta}>
            {[`${num(rating)}+`, regionLabel(t, region), data && dateText(data.date)]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </WidgetHeader>
        {snapshot.isError ? (
          <p className={styles.message} role={missing ? undefined : 'alert'}>
            {missing
              ? t('rep.noSnapshot', { date: date ? dateText(date) : '' })
              : t('widget.unavailable')}
          </p>
        ) : !data ? (
          <div className={styles.skeleton} aria-busy />
        ) : shown.length === 0 ? (
          <p className={styles.message}>{t('rep.noSpecs')}</p>
        ) : (
          <div className={styles.chartBody}>
            <SpecBarChart
              specs={shown}
              classified={data.classified}
              bracket={bracket}
              region={region}
            />
          </div>
        )}
      </WidgetFrame>

      {data && shown.length > 0 && (
        <>
          <p className={styles.summary}>
            {t('rep.summary', { classified: num(data.classified), total: num(data.total) })}
          </p>
          <div className={styles.columns}>
            {STACKS.map((stack) => {
              const cols = columns.filter((c) => stack.includes(c.column));
              return cols.length ? (
                <div key={stack[0]} className={styles.stack}>
                  {cols.map((col) => {
                    const most = col.rows[0]?.entry.count ?? 0;
                    return (
                      <section key={col.column} className={styles.column}>
                        <header className={styles.columnHeader}>
                          <h2>
                            <ColumnRoleIcon column={col.column} />
                            {t(COLUMN_LABEL[col.column])}
                          </h2>
                          <span>{t('rep.playersCount', { count: num(col.players) })}</span>
                        </header>
                        <ol className={styles.rows}>
                          {col.rows.map(({ entry, sp }, i) => (
                            <li key={`${sp.classSlug}-${sp.slug}`}>
                              <Link
                                to="/$game/$locale/pvp/leaderboards/$bracket/$class/$spec"
                                params={{ ...site, bracket, class: sp.classSlug, spec: sp.slug }}
                                search={region === 'world' ? {} : { region }}
                                className={styles.row}
                                data-class-color={classColorKey(sp.classSlug)}
                                title={t('spec.label', {
                                  spec: name('specs', sp.id, sp.name),
                                  class: name('classes', classOfSpec(sp).id, classOfSpec(sp).name),
                                })}
                              >
                                <span className={styles.place}>{i + 1}</span>
                                <ClassIcon cls={sp.classSlug} size="sm" />
                                <SpecIcon spec={sp.id} size="sm" />
                                <span className={styles.count}>{num(entry.count)}</span>
                                <span className={styles.share}>
                                  {pct(col.players ? entry.count / col.players : 0)}
                                </span>
                                {/* Against the column's most: --share (0–1), from the data */}
                                <span
                                  className={styles.bar}
                                  style={
                                    { '--share': most ? entry.count / most : 0 } as CSSProperties
                                  }
                                  aria-hidden
                                />
                              </Link>
                              <HeroSplit entry={entry} classSlug={sp.classSlug} />
                            </li>
                          ))}
                        </ol>
                      </section>
                    );
                  })}
                </div>
              ) : null;
            })}
          </div>
        </>
      )}
    </Page>
  );
}

/**
 * Under a spec, the split between its hero talents (the user, 2026-11-27): one bar in two
 * tones of the class colour (the most played first, full; the other lighter), each tree's
 * icon, name and share at its end. Shares are of the spec's players whose hero talents are
 * known (`heroTalentsClassified`); the counts are on hover. Nothing when none are known.
 */
function HeroSplit({ entry, classSlug }: { entry: RepresentedSpec; classSlug: string }) {
  const { t, name, locale } = useI18n();
  const trees = [...entry.heroTalents].sort((a, b) => b.count - a.count);
  if (!entry.heroTalentsClassified || !trees.length) return null;
  const pct = (n: number) =>
    n.toLocaleString(locale.htmlLang, { style: 'percent', maximumFractionDigits: 0 });
  const label = (h: (typeof trees)[number]) => name('heroTalents', h.id, h.name);
  const hover = trees
    .map(
      (h) =>
        `${label(h)}: ${t('rep.playersCount', { count: h.count.toLocaleString(locale.htmlLang) })}`,
    )
    .join(' · ');

  return (
    <div className={styles.hero} data-class-color={classColorKey(classSlug)} title={hover}>
      <ul className={styles.heroTrees}>
        {trees.map((h) => (
          <li key={h.id}>
            <HeroTalentIcon tree={h.id} size="sm" />
            <span className={styles.heroName}>{label(h)}</span>
            <span className={styles.heroShare}>{pct(h.share)}</span>
          </li>
        ))}
      </ul>
      {/* Each tree's part grows by its count: --part, from the data */}
      <div className={styles.heroBar} aria-hidden>
        {trees.map((h) => (
          <span key={h.id} style={{ '--part': h.count } as CSSProperties} />
        ))}
      </div>
    </div>
  );
}

/** A column's role icon beside its name (the user, 2026-11-27) */
function ColumnRoleIcon({ column }: { column: RepresentationColumn }) {
  return column === 'melee' || column === 'ranged' ? (
    <RoleIcon role="dps" subRole={column} size="sm" />
  ) : (
    <RoleIcon role={column} size="sm" />
  );
}
