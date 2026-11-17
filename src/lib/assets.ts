/**
 * Styled assets: every asset family exists in a `modern` and a `classic` look,
 * and the user picks one (preference `assetStyle`).
 *
 *   src/assets/icons/<family>/<style>/<name>.<ext>  (png, jpg, svg, webp)
 *   e.g. src/assets/icons/races/modern/nightelf-female.png
 *
 * A file missing from the chosen style falls back to the other style, so a
 * family can be completed one style at a time.
 */

export const ASSET_STYLES = ['modern', 'classic'] as const;
export type AssetStyle = (typeof ASSET_STYLES)[number];
export const DEFAULT_ASSET_STYLE: AssetStyle = 'modern';

export const isAssetStyle = (v: unknown): v is AssetStyle =>
  typeof v === 'string' && (ASSET_STYLES as readonly string[]).includes(v);

// Eager imports give hashed URLs (strings) only; the browser fetches a file when it is shown.
const files = import.meta.glob<string>('/src/assets/icons/*/*/*.{png,jpg,jpeg,svg,webp}', {
  eager: true,
  import: 'default',
});

/** "races/modern/nightelf-female" → URL */
const byKey = new Map<string, string>();
for (const [path, url] of Object.entries(files)) {
  const match = /\/icons\/([^/]+)\/([^/]+)\/([^/]+)\.\w+$/.exec(path);
  if (match) byKey.set(`${match[1]}/${match[2]}/${match[3]}`, url);
}

/** Every file name (no extension) a family has in one style. */
export function styledAssetNames(family: string, style: AssetStyle): string[] {
  const prefix = `${family}/${style}/`;
  return [...byKey.keys()].filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length));
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
