import { describe, expect, it } from 'vitest';
import { canonicalPath } from './sitePath';

const at = (path: string) => canonicalPath(path, 'de');

describe('canonical addresses: /<game>/<language>/…', () => {
  it('leaves canonical addresses and / alone', () => {
    expect(at('/')).toBeNull();
    expect(at('/retail/en/pvp')).toBeNull();
    expect(at('/retail/cn/pve/raids/x/hall-of-fame')).toBeNull();
    expect(at('/retail/en')).toBeNull();
  });

  it('puts Retail in front of old links that start with a language', () => {
    expect(at('/en/pvp/leaderboards/3v3')).toBe('/retail/en/pvp/leaderboards/3v3');
    expect(at('/ko/pve')).toBe('/retail/ko/pve');
  });

  it('puts Retail and the preferred language in front of bare paths', () => {
    expect(at('/pvp')).toBe('/retail/de/pvp');
    expect(at('/character/eu/draenor/x')).toBe('/retail/de/character/eu/draenor/x');
  });

  it('sends Forever to Retail while it is off', () => {
    expect(at('/forever/en/pvp')).toBe('/retail/en/pvp');
    expect(at('/forever')).toBe('/retail/de');
  });

  it('fixes the language spelling, or adds one when missing', () => {
    expect(at('/retail/de_DE/pvp')).toBe('/retail/de/pvp');
    expect(at('/retail/kr/pvp')).toBe('/retail/ko/pvp');
    expect(at('/retail')).toBe('/retail/de');
    expect(at('/retail/pvp')).toBe('/retail/de/pvp');
  });
});
