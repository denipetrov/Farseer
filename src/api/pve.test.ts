import { describe, expect, it } from 'vitest';
import { isRunningIn, mplusSeasonsQuery, raidsQuery } from './pve';

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
