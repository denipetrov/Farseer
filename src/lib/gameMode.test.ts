import { describe, expect, it } from 'vitest';
import { gameModeOfPath, isGameMode } from './gameMode';

describe('game modes', () => {
  it('recognises the two modes only', () => {
    expect(isGameMode('pvp')).toBe(true);
    expect(isGameMode('pve')).toBe(true);
    for (const v of ['PvP', 'raid', '', null, 1]) expect(isGameMode(v)).toBe(false);
  });

  it('reads the mode from the first path segment', () => {
    expect(gameModeOfPath('/pvp')).toBe('pvp');
    expect(gameModeOfPath('/pve/')).toBe('pve');
    expect(gameModeOfPath('/pve/leaderboard')).toBe('pve');
    expect(gameModeOfPath('/')).toBeNull();
    expect(gameModeOfPath('/character/eu/draenor/pvpking')).toBeNull();
    expect(gameModeOfPath('/pvpstats')).toBeNull();
  });

  it('reads the mode after the language', () => {
    expect(gameModeOfPath('/de/pvp')).toBe('pvp');
    expect(gameModeOfPath('/cn/pve/')).toBe('pve');
    expect(gameModeOfPath('/en/character/eu/draenor/x')).toBeNull();
    expect(gameModeOfPath('/de')).toBeNull();
  });

  it('reads the mode after the game and language', () => {
    expect(gameModeOfPath('/retail/de/pvp')).toBe('pvp');
    expect(gameModeOfPath('/retail/cn/pve/raids/x/hall-of-fame')).toBe('pve');
    expect(gameModeOfPath('/forever/en/pve')).toBe('pve');
    expect(gameModeOfPath('/retail/en/privacy')).toBeNull();
    expect(gameModeOfPath('/retail/en')).toBeNull();
  });
});
