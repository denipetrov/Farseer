import { describe, expect, it } from 'vitest';
import type { Raid } from '@/api/pve';
import { iconUrl } from '@/lib/assets';
import { isNavGroup, isNavNote, navLinks, type NavGroup, type NavItem } from './navTypes';
import { PVE_ICONS, guildIcon, pveNav } from './pveNav';

const raid = (slug: string, expansionId: number, bosses: string[]): Raid => ({
  slug,
  name: slug,
  shortName: null,
  expansionId,
  icon: slug === 'old' ? null : `icon_${slug}`,
  starts: {},
  ends: {},
  encounters: bosses.map((b, i) => ({ id: i, slug: b, name: b })),
});

const RAIDS = [
  raid('venomous-abyss', 11, ['a', 'b']),
  raid('kithix', 11, ['kithix']),
  raid('manaforge', 10, ['x']),
  raid('old', 6, ['y']),
];

const build = (raids: Parameters<typeof pveNav>[0]['raids']) =>
  pveNav({
    locale: 'en',
    faction: 'alliance',
    name: (_kind, _key, fallback) => fallback,
    names: undefined,
    raids,
  });

const group = (items: NavItem[], id: string) =>
  items.find((i): i is NavGroup => isNavGroup(i) && i.id === id)!;

describe('PvE menu', () => {
  const items = build({ status: 'success', data: RAIDS });

  it('has every entry in the designed order', () => {
    expect(items.map((i) => i.id)).toEqual([
      'home',
      'character',
      'guild',
      'mplus',
      'raids',
      'stats',
      'tier-list',
    ]);
  });

  it('every single-colour icon is a file that exists', () => {
    for (const icon of [...Object.values(PVE_ICONS), guildIcon('horde'), guildIcon('alliance')]) {
      expect(iconUrl(icon), icon).toBeDefined();
    }
  });

  it('lists every class with its specs, and with the roles it plays', () => {
    const specs = group(group(items, 'mplus').children, 'mplus-specs');
    expect(specs.children).toHaveLength(13);
    expect(navLinks(specs.children)).toHaveLength(40);

    const druid = group(
      group(group(items, 'mplus').children, 'mplus-roles').children,
      'mplus-roles-druid',
    );
    expect(druid.children.map((c) => c.id)).toEqual([
      'mplus-roles-druid-tank',
      'mplus-roles-druid-healer',
      'mplus-roles-druid-melee',
      'mplus-roles-druid-ranged',
    ]);
  });

  it('groups raids by expansion, newest first and open, each with its bosses', () => {
    const expansions = group(items, 'raids').children as NavGroup[];
    const [midnight, , legion] = expansions as [NavGroup, NavGroup, NavGroup];
    expect(expansions.map((e) => [e.id, e.defaultOpen])).toEqual([
      ['raids-x11', true],
      ['raids-x10', false],
      ['raids-x6', false],
    ]);
    expect(midnight.children.map((r) => r.id)).toEqual(['raid-venomous-abyss', 'raid-kithix']);

    const abyss = midnight.children[0] as NavGroup;
    expect(navLinks(abyss.children).map((l) => l.id)).toEqual([
      'raid-venomous-abyss-hall-of-fame',
      'raid-venomous-abyss-boss-a',
      'raid-venomous-abyss-boss-b',
    ]);
    expect(abyss.icon).toEqual({
      kind: 'image',
      src: 'https://cdn.raiderio.net/images/wow/icons/large/icon_venomous-abyss.jpg',
    });
    // A raid without an icon, and none of our own for it, shows the unknown icon
    expect((legion.children[0] as NavGroup).icon).toEqual({ kind: 'image', src: null });
  });

  it('says when the raids are loading or failed', () => {
    for (const [status, note] of [
      ['pending', 'nav.raidsLoading'],
      ['error', 'nav.raidsUnavailable'],
    ] as const) {
      const [only] = group(build({ status, data: undefined }), 'raids').children as [NavItem];
      expect(isNavNote(only) && only.note).toBe(note);
    }
  });

  it('nests Stats under Mythic+', () => {
    const stats = group(items, 'stats');
    expect(navLinks(stats.children).map((l) => l.id)).toEqual([
      'stats-mplus-representation',
      'stats-mplus-compositions',
      'stats-mplus-cutoffs',
    ]);
  });
});
