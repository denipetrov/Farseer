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
});
