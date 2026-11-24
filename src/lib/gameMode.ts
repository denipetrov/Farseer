/**
 * The two halves of the site. Each has its own home route (`/pvp`, `/pve`), and
 * Soulseeker's search takes the same values (`/search/suggestions?type=pvp|pve`).
 */
export const GAME_MODES = ['pvp', 'pve'] as const;
export type GameMode = (typeof GAME_MODES)[number];
export const DEFAULT_GAME_MODE: GameMode = 'pvp';

export const GAME_MODE_LABELS: Record<GameMode, string> = { pvp: 'PvP', pve: 'PvE' };

export const isGameMode = (v: unknown): v is GameMode =>
  typeof v === 'string' && (GAME_MODES as readonly string[]).includes(v);

/** The mode a path belongs to (`/pve/...` → `pve`), or null for shared pages. */
export function gameModeOfPath(pathname: string): GameMode | null {
  const first = pathname.split('/')[1];
  return isGameMode(first) ? first : null;
}
