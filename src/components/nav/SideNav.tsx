import { Link, useMatchRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useId, useState, type CSSProperties } from 'react';
import styled from 'styled-components';
import { raidsQuery } from '@/api/pve';
import { ClassIcon } from '@/components/ClassIcon';
import { GameIcon } from '@/components/GameIcon';
import { NavGlyph } from '@/components/NavGlyph';
import { RoleIcon } from '@/components/RoleIcon';
import { SpecIcon } from '@/components/SpecIcon';
import { UnknownIcon } from '@/components/UnknownIcon';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { opticalScale } from '@/lib/iconOptics';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { useGameMode } from '@/preferences/useGameMode';
import {
  isNavGroup,
  isNavNote,
  navLinks,
  type NavGroup,
  type NavIcon,
  type NavItem,
  type NavLabel,
  type NavLink,
} from './navTypes';
import { pveNav } from './pveNav';
import { pvpNav } from './pvpNav';

/**
 * The left menu of the current game mode: a sidebar on desktop (`__root.tsx`), and the
 * bottom of the mobile menu's drawer. Sections nest (PvE's Raids → expansion → raid →
 * Boss Rankings → boss); each level is indented a little further.
 */
export function SideNav() {
  const i18n = useI18n();
  const [mode] = useGameMode();
  const { preferences } = usePreferences();
  // The catalogue is fetched by the root layout on the PvE side; this reads the same cache
  const raids = useQuery({ ...raidsQuery(), enabled: mode === 'pve' });

  const items =
    mode === 'pve'
      ? pveNav({
          locale: i18n.locale.slug,
          faction: preferences.faction,
          name: i18n.name,
          names: i18n.names,
          raids: { status: raids.status, data: raids.data?.raids },
        })
      : pvpNav(i18n.locale.slug);

  return (
    <Nav aria-label={i18n.t('nav.aria')}>
      <Items items={items} depth={0} />
    </Nav>
  );
}

const isWide = (icon: NavIcon | undefined) =>
  typeof icon === 'object' && icon.kind === 'art' && !!icon.wide;

function Items({ items, depth, id }: { items: NavItem[]; depth: number; id?: string }) {
  const ListAt = depth === 0 ? List : SubList;
  // A list with logos (Raids: the expansions) gives every row the logos' slot, so icons
  // centre under them and labels line up (Guild beside the expansions)
  const wide = items.some((item) => !isNavNote(item) && isWide(item.icon));
  return (
    <ListAt id={id}>
      {items.map((item) => (
        <li key={item.id}>
          {isNavGroup(item) ? (
            <Group group={item} depth={depth} wide={wide} />
          ) : isNavNote(item) ? (
            <Note style={indent(depth)}>
              <Label label={item.note} />
            </Note>
          ) : (
            <Item item={item} depth={depth} wide={wide} />
          )}
        </li>
      ))}
    </ListAt>
  );
}

function Label({ label }: { label: NavLabel }) {
  const { t } = useI18n();
  return <>{typeof label === 'string' ? t(label) : label.text}</>;
}

function Item({ item, depth, wide }: { item: NavLink; depth: number; wide?: boolean }) {
  return (
    // A plain Link keeps the router's types; RowFrame styles the <a> it renders
    <RowFrame data-depth={Math.min(depth, 2)} style={indent(depth)}>
      <Link {...item.link} activeOptions={{ exact: item.exact ?? false }}>
        {item.icon && <Icon icon={item.icon} depth={depth} wide={wide} />}
        <span>
          <Label label={item.label} />
        </span>
      </Link>
    </RowFrame>
  );
}

/**
 * An expandable section (Leaderboards, Stats, Raids, a class, a raid). Opens by itself on
 * one of its pages, and on arrival when it is `defaultOpen` (the current expansion). Its
 * rows are only rendered while it is open: PvE's sections hold hundreds of links.
 */
function Group({ group, depth, wide }: { group: NavGroup; depth: number; wide?: boolean }) {
  const matchRoute = useMatchRoute();
  const listId = useId();
  const childActive = navLinks(group.children).some(
    (c) => !!matchRoute({ ...c.link, fuzzy: true }),
  );
  const [open, setOpen] = useState(childActive || !!group.defaultOpen);

  // Arriving on one of its pages another way (search, a link) opens the section too
  const [wasActive, setWasActive] = useState(childActive);
  if (childActive !== wasActive) {
    setWasActive(childActive);
    if (childActive) setOpen(true);
  }

  return (
    <>
      <GroupButton
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        data-depth={Math.min(depth, 2)}
        data-has-active={childActive || undefined}
        style={indent(depth)}
        onClick={() => setOpen((o) => !o)}
      >
        {group.icon && <Icon icon={group.icon} depth={depth} wide={wide} />}
        <span>
          <Label label={group.label} />
        </span>
        <Chevron aria-hidden data-open={open || undefined} />
      </GroupButton>
      {open ? (
        <Items items={group.children} depth={depth + 1} id={listId} />
      ) : (
        <SubList id={listId} hidden />
      )}
    </>
  );
}

