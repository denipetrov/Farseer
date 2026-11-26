import { describe, expect, it } from 'vitest';
import { DEFAULT_GAME, GAMES, isGameEnabled, isGameSlug } from './games';

describe('games', () => {
  it('has Retail on by default and Forever ready but off', () => {
    expect(DEFAULT_GAME).toBe('retail');
    expect(isGameEnabled('retail')).toBe(true);
    expect(isGameEnabled('forever')).toBe(false);
    expect(GAMES.map((g) => g.slug)).toEqual(['retail', 'forever']);
  });

  it('knows its slugs, and nothing else', () => {
    expect(isGameSlug('forever')).toBe(true);
    expect(isGameSlug('en')).toBe(false);
    expect(isGameSlug('classic')).toBe(false);
  });
});
