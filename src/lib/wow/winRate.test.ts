import { describe, expect, it } from 'vitest';
import { winRateTier } from './winRate';

describe('winRateTier', () => {
  it('is red below 50%, grey from 50% to 55%, green above', () => {
    expect(winRateTier(0.3)).toBe('low');
    expect(winRateTier(0.496)).toBe('low');
    expect(winRateTier(0.5)).toBe('even');
    expect(winRateTier(0.55)).toBe('even');
    expect(winRateTier(0.551)).toBe('high');
    expect(winRateTier(1)).toBe('high');
  });
});
