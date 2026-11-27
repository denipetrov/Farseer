import { linkOptions } from '@tanstack/react-router';
import type { GameName } from '@/i18n/useI18n';
import type { SiteParams } from '@/lib/site';
import { ALL } from '@/lib/mplusParams';
import { PVP_BRACKETS, type PvpBracket } from '@/api/pvp';
import { CLASSES_AZ, specsAz } from './gameOrder';
import type { NavGroup, NavItem } from './navTypes';

/**
 * The PvP menu, top to bottom, as the user designed it:
 * Home, Character, Leaderboards (one page per bracket; inside each, every class A–Z, each a
 * page with its specs inside), Stats (Spec Representation, Hero Talents, Cutoffs), FOTM, Tier List,
 * Archives. `name` gives class and spec names in the page's language.
 */
export function pvpNav(site: SiteParams, name: GameName): NavItem[] {
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
      children: PVP_BRACKETS.map((bracket) => bracketGroup(site, name, bracket)),
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

/**
 * A bracket: its label opens the whole ladder; its arrow opens every class (A–Z). A class,
 * the same way, opens its whole ladder (`…/<class>/all`) and its arrow its specs (A–Z):
 * `/pvp/leaderboards/<bracket>/<class>/<spec>` (the user, 2026-11-27; like the PvE Specs).
 */
function bracketGroup(site: SiteParams, name: GameName, bracket: PvpBracket): NavGroup {
  const specLink = (cls: string, spec: string) =>
    linkOptions({
      to: '/$game/$locale/pvp/leaderboards/$bracket/$class/$spec',
      params: { ...site, bracket, class: cls, spec },
    });
  return {
    id: `leaderboards-${bracket}`,
    label: `bracket.${bracket}`,
    icon: `pvp/brackets/svg/${bracket}`,
    link: linkOptions({
      to: '/$game/$locale/pvp/leaderboards/$bracket',
      params: { ...site, bracket },
    }),
    // A class opens its whole ladder (`…/<class>/all`); its arrow, its specs
    children: CLASSES_AZ.map((c) => ({
      id: `leaderboards-${bracket}-${c.slug}`,
      label: { text: name('classes', c.id, c.name) },
      icon: { kind: 'class', cls: c.slug },
      link: specLink(c.slug, ALL),
      children: specsAz(c.slug).map((sp) => ({
        id: `leaderboards-${bracket}-${c.slug}-${sp.slug}`,
        label: { text: name('specs', sp.id, sp.name) },
        icon: { kind: 'spec', specId: sp.id },
        link: specLink(c.slug, sp.slug),
      })),
    })),
  };
}
