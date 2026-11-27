import { linkOptions } from '@tanstack/react-router';
import type { SiteParams } from '@/lib/site';
import type { GameNamesResponse } from '@/api/gameNames';
import { bossIconUrl, bossName, raidIconUrl, raidName, type Raid } from '@/api/pve';
import type { GameName } from '@/i18n/useI18n';
import type { MessageKey } from '@/i18n/messages';
import { iconUrl } from '@/lib/assets';
import type { WowClass } from '@/lib/wow/classes';
import { classRoleKinds, roleLabel, roleSlug, type RoleKind } from '@/lib/wow/roles';
import type { Faction } from '@/styles/palette';
import { ALL } from '@/lib/mplusParams';
import { CLASSES_AZ, specsAz } from './gameOrder';
import type { NavGroup, NavIcon, NavItem, NavLabel } from './navTypes';

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
  leaderboards: 'nav/leaderboards',
  mplusCharacters: want('nav/mplus-characters', 'nav/leaderboards'),
  mplusRuns: want('nav/mplus-runs', 'nav/rating'),
  mplusSpecs: want('nav/mplus-specs', 'nav/talents'),
  mplusClassRoles: want('nav/mplus-class-roles', 'nav/character'),
  hallOfFame: want('nav/hall-of-fame', 'nav/tier-list'),
  bossRankings: 'nav/bosses',
  stats: 'nav/stats',
  representation: 'nav/spec-representation',
  compositions: want('nav/compositions', 'nav/character'),
  cutoffs: 'nav/cutoffs',
  tierList: 'nav/tier-list',
  archives: 'nav/archives',
} as const;

/** Mythic+ and Raids: the game-mode art (`icons/game-modes/`), drawn as it is (the user's choice) */
export const PVE_ART = {
  mythicPlus: { kind: 'art', path: 'game-modes/mplus' },
  raids: { kind: 'art', path: 'game-modes/raid' },
} as const;

/** The guild icon in the visitor's faction (`nav/guild-horde`, `nav/guild-alliance`). */
export const guildIcon = (faction: Faction) => `nav/guild-${faction}`;

export interface PveNavInput {
  site: SiteParams;
  faction: Faction;
  /** Class and spec names in the page's language */
  name: GameName;
  /** Raid and boss names in the page's language */
  names: GameNamesResponse | undefined;
  /** The raid catalogue (`/pve/raids`), while it loads, failed, or with its raids */
  raids: { status: 'pending' | 'error' | 'success'; data: Raid[] | undefined };
}

/**
 * The PvE menu, as the user restructured it (2026-11-26): three sections at the top.
 * - Home.
 * - Mythic+: Character (the last one opened, else the World Mythic+ #1), Leaderboards (All
 *   Characters, Runs, Specs: each class, its specs inside; Classes & Roles: each class, the
 *   roles it plays inside), Stats (Spec Representation, Compositions, Cutoffs), Tier List,
 *   Archives (past seasons: the same Leaderboards and Stats; every season in
 *   `/pve/mplus-seasons` carries its own cutoffs).
 * - Raids: Guild (the last one opened, else the current raid's #1), then every raid in the
 *   catalogue grouped by expansion (the newest one open), each with its Hall of Fame and
 *   Boss Rankings (every boss).
 * Page addresses did not move: Character is `/pve/character`, Stats `/pve/stats/mythic-plus/…`.
 */
export function pveNav({ site, faction, name, names, raids }: PveNavInput): NavItem[] {
  return [
    {
      id: 'home',
      label: 'nav.home',
      icon: PVE_ICONS.home,
      link: linkOptions({ to: '/$game/$locale/pve', params: site }),
      exact: true,
    },
    mythicPlusGroup(site, name),
    raidsGroup(site, faction, names, raids),
  ];
}

