import { linkOptions, type LinkOptions } from '@tanstack/react-router';
import { PVP_BRACKETS } from '@/api/pvp';
import type { LocaleSlug } from '@/i18n/locales';
import type { MessageKey } from '@/i18n/messages';

/**
 * A menu icon: the path under `icons/` of a single-colour SVG (`nav/home`,
 * `pvp/brackets/svg/2v2`), drawn in the text colour so it follows hover and active states.
 */
export type NavIcon = string;

export interface NavLink {
  id: string;
  label: MessageKey;
  icon: NavIcon;
  link: LinkOptions;
  /** Active only on this exact page (Home), not on pages below it */
  exact?: boolean;
}

export interface NavGroup {
  id: string;
  label: MessageKey;
  icon: NavIcon;
  children: NavLink[];
}

export type NavItem = NavLink | NavGroup;

export const isNavGroup = (item: NavItem): item is NavGroup => 'children' in item;

/** Whether a game mode has a left menu yet (PvE's comes later). */
export const hasSideNav = (mode: string) => mode === 'pvp';

/**
 * The PvP menu, top to bottom, as the user designed it:
 * Home, Character, Leaderboards (one page per bracket), Stats (Spec Representation, Hero
 * Talents, Cutoffs), FOTM, Tier List, Archives.
 */
export function pvpNav(locale: LocaleSlug): NavItem[] {
  return [
    {
      id: 'home',
      label: 'nav.home',
      icon: 'nav/home',
      link: linkOptions({ to: '/$locale/pvp', params: { locale } }),
      exact: true,
    },
    {
      id: 'character',
      label: 'nav.character',
      icon: 'nav/character',
      link: linkOptions({ to: '/$locale/pvp/character', params: { locale } }),
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
          to: '/$locale/pvp/leaderboards/$bracket',
          params: { locale, bracket },
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
          link: linkOptions({ to: '/$locale/pvp/stats/representation', params: { locale } }),
        },
        {
          id: 'hero-talents',
          label: 'nav.heroTalents',
          icon: 'nav/talents',
          link: linkOptions({ to: '/$locale/pvp/stats/hero-talents', params: { locale } }),
        },
        {
          id: 'cutoffs',
          label: 'nav.cutoffs',
          icon: 'nav/cutoffs',
          link: linkOptions({ to: '/$locale/pvp/stats/cutoffs', params: { locale } }),
        },
      ],
    },
    {
      id: 'fotm',
      label: 'nav.fotm',
      icon: 'nav/flavour-of-the-month',
      link: linkOptions({ to: '/$locale/pvp/fotm', params: { locale } }),
    },
    {
      id: 'tier-list',
      label: 'nav.tierList',
      icon: 'nav/tier-list',
      link: linkOptions({ to: '/$locale/pvp/tier-list', params: { locale } }),
    },
    {
      id: 'archives',
      label: 'nav.archives',
      icon: 'nav/archives',
      link: linkOptions({ to: '/$locale/pvp/archives', params: { locale } }),
    },
  ];
}
