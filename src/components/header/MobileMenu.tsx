import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import logoUrl from '@/assets/images/logo/rankwarden-logo.svg';
import { useI18n } from '@/i18n/useI18n';
import { useGameMode } from '@/preferences/useGameMode';
import { FactionToggle } from '../FactionToggle';
import { AssetStyleToggle } from './AssetStyleToggle';
import { GameModeToggle } from './GameModeToggle';
import { LanguageSelect } from './LanguageSelect';
import styles from './MobileMenu.module.css';
import { useSite } from '@/lib/site';

interface MobileMenuProps {
  /**
   * The left menu (site navigation), shown in the drawer below the settings. Not built yet:
   * pass it here when it is, and it appears on mobile with no other change.
   */
  children?: ReactNode;
}

/**
 * The mobile header's menu: a button (three bars) that opens a drawer from the left with
 * everything the desktop header shows beside the search, one below the other: the logo
 * (home), language, PvP / PvE, icon style and faction. Then the left menu (`children`).
 *
 * A modal dialog: focus moves into it and stays there (Tab wraps), Escape, the backdrop,
 * the close button or any navigation closes it, focus returns to the menu button, and the
 * page behind does not scroll while it is open.
 */
export function MobileMenu({ children }: MobileMenuProps) {
  const { t } = useI18n();
  const site = useSite();
  const [mode] = useGameMode();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  // Any navigation (mode switch, language, home, a menu link) closes the drawer
  const [openedAt, setOpenedAt] = useState(pathname);
  if (open && pathname !== openedAt) {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    // The page behind doesn't scroll (global.css: body.scroll-locked)
    document.body.classList.add('scroll-locked');
    return () => document.body.classList.remove('scroll-locked');
  }, [open]);

  // Escape and the Tab trap listen on the document, so they work wherever focus is
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      // A control inside (the language list) may handle Escape itself
      if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      // What Tab can reach: radios that aren't the chosen one have tabindex -1
      const focusable = [
        ...panelRef.current.querySelectorAll<HTMLElement>('a[href], button, input'),
      ].filter((el) => el.tabIndex >= 0 && !el.hasAttribute('disabled'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const inside = panelRef.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        className={styles.menuButton}
        type="button"
        aria-label={t('menu.open')}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={t('menu.title')}
        onClick={() => {
          setOpenedAt(pathname);
          setOpen(true);
        }}
      >
        <span className={styles.bars} aria-hidden />
      </button>

      {open &&
        createPortal(
          <div className={styles.overlay}>
            <div className={styles.backdrop} aria-hidden onClick={close} />
            <div
              ref={panelRef}
              className={styles.panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <div className={styles.top}>
                {/* A plain Link keeps the router's types; the class styles the <a> it renders */}
                <Link
                  className={styles.brand}
                  to={`/$game/$locale/${mode}`}
                  params={site}
                  aria-label={t('app.home')}
                >
                  <img src={logoUrl} alt="Rankwarden" />
                </Link>
                <button
                  className={styles.menuButton}
                  type="button"
                  aria-label={t('menu.close')}
                  title={t('menu.close')}
                  onClick={close}
                  data-autofocus
                >
                  <span className={styles.cross} aria-hidden />
                </button>
              </div>
              {/* For screen readers: the dialog's name */}
              <h2 className="sr-only" id={titleId}>
                {t('menu.title')}
              </h2>

              <section className={styles.section}>
                <h3 className={styles.label}>{t('header.language')}</h3>
                <LanguageSelect />
              </section>
              <section className={styles.section}>
                <h3 className={styles.label}>{t('header.gameMode')}</h3>
                <GameModeToggle />
              </section>
              <section className={styles.section}>
                <h3 className={styles.label}>{t('header.iconStyle')}</h3>
                <AssetStyleToggle />
              </section>
              <section className={styles.section}>
                <h3 className={styles.label}>{t('header.faction')}</h3>
                <FactionToggle />
              </section>

              {children && <div className={styles.navSlot}>{children}</div>}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
