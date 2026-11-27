import { useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import styles from './HoverCard.module.css';

const GAP = 8;

/**
 * A card shown over an element (`anchor`) while it is hovered or focused: above it, or
 * below when there is no room above, kept inside the window. It is drawn at the end of the
 * page (a portal), so a scrolling or clipping parent (the large leaderboard scrolls
 * sideways) can't cut it. Its place is set on two custom properties, `--card-x` and
 * `--card-y`: values only known once the card and the anchor are measured.
 */
export function HoverCard({
  anchor,
  id,
  children,
}: {
  anchor: RefObject<HTMLElement | null>;
  id: string;
  children: ReactNode;
}) {
  const card = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const a = anchor.current?.getBoundingClientRect();
    const el = card.current;
    if (!a || !el) return;
    const c = el.getBoundingClientRect();
    const x = Math.min(
      Math.max(a.left + a.width / 2 - c.width / 2, GAP),
      window.innerWidth - c.width - GAP,
    );
    const above = a.top - c.height - GAP;
    const y = above >= GAP ? above : a.bottom + GAP;
    el.style.setProperty('--card-x', `${Math.round(x)}px`);
    el.style.setProperty('--card-y', `${Math.round(y)}px`);
    el.dataset.placed = '';
  });

  return createPortal(
    <div ref={card} id={id} role="tooltip" className={styles.card}>
      {children}
    </div>,
    document.body,
  );
}
