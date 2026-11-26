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
      lastPveCharacter: { region: 'us', realm: 'illidan', name: 'Rooiben' },
      lastPveGuild: { region: 'eu', realm: 'tarren-mill', name: 'Echo' },
      pvpBoardRegions: { shuffle: 'eu', '3v3': 'us' },
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
      lastPveCharacter: null,
      lastPveGuild: null,
      pvpBoardRegions: {},
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
      lastPveCharacter: null,
      lastPveGuild: null,
      pvpBoardRegions: {},
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

  it('keeps the last PvE character and guild apart from the PvP one', () => {
    const echo = { region: 'eu', realm: 'tarren-mill', name: 'Echo' };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lastPveGuild: echo, lastPveCharacter: 'x' }),
    );
    const prefs = readPreferences();
    expect(prefs.lastPveGuild).toEqual(echo);
    expect(prefs.lastPveCharacter).toBeNull();
    expect(prefs.lastPvpCharacter).toBeNull();
  });

  it('keeps a known region per known bracket, and drops the rest', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        pvpBoardRegions: { shuffle: 'eu', blitz: 'cn', '5v5': 'us', rbg: 'world', '3v3': 7 },
      }),
    );
    expect(readPreferences().pvpBoardRegions).toEqual({ shuffle: 'eu', rbg: 'world' });

    for (const bad of ['eu', null, [1], 3]) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ pvpBoardRegions: bad }));
      expect(readPreferences().pvpBoardRegions).toEqual({});
    }
  });
});
