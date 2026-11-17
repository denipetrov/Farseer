import { beforeEach, describe, expect, it } from 'vitest';
import { defaultPreferences, readPreferences, STORAGE_KEY, writePreferences } from './storage';

describe('preferences storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns defaults when nothing is stored', () => {
    expect(readPreferences()).toEqual(defaultPreferences);
  });

  it('round-trips a saved preference', () => {
    writePreferences({ faction: 'alliance' });
    expect(readPreferences().faction).toBe('alliance');
  });

  it('falls back to defaults on corrupt or invalid data', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(readPreferences()).toEqual(defaultPreferences);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ faction: 'scourge' }));
    expect(readPreferences().faction).toBe('horde');
  });
});
