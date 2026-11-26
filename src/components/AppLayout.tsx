import type { ReactNode } from 'react';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import { SideNav } from './nav/SideNav';
import { ScrollTopButton } from './ScrollTopButton';
import styles from './AppLayout.module.css';

/**
 * Every page's frame: the sticky header, then the left menu beside the page (`children`),
 * then the footer, and the back-to-top button.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <SideNav />
          </div>
        </aside>
        <div className={styles.content}>{children}</div>
      </div>
      <AppFooter />
      <ScrollTopButton />
    </>
  );
}
