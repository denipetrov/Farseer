/**
 * The two halves of the site. Each has its own home route (`/pvp`, `/pve`), and
 * Soulseeker's search takes the same values (`/search/suggestions?type=pvp|pve`).
 */
import { resolveLocaleSlug } from '@/i18n/locales';
import { isGameSlug } from './games';

export const GAME_MODES = ['pvp', 'pve'] as const;
export type GameMode = (typeof GAME_MODES)[number];
export const DEFAULT_GAME_MODE: GameMode = 'pvp';

export const GAME_MODE_LABELS: Record<GameMode, string> = { pvp: 'PvP', pve: 'PvE' };

export const isGameMode = (v: unknown): v is GameMode =>
  typeof v === 'string' && (GAME_MODES as readonly string[]).includes(v);

/**
 * The mode a path belongs to, after its game and language (`/retail/de/pve/...` → `pve`), or
 * null for pages outside both (`/retail/de/privacy`). Older shapes still read, for links not
 * yet redirected: `/de/pve`, `/pve`.
 */
export function gameModeOfPath(pathname: string): GameMode | null {
  const segments = pathname.split('/').filter(Boolean);
  if (isGameSlug(segments[0])) segments.shift();
  if (resolveLocaleSlug(segments[0])) segments.shift();
  return isGameMode(segments[0]) ? segments[0] : null;
}
