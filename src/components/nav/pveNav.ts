import { linkOptions } from '@tanstack/react-router';
import type { GameNamesResponse } from '@/api/gameNames';
import { bossIconUrl, bossName, raidIconUrl, raidName, type Raid } from '@/api/pve';
import type { GameName } from '@/i18n/useI18n';
import type { LocaleSlug } from '@/i18n/locales';
import type { MessageKey } from '@/i18n/messages';
import { iconUrl } from '@/lib/assets';
import { CLASSES } from '@/lib/wow/classes';
import { classRoleKinds, roleSlug } from '@/lib/wow/roles';
import { SPECS } from '@/lib/wow/specs';
import type { Faction } from '@/styles/palette';
import type { NavGroup, NavItem, NavLabel } from './navTypes';

/** An icon the PvE menu wants, or a stand-in until its file is added (then it is used). */
const want = (path: string, standIn: string) => (iconUrl(path) ? path : standIn);

/**
 * The PvE menu's single-colour icons. Those without a file yet use a stand-in from the
 * existing set; drop the SVG in `icons/nav/` under the wanted name and it replaces the
 * stand-in, with no code change (SKILLS.md, "The left menu").
 */
export const PVE_ICONS = {
  home: 'nav/home',
  character: 'nav/character',
  mythicPlus: want('nav/mythic-plus', 'nav/leaderboards'),
  mplusCharacters: 'nav/leaderboards',
  mplusRuns: want('nav/runs', 'nav/rating'),
  mplusSpecs: want('nav/spec-leaderboard', 'nav/talents'),
  mplusClassRoles: want('nav/class-role-leaderboard', 'nav/character'),
  raids: want('nav/raids', 'nav/bosses'),
  hallOfFame: want('nav/hall-of-fame', 'nav/tier-list'),
  bossRankings: 'nav/bosses',
  stats: 'nav/stats',
  representation: 'nav/spec-representation',
  compositions: want('nav/compositions', 'nav/character'),
  cutoffs: 'nav/cutoffs',
  tierList: 'nav/tier-list',
} as const;

/** The guild icon in the visitor's faction (`nav/guild-horde`, `nav/guild-alliance`). */
export const guildIcon = (faction: Faction) => `nav/guild-${faction}`;

export interface PveNavInput {
  locale: LocaleSlug;
  faction: Faction;
  /** Class and spec names in the page's language */
  name: GameName;
  /** Raid and boss names in the page's language */
  names: GameNamesResponse | undefined;
  /** The raid catalogue (`/pve/raids`), while it loads, failed, or with its raids */
  raids: { status: 'pending' | 'error' | 'success'; data: Raid[] | undefined };
}

/**
 * The PvE menu, top to bottom, as the user designed it (2026-11-25), with Home first as
 * on PvP:
 * - Character, Guild: the last one opened, else the top of the current boards.
 * - Mythic+: All Characters, Runs, Specs (each class, its specs inside), Classes & Roles
 *   (each class, the roles it plays inside).
 * - Raids: every raid in the catalogue, grouped by expansion (the newest one open), each
 *   with its Hall of Fame and Boss Rankings (every boss).
 * - Stats: Mythic+ (Spec Representation, Compositions, Cutoffs).
 * - Tier List.
 */
export function pveNav({ locale, faction, name, names, raids }: PveNavInput): NavItem[] {
  return [
    {
      id: 'home',
      label: 'nav.home',
      icon: PVE_ICONS.home,
      link: linkOptions({ to: '/$locale/pve', params: { locale } }),
      exact: true,
    },
    {
      id: 'character',
      label: 'nav.character',
      icon: PVE_ICONS.character,
      link: linkOptions({ to: '/$locale/pve/character', params: { locale } }),
    },
    {
      id: 'guild',
      label: 'nav.guild',
      icon: guildIcon(faction),
      link: linkOptions({ to: '/$locale/pve/guild', params: { locale } }),
    },
    mythicPlusGroup(locale, name),
    raidsGroup(locale, names, raids),
    {
      id: 'stats',
      label: 'nav.stats',
      icon: PVE_ICONS.stats,
      children: [
        {
          id: 'stats-mplus',
          label: 'nav.mythicPlus',
          icon: PVE_ICONS.mythicPlus,
          children: [
            {
              id: 'stats-mplus-representation',
              label: 'nav.representation',
              icon: PVE_ICONS.representation,
              link: linkOptions({
                to: '/$locale/pve/stats/mythic-plus/representation',
                params: { locale },
              }),
            },
            {
              id: 'stats-mplus-compositions',
              label: 'nav.compositions',
              icon: PVE_ICONS.compositions,
              link: linkOptions({
                to: '/$locale/pve/stats/mythic-plus/compositions',
                params: { locale },
              }),
            },
            {
              id: 'stats-mplus-cutoffs',
              label: 'nav.cutoffs',
              icon: PVE_ICONS.cutoffs,
              link: linkOptions({
                to: '/$locale/pve/stats/mythic-plus/cutoffs',
                params: { locale },
              }),
            },
          ],
        },
      ],
    },
    {
      id: 'tier-list',
      label: 'nav.tierList',
      icon: PVE_ICONS.tierList,
      link: linkOptions({ to: '/$locale/pve/tier-list', params: { locale } }),
    },
  ];
}

