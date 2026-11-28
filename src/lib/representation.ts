import {
  PVP_BOARDS,
  isPvpBracket,
  isRepresentationRating,
  type PvpBoard,
  type PvpBracket,
  type RepresentationRating,
  type RepresentedSpec,
} from '@/api/pvp';
import { resolveSpec, type Spec } from '@/lib/wow/specs';
import { TIER_ROLES, specInRole, type TierRole } from '@/lib/wow/tierRoles';

/**
 * The PvP spec representation page (the user's design, 2026-11-27): one day's snapshot of
 * who plays what at or above a rating, from `GET /pvp/spec-representation`.
 */

/** The day tabs: today (the newest snapshot), and that many days before it */
export const REPRESENTATION_DAYS = [0, 7, 15, 30] as const;
export type RepresentationDay = (typeof REPRESENTATION_DAYS)[number];

/** `2026-11-27` minus 7 days → `2026-11-20` (UTC days, as Soulseeker's snapshots) */
export function daysBefore(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Why a day tab is off: before the season started, or no snapshot that day */
export type DayOff = 'beforeSeason' | 'noSnapshot';

/**
 * A day tab's date and whether it can be picked (the user, 2026-11-28): counted back from
 * the newest snapshot (`latest`); off when that is before the season started in the region
 * shown (`seasonStart`, an ISO time: its UTC day counts), or when Soulseeker's
 * `availableDates` (the last 30 days with data) doesn't list it. Today is always the
 * newest snapshot. Without `availableDates` (an older Soulseeker) a day is left on: a
 * missing one answers 404, which the page explains.
 */
export function dayStatus(
  day: RepresentationDay,
  latest: string,
  availableDates: readonly string[] | undefined,
  seasonStart: string | null | undefined,
): { date: string; off: DayOff | null } {
  const date = daysBefore(latest, day);
  if (day === 0) return { date, off: null };
  if (seasonStart && date < seasonStart.slice(0, 10)) return { date, off: 'beforeSeason' };
  if (availableDates && !availableDates.includes(date)) return { date, off: 'noSnapshot' };
  return { date, off: null };
}

/** The page's URL: all optional, invalid values dropped */
export interface RepresentationSearch {
  bracket?: PvpBracket;
  region?: PvpBoard;
  rating?: RepresentationRating;
  role?: Exclude<TierRole, 'all'>;
  /** Days before the newest snapshot (absent: today) */
  day?: Exclude<RepresentationDay, 0>;
}

export const validateRepresentationSearch = (
  search: Record<string, unknown>,
): RepresentationSearch => ({
  bracket: isPvpBracket(search.bracket) ? search.bracket : undefined,
  region: PVP_BOARDS.includes(search.region as PvpBoard) ? (search.region as PvpBoard) : undefined,
  rating: isRepresentationRating(Number(search.rating))
    ? (Number(search.rating) as RepresentationRating)
    : undefined,
  role:
    search.role !== 'all' && (TIER_ROLES as readonly unknown[]).includes(search.role)
      ? (search.role as Exclude<TierRole, 'all'>)
      : undefined,
  day:
    Number(search.day) !== 0 &&
    (REPRESENTATION_DAYS as readonly number[]).includes(Number(search.day))
      ? (Number(search.day) as Exclude<RepresentationDay, 0>)
      : undefined,
});

/** The columns, in the user's example's order; Tanks sit under Healers */
export const REPRESENTATION_COLUMNS = ['melee', 'ranged', 'healer', 'tank'] as const;
export type RepresentationColumn = (typeof REPRESENTATION_COLUMNS)[number];

export const columnOf = (sp: Spec): RepresentationColumn =>
  sp.role === 'dps'
    ? sp.subRole === 'melee'
      ? 'melee'
      : 'ranged'
    : (sp.role as RepresentationColumn);

export interface ShownSpec {
  entry: RepresentedSpec;
  sp: Spec;
}

/** The snapshot's specs known to the site, under a role filter, most played first */
export function shownSpecs(specs: readonly RepresentedSpec[], role: TierRole): ShownSpec[] {
  return specs
    .map((entry) => ({ entry, sp: resolveSpec(entry.spec, entry.class) }))
    .filter((x): x is ShownSpec => !!x.sp && specInRole(x.entry, role))
    .sort((a, b) => b.entry.count - a.entry.count);
}

/** Each column's specs and players: only the columns the role filter keeps */
export function representationColumns(shown: readonly ShownSpec[], role: TierRole) {
  return REPRESENTATION_COLUMNS.filter(
    (c) => role === 'all' || (role === 'dps' ? c === 'melee' || c === 'ranged' : role === c),
  ).map((column) => {
    const rows = shown.filter((s) => columnOf(s.sp) === column);
    return { column, rows, players: rows.reduce((n, r) => n + r.entry.count, 0) };
  });
}

/**
 * A chart's axis: a round top above the largest value and its gridlines, 4–6 steps of
 * 1, 2 or 5 × a power of ten (72 → 0, 20, 40, 60, 80).
 */
export function niceAxis(max: number): { top: number; ticks: number[] } {
  if (max <= 0) return { top: 1, ticks: [0, 1] };
  const rough = max / 5;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * power).find((s) => s >= rough)!;
  const top = Math.ceil(max / step) * step;
  return { top, ticks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
}
