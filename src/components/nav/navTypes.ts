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
 *   a role, or an image from the data (a raid's icon on Raider.io; null when it has none,
 *   which shows the unknown icon).
 */
export type NavIcon =
  | string
  | { kind: 'class'; cls: ClassSlug }
  | { kind: 'spec'; specId: number }
  | { kind: 'role'; role: SpecRole; subRole: SpecSubRole | null }
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
}

/** A line of muted text in a section: loading, or why it is empty. */
export interface NavNote {
  id: string;
  note: NavLabel;
}

export type NavItem = NavLink | NavGroup | NavNote;

export const isNavGroup = (item: NavItem): item is NavGroup => 'children' in item;
export const isNavNote = (item: NavItem): item is NavNote => 'note' in item;

/** Every link in a list of items, at any depth. */
export function navLinks(items: readonly NavItem[]): NavLink[] {
  return items.flatMap((item) =>
    isNavGroup(item) ? navLinks(item.children) : isNavNote(item) ? [] : [item],
  );
}
