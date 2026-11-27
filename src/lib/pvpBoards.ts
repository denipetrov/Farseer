/**
 * The PvP ladder families and board regions, with no API code, so the preferences can
 * validate them (`src/api/pvp.ts` re-exports them).
 */

/** Ladder families, in the game's order. Each has its own leaderboard page. */
/** In the menus' order (the user's, 2026-11-27): Solo Shuffle, 3v3, 2v2, Blitz, RBG */
export const PVP_BRACKETS = ['shuffle', '3v3', '2v2', 'blitz', 'rbg'] as const;
export type PvpBracket = (typeof PVP_BRACKETS)[number];
export const isPvpBracket = (v: unknown): v is PvpBracket =>
  typeof v === 'string' && (PVP_BRACKETS as readonly string[]).includes(v);

/** A PvP board's region: one of Blizzard's, or `world` for all of them together. */
export type PvpBoard = 'us' | 'eu' | 'kr' | 'tw' | 'world';

/** Every PvP board's region, World first (the boards' default) */
export const PVP_BOARDS: readonly PvpBoard[] = ['world', 'us', 'eu', 'kr', 'tw'];
export const isPvpBoard = (v: unknown): v is PvpBoard =>
  typeof v === 'string' && (PVP_BOARDS as readonly string[]).includes(v);
