import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import logoUrl from '@/assets/images/logo/rankwarden-logo.svg';
import { useI18n } from '@/i18n/useI18n';
import { useGameMode } from '@/preferences/useGameMode';
import { FactionToggle } from '../FactionToggle';
import { AssetStyleToggle } from './AssetStyleToggle';
import { GameModeToggle } from './GameModeToggle';
import { LanguageSelect } from './LanguageSelect';

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
  const { t, locale } = useI18n();
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
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
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
      <MenuButton
        ref={buttonRef}
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
        <Bars aria-hidden />
      </MenuButton>

      {open &&
        createPortal(
          <Overlay>
            <Backdrop aria-hidden onClick={close} />
            <Panel ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId}>
              <Top>
                <Brand to={`/${locale.slug}/${mode}`} aria-label={t('app.home')}>
                  <img src={logoUrl} alt="Rankwarden" />
                </Brand>
                <CloseButton
                  type="button"
                  aria-label={t('menu.close')}
                  title={t('menu.close')}
                  onClick={close}
                  data-autofocus
                >
                  <Cross aria-hidden />
                </CloseButton>
              </Top>
              <Title id={titleId}>{t('menu.title')}</Title>

              <Section>
                <Label>{t('header.language')}</Label>
                <LanguageSelect />
              </Section>
              <Section>
                <Label>{t('header.gameMode')}</Label>
                <GameModeToggle />
              </Section>
              <Section>
                <Label>{t('header.iconStyle')}</Label>
                <AssetStyleToggle />
              </Section>
              <Section>
                <Label>{t('header.faction')}</Label>
                <FactionToggle />
              </Section>

              {children && <NavSlot>{children}</NavSlot>}
            </Panel>
          </Overlay>,
          document.body,
        )}
    </>
  );
}

const MenuButton = styled.button`
  display: grid;
  flex: none;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid var(--color-trim-muted);
  border-radius: var(--radius-md);
  background: var(--color-bg-sunken);
  color: var(--color-accent-strong);
  cursor: pointer;
  transition: border-color var(--transition-fast);

  &:hover,
  &[aria-expanded='true'] {
    border-color: var(--color-trim);
  }
`;

/** Three bars, drawn in the current colour */
const Bars = styled.span`
  position: relative;
  width: 20px;
  height: 2px;
  border-radius: 1px;
  background: currentColor;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0;
    width: 20px;
    height: 2px;
    border-radius: 1px;
    background: currentColor;
  }

  &::before {
    top: -6px;
  }

  &::after {
    top: 6px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 0.6);
  animation: fade-in var(--transition-fast);

  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
`;

const Panel = styled.div`
  position: absolute;
  inset: 0 auto 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: min(22rem, 88vw);
  padding: var(--space-3) var(--space-4) var(--space-6);
  overflow-y: auto;
  background: var(--color-surface);
  border-right: 1px solid var(--color-trim-muted);
  box-shadow:
    inset -2px 0 0 var(--color-accent),
    var(--shadow-md);
  animation: slide-in 160ms ease-out;

  @keyframes slide-in {
    from {
      transform: translateX(-100%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
`;

const Brand = styled(Link)`
  display: flex;
  border-radius: var(--radius-md);

  img {
    display: block;
    height: 44px;
    width: auto;
  }
`;

const CloseButton = styled(MenuButton)``;

/** An × drawn in the current colour */
const Cross = styled.span`
  position: relative;
  width: 18px;
  height: 18px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 0;
    width: 18px;
    height: 2px;
    border-radius: 1px;
    background: currentColor;
  }

  &::before {
    transform: rotate(45deg);
  }

  &::after {
    transform: rotate(-45deg);
  }
`;

/** For screen readers: the dialog's name */
const Title = styled.h2`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-muted);
`;

const Label = styled.h3`
  color: var(--color-trim-strong);
  font-size: var(--font-size-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const NavSlot = styled.div`
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-trim-muted);
`;
