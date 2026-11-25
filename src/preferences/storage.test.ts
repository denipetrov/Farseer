import { beforeEach, describe, expect, it } from 'vitest';
import { defaultPreferences, readPreferences, STORAGE_KEY, writePreferences } from './storage';

describe('preferences storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns defaults when nothing is stored', () => {
    expect(readPreferences()).toEqual(defaultPreferences);
  });

  it('defaults to PvP', () => {
    expect(defaultPreferences.gameMode).toBe('pvp');
  });

  it('round-trips saved preferences', () => {
    const prefs = {
      faction: 'alliance',
      assetStyle: 'classic',
      gameMode: 'pve',
      locale: 'de',
    } as const;
    writePreferences(prefs);
    expect(readPreferences()).toEqual(prefs);
  });

  it('validates each field on its own and drops unknown keys', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        faction: 'alliance',
        assetStyle: 'retro',
        gameMode: 'raid',
        locale: 'xx',
        junk: 1,
      }),
    );
    expect(readPreferences()).toEqual({
      faction: 'alliance',
      assetStyle: 'modern',
      gameMode: 'pvp',
      locale: null,
    });
  });

  it('keeps older saved preferences that have no game mode', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ faction: 'alliance', assetStyle: 'classic' }),
    );
    expect(readPreferences()).toEqual({
      faction: 'alliance',
      assetStyle: 'classic',
      gameMode: 'pvp',
      locale: null,
    });
  });

  it('falls back to defaults on corrupt or invalid data', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(readPreferences()).toEqual(defaultPreferences);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ faction: 'scourge' }));
    expect(readPreferences().faction).toBe('horde');
  });
});
