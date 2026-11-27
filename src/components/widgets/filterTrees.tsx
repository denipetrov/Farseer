/**
 * Ready-made trees for IconFilter. Each is the same order as the menus (A–Z by English
 * name, gameOrder.ts) and names things in the page's language. More trees (dungeons, raid →
 * boss) follow the same shape: `{ id, label, icon, children? }`.
 */
import { ClassIcon } from '@/components/ClassIcon';
import { RoleIcon } from '@/components/RoleIcon';
import { SpecIcon } from '@/components/SpecIcon';
import { CLASSES_AZ, rolesAz, specsAz } from '@/components/nav/gameOrder';
import { roleText } from '@/i18n/labels';
import type { Translate } from '@/i18n/messages';
import type { GameName } from '@/i18n/useI18n';
import { roleKindOfSlug, roleSlug } from '@/lib/wow/roles';
import { LADDER_ROLES } from '@/api/pvp';
import type { FilterOption } from './IconFilter';

/** Class → spec, by Soulseeker's slugs (`mage` → `fire`) */
export function classSpecTree(name: GameName): FilterOption[] {
  return CLASSES_AZ.map((c) => ({
    id: c.slug,
    label: name('classes', c.id, c.name),
    icon: <ClassIcon cls={c.slug} size="md" />,
    children: specsAz(c.slug).map((sp) => ({
      id: sp.slug,
      label: name('specs', sp.id, sp.name),
      icon: <SpecIcon spec={sp.id} size="md" />,
    })),
  }));
}

/** Class → the roles it plays (`druid` → `healer`, `melee`, `ranged`, `tank`) */
export function classRoleTree(name: GameName, t: Translate): FilterOption[] {
  return CLASSES_AZ.map((c) => ({
    id: c.slug,
    label: name('classes', c.id, c.name),
    icon: <ClassIcon cls={c.slug} size="md" />,
    children: rolesAz(c.slug).map((kind) => ({
      id: roleSlug(kind),
      label: roleText(t, kind),
      icon: <RoleIcon role={kind.role} subRole={kind.subRole} size="md" />,
    })),
  }));
}

/**
 * Class → spec, then the roles beside the classes (the user, 2026-11-27): DPS, Healer, Melee
 * DPS, Ranged DPS, Tank. A role is a pick of its own (no row below it).
 */
export function classSpecRoleTree(name: GameName, t: Translate): FilterOption[] {
  return [
    ...classSpecTree(name).map((c) => ({ ...c, group: 'class' })),
    ...LADDER_ROLES.map((role) => {
      const kind = roleKindOfSlug(role)!;
      return {
        id: role,
        label: roleText(t, kind),
        icon: <RoleIcon role={kind.role} subRole={kind.subRole} size="md" />,
        group: 'role',
      };
    }),
  ];
}
