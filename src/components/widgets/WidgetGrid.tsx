import type { ReactNode } from 'react';
import styles from './WidgetGrid.module.css';

/**
 * A widget's width in the page's widget grid (the user's design, 2026-11-26):
 * - `small`: three side by side;
 * - `medium`: two side by side;
 * - `large`: the full width.
 * A widget's root carries `data-size`; WidgetGrid.module.css places it and steps it down on
 * narrower areas.
 */
export type WidgetSize = 'small' | 'medium' | 'large';

/** The grid widgets sit in; `dense` halves the gaps (the leaderboard pages, to show the board) */
export function WidgetGrid({ children, dense }: { children: ReactNode; dense?: boolean }) {
  return (
    <div className={styles.grid} data-dense={dense || undefined}>
      {children}
    </div>
  );
}
