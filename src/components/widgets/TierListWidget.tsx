import { Link, type LinkOptions } from '@tanstack/react-router';
import { useState } from 'react';
import { TIERS, type TierList, type TierListSpec } from '@/api/tierList';
import { GameIcon } from '@/components/GameIcon';
import { RoleIcon } from '@/components/RoleIcon';
import { SpecIcon } from '@/components/SpecIcon';
import { tabBar } from '@/components/tabBar';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { cx } from '@/lib/cx';
import { classColorKey } from '@/lib/wow/classes';
import { seasonShortName } from '@/lib/wow/pvpSeason';
import { TIER_ROLES, specInRole, type TierRole } from '@/lib/wow/tierRoles';
import type { IconSize } from '@/styles/iconSizes';
import { WidgetFooter, WidgetFrame } from './Widget';
import styles from './TierListWidget.module.css';

const ROLE_LABEL: Record<TierRole, MessageKey> = {
  all: 'tier.role.all',
  dps: 'tier.role.dps',
  healer: 'tier.role.healer',
  melee: 'tier.role.melee',
  ranged: 'tier.role.ranged',
  tank: 'tier.role.tank',
};

/**
 * A tier list (the user's design, 2026-11-27): every spec in its tier, S to D, from
 * Soulseeker's `/pvp/tier-list` or `/pve/tier-list` (same spec shape).
 *
 * - The header: the title, the season, the region and when it was computed; a role
 *   filter (All, DPS, Healers, Melee, Ranged, Tanks) on the right. The bracket and region
 *   are the page's: its own bar (standalone pages) or the leaderboard's.
 * - "How are rankings calculated?" opens Soulseeker's rules, in the page's language.
 * - Each tier a row: its letter on the tier's colour (the item quality colours, legendary
 *   to poor), then its specs best first. A spec is its icon and name in its class colour,
 *   its score on hover, and a link to its board when `linkFor` gives one.
 * - A tier with no spec (after a role filter, or S under 5 specs) is left out.
 */