function mythicPlusGroup(site: SiteParams, name: GameName): NavGroup {
  return {
    id: 'mplus',
    label: 'nav.mythicPlus',
    icon: PVE_ART.mythicPlus,
    children: [
      {
        id: 'character',
        label: 'nav.character',
        icon: PVE_ICONS.character,
        link: linkOptions({ to: '/$game/$locale/pve/character', params: site }),
      },
      leaderboardsGroup(site, name, false),
      {
        id: 'stats',
        label: 'nav.stats',
        icon: PVE_ICONS.stats,
        children: [
          {
            id: 'stats-representation',
            label: 'nav.representation',
            icon: PVE_ICONS.representation,
            link: linkOptions({
              to: '/$game/$locale/pve/stats/mythic-plus/representation',
              params: site,
            }),
          },
          {
            id: 'stats-compositions',
            label: 'nav.compositions',
            icon: PVE_ICONS.compositions,
            link: linkOptions({
              to: '/$game/$locale/pve/stats/mythic-plus/compositions',
              params: site,
            }),
          },
          {
            id: 'stats-cutoffs',
            label: 'nav.cutoffs',
            icon: PVE_ICONS.cutoffs,
            link: linkOptions({ to: '/$game/$locale/pve/stats/mythic-plus/cutoffs', params: site }),
          },
        ],
      },
      {
        id: 'tier-list',
        label: 'nav.tierList',
        icon: PVE_ICONS.tierList,
        link: linkOptions({ to: '/$game/$locale/pve/tier-list', params: site }),
      },
      {
        id: 'archives',
        label: 'nav.archives',
        icon: PVE_ICONS.archives,
        children: [
          leaderboardsGroup(site, name, true),
          {
            id: 'archives-stats',
            label: 'nav.stats',
            icon: PVE_ICONS.stats,
            children: [
              {
                id: 'archives-stats-representation',
                label: 'nav.representation',
                icon: PVE_ICONS.representation,
                link: linkOptions({
                  to: '/$game/$locale/pve/mythic-plus/archives/stats/representation',
                  params: site,
                }),
              },
              {
                id: 'archives-stats-compositions',
                label: 'nav.compositions',
                icon: PVE_ICONS.compositions,
                link: linkOptions({
                  to: '/$game/$locale/pve/mythic-plus/archives/stats/compositions',
                  params: site,
                }),
              },
              {
                id: 'archives-stats-cutoffs',
                label: 'nav.cutoffs',
                icon: PVE_ICONS.cutoffs,
                link: linkOptions({
                  to: '/$game/$locale/pve/mythic-plus/archives/stats/cutoffs',
                  params: site,
                }),
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Leaderboards: All Characters, Runs, Specs (each class, its specs inside), Classes & Roles
 * (each class, the roles it plays inside). A class row opens the whole class's board and
 * only its arrow opens its specs or roles (the user, 2026-11-27: no more "All" rows). The same rows for the current season and, under
 * Archives, for past ones (`archive`: other pages, ids prefixed `archives-`).
 */
function leaderboardsGroup(site: SiteParams, name: GameName, archive: boolean): NavGroup {
  const id = (s: string) => (archive ? `archives-${s}` : s);
  const className = (c: WowClass): NavLabel => ({
    text: name('classes', c.id, c.name),
  });
  const specLink = (cls: string, spec: string) => {
    const params = { ...site, class: cls, spec };
    return archive
      ? linkOptions({ to: '/$game/$locale/pve/mythic-plus/archives/specs/$class/$spec', params })
      : linkOptions({ to: '/$game/$locale/pve/mythic-plus/specs/$class/$spec', params });
  };
  const roleLink = (cls: string, role: string) => {
    const params = { ...site, class: cls, role };
    return archive
      ? linkOptions({ to: '/$game/$locale/pve/mythic-plus/archives/roles/$class/$role', params })
      : linkOptions({ to: '/$game/$locale/pve/mythic-plus/roles/$class/$role', params });
  };
  return {
    id: id('mplus-leaderboards'),
    label: 'nav.leaderboards',
    icon: PVE_ICONS.leaderboards,
    children: [
      {
        id: id('mplus-characters'),
        label: 'nav.mplusCharacters',
        icon: PVE_ICONS.mplusCharacters,
        link: archive
          ? linkOptions({ to: '/$game/$locale/pve/mythic-plus/archives/characters', params: site })
          : linkOptions({ to: '/$game/$locale/pve/mythic-plus/characters', params: site }),
      },
      {
        id: id('mplus-runs'),
        label: 'nav.mplusRuns',
        icon: PVE_ICONS.mplusRuns,
        link: archive
          ? linkOptions({ to: '/$game/$locale/pve/mythic-plus/archives/runs', params: site })
          : linkOptions({ to: '/$game/$locale/pve/mythic-plus/runs', params: site }),
      },
      {
        id: id('mplus-specs'),
        label: 'nav.mplusSpecs',
        icon: PVE_ICONS.mplusSpecs,
        // A class opens its whole board (`…/specs/<class>/all`); its arrow, its specs
        children: CLASSES_AZ.map((c) => ({
          id: id(`mplus-specs-${c.slug}`),
          label: className(c),
          icon: { kind: 'class', cls: c.slug },
          link: specLink(c.slug, ALL),
          children: specsAz(c.slug).map((sp) => ({
            id: id(`mplus-specs-${c.slug}-${sp.slug}`),
            label: { text: name('specs', sp.id, sp.name) },
            icon: { kind: 'spec', specId: sp.id },
            link: specLink(c.slug, sp.slug),
          })),
        })),
      },
      {
        id: id('mplus-roles'),
        label: 'nav.mplusClassRoles',
        icon: PVE_ICONS.mplusClassRoles,
        // A class opens its whole board (`…/roles/<class>/all`); its arrow, its roles
        children: CLASSES_AZ.map((c) => ({
          id: id(`mplus-roles-${c.slug}`),
          label: className(c),
          icon: { kind: 'class', cls: c.slug },
          link: roleLink(c.slug, ALL),
          children: rolesAz(c.slug).map((kind) => ({
            id: id(`mplus-roles-${c.slug}-${roleSlug(kind)}`),
            label: ROLE_LABEL[roleSlug(kind)],
            icon: { kind: 'role', role: kind.role, subRole: kind.subRole },
            link: roleLink(c.slug, roleSlug(kind)),
          })),
        })),
      },
    ],
  };
}

// Classes, specs and roles A–Z by their English names (gameOrder.ts)
/** Healer, Melee DPS, Ranged DPS, Tank */
const rolesAz = (classSlug: string): RoleKind[] =>
  classRoleKinds(classSlug).sort((a, b) => roleLabel(a).localeCompare(roleLabel(b), 'en'));

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

/**
 * Each expansion's logo (`icons/expansions/`), by Raider.io's expansion id. The folder also
 * holds the older expansions (vanilla … wod) and `tlt` / `forever`, for when the catalogue
 * reaches them.
 */
export const EXPANSION_ART: Record<number, string> = {
  6: 'expansions/legion',
  7: 'expansions/bfa',
  8: 'expansions/shadowlands',
  9: 'expansions/dragonflight',
  10: 'expansions/tww',
  11: 'expansions/midnight',
};

function raidsGroup(
  site: SiteParams,
  faction: Faction,
  names: GameNamesResponse | undefined,
  raids: PveNavInput['raids'],
): NavGroup {
  const group = { id: 'raids', label: 'nav.raids', icon: PVE_ART.raids } as const;
  const guild: NavItem = {
    id: 'guild',
    label: 'nav.guild',
    icon: guildIcon(faction),
    link: linkOptions({ to: '/$game/$locale/pve/guild', params: site }),
  };
  if (raids.status !== 'success' || !raids.data) {
    return {
      ...group,
      children: [
        guild,
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
    children: [
      guild,
      ...[...byExpansion].map(([expansionId, list]): NavGroup => ({
        id: `raids-x${expansionId}`,
        label: EXPANSION_LABELS[expansionId] ?? { text: `#${expansionId}` },
        ...(EXPANSION_ART[expansionId] && {
          icon: { kind: 'art', path: EXPANSION_ART[expansionId], wide: true } as NavIcon,
        }),
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
                to: '/$game/$locale/pve/raids/$raid/hall-of-fame',
                params: { ...site, raid: raid.slug },
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
                  to: '/$game/$locale/pve/raids/$raid/bosses/$boss',
                  params: { ...site, raid: raid.slug, boss: boss.slug },
                }),
              })),
            },
          ],
        })),
      })),
    ],
  };
}
