import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/useI18n';
import styles from './ScrollTopButton.module.css';

/** Shown once the page has scrolled this far: about a screen, so short pages never show it. */
const SHOW_AFTER_PX = 600;

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
    <button
      className={styles.button}
      type="button"
      onClick={toTop}
      aria-label={t('scrollTop')}
      title={t('scrollTop')}
      data-visible={visible || undefined}
      // Hidden from assistive tech and the tab order while there is nothing to go back to
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <span className={styles.glyph} aria-hidden />
    </button>
  );
}
