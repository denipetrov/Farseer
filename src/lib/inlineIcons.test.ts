import { describe, expect, it } from 'vitest';
import { MASKED_ON_PURPOSE, MULTI_COLOUR_ICONS, inlineSvg } from './inlineIcons';

const navSvgs = import.meta.glob<string>('/src/assets/icons/nav/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/**
 * Whether an SVG paints a colour other than `currentColor`: a CSS variable, or a fixed fill
 * or stroke. Black and white inside `<mask>` only cut shapes out, so they don't count.
 */
function hasOwnColours(svg: string): boolean {
  const painted = svg.replace(/<mask[\s\S]*?<\/mask>/g, '');
  return (
    /var\(--/.test(painted) ||
    /(fill|stroke)(="|:\s*)#(?!000\b|fff\b|000000\b|ffffff\b)[0-9a-f]{3,6}/i.test(painted)
  );
}

describe('multi-colour icons', () => {
  it('decides for every menu icon with colours of its own: inline, or a mask on purpose', () => {
    const coloured = Object.entries(navSvgs)
      .filter(([, svg]) => hasOwnColours(svg))
      .map(([path]) => /\/icons\/(.+)\.svg$/.exec(path)![1]!)
      .sort();
    expect([...MULTI_COLOUR_ICONS, ...MASKED_ON_PURPOSE].sort()).toEqual(coloured);
  });

  it('keeps the bosses icon green, and the guild icons in the text colour', () => {
    expect(inlineSvg('nav/bosses')).toContain('#85bb6f');
    expect(inlineSvg('nav/guild-horde')).toBeUndefined();
    expect(inlineSvg('nav/home')).toBeUndefined();
  });
});
