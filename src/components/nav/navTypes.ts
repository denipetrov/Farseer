import type { LinkOptions } from '@tanstack/react-router';
import type { MessageKey } from '@/i18n/messages';
import type { ClassSlug } from '@/lib/wow/classes';
import type { SpecRole, SpecSubRole } from '@/lib/wow/roles';

/**
 * A menu icon.
 *
 * - A string is the path under `icons/` of a single-colour SVG (`nav/home`,
 *   `pvp/brackets/svg/2v2`), drawn in the text colour so it follows hover and active states.
 * - The objects are game art, drawn as it is: a class (in the visitor's icon style), a spec,
 *   a role, one of our own image files by its path under `icons/` (`game-modes/raid`), or an
 *   image from the data (a raid's icon on Raider.io; null when it has none, which shows the
 *   unknown icon).
 */
export type NavIcon =
  | string
  | { kind: 'class'; cls: ClassSlug }
  | { kind: 'spec'; specId: number }
  | { kind: 'role'; role: SpecRole; subRole: SpecSubRole | null }
  /** `round`: self-framed round art (`roles/all`), sized and drawn as the role and class icons */
  /** `wide`: a logo (`expansions/midnight`): a 64×30 slot instead of the square (WIDE_ART) */
  | { kind: 'art'; path: string; round?: boolean; wide?: boolean }
  | { kind: 'image'; src: string | null };

/** A menu label: static text by its message key, or text already resolved (a game name). */
export type NavLabel = MessageKey | { text: string };

export interface NavLink {
  id: string;
  label: NavLabel;
  icon?: NavIcon;
  link: LinkOptions;
  /** Active only on this exact page (Home), not on pages below it */
  exact?: boolean;
}

export interface NavGroup {
  id: string;
  label: NavLabel;
  icon?: NavIcon;
  children: NavItem[];
  /** Open on arrival even when none of its pages is the current one (the current expansion) */
  defaultOpen?: boolean;
  /**
   * The section's own page (a PvP bracket: the whole ladder). Its label then opens the page
   * and only its arrow opens or closes the section (the user, 2026-11-27); without one, the
   * whole row opens and closes it. Active on that exact page only: its rows mark the rest.
   */
  link?: LinkOptions;
}

/** A line of muted text in a section: loading, or why it is empty. */
export interface NavNote {
  id: string;
  note: NavLabel;
}

export type NavItem = NavLink | NavGroup | NavNote;

export const isNavGroup = (item: NavItem): item is NavGroup => 'children' in item;
export const isNavNote = (item: NavItem): item is NavNote => 'note' in item;

/** Every link in a list of items, at any depth: sections' own pages included. */
export function navLinks(items: readonly NavItem[]): NavLink[] {
  return items.flatMap((item): NavLink[] =>
    isNavGroup(item)
      ? [
          ...(item.link ? [{ id: item.id, label: item.label, link: item.link, exact: true }] : []),
          ...navLinks(item.children),
        ]
      : isNavNote(item)
        ? []
        : [item],
  );
}
