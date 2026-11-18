/**
 * Styled assets: every asset family exists in a `modern` and a `classic` look,
 * and the user picks one (preference `assetStyle`).
 *
 *   src/assets/icons/<family>/<style>/<name>.<ext>  (png, jpg, svg, webp)
 *   e.g. src/assets/icons/races/modern/nightelf-female.png
 *
 * A file missing from the chosen style falls back to the other style, so a
 * family can be completed one style at a time.
 *
 * Icons with a single look (race crests: icons/races/crests/<faction>/<name>.png)
 * are read by path with `iconUrl`.
 */

export const ASSET_STYLES = ['modern', 'classic'] as const;
export type AssetStyle = (typeof ASSET_STYLES)[number];
export const DEFAULT_ASSET_STYLE: AssetStyle = 'modern';

export const isAssetStyle = (v: unknown): v is AssetStyle =>
  typeof v === 'string' && (ASSET_STYLES as readonly string[]).includes(v);

// Eager imports give hashed URLs (strings) only; the browser fetches a file when it is shown.
const files = import.meta.glob<string>('/src/assets/icons/**/*.{png,jpg,jpeg,svg,webp}', {
  eager: true,
  import: 'default',
});

/** Path under icons/ without extension → URL: "races/modern/nightelf-female", "races/crests/horde/orc-crest" */
const byKey = new Map<string, string>();
for (const [path, url] of Object.entries(files)) {
  const match = /\/icons\/(.+)\.\w+$/.exec(path);
  if (match) byKey.set(match[1]!, url);
}

/**
 * URL of an icon that has no modern/classic styles (e.g. race crests), by its path
 * under `icons/` without extension. Prefer a family mapper over calling this directly.
 */
export function iconUrl(path: string): string | undefined {
  return byKey.get(path);
}

/** Every icon path (no extension) directly inside a folder under `icons/`. */
export function iconNames(folder: string): string[] {
  const prefix = `${folder}/`;
  return [...byKey.keys()]
    .filter((k) => k.startsWith(prefix) && !k.slice(prefix.length).includes('/'))
    .map((k) => k.slice(prefix.length));
}

/** Every file name (no extension) a family has in one style. */
export function styledAssetNames(family: string, style: AssetStyle): string[] {
  return iconNames(`${family}/${style}`);
}

/** Whether a family has `name` in exactly this style (no fallback). */
export function hasStyledAsset(family: string, style: AssetStyle, name: string): boolean {
  return byKey.has(`${family}/${style}/${name}`);
}

/** URL of `family/style/name`, falling back to the other style; undefined if neither has it. */
export function styledAssetUrl(
  family: string,
  style: AssetStyle,
  name: string,
): string | undefined {
  return (
    byKey.get(`${family}/${style}/${name}`) ??
    ASSET_STYLES.map((s) => byKey.get(`${family}/${s}/${name}`)).find(Boolean)
  );
}
