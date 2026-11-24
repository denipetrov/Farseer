/**
 * Blizzard's regions, as the API spells them (`us`, `eu`, `kr`, `tw`, `cn`), and the
 * names shown to people. `us` covers the Americas and Oceania.
 */
export const REGION_NAMES: Readonly<Record<string, string>> = {
  us: 'Americas',
  eu: 'Europe',
  kr: 'Korea',
  tw: 'Taiwan',
  cn: 'China',
};

/** "eu" → "Europe"; an unknown region is shown as its code in capitals. */
export function regionName(region: string): string {
  const code = region.trim().toLowerCase();
  return REGION_NAMES[code] ?? code.toUpperCase();
}

/**
 * A realm as shown: a display name stays as it is; a slug (the API sends one when it has
 * no name) becomes words: "burning-legion" → "Burning Legion".
 */
export function realmLabel(realm: string): string {
  if (!/^[a-z0-9-]+$/.test(realm)) return realm;
  return realm
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
