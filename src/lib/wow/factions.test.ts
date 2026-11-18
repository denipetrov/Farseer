import { describe, expect, it } from 'vitest';
import { hasStyledAsset, styledAssetNames, ASSET_STYLES } from '@/lib/assets';
import { FACTIONS, factionColorVars, factionIconUrl, resolveFaction } from './factions';

/** Emblems not drawn yet; the mapper falls back to the other style. Add entries as needed. */
const KNOWN_MISSING = new Set<string>([]);

describe('resolveFaction', () => {
  it('accepts every API shape', () => {
    expect(resolveFaction('horde')?.slug).toBe('horde'); // Soulseeker
    expect(resolveFaction('ALLIANCE')?.slug).toBe('alliance');
    expect(resolveFaction({ type: 'HORDE', name: 'Horde' })?.slug).toBe('horde'); // Blizzard
    expect(resolveFaction({ name: 'Alliance' })?.slug).toBe('alliance');
    expect(resolveFaction(' Horde ')?.name).toBe('Horde');
  });

  it('returns null for neutral, unknown or missing data', () => {
    for (const input of [null, undefined, '', 'NEUTRAL', 'scourge', { type: null }, {}]) {
      expect(resolveFaction(input)).toBeNull();
    }
  });
});

describe('faction icons', () => {
  it.each(ASSET_STYLES)('every faction has a %s emblem (or is a known gap)', (style) => {
    const missing = FACTIONS.filter(
      (f) => !hasStyledAsset('factions', style, f.slug) && !KNOWN_MISSING.has(`${style}/${f.slug}`),
    );
    expect(missing.map((f) => f.slug)).toEqual([]);
  });

  it('known gaps are still gaps (remove them from KNOWN_MISSING once added)', () => {
    for (const key of KNOWN_MISSING) {
      const [style, name] = key.split('/') as ['modern' | 'classic', string];
      expect(hasStyledAsset('factions', style, name)).toBe(false);
    }
  });

  it.each(ASSET_STYLES)('every %s file belongs to a faction (no misspelt names)', (style) => {
    const slugs = new Set<string>(FACTIONS.map((f) => f.slug));
    expect(styledAssetNames('factions', style).filter((n) => !slugs.has(n))).toEqual([]);
  });

  it('resolves to the file of the chosen style', () => {
    expect(factionIconUrl('horde', { style: 'classic' })).toMatch(/classic\/horde\.png/);
    expect(factionIconUrl('ALLIANCE', { style: 'modern' })).toMatch(/modern\/alliance\.png/);
    expect(factionIconUrl('NEUTRAL', { style: 'modern' })).toBeUndefined();
  });
});

describe('factionColorVars', () => {
  it("gives the faction's own colour and trim", () => {
    expect(factionColorVars('horde')).toEqual({
      color: 'var(--color-horde)',
      trim: 'var(--color-horde-trim)',
    });
    expect(factionColorVars({ type: 'ALLIANCE' })?.trim).toBe('var(--color-alliance-trim)');
    expect(factionColorVars(null)).toBeUndefined();
  });
});
