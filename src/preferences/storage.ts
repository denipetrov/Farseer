/**
 * Tiny typed wrapper around localStorage with cross-tab sync.
 * All preferences live under a single key so they can be versioned/migrated together.
 */
import type { Faction } from '@/styles/palette';
import { DEFAULT_ASSET_STYLE, isAssetStyle, type AssetStyle } from '@/lib/assets';

export const STORAGE_KEY = 'farseer:preferences';

export interface Preferences {
  /** Accent colour: red (Horde) or blue (Alliance) */
  faction: Faction;
  /** Which look of the icon sets to show: modern or classic */
  assetStyle: AssetStyle;
}

export const defaultPreferences: Preferences = {
  faction: 'horde',
  assetStyle: DEFAULT_ASSET_STYLE,
};

const isFaction = (v: unknown): v is Faction => v === 'horde' || v === 'alliance';

/** Each field is validated on its own: one bad value never resets the others. */
export function readPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      faction: isFaction(parsed.faction) ? parsed.faction : defaultPreferences.faction,
      assetStyle: isAssetStyle(parsed.assetStyle)
        ? parsed.assetStyle
        : defaultPreferences.assetStyle,
    };
  } catch {
    return defaultPreferences;
  }
}

export function writePreferences(prefs: Preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // storage full / disabled — preferences just won't persist
  }
}
