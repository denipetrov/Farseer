import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  PVP_BOARDS,
  PVP_BRACKETS,
  isLadderRole,
  pvpHeroTalentsQuery,
  type PvpBoard,
  type PvpBracket,
} from '@/api/pvp';
import { ClassIcon } from '@/components/ClassIcon';
import { GameIcon } from '@/components/GameIcon';
import { HoverCard } from '@/components/HoverCard';
import { HeroTalentIcon } from '@/components/HeroTalentIcon';
import { Page, PageTitle } from '@/components/Page';
import { SpecIcon } from '@/components/SpecIcon';
import { tabBar } from '@/components/tabBar';
import { IconFilter } from '@/components/widgets/IconFilter';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { classSpecRoleTree } from '@/components/widgets/filterTrees';
import { regionLabel } from '@/i18n/labels';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import {
  heroTalentCards,
  type ClassCard,
  type HeroTalentStatsSearch,
  type SpecCard,
} from '@/lib/heroTalentStats';
import { useSite } from '@/lib/site';
import { classColorKey } from '@/lib/wow/classes';
import { classOfSpec } from '@/lib/wow/specs';
import { TopSelect } from './StatsControls';
import styles from './HeroTalentsPage.module.css';

const SHORT: Partial<Record<PvpBracket, MessageKey>> = {
  blitz: 'bracketShort.blitz',
  rbg: 'bracketShort.rbg',
};

/**
 * PvP Stats → Hero Talents (the user's design, 2026-11-27): which hero talent trees each
 * spec's top players take, from `GET /pvp/hero-talents` (current season, no rating: its
 * `top` per spec).
 *
 * - The heading, the bracket and region bar, then "Top N per spec" and the leaderboard's
 *   class → spec / role filter (the user: easier to find a spec), all in the URL.
 * - "892 players with a known hero talent build", then a card per class (two across): each
 *   spec's rating range and players with a known tree of the top asked (a warning when its
 *   ladder has fewer), then both its trees, the untaken at 0, a bar each in the class colour.
 */
