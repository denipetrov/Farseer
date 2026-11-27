import { describe, expect, it } from 'vitest';
import css from './tokens.css?raw';
import gameColors from './gameColors.css?raw';
import { ICON_SIZES } from './iconSizes';
import { factionTrim, palette } from './palette';

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** The custom properties a rule block declares: name → value */
function declared(block: string): Record<string, string> {
  return Object.fromEntries(
    [...block.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]),
  );
}

const root = declared(
  css.slice(css.indexOf(':root {'), css.indexOf(":root[data-faction='alliance']")),
);
const alliance = declared(css.slice(css.indexOf(":root[data-faction='alliance']")));

describe('tokens.css follows palette.ts', () => {
  it('has every class, quality and rank colour', () => {
    for (const [k, v] of Object.entries(palette.class))
      expect(root[`--color-class-${kebab(k)}`], k).toBe(v);
    for (const [k, v] of Object.entries(palette.quality))
      expect(root[`--color-quality-${kebab(k)}`], k).toBe(v);
    for (const [k, v] of Object.entries(palette.rank))
      expect(root[`--color-rank-${kebab(k)}`], k).toBe(v);
    for (const [k, v] of Object.entries(palette.tooltip))
      expect(root[`--color-tooltip-${kebab(k)}`], k).toBe(v);
  });

  it('has the surfaces, text, status and faction colours', () => {
    expect(root['--color-bg']).toBe(palette.neutral[900]);
    expect(root['--color-surface']).toBe(palette.neutral[800]);
    expect(root['--color-text']).toBe(palette.neutral[100]);
    expect(root['--color-danger']).toBe(palette.status.danger);
    expect(root['--color-horde-trim']).toBe(palette[factionTrim.horde][700]);
    expect(root['--color-alliance-trim']).toBe(palette[factionTrim.alliance][700]);
  });

  it('switches accent and trim with the faction', () => {
    expect(root['--color-accent']).toBe(palette.horde[500]);
    expect(root['--color-trim']).toBe(palette[factionTrim.horde][500]);
    expect(alliance['--color-accent']).toBe(palette.alliance[500]);
    expect(alliance['--color-trim']).toBe(palette[factionTrim.alliance][500]);
  });

  it('has the icon sizes of iconSizes.ts', () => {
    for (const [k, v] of Object.entries(ICON_SIZES))
      expect(root[`--icon-size-${k}`]).toBe(`${v}px`);
  });
});

describe('gameColors.css', () => {
  it('colours every class and rank through a token that exists', () => {
    for (const k of Object.keys(palette.class)) {
      expect(gameColors).toContain(
        `[data-class-color='${kebab(k)}'] {\n  color: var(--color-class-${kebab(k)});`,
      );
    }
    for (const k of Object.keys(palette.rank)) {
      expect(gameColors).toContain(
        `[data-rank='${kebab(k)}'] {\n  color: var(--color-rank-${kebab(k)});`,
      );
    }
  });
});
