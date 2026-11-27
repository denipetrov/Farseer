import type { SpecRepresentationHistory } from '@/api/pvp';
import { resolveHeroTree, type HeroTree } from '@/lib/wow/heroTalents';
import type { Translate } from '@/i18n/messages';
import type { GameName } from '@/i18n/useI18n';
import { classOfSpec, resolveSpec, type Spec } from '@/lib/wow/specs';
import { specInRole, type TierRole } from '@/lib/wow/tierRoles';
import { validateRepresentationSearch, type RepresentationSearch } from './representation';

/**
 * The FOTM page (the user, 2026-11-27): each spec's share of the players at or above a
 * rating, day by day over the last month, from `GET /pvp/spec-representation/history`.
 */

/** What the lines are: specs, or hero talent trees (the user's switch, 2026-11-27) */
export type FotmMode = 'specs' | 'hero';

/** The page's URL: the representation page's without the day (it shows them all), and the mode */
export type FotmSearch = Omit<RepresentationSearch, 'day'> & {
  /** Hero talent trees instead of specs (absent: specs) */
  view?: 'hero';
};

export const validateFotmSearch = (search: Record<string, unknown>): FotmSearch => {
  const { bracket, region, rating, role } = validateRepresentationSearch(search);
  return { bracket, region, rating, role, view: search.view === 'hero' ? 'hero' : undefined };
};

/** Every UTC day from `from` to `to`, both included */
export function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  const d = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`).getTime();
  while (d.getTime() <= end && out.length < 400) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export interface FotmPoint {
  /** Share of the day's players in the filter (0–1) */
  share: number;
  count: number;
}

/** What a line stands for: a spec, or a hero talent tree (shared by its class's specs) */
export type FotmItem = { kind: 'spec'; sp: Spec } | { kind: 'hero'; tree: HeroTree };

export interface FotmSeries {
  /** `<class>-<spec>`, or `hero-<id>` */
  key: string;
  item: FotmItem;
  /** Its class (the line's colour) */
  classSlug: string;
  /**
   * One per day of the window: null on a day without a snapshot (a gap in the line), 0
   * share on a day with one that does not list it (nobody played it)
   */
  points: (FotmPoint | null)[];
  /** The share on the newest day with a snapshot: the series' order */
  latest: number;
}

type Day = SpecRepresentationHistory['days'][number];

/**
 * The history as lines: the window's days, and a series per spec (or hero talent tree)
 * under a role filter, the most played on the newest day first.
 * - Specs: each spec's players. Hero trees: each tree's players summed over the specs in
 *   the filter that take it (Oracle: Discipline and Holy), from each spec's `heroTalents`.
 * - Shares are recomputed over the day's lines, so they add up to 100% in any filter.
 */
export function fotmSeries(
  history: SpecRepresentationHistory,
  role: TierRole,
  mode: FotmMode = 'specs',
): { dates: string[]; series: FotmSeries[] } {
  const dates = daysBetween(history.from, history.to);
  const items = new Map<string, FotmItem>();
  // Each day's counts per line, under the filter
  const counts = new Map<string, Map<string, number>>();
  for (const day of history.days) {
    const of = new Map<string, number>();
    for (const e of day.specs) {
      const sp = resolveSpec(e.spec, e.class);
      if (!sp || !specInRole(e, role)) continue;
      if (mode === 'specs') {
        const key = `${e.class}-${e.spec}`;
        items.set(key, { kind: 'spec', sp });
        of.set(key, (of.get(key) ?? 0) + e.count);
        continue;
      }
      for (const h of e.heroTalents) {
        const tree = resolveHeroTree(h.id) ?? resolveHeroTree(h.name);
        if (!tree) continue;
        const key = `hero-${tree.id}`;
        items.set(key, { kind: 'hero', tree });
        of.set(key, (of.get(key) ?? 0) + h.count);
      }
    }
    counts.set(day.date, of);
  }
  const total = (day: Day) =>
    [...(counts.get(day.date)?.values() ?? [])].reduce((n, c) => n + c, 0);
  const byDate = new Map(history.days.map((d) => [d.date, d]));
  const newest = [...history.days].reverse().find((d) => total(d) > 0)?.date;
  const at = newest ? dates.indexOf(newest) : -1;

  const series = [...items].map(([key, item]): FotmSeries => {
    const points = dates.map((date): FotmPoint | null => {
      const day = byDate.get(date);
      if (!day) return null;
      const count = counts.get(date)?.get(key) ?? 0;
      const of = total(day);
      return { count, share: of ? count / of : 0 };
    });
    const classSlug = item.kind === 'spec' ? item.sp.classSlug : item.tree.classSlug;
    return { key, item, classSlug, points, latest: points[at]?.share ?? 0 };
  });
  return { dates, series: series.sort((a, b) => b.latest - a.latest) };
}

/**
 * A line's name in the page's language: "Fire Mage" (the class says which Holy), or the
 * tree's name ("Oracle"); `short` drops the class (the legend, where the icon says it).
 */
export function fotmItemName(item: FotmItem, name: GameName, t: Translate, short = false): string {
  if (item.kind === 'hero') return name('heroTalents', item.tree.id, item.tree.name);
  const spec = name('specs', item.sp.id, item.sp.name);
  if (short) return spec;
  const cls = classOfSpec(item.sp);
  return t('spec.label', { spec, class: name('classes', cls.id, cls.name) });
}

/**
 * The end labels' places: each wants its line's last y, but no two may sit closer than
 * `gap`; pushed apart downwards, then back up from the floor (`max`), keeping their order.
 */
export function spreadLabels(wanted: readonly number[], gap: number, max: number): number[] {
  const order = wanted.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const placed = order.map((o) => o.y);
  for (let k = 1; k < placed.length; k++) placed[k] = Math.max(placed[k]!, placed[k - 1]! + gap);
  for (let k = placed.length - 1; k >= 0; k--) {
    const limit = k === placed.length - 1 ? max : placed[k + 1]! - gap;
    placed[k] = Math.min(placed[k]!, limit);
  }
  const out = new Array<number>(wanted.length);
  order.forEach((o, k) => (out[o.i] = placed[k]!));
  return out;
}
