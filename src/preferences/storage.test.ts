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
      lastPvpCharacter: { region: 'eu', realm: 'draenor', name: 'Biba' },
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
      lastPvpCharacter: null,
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
      lastPvpCharacter: null,
    });
  });

  it('falls back to defaults on corrupt or invalid data', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(readPreferences()).toEqual(defaultPreferences);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ faction: 'scourge' }));
    expect(readPreferences().faction).toBe('horde');
  });

  it('keeps a valid last PvP character and drops a malformed one', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lastPvpCharacter: { region: 'us', realm: 'illidan', name: 'X', extra: 1 } }),
    );
    expect(readPreferences().lastPvpCharacter).toEqual({
      region: 'us',
      realm: 'illidan',
      name: 'X',
    });

    for (const bad of [{ region: 'us' }, 'Biba', { region: '', realm: 'a', name: 'b' }, 7]) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastPvpCharacter: bad }));
      expect(readPreferences().lastPvpCharacter).toBeNull();
    }
  });
});
