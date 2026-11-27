import { describe, expect, it } from 'vitest';
import type { Raid } from '@/api/pve';
import { iconUrl } from '@/lib/assets';
import { isNavGroup, isNavNote, navLinks, type NavGroup, type NavItem } from './navTypes';
import { EXPANSION_ART, PVE_ART, PVE_ICONS, guildIcon, pveNav } from './pveNav';

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
    site: { game: 'retail', locale: 'en' },
    faction: 'alliance',
    name: (_kind, _key, fallback) => fallback,
    names: undefined,
    raids,
  });

const group = (items: NavItem[], id: string) =>
  items.find((i): i is NavGroup => isNavGroup(i) && i.id === id)!;

describe('PvE menu', () => {
  const items = build({ status: 'success', data: RAIDS });
  const leaderboards = group(group(items, 'mplus').children, 'mplus-leaderboards');

  it('has every entry in the designed order', () => {
    expect(items.map((i) => i.id)).toEqual(['home', 'mplus', 'raids']);
    expect(group(items, 'mplus').children.map((i) => i.id)).toEqual([
      'character',
      'mplus-leaderboards',
      'stats',
      'tier-list',
      'archives',
    ]);
    expect(leaderboards.children.map((i) => i.id)).toEqual([
      'mplus-characters',
      'mplus-runs',
      'mplus-specs',
      'mplus-roles',
    ]);
  });

  it('every single-colour icon is a file that exists', () => {
    for (const icon of [...Object.values(PVE_ICONS), guildIcon('horde'), guildIcon('alliance')]) {
      expect(iconUrl(icon), icon).toBeDefined();
    }
    for (const art of Object.values(PVE_ART)) expect(iconUrl(art.path), art.path).toBeDefined();
    for (const logo of Object.values(EXPANSION_ART)) expect(iconUrl(logo), logo).toBeDefined();
  });

  it('lists every class with its specs, and with the roles it plays', () => {
    const specs = group(leaderboards.children, 'mplus-specs');
    expect(specs.children).toHaveLength(13);
    // 40 specs, and each class's own page (the whole class: `…/specs/<class>/all`)
    expect(navLinks(specs.children)).toHaveLength(40 + 13);
    const hunter = group(specs.children, 'mplus-specs-hunter');
    expect(hunter.link?.params).toMatchObject({ class: 'hunter', spec: 'all' });

    const druid = group(group(leaderboards.children, 'mplus-roles').children, 'mplus-roles-druid');
    expect(druid.children.map((c) => c.id)).toEqual([
      'mplus-roles-druid-healer',
      'mplus-roles-druid-melee',
      'mplus-roles-druid-ranged',
      'mplus-roles-druid-tank',
    ]);
    expect(druid.link?.params).toMatchObject({ class: 'druid', role: 'all' });
  });

  it('groups raids by expansion, newest first and open, each with its bosses', () => {
    const [guild, ...rest] = group(items, 'raids').children;
    expect(guild?.id).toBe('guild');
    const expansions = rest as NavGroup[];
    const [midnight, , legion] = expansions as [NavGroup, NavGroup, NavGroup];
    expect(expansions[0]?.icon).toEqual({ kind: 'art', path: 'expansions/midnight', wide: true });
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
      const [guild, only] = group(build({ status, data: undefined }), 'raids').children as [
        NavItem,
        NavItem,
      ];
      expect(guild.id).toBe('guild');
      expect(isNavNote(only) && only.note).toBe(note);
    }
  });

  it('lists classes, specs and roles A-Z by English name, All last', () => {
    const specs = group(leaderboards.children, 'mplus-specs');
    expect(specs.children.map((c) => c.id.replace('mplus-specs-', ''))).toEqual([
      'deathknight',
      'demonhunter',
      'druid',
      'evoker',
      'hunter',
      'mage',
      'monk',
      'paladin',
      'priest',
      'rogue',
      'shaman',
      'warlock',
      'warrior',
    ]);
    const hunter = group(specs.children, 'mplus-specs-hunter');
    expect(hunter.children.map((c) => c.id.replace('mplus-specs-hunter-', ''))).toEqual([
      'beastmastery',
      'marksmanship',
      'survival',
    ]);
  });

  it('has Archives: the same leaderboards and stats for past seasons', () => {
    const archives = group(group(items, 'mplus').children, 'archives');
    expect(archives.children.map((i) => i.id)).toEqual([
      'archives-mplus-leaderboards',
      'archives-stats',
    ]);
    const current = navLinks(leaderboards.children);
    const past = navLinks((archives.children[0] as NavGroup).children);
    expect(past).toHaveLength(current.length);
    expect(past.map((l) => l.id)).toEqual(current.map((l) => `archives-${l.id}`));
    expect(past.every((l) => String(l.link.to).includes('/mythic-plus/archives/'))).toBe(true);
    expect(navLinks((archives.children[1] as NavGroup).children).map((l) => l.id)).toEqual([
      'archives-stats-representation',
      'archives-stats-compositions',
      'archives-stats-cutoffs',
    ]);
  });

  it('nests Stats under Mythic+', () => {
    const stats = group(group(items, 'mplus').children, 'stats');
    expect(navLinks(stats.children).map((l) => l.id)).toEqual([
      'stats-representation',
      'stats-compositions',
      'stats-cutoffs',
    ]);
  });
});
