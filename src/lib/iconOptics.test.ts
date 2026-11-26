import { describe, expect, it } from 'vitest';
import css from '@/styles/iconOptics.css?raw';
import { iconUrl } from './assets';

/** The optical scale table, read from the stylesheet: icon path → factor */
const table = Object.fromEntries(
  [...css.matchAll(/\[data-optical='([^']+)'\]\s*\{\s*--optical-scale:\s*([\d.]+);/g)].map((m) => [
    m[1]!,
    Number(m[2]),
  ]),
);

describe('icon optical sizing (iconOptics.css)', () => {
  it('names only icons that exist, with factors between 1 and 1.4', () => {
    expect(Object.keys(table).length).toBeGreaterThan(0);
    for (const [icon, factor] of Object.entries(table)) {
      expect(iconUrl(icon), icon).toBeDefined();
      expect(factor, icon).toBeGreaterThan(1);
      expect(factor, icon).toBeLessThanOrEqual(1.4);
    }
  });

  it('includes the tall, thin icons the user picked', () => {
    expect(table['nav/character']).toBe(1.4);
    expect(table['game-modes/raid']).toBe(1.4);
    expect(table['nav/home']).toBeUndefined();
  });
});
