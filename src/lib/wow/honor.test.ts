import { describe, expect, it } from 'vitest';
import { iconNames } from '@/lib/assets';
import { HONOR_BADGES, honorBadgeUrl, honorLevel, resolveHonorBadge } from './honor';

/** Icons with no known threshold yet. Remove a tier once it is added to HONOR_BADGES. */
const UNMAPPED_TIERS = Array.from({ length: 12 }, (_, i) => 22 + i); // 22–33

describe('resolveHonorBadge', () => {
  it.each(HONOR_BADGES.map((badge, i) => ({ badge, previous: HONOR_BADGES[i - 1] })))(
    'tier $badge.tier starts at level $badge.minLevel',
    ({ badge, previous }) => {
      expect(resolveHonorBadge(badge.minLevel)?.tier).toBe(badge.tier);
      expect(resolveHonorBadge(badge.minLevel - 1)?.tier ?? null).toBe(previous?.tier ?? null);
    },
  );

  it('keeps the last badge past the last threshold', () => {
    expect(resolveHonorBadge(1991)?.tier).toBe(21);
  });

  it('accepts the API honor object', () => {
    expect(resolveHonorBadge({ level: 260 })?.tier).toBe(18);
    expect(honorLevel({ level: 260 })).toBe(260);
  });

  it('gives no badge below level 5 or without data', () => {
    for (const input of [0, 4, null, undefined, { level: null }, {}, Number.NaN]) {
      expect(resolveHonorBadge(input)).toBeNull();
    }
  });

  it('has thresholds in ascending order with unique tiers', () => {
    const levels = HONOR_BADGES.map((b) => b.minLevel);
    expect(levels).toEqual([...levels].sort((a, b) => a - b));
    expect(new Set(HONOR_BADGES.map((b) => b.tier)).size).toBe(HONOR_BADGES.length);
  });
});

describe('honor badge icons', () => {
  it('every badge has its icon', () => {
    for (const b of HONOR_BADGES) {
      expect(honorBadgeUrl(b.minLevel)).toMatch(new RegExp(`pvptier-${b.tier}\\.png`));
    }
  });

  it('every icon file is a mapped or known-unmapped tier', () => {
    const known = new Set(
      [...HONOR_BADGES.map((b) => b.tier), ...UNMAPPED_TIERS].map((t) => `pvptier-${t}`),
    );
    expect(iconNames('pvp/honor').filter((n) => !known.has(n))).toEqual([]);
    for (const t of UNMAPPED_TIERS) expect(iconNames('pvp/honor')).toContain(`pvptier-${t}`);
  });

  it('gives no icon without a badge', () => {
    expect(honorBadgeUrl(3)).toBeUndefined();
  });
});
