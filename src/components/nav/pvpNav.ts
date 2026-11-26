import { linkOptions } from '@tanstack/react-router';
import type { SiteParams } from '@/lib/site';
import { PVP_BRACKETS } from '@/api/pvp';
import type { NavItem } from './navTypes';

/**
 * The PvP menu, top to bottom, as the user designed it:
 * Home, Character, Leaderboards (one page per bracket), Stats (Spec Representation, Hero
 * Talents, Cutoffs), FOTM, Tier List, Archives.
 */
export function pvpNav(site: SiteParams): NavItem[] {
  return [
    {
      id: 'home',
      label: 'nav.home',
      icon: 'nav/home',
      link: linkOptions({ to: '/$game/$locale/pvp', params: site }),
      exact: true,
    },
    {
      id: 'character',
      label: 'nav.character',
      icon: 'nav/character',
      link: linkOptions({ to: '/$game/$locale/pvp/character', params: site }),
    },
    {
      id: 'leaderboards',
      label: 'nav.leaderboards',
      icon: 'nav/leaderboards',
      children: PVP_BRACKETS.map((bracket) => ({
        id: `leaderboards-${bracket}`,
        label: `bracket.${bracket}` as const,
        icon: `pvp/brackets/svg/${bracket}`,
        link: linkOptions({
          to: '/$game/$locale/pvp/leaderboards/$bracket',
          params: { ...site, bracket },
        }),
      })),
    },
    {
      id: 'stats',
      label: 'nav.stats',
      icon: 'nav/stats',
      children: [
        {
          id: 'representation',
          label: 'nav.representation',
          icon: 'nav/spec-representation',
          link: linkOptions({ to: '/$game/$locale/pvp/stats/representation', params: site }),
        },
        {
          id: 'hero-talents',
          label: 'nav.heroTalents',
          icon: 'nav/talents',
          link: linkOptions({ to: '/$game/$locale/pvp/stats/hero-talents', params: site }),
        },
        {
          id: 'cutoffs',
          label: 'nav.cutoffs',
          icon: 'nav/cutoffs',
          link: linkOptions({ to: '/$game/$locale/pvp/stats/cutoffs', params: site }),
        },
      ],
    },
    {
      id: 'fotm',
      label: 'nav.fotm',
      icon: 'nav/flavour-of-the-month',
      link: linkOptions({ to: '/$game/$locale/pvp/fotm', params: site }),
    },
    {
      id: 'tier-list',
      label: 'nav.tierList',
      icon: 'nav/tier-list',
      link: linkOptions({ to: '/$game/$locale/pvp/tier-list', params: site }),
    },
    {
      id: 'archives',
      label: 'nav.archives',
      icon: 'nav/archives',
      link: linkOptions({ to: '/$game/$locale/pvp/archives', params: site }),
    },
  ];
}
