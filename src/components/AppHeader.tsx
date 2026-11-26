import { Link } from '@tanstack/react-router';
import { useLayoutEffect, useRef } from 'react';
import logoUrl from '@/assets/images/logo/rankwarden-logo.svg';
import { useI18n } from '@/i18n/useI18n';
import { useGameMode } from '@/preferences/useGameMode';
import { FactionToggle } from './FactionToggle';
import { AssetStyleToggle } from './header/AssetStyleToggle';
import { GameModeToggle } from './header/GameModeToggle';
import { LanguageSelect } from './header/LanguageSelect';
import { MobileMenu } from './header/MobileMenu';
import { SideNav } from './nav/SideNav';
import { SearchBar } from './header/SearchBar';
import styles from './AppHeader.module.css';
import { useSite } from '@/lib/site';

/**
 * Desktop: left, the logo (home of the current game mode), the language dropdown and the
 * PvP / PvE switch; centre, the search; right, the icon style and faction switches. Three
 * grid columns, the outer two equal, so the search stays centred whatever the sides hold.
 * Below 1100px the search moves to a row of its own.
 *
 * Mobile (820px and below): the menu button and the search only. Everything else is in the
 * menu's drawer, one below the other (`MobileMenu`), with the left menu once it exists.
 */
export function AppHeader() {
  const [mode] = useGameMode();
  const { t } = useI18n();
  const site = useSite();
  const ref = useRef<HTMLElement>(null);

  // Publish the header's height as --header-height: the sticky sidebar sits right below it
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty(
        '--header-height',
        `${Math.round(entry!.borderBoxSize[0]!.blockSize)}px`,
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={ref} className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.menu}>
          <MobileMenu>
            <SideNav />
          </MobileMenu>
        </div>

        <div className={styles.start}>
          {/* A plain Link keeps the router's types; the class styles the <a> it renders */}
          <Link
            className={styles.brand}
            to={`/$game/$locale/${mode}`}
            params={site}
            aria-label={t('app.home')}
          >
            <img src={logoUrl} alt="Rankwarden" />
          </Link>
          <LanguageSelect />
          <GameModeToggle />
        </div>

        <div className={styles.center}>
          <SearchBar />
        </div>

        <div className={styles.end}>
          <AssetStyleToggle />
          <span className={styles.divider} aria-hidden />
          <FactionToggle />
        </div>
      </div>
    </header>
  );
}
