import { describe, expect, it } from 'vitest';
import { realmLabel, regionName } from './regions';

describe('regionName', () => {
  it('names every API region', () => {
    expect(regionName('us')).toBe('Americas');
    expect(regionName('EU')).toBe('Europe');
    expect(regionName('kr')).toBe('Korea');
    expect(regionName('tw')).toBe('Taiwan');
    expect(regionName('cn')).toBe('China');
  });

  it('shows an unknown region as its code', () => {
    expect(regionName('xx')).toBe('XX');
  });
});

describe('realmLabel', () => {
  it('turns slugs into words and keeps display names', () => {
    expect(realmLabel('burning-legion')).toBe('Burning Legion');
    expect(realmLabel('draenor')).toBe('Draenor');
    expect(realmLabel('Azjol-Nerub')).toBe('Azjol-Nerub');
    expect(realmLabel("Kael'thas")).toBe("Kael'thas");
    expect(realmLabel('阿古斯')).toBe('阿古斯');
  });
});
