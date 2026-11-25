import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';

/** Shown once the page has scrolled this far: about a screen, so short pages never show it. */
const SHOW_AFTER_PX = 600;

/**
 * `nav/scroll-top.svg` as a CSS `url()` value, built here: Vite inlines small SVGs as
 * data: URLs with single quotes, and Prettier rewrites quotes inside styled-components CSS.
 */
const glyph = `url("${iconUrl('nav/scroll-top')}")`;

/**
 * "Back to top": a round button fixed at the bottom right, on desktop and mobile, that
 * appears after the visitor has scrolled about a screen down.
 *
 * Scrolls smoothly (instantly with reduced motion), then moves focus to the top of the page
 * so keyboard users continue from there. The icon is monochrome, drawn in the accent.
 */
export function ScrollTopButton() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    // Keyboard users continue from the top: focus the page body without scrolling again
    document.body.setAttribute('tabindex', '-1');
    document.body.focus({ preventScroll: true });
    document.body.removeAttribute('tabindex');
  };

  return (
    <Button
      type="button"
      onClick={toTop}
      aria-label={t('scrollTop')}
      title={t('scrollTop')}
      data-visible={visible || undefined}
      // Hidden from assistive tech and the tab order while there is nothing to go back to
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <Glyph aria-hidden />
    </Button>
  );
}

const Button = styled.button`
  position: fixed;
  right: max(var(--space-6), env(safe-area-inset-right));
  bottom: max(var(--space-6), env(safe-area-inset-bottom));
  z-index: 20;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid var(--color-trim-muted);
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  color: var(--color-accent-strong);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px);
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);

  &[data-visible] {
    opacity: 1;
    pointer-events: auto;
    transform: none;
  }

  &:hover {
    border-color: var(--color-trim);
    color: var(--color-text-highlight);
  }

  @media (max-width: 820px) {
    right: max(var(--space-4), env(safe-area-inset-right));
    bottom: max(var(--space-4), env(safe-area-inset-bottom));
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Glyph = styled.span`
  width: 24px;
  height: 24px;
  background: currentColor;
  mask: ${glyph} center / contain no-repeat;
`;
