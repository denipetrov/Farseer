import { describe, expect, it } from 'vitest';
import { lastReachablePage, pageWindow } from './pagination';

describe('pageWindow', () => {
  it('shows every page of a short list', () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageWindow(1, 0)).toEqual([1]);
  });

  it('keeps the first and last, and skips the rest with gaps', () => {
    expect(pageWindow(6, 120)).toEqual([1, 'gap', 4, 5, 6, 7, 8, 'gap', 120]);
    expect(pageWindow(1, 120)).toEqual([1, 2, 3, 'gap', 120]);
    expect(pageWindow(120, 120)).toEqual([1, 'gap', 118, 119, 120]);
  });

  it('never hides a single page behind a gap', () => {
    expect(pageWindow(4, 10)).toEqual([1, 2, 3, 4, 5, 6, 'gap', 10]);
    expect(pageWindow(7, 10)).toEqual([1, 'gap', 5, 6, 7, 8, 9, 10]);
  });

  it('stops at the last page Soulseeker serves (rows up to 200,000)', () => {
    expect(lastReachablePage(5303, 50)).toBe(4000);
    expect(lastReachablePage(2695, 50)).toBe(2695);
    expect(lastReachablePage(0, 50)).toBe(1);
  });
});
