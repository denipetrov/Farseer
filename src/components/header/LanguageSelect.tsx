import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import styled from 'styled-components';
import { LOCALES, resolveLocaleSlug, type LocaleSlug } from '@/i18n/locales';
import { useI18n } from '@/i18n/useI18n';
import { usePreferences } from '@/preferences/PreferencesProvider';

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
    const [, first, ...rest] = pathname.split('/');
    const path = resolveLocaleSlug(first) ? rest.join('/') : [first, ...rest].join('/');
    void navigate({ href: `/${slug}/${path}${searchStr}${hash ? `#${hash}` : ''}` });
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
    <Wrap ref={wrapRef}>
      <Button
        ref={buttonRef}
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
        <Code lang={locale.htmlLang}>{locale.slug.toUpperCase()}</Code>
        <Chevron aria-hidden $open={open} />
      </Button>

      {open && (
        <List id={listId} role="listbox" aria-label={t('header.language')}>
          {LOCALES.map((l, i) => (
            <Option
              key={l.slug}
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
              <OptionCode>{l.slug.toUpperCase()}</OptionCode>
            </Option>
          ))}
        </List>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  flex: none;
`;

const Button = styled.button`
  --lang-border: var(--color-trim-muted);

  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--lang-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-sunken);
  color: var(--color-text-highlight);
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: border-color var(--transition-fast);

  &:hover,
  &[aria-expanded='true'] {
    --lang-border: var(--color-trim);
  }
`;

const Code = styled.span`
  font-size: var(--font-size-sm);
`;

/** A small chevron drawn with borders, pointing down (up when open). */
const Chevron = styled.span<{ $open: boolean }>`
  width: 7px;
  height: 7px;
  margin-top: ${(p) => (p.$open ? '3px' : '-3px')};
  border-right: 2px solid var(--color-text-subtle);
  border-bottom: 2px solid var(--color-text-subtle);
  transform: rotate(${(p) => (p.$open ? '-135deg' : '45deg')});
  transition: transform var(--transition-fast);
`;

const List = styled.ul`
  position: absolute;
  top: calc(100% + var(--space-1));
  left: 0;
  z-index: 20;
  min-width: 12rem;
  margin: 0;
  padding: var(--space-1);
  list-style: none;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-trim-muted);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
`;

const Option = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  cursor: pointer;

  &[data-active] {
    background: var(--color-surface-hover);
  }

  &[aria-selected='true'] {
    color: var(--color-text-highlight);
    font-weight: 600;
    box-shadow: inset 3px 0 0 var(--color-accent);
  }
`;

const OptionCode = styled.span`
  color: var(--color-text-subtle);
  font-size: var(--font-size-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
`;
