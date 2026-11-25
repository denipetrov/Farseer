import { Link, useMatchRoute } from '@tanstack/react-router';
import { useId, useState } from 'react';
import styled from 'styled-components';
import { NavGlyph } from '@/components/NavGlyph';
import { useI18n } from '@/i18n/useI18n';
import { useGameMode } from '@/preferences/useGameMode';
import {
  hasSideNav,
  isNavGroup,
  pvpNav,
  type NavGroup,
  type NavIcon,
  type NavLink,
} from './pvpNav';

/**
 * The left menu of the current game mode: a sidebar on desktop (`AppLayout`), and the
 * bottom of the mobile menu's drawer. Only PvP has one so far; PvE renders nothing.
 */
export function SideNav() {
  const { locale, t } = useI18n();
  const [mode] = useGameMode();
  if (!hasSideNav(mode)) return null;

  const items = pvpNav(locale.slug);
  return (
    <Nav aria-label={t('nav.aria')}>
      <List>
        {items.map((item) =>
          isNavGroup(item) ? (
            <Group key={item.id} group={item} />
          ) : (
            <li key={item.id}>
              <Item item={item} />
            </li>
          ),
        )}
      </List>
    </Nav>
  );
}

function Item({ item, nested = false }: { item: NavLink; nested?: boolean }) {
  const { t } = useI18n();
  return (
    // A plain Link keeps the router's types; RowFrame styles the <a> it renders
    <RowFrame data-nested={nested || undefined}>
      <Link {...item.link} activeOptions={{ exact: item.exact ?? false }}>
        <Icon icon={item.icon} />
        <span>{t(item.label)}</span>
      </Link>
    </RowFrame>
  );
}

/** An expandable section (Leaderboards, Stats). Opens by itself on one of its pages. */
function Group({ group }: { group: NavGroup }) {
  const { t } = useI18n();
  const matchRoute = useMatchRoute();
  const listId = useId();
  const childActive = group.children.some((c) => !!matchRoute({ ...c.link, fuzzy: true }));
  const [open, setOpen] = useState(childActive);

  // Arriving on one of its pages another way (search, a link) opens the section too
  const [wasActive, setWasActive] = useState(childActive);
  if (childActive !== wasActive) {
    setWasActive(childActive);
    if (childActive) setOpen(true);
  }

  return (
    <li>
      <GroupButton
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        data-has-active={childActive || undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon icon={group.icon} />
        <span>{t(group.label)}</span>
        <Chevron aria-hidden data-open={open || undefined} />
      </GroupButton>
      <SubList id={listId} hidden={!open}>
        {group.children.map((child) => (
          <li key={child.id}>
            <Item item={child} nested />
          </li>
        ))}
      </SubList>
    </li>
  );
}

function Icon({ icon }: { icon: NavIcon }) {
  return <NavGlyph icon={icon} size={ICON_SIZE} />;
}

/**
 * Menu sizes (the user chose the larger set, 2026-11-26): 17px text (15.5px for sub-items),
 * 26px icons, 46px rows (42px for sub-items), in a 17.5rem sidebar (`__root.tsx`).
 */
const ICON_SIZE = 26;
const ROW_GAP = 14;

const Nav = styled.nav`
  padding: var(--space-3) var(--space-2);
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const SubList = styled(List)`
  margin: 2px 0 var(--space-1);

  /* display: flex above would otherwise override the hidden attribute */
  &[hidden] {
    display: none;
  }
`;

const rowStyles = `
  display: flex;
  align-items: center;
  gap: ${ROW_GAP}px;
  width: 100%;
  min-height: 46px;
  padding: var(--space-2) var(--space-3);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  font: inherit;
  font-size: 1.0625rem; /* 17px */
  font-weight: 500;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);

  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-highlight);
  }
`;

const RowFrame = styled.div`
  > a {
    ${rowStyles}
  }

  &[data-nested] > a {
    min-height: 42px;
    /* Sub-items line their icons up under the section's label */
    padding-left: calc(var(--space-3) + ${ICON_SIZE}px + ${ROW_GAP}px);
    font-size: 0.96875rem; /* 15.5px */
  }

  /* The current page: accent bar, bright text, icon in the accent */
  > a[data-status='active'] {
    background: var(--color-surface-hover);
    box-shadow: inset 3px 0 0 var(--color-accent);
    color: var(--color-text-highlight);

    > span[aria-hidden] {
      color: var(--color-accent-strong);
    }
  }
`;

const GroupButton = styled.button`
  ${rowStyles}

  > span:nth-of-type(2) {
    flex: 1;
  }

  /* A page inside is open: the section reads as part of the path */
  &[data-has-active] {
    color: var(--color-text-highlight);
  }
`;

/** A small chevron drawn with borders: right when closed, down when open */
const Chevron = styled.span`
  width: 7px;
  height: 7px;
  margin-right: var(--space-1);
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  opacity: 0.7;
  transform: rotate(-45deg);
  transition: transform var(--transition-fast);

  &[data-open] {
    transform: rotate(45deg);
  }
`;
