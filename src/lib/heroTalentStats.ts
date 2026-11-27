import {
  HERO_TALENT_TOPS,
  PVP_BOARDS,
  isLadderRole,
  isPvpBracket,
  type HeroTalentTop,
  type HeroTalentsSpec,
  type LadderRole,
  type PvpBoard,
  type PvpBracket,
  type PvpHeroTalents,
} from '@/api/pvp';
import { resolveClass, type WowClass } from '@/lib/wow/classes';
import { SPEC_HERO_TREES, resolveHeroTree, type HeroTree } from '@/lib/wow/heroTalents';
import { resolveSpec, type Spec } from '@/lib/wow/specs';
import { specInRole } from '@/lib/wow/tierRoles';

/**
 * The PvP hero talents page (the user, 2026-11-27): which trees each spec's top players
 * take, from `GET /pvp/hero-talents`, a card per class.
 */

/** The page's URL: all optional, invalid values dropped */
export interface HeroTalentStatsSearch {
  bracket?: PvpBracket;
  region?: PvpBoard;
  top?: HeroTalentTop;
  /** The filter: a class (with `spec`, one spec), or a role */
  class?: string;
  spec?: string;
  role?: LadderRole;
}

export const validateHeroTalentStatsSearch = (
  search: Record<string, unknown>,
): HeroTalentStatsSearch => {
  const cls =
    typeof search.class === 'string' && resolveClass(search.class) ? search.class : undefined;
  return {
    bracket: isPvpBracket(search.bracket) ? search.bracket : undefined,
    region: PVP_BOARDS.includes(search.region as PvpBoard)
      ? (search.region as PvpBoard)
      : undefined,
    top: (HERO_TALENT_TOPS as readonly number[]).includes(Number(search.top))
      ? (Number(search.top) as HeroTalentTop)
      : undefined,
    class: cls,
    spec:
      cls && typeof search.spec === 'string' && resolveSpec(search.spec, cls)
        ? search.spec
        : undefined,
    role: !cls && isLadderRole(search.role) ? search.role : undefined,
  };
};

export interface TreeRow {
  tree: HeroTree;
  count: number;
  /** Of the spec's players with a known tree (0–1) */
  share: number;
}

export interface SpecCard {
  sp: Spec;
  entry: HeroTalentsSpec;
  /** The spec's two trees (a tree nobody took at 0), most taken first */
  trees: TreeRow[];
}

export interface ClassCard {
  cls: WowClass;
  specs: SpecCard[];
  /** Players with a known tree over the class's shown specs */
  covered: number;
}

/**
 * The answer as class cards, in its order (the game's), under the page's filter: a class
 * (and spec), or a role. Each spec lists its two trees (`SPEC_HERO_TREES`) with any other
 * tree of its class the data has; a tree of another class is a data error and is left
 * out. Specs nobody plays (no players read) are left out, and classes left with none.
 */
export function heroTalentCards(
  data: PvpHeroTalents,
  filter: { cls?: string; spec?: string; role?: LadderRole },
): ClassCard[] {
  return data.classes.flatMap((c): ClassCard[] => {
    const cls = resolveClass(c.classId ?? c.class);
    if (!cls || (filter.cls && cls.slug !== filter.cls)) return [];
    const specs = c.specs.flatMap((entry): SpecCard[] => {
      const sp = resolveSpec(entry.specId ?? entry.spec, cls.slug);
      if (!sp || !entry.characters) return [];
      if (filter.spec && sp.slug !== filter.spec) return [];
      if (filter.role && !specInRole({ class: cls.slug, spec: sp.slug }, filter.role)) return [];
      const counts = new Map<number, number>();
      for (const id of SPEC_HERO_TREES[`${cls.slug}/${sp.slug}`] ?? []) counts.set(id, 0);
      for (const h of entry.heroTalents) {
        const tree = resolveHeroTree(h.id) ?? resolveHeroTree(h.name);
        if (tree && tree.classSlug === cls.slug)
          counts.set(tree.id, (counts.get(tree.id) ?? 0) + h.count);
      }
      const known = [...counts.values()].reduce((n, x) => n + x, 0);
      const trees = [...counts]
        .map(([id, count]) => ({
          tree: resolveHeroTree(id)!,
          count,
          share: known ? count / known : 0,
        }))
        .sort((a, b) => b.count - a.count || a.tree.id - b.tree.id);
      return [{ sp, entry, trees }];
    });
    return specs.length
      ? [{ cls, specs, covered: specs.reduce((n, s) => n + s.entry.covered, 0) }]
      : [];
  });
}
