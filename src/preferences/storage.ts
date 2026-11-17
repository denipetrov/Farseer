/**
 * Tiny typed wrapper around localStorage with cross-tab sync.
 * All preferences live under a single key so they can be versioned/migrated together.
 */
import type { Faction } from '@/styles/palette';

export const STORAGE_KEY = 'farseer:preferences';

export interface Preferences {
  faction: Faction;
}

export const defaultPreferences: Preferences = {
  faction: 'horde',
};

const isFaction = (v: unknown): v is Faction => v === 'horde' || v === 'alliance';

export function readPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      ...defaultPreferences,
      ...parsed,
      faction: isFaction(parsed.faction) ? parsed.faction : defaultPreferences.faction,
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
