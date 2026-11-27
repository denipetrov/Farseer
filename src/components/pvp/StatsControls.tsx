import { Link, type LinkOptions } from '@tanstack/react-router';
import { useId } from 'react';
import {
  HERO_TALENT_TOPS,
  REPRESENTATION_RATINGS,
  type HeroTalentTop,
  type RepresentationRating,
} from '@/api/pvp';
import { GameIcon } from '@/components/GameIcon';
import { RoleIcon } from '@/components/RoleIcon';
import { tabBar } from '@/components/tabBar';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { cx } from '@/lib/cx';
import { TIER_ROLES, type TierRole } from '@/lib/wow/tierRoles';
import styles from './StatsControls.module.css';

const ROLE_LABEL: Record<TierRole, MessageKey> = {
  all: 'tier.role.all',
  dps: 'tier.role.dps',
  healer: 'tier.role.healer',
  melee: 'tier.role.melee',
  ranged: 'tier.role.ranged',
  tank: 'tier.role.tank',
};

/**
 * The PvP stats pages' rating dropdown (Spec Representation, FOTM): Rankwarden's snapshot
 * ratings, 1500+ to 2700+.
 */
export function RatingSelect({
  rating,
  onPick,
}: {
  rating: RepresentationRating;
  onPick: (rating: RepresentationRating) => void;
}) {
  const { t, locale } = useI18n();
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {t('rep.rating')}
      </label>
      <select
        id={id}
        className={styles.select}
        value={rating}
        onChange={(e) => onPick(Number(e.target.value) as RepresentationRating)}
      >
        {REPRESENTATION_RATINGS.map((r) => (
          <option key={r} value={r}>
            {r.toLocaleString(locale.htmlLang)}+
          </option>
        ))}
      </select>
    </>
  );
}

/** The hero talents page's "Top N per spec" dropdown (Soulseeker's `top`) */
export function TopSelect({
  top,
  onPick,
}: {
  top: HeroTalentTop;
  onPick: (top: HeroTalentTop) => void;
}) {
  const { t } = useI18n();
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {t('heroStats.topLabel')}
      </label>
      <select
        id={id}
        className={styles.select}
        value={top}
        onChange={(e) => onPick(Number(e.target.value) as HeroTalentTop)}
      >
        {HERO_TALENT_TOPS.map((n) => (
          <option key={n} value={n}>
            {t('heroStats.top', { count: n })}
          </option>
        ))}
      </select>
    </>
  );
}

/**
 * The PvP stats pages' role tabs: icons only (as the tier list's), each its name on hover
 * and for screen readers, each a link (`linkFor`) so the role is in the URL.
 */
export function RoleTabs({
  role,
  linkFor,
}: {
  role: TierRole;
  linkFor: (role: TierRole) => LinkOptions;
}) {
  const { t } = useI18n();
  return (
    <nav className={tabBar.group} aria-label={t('tier.role.label')}>
      {TIER_ROLES.map((r) => (
        <Link
          key={r}
          className={cx(tabBar.tab, styles.roleTab)}
          {...linkFor(r)}
          aria-current={r === role ? 'page' : undefined}
          aria-label={t(ROLE_LABEL[r])}
          title={t(ROLE_LABEL[r])}
        >
          <RoleTabIcon role={r} />
        </Link>
      ))}
    </nav>
  );
}

/** A role tab's icon: All is the round "all roles" flag; melee and ranged are damage dealers */
function RoleTabIcon({ role }: { role: TierRole }) {
  if (role === 'all') {
    const src = iconUrl('roles/all');
    return src ? <GameIcon src={src} label="" size="sm" shape="round" /> : null;
  }
  return role === 'melee' || role === 'ranged' ? (
    <RoleIcon role="dps" subRole={role} size="sm" />
  ) : (
    <RoleIcon role={role} size="sm" />
  );
}
