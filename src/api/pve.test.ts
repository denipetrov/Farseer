import { describe, expect, it } from 'vitest';
import BOSS_ICONS from '@/data/bossIcons.json';
import {
  RAID_ICON_FALLBACK,
  bossIconUrl,
  isRunningIn,
  mplusSeasonsQuery,
  raidIconUrl,
  raidsQuery,
} from './pve';

describe('PvE catalogue', () => {
  it('has one cache entry each, shared by every reader', () => {
    expect(raidsQuery().queryKey).toEqual(['pve', 'raids']);
    expect(mplusSeasonsQuery().queryKey).toEqual(['pve', 'mplus-seasons']);
  });

  it('knows what is running in a region', () => {
    const now = new Date('2026-11-25T12:00:00Z');
    const raid = {
      starts: { us: '2026-10-13T15:00:00Z', eu: '2026-12-01T04:00:00Z' },
      ends: { us: null, eu: null, kr: '2026-11-01T00:00:00Z' },
    };
    expect(isRunningIn(raid, 'us', now)).toBe(true);
    expect(isRunningIn(raid, 'eu', now)).toBe(false); // not open yet
    expect(isRunningIn(raid, 'kr', now)).toBe(false); // never opened there
    expect(
      isRunningIn({ starts: { kr: '2026-01-01T00:00:00Z' }, ends: raid.ends }, 'kr', now),
    ).toBe(
      false, // closed
    );
  });
});

describe('raid icons', () => {
  const url = (icon: string) => `https://cdn.raiderio.net/images/wow/icons/large/${icon}.jpg`;

  it("uses the catalogue's icon, a name or a file id", () => {
    expect(raidIconUrl({ slug: 'nerubar-palace', icon: 'achievement_zone_azjkahet' })).toBe(
      url('achievement_zone_azjkahet'),
    );
    expect(raidIconUrl({ slug: 'the-venomous-abyss', icon: '8039569' })).toBe(url('8039569'));
  });

  it('fills in Legion raids, which the catalogue sends without one', () => {
    expect(raidIconUrl({ slug: 'the-nighthold', icon: null })).toBe(
      url('achievement_thenighthold'),
    );
    expect(raidIconUrl({ slug: 'tomb-of-sargeras', icon: null })).toBe(
      url('achievement_raid_tombofsargeras'),
    );
    expect(Object.keys(RAID_ICON_FALLBACK)).toHaveLength(5);
    expect(raidIconUrl({ slug: 'unknown', icon: null })).toBeNull();
  });
});

describe('boss icons', () => {
  const url = (icon: string) => `https://cdn.raiderio.net/images/wow/icons/large/${icon}.jpg`;

  it("uses each boss's Mythic achievement icon", () => {
    expect(bossIconUrl({ slug: 'the-venomous-abyss' }, { slug: 'the-lost-explorers' })).toBe(
      url('inv_121_raid_achievement_tortollans'),
    );
  });

  it("gives a re-release's bosses the original's icons", () => {
    expect(bossIconUrl({ slug: 'fated-castle-nathria' }, { slug: 'fated-sludgefist' })).toBe(
      bossIconUrl({ slug: 'castle-nathria' }, { slug: 'sludgefist' }),
    );
  });

  it('is null for a boss without one', () => {
    expect(bossIconUrl({ slug: 'blackrock-depths' }, { slug: 'lord-roccor' })).toBeNull();
  });

  it('holds only icon names', () => {
    for (const [key, icon] of Object.entries(BOSS_ICONS)) {
      expect(key, key).toMatch(/^[a-z0-9-]+\/[a-z0-9-]+$/);
      expect(icon, key).toMatch(/^[a-z0-9_-]+$/);
    }
  });
});