/** `wide`: a sibling has a logo, so this icon is centred in the logos' slot */
function Icon({ icon, depth, wide }: { icon: NavIcon; depth: number; wide?: boolean }) {
  if (wide && !isWide(icon)) {
    return (
      <WideSlot aria-hidden>
        <Icon icon={icon} depth={depth} />
      </WideSlot>
    );
  }
  if (typeof icon === 'string') {
    return <NavGlyph icon={icon} size={depth >= 2 ? DEEP_ICON_SIZE : ICON_SIZE} />;
  }
  // Game art, drawn as it is; hidden from screen readers, as the label follows
  if (icon.kind === 'art' && icon.wide) {
    const src = iconUrl(icon.path);
    return src ? <WideArt aria-hidden src={src} alt="" /> : null;
  }
  return (
    <ArtSlot aria-hidden style={{ width: depth >= 2 ? DEEP_ICON_SIZE : ICON_SIZE }}>
      {icon.kind === 'class' && <ClassIcon cls={icon.cls} />}
      {icon.kind === 'spec' && <SpecIcon spec={icon.specId} />}
      {icon.kind === 'role' && <RoleIcon role={icon.role} subRole={icon.subRole} />}
      {icon.kind === 'image' && <RemoteArt src={icon.src} />}
      {icon.kind === 'art' && <OwnArt path={icon.path} round={icon.round} />}
    </ArtSlot>
  );
}

/**
 * One of our own image files (`game-modes/raid`), at the slot's size, untouched. Tall,
 * thin art is drawn larger, as the glyphs are (`iconOptics.ts`); the layout box stays.
 */
function OwnArt({ path, round }: { path: string; round?: boolean }) {
  const src = iconUrl(path);
  if (!src) return <UnknownIcon label="" />;
  if (round) return <GameIcon src={src} label="" shape="round" />;
  const scale = opticalScale(path);
  return (
    <ArtImage src={src} alt="" style={scale !== 1 ? { transform: `scale(${scale})` } : undefined} />
  );
}

/** Art from the data (a raid's icon on Raider.io): the unknown icon when absent or broken. */
function RemoteArt({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <UnknownIcon label="" />;
  return <GameIcon src={src} label="" onError={() => setFailed(true)} />;
}

/**
 * Menu sizes (the user chose the larger set, 2026-11-26): 17px text (15.5px for sub-items),
 * 26px icons, 46px rows (42px for sub-items), in a 17.5rem sidebar (`__root.tsx`).
 * Deeper levels (PvE) keep the sub-item text, with 22px icons and 38px rows.
 */
const ICON_SIZE = 26;
const DEEP_ICON_SIZE = 22;
const ROW_GAP = 14;

/**
 * Left padding by depth. Level 1 lines its icons up under the section's label, as before;
 * each level below steps in by INDENT_STEP only, so five levels still fit 17.5rem.
 */
const INDENT_BASE = 12; // --space-3
const INDENT_STEP = 14;
const indentOf = (depth: number) =>
  depth === 0 ? INDENT_BASE : INDENT_BASE + ICON_SIZE + ROW_GAP + (depth - 1) * INDENT_STEP;
const indent = (depth: number): CSSProperties =>
  ({ '--nav-indent': `${indentOf(depth)}px` }) as CSSProperties;

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
  padding: var(--space-2) var(--space-3) var(--space-2) var(--nav-indent, ${INDENT_BASE}px);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  font: inherit;
  font-size: 1.0625rem; /* 17px */
  font-weight: 500;
  line-height: 1.3;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);

  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-highlight);
  }
`;

/** Section buttons below the top: smaller text and rows, as RowFrame's links below */
const depthStyles = `
  &[data-depth='1'] {
    min-height: 42px;
    font-size: 0.96875rem; /* 15.5px */
  }

  &[data-depth='2'] {
    min-height: 38px;
    gap: 10px;
    font-size: 0.96875rem;
  }
`;

const RowFrame = styled.div`
  > a {
    ${rowStyles}
  }

  &[data-depth='1'] > a {
    min-height: 42px;
    font-size: 0.96875rem; /* 15.5px */
  }

  &[data-depth='2'] > a {
    min-height: 38px;
    gap: 10px;
    font-size: 0.96875rem;
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
  ${depthStyles}

  > span:nth-last-of-type(2) {
    flex: 1;
  }

  /* A page inside is open: the section reads as part of the path */
  &[data-has-active] {
    color: var(--color-text-highlight);
  }
`;

/** Holds game art at the glyphs' width, so labels line up whatever the icon */
const ArtSlot = styled.span`
  display: inline-flex;
  flex: none;
  justify-content: center;
`;

/**
 * A logo (the expansions, the user's pick of 2026-11-26): 64×30 beside the label. The files
 * are 128px squares with the logo across the middle, so the square is scaled to the width
 * and its empty top and bottom are trimmed (object-fit: cover); the logo is untouched.
 */
const WIDE_ART = { width: 64, height: 30 };

const WideArt = styled.img`
  display: block;
  flex: none;
  width: ${WIDE_ART.width}px;
  height: ${WIDE_ART.height}px;
  object-fit: cover;
`;

/** The logos' slot, for a plain icon in a list that has logos */
const WideSlot = styled.span`
  display: inline-flex;
  flex: none;
  justify-content: center;
  align-items: center;
  width: ${WIDE_ART.width}px;
`;

const ArtImage = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
`;

const Note = styled.p`
  margin: 0;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--nav-indent);
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  font-style: italic;
`;

/** A small chevron drawn with borders: right when closed, down when open */
const Chevron = styled.span`
  flex: none;
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