export function HeroTalentsPage({ search }: { search: HeroTalentStatsSearch }) {
  const { t, name, locale } = useI18n();
  const site = useSite();
  const navigate = useNavigate();
  const tree = useMemo(() => classSpecRoleTree(name, t), [name, t]);
  const bracket = search.bracket ?? 'shuffle';
  const region = search.region ?? 'world';
  const top = search.top ?? 100;
  const { class: cls, spec, role } = search;

  const data = useQuery({
    ...pvpHeroTalentsQuery(region, bracket, top),
    placeholderData: (previous) => previous,
  });
  const cards = data.data ? heroTalentCards(data.data, { cls, spec, role }) : [];
  const covered = cards.reduce((n, c) => n + c.covered, 0);
  const art = iconUrl(`pvp/brackets/${bracket}`);

  // A link to this page with part of the view changed; defaults are left out of the URL
  const to = (next: Partial<HeroTalentStatsSearch>) => {
    const s = { ...search, ...next };
    return {
      to: '/$game/$locale/pvp/stats/hero-talents' as const,
      params: site,
      search: {
        ...s,
        bracket: s.bracket === 'shuffle' ? undefined : s.bracket,
        region: s.region === 'world' ? undefined : s.region,
        top: s.top === 100 ? undefined : s.top,
      } satisfies HeroTalentStatsSearch,
      // A key left out must be absent from the URL too, or its tab is marked current
      activeOptions: { explicitUndefined: true },
    };
  };
  const go = (next: Partial<HeroTalentStatsSearch>) => {
    const { to: path, params, search: s } = to(next);
    void navigate({ to: path, params, search: s });
  };

  return (
    <Page className={styles.page}>
      <PageTitle className={styles.title}>
        {art && <GameIcon src={art} label="" shape="round" />}
        <span>{t('heroStats.pageTitle', { bracket: t(`bracket.${bracket}`) })}</span>
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
        <TopSelect top={top} onPick={(n) => go({ top: n })} />
      </div>

      <WidgetGrid dense>
        <IconFilter
          options={tree}
          value={cls ? (spec ? [cls, spec] : [cls]) : role ? [role] : []}
          levels={[t('filter.classOrRole'), t('filter.spec')]}
          label={t('filter.leaderboard')}
          onChange={([first, sp]) =>
            go(
              first && !isLadderRole(first)
                ? { class: first, spec: sp, role: undefined }
                : {
                    class: undefined,
                    spec: undefined,
                    role: isLadderRole(first) ? first : undefined,
                  },
            )
          }
        />
      </WidgetGrid>

      {data.isError ? (
        <p className={styles.message} role="alert">
          {t('heroStats.unavailable')}
        </p>
      ) : !data.data ? (
        <div className={styles.skeleton} aria-busy />
      ) : (
        <>
          <p className={styles.summary}>
            <strong>{covered.toLocaleString(locale.htmlLang)}</strong> {t('heroStats.summary')}{' '}
            <span>{t('heroStats.summaryNote')}</span>
          </p>
          {cards.length === 0 ? (
            <p className={styles.message}>{t('rep.noSpecs')}</p>
          ) : (
            <div className={styles.cards} data-stale={data.isPlaceholderData || undefined}>
              {cards.map((card) => (
                <ClassCardView
                  key={card.cls.slug}
                  card={card}
                  bracket={bracket}
                  region={region}
                  top={top}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Page>
  );
}

/** A class's card: its specs, each with its trees */
function ClassCardView({
  card,
  bracket,
  region,
  top,
}: {
  card: ClassCard;
  bracket: PvpBracket;
  region: PvpBoard;
  top: number;
}) {
  const { name, locale } = useI18n();
  return (
    <section className={styles.card} data-class-color={classColorKey(card.cls.slug)}>
      <header className={styles.cardHeader}>
        <h2>
          <ClassIcon cls={card.cls.slug} size="sm" />
          {name('classes', card.cls.id, card.cls.name)}
        </h2>
        <span>{card.covered.toLocaleString(locale.htmlLang)}</span>
      </header>
      {card.specs.map((s) => (
        <SpecBlock key={s.sp.slug} card={s} bracket={bracket} region={region} top={top} />
      ))}
    </section>
  );
}

/**
 * The ⚠ of a spec whose coverage isn't full (the user, 2026-11-27): its ladder had fewer
 * players than the top asked, or some have no known build yet. Hover, focus or a click (for
 * touch; it stays until clicked again or focus leaves) shows why, with the numbers.
 */
function CoverageInfo({ card, top }: { card: SpecCard; top: number }) {
  const { t, name, locale } = useI18n();
  const id = useId();
  const anchor = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const [held, setHeld] = useState(false);
  const { sp, entry } = card;
  const num = (n: number) => n.toLocaleString(locale.htmlLang);
  const cls = classOfSpec(sp);
  const specName = t('spec.label', {
    spec: name('specs', sp.id, sp.name),
    class: name('classes', cls.id, cls.name),
  });
  const coverage = (entry.characters ? entry.covered / entry.characters : 0).toLocaleString(
    locale.htmlLang,
    { style: 'percent', maximumFractionDigits: 1 },
  );
  const lines = [
    entry.characters < top
      ? t('heroStats.infoShort', { count: num(entry.characters), top: num(top) })
      : t('heroStats.infoFull', { count: num(entry.characters) }),
    entry.covered < entry.characters
      ? t('heroStats.infoCovered', { covered: num(entry.covered), coverage })
      : t('heroStats.infoAllCovered'),
    entry.minRating != null && entry.maxRating != null
      ? t('heroStats.infoRating', { min: num(entry.minRating), max: num(entry.maxRating) })
      : null,
  ].filter(Boolean);
  const open = hover || held;

  return (
    <>
      <button
        ref={anchor}
        type="button"
        className={styles.info}
        aria-label={t('heroStats.infoLabel', { spec: specName })}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setHeld((h) => !h)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => {
          setHover(false);
          setHeld(false);
        }}
      >
        ⚠
      </button>
      {open && (
        <HoverCard anchor={anchor} id={id}>
          <strong className={styles.infoTitle}>{specName}</strong>
          {lines.map((line) => (
            <span key={line} className={styles.infoLine}>
              {line}
            </span>
          ))}
        </HoverCard>
      )}
    </>
  );
}

/**
 * A spec: its name (a link to its ladder), its top players' rating range, those with a known
 * tree of the top asked (a warning when the ladder had fewer players), then its trees
 */
function SpecBlock({
  card,
  bracket,
  region,
  top,
}: {
  card: SpecCard;
  bracket: PvpBracket;
  region: PvpBoard;
  top: number;
}) {
  const { t, name, locale } = useI18n();
  const site = useSite();
  const { sp, entry, trees } = card;
  const num = (n: number) => n.toLocaleString(locale.htmlLang);
  const pct = (n: number) =>
    n.toLocaleString(locale.htmlLang, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  const short = entry.characters < top;
  const unknown = entry.characters - entry.covered;

  return (
    <div className={styles.spec}>
      <div className={styles.specHead}>
        <Link
          to="/$game/$locale/pvp/leaderboards/$bracket/$class/$spec"
          params={{ ...site, bracket, class: sp.classSlug, spec: sp.slug }}
          search={region === 'world' ? {} : { region }}
          className={styles.specName}
        >
          <SpecIcon spec={sp.id} size="sm" />
          {name('specs', sp.id, sp.name)}
        </Link>
        {entry.minRating != null && entry.maxRating != null && (
          <span className={styles.range}>
            {num(entry.minRating)}–{num(entry.maxRating)}
          </span>
        )}
        <span className={styles.pool} data-short={short || unknown > 0 || undefined}>
          {(short || unknown > 0) && <CoverageInfo card={card} top={top} />}
          <strong>{num(entry.covered)}</strong> / {num(top)}
        </span>
      </div>
      {short && (
        <p className={styles.shortNote}>
          {t('heroStats.shortPool', { count: num(entry.characters) })}
        </p>
      )}
      <ul className={styles.trees}>
        {trees.map((row) => (
          <li key={row.tree.id} className={styles.tree} data-zero={row.count === 0 || undefined}>
            <HeroTalentIcon tree={row.tree.id} size="sm" />
            <span className={styles.treeName}>
              {name('heroTalents', row.tree.id, row.tree.name)}
            </span>
            {/* The tree's share: --share (0–1), from the data */}
            <span
              className={styles.bar}
              style={{ '--share': row.share } as CSSProperties}
              aria-hidden
            />
            <span className={styles.count}>{num(row.count)}</span>
            <span className={styles.share}>{pct(row.share)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
