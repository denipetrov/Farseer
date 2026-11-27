import {
  PVP_BOARDS,
  isLadderRole,
  type LadderRole,
  PVP_BRACKETS,
  isPvpBracket,
  type PvpBoard,
  type PvpBracket,
  type PvpSeason,
} from '@/api/pvp';
import { resolveClass } from '@/lib/wow/classes';
import { resolveSpec } from '@/lib/wow/specs';

/**
 * The PvP archives (finished seasons' ladders; the user, 2026-11-27). What Soulseeker holds,
 * probed on 2026-11-27 (US, every season): 2v2, 3v3 and RBG from season 27, Solo Shuffle
 * from 34, Blitz from 38; seasons 22–26 are listed but empty.
 */
export const ARCHIVE_FIRST_SEASON = 27;
const BRACKET_FIRST_SEASON: Partial<Record<PvpBracket, number>> = { shuffle: 34, blitz: 38 };

/** The brackets a finished season has ladders for, in the menus' order */
export const archiveBrackets = (seasonId: number): PvpBracket[] =>
  PVP_BRACKETS.filter((b) => seasonId >= (BRACKET_FIRST_SEASON[b] ?? ARCHIVE_FIRST_SEASON));

/**
 * Archived Shuffle and Blitz are stored per spec ladder: Soulseeker serves them by spec
 * (`class` + `spec`) or by role (merged by rating), never all specs or a class alone. So
 * these two get the class/spec/role filter (the user, 2026-11-27), opening on DPS; a class
 * picked alone waits for its spec.
 */
export const archiveFiltered = (bracket: PvpBracket) =>
  bracket === 'shuffle' || bracket === 'blitz';

/** The finished seasons with ladders, newest first */
export const archiveSeasons = (seasons: readonly PvpSeason[]): PvpSeason[] =>
  seasons
    .filter((s) => !s.current && s.seasonId >= ARCHIVE_FIRST_SEASON)
    .sort((a, b) => b.seasonId - a.seasonId);

/** The archives page's URL: all optional, invalid values dropped */
export interface ArchiveSearch {
  season?: number;
  bracket?: PvpBracket;
  region?: PvpBoard;
  /** Shuffle and Blitz: a class (Soulseeker's slug), with `spec` one spec's ladder */
  class?: string;
  spec?: string;
  role?: LadderRole;
  page?: number;
}

export const validateArchiveSearch = (search: Record<string, unknown>): ArchiveSearch => ({
  season:
    Number.isInteger(Number(search.season)) && Number(search.season) >= ARCHIVE_FIRST_SEASON
      ? Number(search.season)
      : undefined,
  bracket: isPvpBracket(search.bracket) ? search.bracket : undefined,
  region: PVP_BOARDS.includes(search.region as PvpBoard) ? (search.region as PvpBoard) : undefined,
  class: typeof search.class === 'string' && resolveClass(search.class) ? search.class : undefined,
  spec:
    typeof search.spec === 'string' &&
    typeof search.class === 'string' &&
    resolveSpec(search.spec, search.class)
      ? search.spec
      : undefined,
  role: isLadderRole(search.role) ? search.role : undefined,
  page: Number(search.page) > 1 ? Math.floor(Number(search.page)) : undefined,
});

export interface ArchiveView {
  seasonId: number;
  bracket: PvpBracket;
  /** Shuffle and Blitz: the class picked, with `spec` one spec's ladder */
  cls?: string;
  spec?: string;
  /** Shuffle and Blitz: the role shown when no class is picked (DPS when none) */
  role?: LadderRole;
}

/**
 * What the page shows for a URL: the season asked for when it is a finished one with
 * ladders (else the newest), the bracket asked for when that season has it (else 3v3), and
 * on Shuffle and Blitz the class and spec, or else the role (DPS when none). 2v2, 3v3 and
 * RBG take no filter.
 */
export function resolveArchive(
  search: ArchiveSearch,
  seasons: readonly PvpSeason[],
): ArchiveView | null {
  const list = archiveSeasons(seasons);
  const season = list.find((s) => s.seasonId === search.season) ?? list[0];
  if (!season) return null;
  const brackets = archiveBrackets(season.seasonId);
  const bracket = search.bracket && brackets.includes(search.bracket) ? search.bracket : '3v3';
  const view: ArchiveView = { seasonId: season.seasonId, bracket };
  if (!archiveFiltered(bracket)) return view;
  if (search.class) return { ...view, cls: search.class, spec: search.spec };
  return { ...view, role: search.role ?? 'dps' };
}
