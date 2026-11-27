import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import type { CSSProperties, ReactNode } from 'react';
import {
  pvpCutoffsQuery,
  type LadderRole,
  type PvpBoard,
  type PvpCutoffs,
  type PvpSpecCutoff,
  type TitleBracket,
} from '@/api/pvp';
import { ClassIcon } from '@/components/ClassIcon';
import { SpecIcon } from '@/components/SpecIcon';
import { CLASSES_AZ, specsAz } from '@/components/nav/gameOrder';
import { WidgetFrame, WidgetHeader, WidgetTitle } from '@/components/widgets/Widget';
import { regionLabel, roleText } from '@/i18n/labels';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import { useSite } from '@/lib/site';
import { classColorKey, resolveClass } from '@/lib/wow/classes';
import { rankForRating } from '@/lib/wow/pvpRank';
import { ladderReward } from '@/lib/wow/pvpSeason';
import { roleKindOfSlug } from '@/lib/wow/roles';
import { resolveSpec, type Spec } from '@/lib/wow/specs';
import { specInRole } from '@/lib/wow/tierRoles';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { PieRoleIcon, RolePie } from './RolePie';
import styles from './RankOneCutoffs.module.css';

type Region = Exclude<PvpBoard, 'world'>;

interface Filter {
  /** The page's class (Soulseeker's slug), and its spec on a spec page */
  cls?: string;
  spec?: string;
  role?: LadderRole;
}

/**
 * Rank One cutoffs (the user's designs, 2026-11-27), from `GET /pvp/cutoffs` for one region:
 * Blizzard sets the cutoffs per region, so the page leaves it out on World. Every ladder
 * with a title has it (not 2v2):
 *
 * - **Solo Shuffle and Blitz** give their title per spec, so each spec ladder has its own
 *   cutoff: a card per class (A–Z), each spec's cutoff in its rank colour (the rating's
 *   band), linking to that spec's ladder; how many reach it on hover.
 * - **3v3 and RBG** have one cutoff: the title and its rating, then who holds a Rank One
 *   spot, split by role (a bar) and by spec (a column per role, most first).
 *
 * It follows the page's filter: a class keeps its specs (a spec page marks the spec), a role
 * keeps that role's. Nothing while it loads or when the region has no cutoffs yet.
 */
export function RankOneCutoffs({
  bracket,
  region,
  ...filter
}: { bracket: TitleBracket; region: Region } & Filter) {
  const { t, name, locale } = useI18n();
  const { faction } = usePreferences().preferences;
  const { data } = useQuery(pvpCutoffsQuery(region, bracket));
  if (!data?.specs.length) return null;

  const perSpec = bracket === 'shuffle' || bracket === 'blitz';
  // The title: the ladder's (3v3, RBG), or the first spec ladder's (all share it); RBG and
  // Blitz name it per faction, the header's faction's
  const reward = ladderReward(
    { cutoff: perSpec ? (data.specs.find((s) => s.cutoff)?.cutoff ?? null) : data.cutoff },
    region,
    faction,
  );
  const read = data.rewardsFetchedAt
    ? new Intl.DateTimeFormat(locale.htmlLang, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(data.rewardsFetchedAt),
      )
    : null;
  const about = [
    t(perSpec ? 'cutoffs.about' : 'cutoffs.aboutLadder', { region: regionLabel(t, region) }),
    reward?.title,
    read && t('cutoffs.read', { date: read }),
  ]
    .filter(Boolean)
    .join(' · ');
  const c = filter.cls ? resolveClass(filter.cls) : undefined;
  const scope = c
    ? name('classes', c.id, c.name)
    : filter.role
      ? roleText(t, roleKindOfSlug(filter.role)!)
      : t('cutoffs.allSpecs');

  const body = perSpec ? (
    <SpecCards data={data} bracket={bracket} region={region} filter={filter} />
  ) : (
    <RoleSplit
      data={data}
      bracket={bracket}
      region={region}
      filter={filter}
      title={reward?.title}
      rating={reward?.rating ?? null}
      updated={read}
    />
  );
  if (!body) return null;

  return (
    <WidgetFrame size="large" aria-label={t('cutoffs.title')}>
      <WidgetHeader className={styles.header}>
        <WidgetTitle className={styles.title}>{t('cutoffs.title')}</WidgetTitle>
        {/* The why on hover and for screen readers: the region, the title, when it was read */}
        <span className={styles.info} title={about} aria-label={about} role="img">
          i
        </span>
        <span className={styles.scope}>· {scope}</span>
      </WidgetHeader>
      {body}
    </WidgetFrame>
  );
}

