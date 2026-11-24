import { describe, expect, it } from 'vitest';
import { searchQueryOf } from './search';

describe('searchQueryOf', () => {
  it('sends names as typed, trimmed', () => {
    expect(searchQueryOf('  Biba ')).toBe('Biba');
    expect(searchQueryOf('Bad   Call')).toBe('Bad Call');
    for (const q of ['Bìbà', 'Telegon-306757597', 'Repugnant!', '***', '흑마법사', 'Смерть']) {
      expect(searchQueryOf(q)).toBe(q);
    }
  });

  it('holds back what Soulseeker would refuse', () => {
    for (const q of ['', 'b', '  b  ', 'x'.repeat(33), '<script>', '.*', 'a|b', "o'neil"]) {
      expect(searchQueryOf(q)).toBeNull();
    }
  });
});
