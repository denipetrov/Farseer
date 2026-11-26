import { Link, useMatchRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { raidsQuery } from '@/api/pve';
import { ClassIcon } from '@/components/ClassIcon';
import { GameIcon } from '@/components/GameIcon';
import { NavGlyph } from '@/components/NavGlyph';
import { RoleIcon } from '@/components/RoleIcon';
import { SpecIcon } from '@/components/SpecIcon';
import { UnknownIcon } from '@/components/UnknownIcon';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { cx } from '@/lib/cx';
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
import styles from './SideNav.module.css';

/**
 * The left menu of the current game mode: a sidebar on desktop (`AppLayout`), and the
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
    <nav className={styles.nav} aria-label={i18n.t('nav.aria')}>
      <Items items={items} depth={0} />
    </nav>
  );
}

const isWide = (icon: NavIcon | undefined) =>
  typeof icon === 'object' && icon.kind === 'art' && !!icon.wide;

function Items({ items, depth, id }: { items: NavItem[]; depth: number; id?: string }) {
  // A list with logos (Raids: the expansions) gives every row the logos' slot, so icons
  // centre under them and labels line up (Guild beside the expansions)
  const wide = items.some((item) => !isNavNote(item) && isWide(item.icon));
  return (
    <ul className={cx(styles.list, depth > 0 && styles.subList)} id={id}>
      {items.map((item) => (
        <li key={item.id}>
          {isNavGroup(item) ? (
            <Group group={item} depth={depth} wide={wide} />
          ) : isNavNote(item) ? (
            <p className={styles.note} data-depth={depthAttr(depth)}>
              <Label label={item.note} />
            </p>
          ) : (
            <Item item={item} depth={depth} wide={wide} />
          )}
        </li>
      ))}
    </ul>
  );
}

function Label({ label }: { label: NavLabel }) {
  const { t } = useI18n();
  return <>{typeof label === 'string' ? t(label) : label.text}</>;
}

function Item({ item, depth, wide }: { item: NavLink; depth: number; wide?: boolean }) {
  return (
    // A plain Link keeps the router's types; the frame's class styles the <a> it renders
    <div className={styles.rowFrame} data-depth={depthAttr(depth)}>
      <Link {...item.link} activeOptions={{ exact: item.exact ?? false }}>
        {item.icon && <Icon icon={item.icon} depth={depth} wide={wide} />}
        <span>
          <Label label={item.label} />
        </span>
      </Link>
    </div>
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
      <button
        className={styles.groupButton}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        data-depth={depthAttr(depth)}
        data-has-active={childActive || undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {group.icon && <Icon icon={group.icon} depth={depth} wide={wide} />}
        <span className={styles.label}>
          <Label label={group.label} />
        </span>
        <span className={styles.chevron} aria-hidden data-open={open || undefined} />
      </button>
      {open ? (
        <Items items={group.children} depth={depth + 1} id={listId} />
      ) : (
        <ul className={cx(styles.list, styles.subList)} id={listId} hidden />
      )}
    </>
  );
}

/** `wide`: a sibling has a logo, so this icon is centred in the logos' slot */
function Icon({ icon, depth, wide }: { icon: NavIcon; depth: number; wide?: boolean }) {
  if (wide && !isWide(icon)) {
    return (
      <span className={styles.wideSlot} aria-hidden>
        <Icon icon={icon} depth={depth} />
      </span>
    );
  }
  if (typeof icon === 'string') {
    return <NavGlyph icon={icon} size={depth >= 2 ? 'sm' : 'md'} />;
  }
  // Game art, drawn as it is; hidden from screen readers, as the label follows
  if (icon.kind === 'art' && icon.wide) {
    const src = iconUrl(icon.path);
    return src ? <img className={styles.wideArt} aria-hidden src={src} alt="" /> : null;
  }
  return (
    <span className={cx(styles.artSlot, depth >= 2 && styles.deep)} aria-hidden>
      {icon.kind === 'class' && <ClassIcon cls={icon.cls} />}
      {icon.kind === 'spec' && <SpecIcon spec={icon.specId} />}
      {icon.kind === 'role' && <RoleIcon role={icon.role} subRole={icon.subRole} />}
      {icon.kind === 'image' && <RemoteArt src={icon.src} />}
      {icon.kind === 'art' && <OwnArt path={icon.path} round={icon.round} />}
    </span>
  );
}

/**
 * One of our own image files (`game-modes/raid`), at the slot's size, untouched. Tall,
 * thin art is drawn larger, as the glyphs are (`iconOptics.css`); the layout box stays.
 */
function OwnArt({ path, round }: { path: string; round?: boolean }) {
  const src = iconUrl(path);
  if (!src) return <UnknownIcon label="" />;
  if (round) return <GameIcon src={src} label="" shape="round" />;
  return <img className={styles.artImage} data-optical={path} src={src} alt="" />;
}

/** Art from the data (a raid's icon on Raider.io): the unknown icon when absent or broken. */
function RemoteArt({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <UnknownIcon label="" />;
  return <GameIcon src={src} label="" onError={() => setFailed(true)} />;
}

/** Depth as the rows' `data-depth` (SideNav.module.css styles 0–6; deeper rows share 6) */
const depthAttr = (depth: number) => Math.min(depth, 6);