/** A spec's row link to its ladder on this bracket, in this region */
function SpecLink({
  bracket,
  region,
  sp,
  current,
  hover,
  children,
}: {
  bracket: TitleBracket;
  region: Region;
  sp: Spec;
  current: boolean;
  hover: string;
  children: ReactNode;
}) {
  const site = useSite();
  return (
    <Link
      to="/$game/$locale/pvp/leaderboards/$bracket/$class/$spec"
      params={{ ...site, bracket, class: sp.classSlug, spec: sp.slug }}
      search={{ region }}
      className={styles.spec}
      aria-current={current ? 'page' : undefined}
      title={hover}
    >
      {children}
    </Link>
  );
}

/** Shuffle and Blitz: a card per class, each spec's own cutoff */
function SpecCards({
  data,
  bracket,
  region,
  filter,
}: {
  data: PvpCutoffs;
  bracket: TitleBracket;
  region: Region;
  filter: Filter;
}) {
  const { t, name, locale } = useI18n();
  const bySpec = new Map(data.specs.map((s) => [`${s.class}-${s.spec}`, s]));
  const cards = CLASSES_AZ.filter((c) => !filter.cls || c.slug === filter.cls)
    .map((c) => ({
      cls: c,
      specs: specsAz(c.slug)
        .filter((sp) => !filter.role || specInRole({ class: c.slug, spec: sp.slug }, filter.role))
        .map((sp) => ({ sp, entry: bySpec.get(`${c.slug}-${sp.slug}`) }))
        .filter((x): x is { sp: Spec; entry: PvpSpecCutoff } => !!x.entry?.cutoff?.rating),
    }))
    .filter((card) => card.specs.length);
  if (!cards.length) return null;

  return (
    <ul className={styles.cards}>
      {cards.map(({ cls: c, specs }) => (
        <li key={c.slug} className={styles.card}>
          <h3 className={styles.className} data-class-color={classColorKey(c.slug)}>
            <ClassIcon cls={c.slug} size="sm" />
            {name('classes', c.id, c.name)}
          </h3>
          <ul className={styles.specs}>
            {specs.map(({ sp, entry }) => {
              const rating = entry.cutoff!.rating!;
              return (
                <li key={sp.slug}>
                  <SpecLink
                    bracket={bracket}
                    region={region}
                    sp={sp}
                    current={c.slug === filter.cls && sp.slug === filter.spec}
                    hover={t('cutoffs.reach', {
                      count: entry.count.toLocaleString(locale.htmlLang),
                    })}
                  >
                    <SpecIcon spec={sp.id} size="sm" />
                    <span className={styles.specName}>{name('specs', sp.id, sp.name)}</span>
                    <span className={styles.rating} data-rank={rankForRating({ rating }).id}>
                      {rating}
                    </span>
                  </SpecLink>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** The role columns, in the user's example's order */
const SPLIT_ROLES = ['melee', 'ranged', 'healer', 'tank'] as const;
type SplitRole = (typeof SPLIT_ROLES)[number];
const SPLIT_LABEL: Record<SplitRole, MessageKey> = {
  melee: 'tier.role.melee',
  ranged: 'tier.role.ranged',
  healer: 'tier.role.healer',
  tank: 'tier.role.tank',
};
/** The columns' stacks: Tanks sit under Healers */
const STACKS: readonly (readonly SplitRole[])[] = [['melee'], ['ranged'], ['healer', 'tank']];
const splitRoleOf = (sp: Spec): SplitRole =>
  sp.role === 'dps' ? (sp.subRole === 'melee' ? 'melee' : 'ranged') : (sp.role as SplitRole);

/**
 * 3v3 and RBG: the title and its rating; how many hold a Rank One spot, and those not yet
 * identified (no spec known: Rankwarden has not read the character); the split by role, a
 * bar; then a column per role, its specs most first, each with a bar against the column's
 * most. The page's role filter keeps that role's columns (DPS: melee and ranged).
 */
function RoleSplit({
  data,
  bracket,
  region,
  filter,
  title,
  rating,
  updated,
}: {
  data: PvpCutoffs;
  bracket: TitleBracket;
  region: Region;
  filter: Filter;
  title: string | undefined;
  rating: number | null;
  updated: string | null;
}) {
  const { t, name, locale } = useI18n();
  const num = (n: number) => n.toLocaleString(locale.htmlLang);
  const pct = (n: number, of: number) =>
    (of ? n / of : 0).toLocaleString(locale.htmlLang, { style: 'percent' });

  const known = data.specs
    .map((entry) => ({
      entry,
      sp: entry.class && entry.spec ? resolveSpec(entry.spec, entry.class) : undefined,
    }))
    .filter((x): x is { entry: PvpSpecCutoff; sp: Spec } => !!x.sp)
    .filter(({ sp }) => !filter.cls || sp.classSlug === filter.cls)
    .filter(
      ({ sp }) => !filter.role || specInRole({ class: sp.classSlug, spec: sp.slug }, filter.role),
    );
  // Not yet identified: only without a filter (their class and role are unknown)
  const unknown =
    filter.cls || filter.role
      ? 0
      : data.total - data.specs.reduce((n, s) => n + (s.class ? s.count : 0), 0);
  const columns = SPLIT_ROLES.filter(
    (r) =>
      !filter.role || (filter.role === 'dps' ? r === 'melee' || r === 'ranged' : filter.role === r),
  ).map((r) => {
    const rows = known
      .filter(({ sp }) => splitRoleOf(sp) === r)
      .sort((a, b) => b.entry.count - a.entry.count);
    return { role: r, rows, count: rows.reduce((n, x) => n + x.entry.count, 0) };
  });
  const identified = columns.reduce((n, col) => n + col.count, 0);

  return (
    <div className={styles.split}>
      <div className={styles.summary}>
        <div className={styles.hero}>
          <span className={styles.heroLabel}>{t('cutoffs.titleLabel')}</span>
          {title && <span className={styles.heroTitle}>{title}</span>}
          {rating != null && (
            <span className={styles.heroRating} data-rank="rank-one">
              {rating}
            </span>
          )}
          {updated && (
            <span className={styles.heroUpdated}>{t('cutoffs.read', { date: updated })}</span>
          )}
        </div>

        <div className={styles.roles}>
          <p className={styles.positions}>
            <span>
              {t('cutoffs.positions')} <strong>{num(identified + unknown)}</strong>
            </span>
            {unknown > 0 && (
              <span title={t('cutoffs.unknownHint')}>
                {t('cutoffs.unknown')} <strong>{num(unknown)}</strong>
              </span>
            )}
          </p>
          {/* The split (the user, 2026-11-27): a pie in the role colours with the role icons,
              and beside it each role by its icon, name, count and share */}
          <div className={styles.pieRow}>
            <RolePie
              slices={columns.map((col) => ({
                role: col.role,
                count: col.count,
                label: `${t(SPLIT_LABEL[col.role])} ${num(col.count)} (${pct(col.count, identified)})`,
              }))}
            />
            <ul className={styles.legend}>
              {columns.map((col) => (
                <li key={col.role} data-role={col.role}>
                  <PieRoleIcon role={col.role} />
                  <span className={styles.legendName}>{t(SPLIT_LABEL[col.role])}</span>
                  <strong>{num(col.count)}</strong>
                  <span className={styles.pct}>{pct(col.count, identified)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Three stacks, Tanks under Healers as in the user's example: tanks are few */}
      <div className={styles.columns}>
        {STACKS.map((stack) => {
          const cols = columns.filter((col) => stack.includes(col.role));
          return cols.length ? (
            <div key={stack[0]} className={styles.stack}>
              {cols.map((col) => {
                const most = col.rows[0]?.entry.count ?? 0;
                return (
                  <section key={col.role} className={styles.column} data-role={col.role}>
                    <h3 className={styles.columnTitle}>
                      <PieRoleIcon role={col.role} />
                      {t(SPLIT_LABEL[col.role])} <span>{num(col.count)}</span>
                    </h3>
                    {col.rows.length > 0 && (
                      <ol className={styles.rows}>
                        {col.rows.map(({ entry, sp }, i) => (
                          <li key={`${sp.classSlug}-${sp.slug}`}>
                            <SpecLink
                              bracket={bracket}
                              region={region}
                              sp={sp}
                              current={sp.classSlug === filter.cls && sp.slug === filter.spec}
                              hover={t('cutoffs.holders', { count: num(entry.count) })}
                            >
                              <span className={styles.place}>#{i + 1}</span>
                              <ClassIcon cls={sp.classSlug} size="sm" />
                              <SpecIcon spec={sp.id} size="sm" />
                              <span
                                className={styles.specName}
                                data-class-color={classColorKey(sp.classSlug)}
                              >
                                {name('specs', sp.id, sp.name)}
                              </span>
                              <strong className={styles.count}>{num(entry.count)}</strong>
                              {/* Against the column's most: --share (0–1), known only from the data */}
                              <span
                                className={styles.share}
                                data-class-color={classColorKey(sp.classSlug)}
                                style={
                                  { '--share': most ? entry.count / most : 0 } as CSSProperties
                                }
                                aria-hidden
                              />
                            </SpecLink>
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                );
              })}
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