function mythicPlusGroup(locale: LocaleSlug, name: GameName): NavGroup {
  const className = (c: (typeof CLASSES)[number]): NavLabel => ({
    text: name('classes', c.id, c.name),
  });
  return {
    id: 'mplus',
    label: 'nav.mythicPlus',
    icon: PVE_ICONS.mythicPlus,
    children: [
      {
        id: 'mplus-characters',
        label: 'nav.mplusCharacters',
        icon: PVE_ICONS.mplusCharacters,
        link: linkOptions({ to: '/$locale/pve/mythic-plus/characters', params: { locale } }),
      },
      {
        id: 'mplus-runs',
        label: 'nav.mplusRuns',
        icon: PVE_ICONS.mplusRuns,
        link: linkOptions({ to: '/$locale/pve/mythic-plus/runs', params: { locale } }),
      },
      {
        id: 'mplus-specs',
        label: 'nav.mplusSpecs',
        icon: PVE_ICONS.mplusSpecs,
        children: CLASSES.map((c) => ({
          id: `mplus-specs-${c.slug}`,
          label: className(c),
          icon: { kind: 'class', cls: c.slug },
          children: SPECS.filter((sp) => sp.classSlug === c.slug).map((sp) => ({
            id: `mplus-specs-${c.slug}-${sp.slug}`,
            label: { text: name('specs', sp.id, sp.name) },
            icon: { kind: 'spec', specId: sp.id },
            link: linkOptions({
              to: '/$locale/pve/mythic-plus/specs/$class/$spec',
              params: { locale, class: c.slug, spec: sp.slug },
            }),
          })),
        })),
      },
      {
        id: 'mplus-roles',
        label: 'nav.mplusClassRoles',
        icon: PVE_ICONS.mplusClassRoles,
        children: CLASSES.map((c) => ({
          id: `mplus-roles-${c.slug}`,
          label: className(c),
          icon: { kind: 'class', cls: c.slug },
          children: classRoleKinds(c.slug).map((kind) => ({
            id: `mplus-roles-${c.slug}-${roleSlug(kind)}`,
            label: ROLE_LABEL[roleSlug(kind)],
            icon: { kind: 'role', role: kind.role, subRole: kind.subRole },
            link: linkOptions({
              to: '/$locale/pve/mythic-plus/roles/$class/$role',
              params: { locale, class: c.slug, role: roleSlug(kind) },
            }),
          })),
        })),
      },
    ],
  };
}

const ROLE_LABEL: Record<ReturnType<typeof roleSlug>, MessageKey> = {
  tank: 'role.tank',
  healer: 'role.healer',
  dps: 'role.dps',
  melee: 'role.meleeDps',
  ranged: 'role.rangedDps',
};

/** Raider.io's expansion ids that have a translated name (`expansion.<id>`). */
const EXPANSION_LABELS: Record<number, MessageKey> = {
  6: 'expansion.6',
  7: 'expansion.7',
  8: 'expansion.8',
  9: 'expansion.9',
  10: 'expansion.10',
  11: 'expansion.11',
};

function raidsGroup(
  locale: LocaleSlug,
  names: GameNamesResponse | undefined,
  raids: PveNavInput['raids'],
): NavGroup {
  const group = { id: 'raids', label: 'nav.raids', icon: PVE_ICONS.raids } as const;
  if (raids.status !== 'success' || !raids.data) {
    return {
      ...group,
      children: [
        {
          id: 'raids-note',
          note: raids.status === 'error' ? 'nav.raidsUnavailable' : 'nav.raidsLoading',
        },
      ],
    };
  }

  // The catalogue is newest first: expansions come out in that order, raids too within each
  const byExpansion = new Map<number, Raid[]>();
  for (const raid of raids.data) {
    byExpansion.set(raid.expansionId, [...(byExpansion.get(raid.expansionId) ?? []), raid]);
  }
  const newest = Math.max(...byExpansion.keys());

  return {
    ...group,
    children: [...byExpansion].map(([expansionId, list]) => ({
      id: `raids-x${expansionId}`,
      label: EXPANSION_LABELS[expansionId] ?? { text: `#${expansionId}` },
      defaultOpen: expansionId === newest,
      children: list.map((raid) => ({
        id: `raid-${raid.slug}`,
        label: { text: raidName(names, raid) },
        icon: { kind: 'image', src: raidIconUrl(raid) },
        children: [
          {
            id: `raid-${raid.slug}-hall-of-fame`,
            label: 'nav.hallOfFame',
            icon: PVE_ICONS.hallOfFame,
            link: linkOptions({
              to: '/$locale/pve/raids/$raid/hall-of-fame',
              params: { locale, raid: raid.slug },
            }),
          },
          {
            id: `raid-${raid.slug}-bosses`,
            label: 'nav.bossRankings',
            icon: PVE_ICONS.bossRankings,
            children: raid.encounters.map((boss) => ({
              id: `raid-${raid.slug}-boss-${boss.slug}`,
              label: { text: bossName(names, raid, boss) },
              icon: { kind: 'image', src: bossIconUrl(raid, boss) },
              link: linkOptions({
                to: '/$locale/pve/raids/$raid/bosses/$boss',
                params: { locale, raid: raid.slug, boss: boss.slug },
              }),
            })),
          },
        ],
      })),
    })),
  };
}
