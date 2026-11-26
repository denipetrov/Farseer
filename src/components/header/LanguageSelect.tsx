import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { LOCALES, resolveLocaleSlug, type LocaleSlug } from '@/i18n/locales';
import { useI18n } from '@/i18n/useI18n';
import { usePreferences } from '@/preferences/PreferencesProvider';
import styles from './LanguageSelect.module.css';

/**
 * The language dropdown, next to the logo. Shows the current language's code (`EN`); the
 * list names each language in itself (`Deutsch`, `한국어`).
 *
 * Choosing a language keeps the page: only the URL's first segment changes
 * (`/en/pvp?x=1` → `/de/pvp?x=1`), and the choice is remembered.
 *
 * A listbox button: Enter, Space or the arrows open it; arrows move, Enter chooses, Escape
 * or Tab closes, as does a click outside.
 */
export function LanguageSelect() {
  const { locale, t } = useI18n();
  const { setPreference } = usePreferences();
  const navigate = useNavigate();
  const { pathname, searchStr, hash } = useRouterState({
    select: (s) => ({
      pathname: s.location.pathname,
      searchStr: s.location.searchStr,
      hash: s.location.hash,
    }),
  });

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const current = LOCALES.findIndex((l) => l.slug === locale.slug);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const openList = () => {
    setActive(current);
    setOpen(true);
  };

  const choose = (slug: LocaleSlug) => {
    setOpen(false);
    buttonRef.current?.focus();
    if (slug === locale.slug) return;
    setPreference('locale', slug);
    // The same page in the other language: `/<game>/<language>/…` with the language swapped
    const [, game, current, ...rest] = pathname.split('/');
    const path = resolveLocaleSlug(current) ? rest.join('/') : [current, ...rest].join('/');
    void navigate({ href: `/${game}/${slug}/${path}${searchStr}${hash ? `#${hash}` : ''}` });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        const step = e.key === 'ArrowDown' ? 1 : -1;
        setActive((a) => (a + step + LOCALES.length) % LOCALES.length);
        return;
      }
      case 'Home':
      case 'End':
        e.preventDefault();
        setActive(e.key === 'Home' ? 0 : LOCALES.length - 1);
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(LOCALES[active]!.slug);
        return;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        return;
      case 'Tab':
        setOpen(false);
        return;
    }
  };

  const optionId = (i: number) => `${listId}-${i}`;

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <button
        ref={buttonRef}
        className={styles.button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        aria-label={`${t('header.language')}: ${locale.name}`}
        title={t('header.language')}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className={styles.code} lang={locale.htmlLang}>
          {locale.slug.toUpperCase()}
        </span>
        <span className={styles.chevron} aria-hidden />
      </button>

      {open && (
        <ul className={styles.list} id={listId} role="listbox" aria-label={t('header.language')}>
          {LOCALES.map((l, i) => (
            <li
              key={l.slug}
              className={styles.option}
              id={optionId(i)}
              role="option"
              lang={l.htmlLang}
              aria-selected={l.slug === locale.slug}
              data-active={i === active || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={() => setActive(i)}
              onClick={() => choose(l.slug)}
            >
              <span>{l.name}</span>
              <span className={styles.optionCode}>{l.slug.toUpperCase()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
