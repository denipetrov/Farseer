/**
 * Tiny typed wrapper around localStorage with cross-tab sync.
 * All preferences live under a single key so they can be versioned/migrated together.
 */
import type { Faction } from '@/styles/palette';
import { DEFAULT_ASSET_STYLE, isAssetStyle, type AssetStyle } from '@/lib/assets';
import { DEFAULT_GAME_MODE, isGameMode, type GameMode } from '@/lib/gameMode';
import { isLocaleSlug, type LocaleSlug } from '@/i18n/locales';
import { isPvpBoard, isPvpBracket, type PvpBoard, type PvpBracket } from '@/lib/pvpBoards';

export const STORAGE_KEY = 'farseer:preferences';

export interface Preferences {
  /** Accent colour: red (Horde) or blue (Alliance) */
  faction: Faction;
  /** Which look of the icon sets to show: modern or classic */
  assetStyle: AssetStyle;
  /** The half of the site the user last chose: PvP or PvE. `/` and the logo lead there. */
  gameMode: GameMode;
  /**
   * The language last chosen (dropdown or a link's URL), as its URL slug. Null until one is:
   * a first visit then follows the browser's language.
   */
  locale: LocaleSlug | null;
  /**
   * The last PvP character page opened, so the menu's Character link can return to it.
   * Null until one is opened (the link then opens the top Solo Shuffle player).
   */
  lastPvpCharacter: CharacterRef | null;
  /** The last PvE character page opened (else the link opens the top Mythic+ player) */
  lastPveCharacter: CharacterRef | null;
  /** The last guild page opened (else the link opens the current raid's top guild) */
  lastPveGuild: CharacterRef | null;
  /**
   * The region last picked on each PvP bracket's leaderboard widget (`{ shuffle: 'eu' }`), so
   * it stays after navigating or reloading. A bracket not listed opens on its default (World).
   */
  pvpBoardRegions: Partial<Record<PvpBracket, PvpBoard>>;
  /**
   * The region last picked on each of the PvE home's Mythic+ role widgets
   * (`{ healer: 'eu' }`); a role not listed opens on World
   */
  mplusBoardRegions: Partial<Record<MplusWidgetRole, MplusRegion>>;
}

/** The PvE home's Mythic+ widgets, one per role (the user, 2026-11-28) */
export const MPLUS_WIDGET_ROLES = ['melee', 'ranged', 'healer', 'tank'] as const;
export type MplusWidgetRole = (typeof MPLUS_WIDGET_ROLES)[number];
/** Raider.io's regions and World (Soulseeker's PvE boards) */
const MPLUS_REGIONS = ['world', 'us', 'eu', 'kr', 'tw', 'cn'] as const;
export type MplusRegion = (typeof MPLUS_REGIONS)[number];

/** A character or guild page's address: region, realm slug and name as in its URL. */
export interface CharacterRef {
  region: string;
  realm: string;
  name: string;
}

export const defaultPreferences: Preferences = {
  faction: 'horde',
  assetStyle: DEFAULT_ASSET_STYLE,
  gameMode: DEFAULT_GAME_MODE,
  locale: null,
  lastPvpCharacter: null,
  lastPveCharacter: null,
  lastPveGuild: null,
  pvpBoardRegions: {},
  mplusBoardRegions: {},
};

const isFaction = (v: unknown): v is Faction => v === 'horde' || v === 'alliance';

const isShortText = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0 && v.length <= 64;

export const isCharacterRef = (v: unknown): v is CharacterRef => {
  const r = v as Partial<CharacterRef> | null;
  return (
    typeof r === 'object' &&
    r !== null &&
    isShortText(r.region) &&
    isShortText(r.realm) &&
    isShortText(r.name)
  );
};

/** A stored page address, copied field by field (nothing else from storage is kept), or null */
const pageRef = (v: unknown): CharacterRef | null =>
  isCharacterRef(v) ? { region: v.region, realm: v.realm, name: v.name } : null;

/** Only known brackets with known regions are kept; anything else is dropped */
function boardRegions(v: unknown): Partial<Record<PvpBracket, PvpBoard>> {
  if (typeof v !== 'object' || v === null) return {};
  return Object.fromEntries(
    Object.entries(v).filter(([bracket, region]) => isPvpBracket(bracket) && isPvpBoard(region)),
  );
}

/** Only the four roles with known regions are kept */
function mplusRegions(v: unknown): Partial<Record<MplusWidgetRole, MplusRegion>> {
  if (typeof v !== 'object' || v === null) return {};
  return Object.fromEntries(
    Object.entries(v).filter(
      ([role, region]) =>
        (MPLUS_WIDGET_ROLES as readonly string[]).includes(role) &&
        (MPLUS_REGIONS as readonly unknown[]).includes(region),
    ),
  );
}

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
      gameMode: isGameMode(parsed.gameMode) ? parsed.gameMode : defaultPreferences.gameMode,
      locale: isLocaleSlug(parsed.locale) ? parsed.locale : defaultPreferences.locale,
      lastPvpCharacter: pageRef(parsed.lastPvpCharacter),
      lastPveCharacter: pageRef(parsed.lastPveCharacter),
      lastPveGuild: pageRef(parsed.lastPveGuild),
      pvpBoardRegions: boardRegions(parsed.pvpBoardRegions),
      mplusBoardRegions: mplusRegions(parsed.mplusBoardRegions),
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
