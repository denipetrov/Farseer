/**
 * Translated labels for values the API sends as codes (regions, roles). The English
 * helpers in `src/lib/wow/` stay for code that has no translator (tests, logs).
 */
import type { RoleKind } from '@/lib/wow/roles';
import type { Translate } from './messages';

const REGIONS = ['us', 'eu', 'kr', 'tw', 'cn'] as const;

/** "eu" → "Europe" / "Europa" / "유럽"; an unknown region is shown as its code in capitals. */
export function regionLabel(t: Translate, region: string): string {
  const code = region.trim().toLowerCase();
  return (REGIONS as readonly string[]).includes(code)
    ? t(`region.${code as (typeof REGIONS)[number]}`)
    : code.toUpperCase();
}

/** Tank, Healer, DPS, Melee DPS, Ranged DPS, in the current language. */
export function roleText(t: Translate, { role, subRole }: RoleKind): string {
  if (role === 'tank') return t('role.tank');
  if (role === 'healer') return t('role.healer');
  if (subRole === 'melee') return t('role.meleeDps');
  if (subRole === 'ranged') return t('role.rangedDps');
  return t('role.dps');
}
