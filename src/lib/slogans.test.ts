import { describe, expect, it } from 'vitest';
import en from '@/i18n/messages/en.json';
import { SLOGANS, pickSlogans } from './slogans';

describe('pickSlogans', () => {
  it('never gives the hero and the footer the same slogan', () => {
    for (let a = 0; a < SLOGANS.length; a++) {
      for (let b = 0; b < SLOGANS.length - 1; b++) {
        const draws = [a / SLOGANS.length, b / (SLOGANS.length - 1)];
        const { hero, footer } = pickSlogans(() => draws.shift()!);
        expect(hero).toBe(SLOGANS[a]);
        expect(footer).not.toBe(hero);
      }
    }
  });

  it('reaches every slogan for the footer too', () => {
    const seen = new Set<string>();
    for (let a = 0; a < SLOGANS.length; a++)
      for (let b = 0; b < SLOGANS.length - 1; b++) {
        const draws = [a / SLOGANS.length, b / (SLOGANS.length - 1)];
        seen.add(pickSlogans(() => draws.shift()!).footer);
      }
    expect(seen.size).toBe(SLOGANS.length);
  });

  it('has ten slogans, each with an English line', () => {
    expect(SLOGANS).toHaveLength(10);
    for (const key of SLOGANS) expect((en as Record<string, string>)[key], key).toBeTruthy();
  });
});