export function TierListWidget({
  title,
  list,
  status,
  regionName,
  floor,
  averageTitle,
  linkFor,
  compact = false,
  mini,
}: {
  title: string;
  list: TierList | undefined;
  status: 'pending' | 'error' | 'success';
  /** The region shown, by name ("Europe") */
  regionName: string;
  /** The floor representation and average count from, as text ("1,500 rating") */
  floor: string;
  /** The third factor's name: "Average rating" (PvP), "Average score" (PvE) */
  averageTitle: string;
  linkFor?: (spec: TierListSpec) => LinkOptions;
  /**
   * Shorter rows of icon-only chips (name and score on hover), as the home page's: on the
   * leaderboard pages, where the list sits above the board (the user, 2026-11-27: it must
   * leave the board in view on 1080p). The standalone pages show it full size.
   */
  compact?: boolean;
  /**
   * The home page's version (the user, 2026-11-27), above each ladder at its width: the
   * title, disclaimer and season line, then each tier's spec icons only (name and score on
   * hover), and a link to the full list. No role filter or "how" panel: no room.
   */
  mini?: { size: 'small' | 'medium'; fullLink: LinkOptions };
}) {
  const { t, locale, name } = useI18n();
  const [role, setRole] = useState<TierRole>('all');
  const [howOpen, setHowOpen] = useState(false);
  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale.htmlLang, { dateStyle: 'medium' }).format(new Date(iso));
  const num = (n: number, digits = 0) =>
    n.toLocaleString(locale.htmlLang, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

  const specs = list?.specs.filter((s) => specInRole(s, role)) ?? [];
  const meta = list
    ? [
        seasonShortName(list.seasonName),
        regionName,
        t('tier.updated', { date: date(list.computedAt) }),
      ]
        .filter(Boolean)
        .join(' · ')
    : regionName;

  // The rules (Soulseeker's), shown under the "how" link, or the ⓘ on the compact list
  const howBody = (
    <div className={styles.howBody}>
      <p>{t('tier.howIntro')}</p>
      <ul className={styles.factors}>
        <li>
          <strong>
            <span className={styles.points}>45</span> {t('tier.density')}
          </strong>
          <span>{t('tier.densityText')}</span>
        </li>
        <li>
          <strong>
            <span className={styles.points}>35</span> {t('tier.representation')}
          </strong>
          <span>{t('tier.representationText', { floor })}</span>
        </li>
        <li>
          <strong>
            <span className={styles.points}>20</span> {averageTitle}
          </strong>
          <span>{t('tier.averageText', { floor })}</span>
        </li>
      </ul>
      <p>
        <strong>{t('tier.boundaries')}</strong> {t('tier.boundariesText')}
      </p>
      <p className={styles.note}>{t('tier.note')}</p>
      {compact && <p className={styles.note}>{meta}</p>}
    </div>
  );

  return (
    <WidgetFrame
      size={mini?.size ?? 'large'}
      className={styles.frame}
      data-compact={compact || undefined}
      data-mini={mini ? '' : undefined}
      aria-label={title}
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          {/* The title, and beside it why the list may lag a patch (the user, 2026-11-27) */}
          <div className={styles.titleLine}>
            <h2 className={styles.title}>{title}</h2>
            {/* Compact: the "how" is an ⓘ beside the title, opening the rules below the
                header (the user, 2026-11-27: one header line on the leaderboard pages) */}
            {compact && (
              <button
                type="button"
                className={styles.infoButton}
                aria-expanded={howOpen}
                aria-label={t('tier.how')}
                title={t('tier.how')}
                onClick={() => setHowOpen((o) => !o)}
              >
                <span className={styles.info} aria-hidden>
                  i
                </span>
              </button>
            )}
            <p className={styles.disclaimer}>{t('tier.disclaimer')}</p>
          </div>
          {/* Compact: no season line, the page's heading has the season (the date is in the rules) */}
          {!compact && <p className={styles.meta}>{meta}</p>}
        </div>
        {!mini && (
          <div className={tabBar.group} role="group" aria-label={t('tier.role.label')}>
            {/* The role icons, their names on hover and for screen readers (the user, 2026-11-27) */}
            {TIER_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                className={cx(tabBar.tab, styles.roleTab)}
                aria-pressed={r === role}
                aria-label={t(ROLE_LABEL[r])}
                title={t(ROLE_LABEL[r])}
                onClick={() => setRole(r)}
              >
                <RoleTabIcon role={r} size={compact ? 'sm' : 'md'} />
              </button>
            ))}
          </div>
        )}
      </header>

      {/* A quiet "ⓘ How are rankings calculated? ⌄" under the season line (the user's example,
          2026-11-27); the explanation opens below it in a box */}
      {compact && howOpen && howBody}
      {!mini && !compact && (
        <details className={styles.how}>
          <summary>
            <span className={styles.info} aria-hidden>
              i
            </span>
            {t('tier.how')}
            <span className={styles.chevron} aria-hidden />
          </summary>
          {howBody}
        </details>
      )}

      {status === 'error' ? (
        <p className={styles.message} role="alert">
          {t('tier.unavailable')}
        </p>
      ) : !list ? (
        <div className={styles.tiers} aria-busy>
          {TIERS.slice(0, 3).map((tier) => (
            <div key={tier} className={styles.tier} data-tier={tier}>
              <span className={styles.letter}>{tier}</span>
              <span className={styles.skeleton} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.tiers}>
          {TIERS.map((tier) => {
            const inTier = specs.filter((s) => s.tier === tier);
            if (!inTier.length) return null;
            return (
              <section key={tier} className={styles.tier} data-tier={tier}>
                <h3 className={styles.letter} aria-label={t('tier.tierName', { tier })}>
                  {tier}
                </h3>
                <ul className={styles.specs}>
                  {inTier.map((s) => {
                    const sp = s.specId ?? s.spec;
                    const cls = s.classId ?? s.class;
                    const specName = s.specId != null ? name('specs', s.specId, s.spec) : s.spec;
                    const className =
                      s.classId != null ? name('classes', s.classId, s.class) : s.class;
                    const hover = t('tier.specHover', {
                      spec: specName,
                      class: className,
                      score: num(s.score, 1),
                      density: num(s.topDensity.score, 1),
                      representation: num(s.representation.score, 1),
                      average: num(s.averageRating.score, 1),
                      players: num(s.representation.count),
                    });
                    const chip = (
                      <>
                        <SpecIcon spec={sp} cls={cls} size={compact || mini ? 'sm' : 'md'} />
                        {/* The mini list shows icons only: the name stays for screen readers */}
                        <span className={mini || compact ? 'sr-only' : styles.specName}>
                          {specName}
                        </span>
                      </>
                    );
                    const link = linkFor?.(s);
                    return (
                      <li key={`${s.class}-${s.spec}`}>
                        {link ? (
                          <Link
                            {...link}
                            className={styles.spec}
                            data-class-color={classColorKey(cls)}
                            title={hover}
                          >
                            {chip}
                          </Link>
                        ) : (
                          <span
                            className={styles.spec}
                            data-class-color={classColorKey(cls)}
                            title={hover}
                          >
                            {chip}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {mini && (
        <WidgetFooter>
          <span className={styles.fullLink}>
            <Link {...mini.fullLink}>
              {t('tier.viewFull')}
              <span aria-hidden>→</span>
            </Link>
          </span>
        </WidgetFooter>
      )}
    </WidgetFrame>
  );
}

/**
 * A role tab's icon: the role art (`melee` and `ranged` are damage dealers of that reach),
 * and for All the round "all roles" flag (`roles/all`). Named by the tab around it.
 */
function RoleTabIcon({ role, size }: { role: TierRole; size: IconSize }) {
  if (role === 'all') {
    const src = iconUrl('roles/all');
    return src ? <GameIcon src={src} label="" size={size} shape="round" /> : null;
  }
  return role === 'melee' || role === 'ranged' ? (
    <RoleIcon role="dps" subRole={role} size={size} />
  ) : (
    <RoleIcon role={role} size={size} />
  );
}
