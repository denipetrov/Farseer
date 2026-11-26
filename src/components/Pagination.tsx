import { useId, useState, type FormEvent } from 'react';
import { NavGlyph } from '@/components/NavGlyph';
import { useI18n } from '@/i18n/useI18n';
import { pageWindow } from '@/lib/pagination';
import { typedPage } from '@/lib/pageInput';
import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  /** How many there are in all, for "Page 3 of 4,000 · 265,120 players" */
  total: number;
  onChange: (page: number) => void;
}

/**
 * Page controls for a long list: first and previous, the pages around the current one
 * (`pageWindow`), next and last, with a summary ("Page 3 of 4,000 · 265,120 players"), and a
 * "Go to page" field for a page far from the current one (Enter, or its arrow button). The
 * arrows are the nav/page-* icons; there is no text to translate on any button. Buttons that
 * would go nowhere are disabled.
 */
export function Pagination({ page, totalPages, total, onChange }: PaginationProps) {
  const { t, locale } = useI18n();
  const fmt = (n: number) => n.toLocaleString(locale.htmlLang);
  const last = Math.max(1, totalPages);
  const inputId = useId();
  const [typed, setTyped] = useState('');

  // "Go to page": a typed page, kept between 1 and the last; anything else does nothing
  const go = (e: FormEvent) => {
    e.preventDefault();
    const target = typedPage(typed, last);
    if (target == null) return;
    setTyped('');
    if (target !== page) onChange(target);
  };

  const arrow = (target: number, label: string, icon: string, disabled: boolean) => (
    <button
      type="button"
      className={styles.arrow}
      onClick={() => onChange(target)}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <NavGlyph icon={icon} />
    </button>
  );

  return (
    <nav className={styles.pagination} aria-label={t('pagination.aria')}>
      <span className={styles.range}>
        {t('pagination.summary', { page: fmt(page), pages: fmt(last), total: fmt(total) })}
      </span>
      <span className={styles.controls}>
        {arrow(1, t('pagination.first'), 'nav/page-first', page <= 1)}
        {arrow(page - 1, t('pagination.prev'), 'nav/page-prev', page <= 1)}
        {pageWindow(page, last).map((item, i) =>
          item === 'gap' ? (
            <span key={`gap-${i}`} className={styles.gap} aria-hidden>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={styles.page}
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
              aria-label={t('pagination.page', { page: fmt(item) })}
            >
              {fmt(item)}
            </button>
          ),
        )}
        {arrow(page + 1, t('pagination.next'), 'nav/page-next', page >= last)}
        {arrow(last, t('pagination.last'), 'nav/page-last', page >= last)}
      </span>
      {last > 1 && (
        <form className={styles.goTo} onSubmit={go}>
          <label htmlFor={inputId}>{t('pagination.goTo')}</label>
          <input
            id={inputId}
            className={styles.input}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            placeholder={fmt(page)}
            value={typed}
            // Digits only: anything else never reaches the field
            onChange={(e) => setTyped(e.target.value.replace(/\D/g, ''))}
          />
          {/* An arrow, not a word: "Go" doesn't translate well (the user, 2026-11-26) */}
          <button
            type="submit"
            className={styles.go}
            aria-label={t('pagination.goTo')}
            title={t('pagination.goTo')}
          >
            <NavGlyph icon="nav/page-next" />
          </button>
        </form>
      )}
    </nav>
  );
}
