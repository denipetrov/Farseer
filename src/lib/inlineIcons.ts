/**
 * Icons whose SVG carries colours of its own besides `currentColor` (the bosses' fel-green
 * warglaives). A mask would flatten them to the text colour, so they are drawn inline:
 * `currentColor` still follows the text, and the other colours stay. Their source is
 * bundled, so only these are listed; `inlineIcons.test.ts` fails if an icon under `nav/`
 * has its own colours and is in neither list.
 */
const MULTI_COLOUR = import.meta.glob<string>('/src/assets/icons/nav/bosses.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const sources = new Map(
  Object.entries(MULTI_COLOUR).map(([path, svg]) => [/\/icons\/(.+)\.svg$/.exec(path)![1]!, svg]),
);
export const MULTI_COLOUR_ICONS: readonly string[] = [...sources.keys()];

/**
 * Icons with colours of their own that stay masks, in the text colour like the rest of the
 * menu: the guild icons. Inline, their faction-trim border stood out too much in the menu
 * (the user, 2026-11-25).
 */
export const MASKED_ON_PURPOSE: readonly string[] = ['nav/guild-horde', 'nav/guild-alliance'];

/** The SVG source of a multi-colour icon (by its path under `icons/`), else undefined */
export const inlineSvg = (icon: string): string | undefined => sources.get(icon);
