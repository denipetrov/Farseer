import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { ApiError } from '@/api';
import {
  searchQueryOf,
  searchSuggestionsQuery,
  type CharacterSuggestion,
  type GuildSuggestion,
} from '@/api/search';
import { CharacterLine } from '@/components/CharacterLine';
import { GuildLine } from '@/components/GuildLine';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useI18n } from '@/i18n/useI18n';
import { useGameMode } from '@/preferences/useGameMode';
import type { GameMode } from '@/lib/gameMode';
import styles from './SearchBar.module.css';
import { useSite } from '@/lib/site';

/** Each list is up to 100 long; the first few are what a visitor reads. */
const MAX_SHOWN = 20;
const DEBOUNCE_MS = 250;

type Item =
  | { kind: 'character'; id: string; data: CharacterSuggestion }
  | { kind: 'guild'; id: string; data: GuildSuggestion };

/**
 * The header search: suggestions from `/search/suggestions` for the current game mode
 * as the visitor types. Choosing one opens its character or guild page.
 *
 * An ARIA combobox: arrow keys move through the list, Enter opens the highlighted
 * entry (the first when none is), Escape closes the list, then clears the box.
 */
export function SearchBar() {
  const [mode] = useGameMode();
  const { t } = useI18n();
  const site = useSite();
  const navigate = useNavigate();
  const listId = useId();

  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const q = searchQueryOf(useDebouncedValue(input, DEBOUNCE_MS));
  const typed = searchQueryOf(input);
  const { data, error, isFetching } = useQuery({
    ...searchSuggestionsQuery(mode, q ?? ''),
    enabled: q !== null,
  });

  // An answer for an older query stays on screen only while it is still being typed past.
  const current = typed !== null && data?.type === mode ? data : undefined;

  const items = useMemo<Item[]>(() => {
    if (!current) return [];
    const key = (...parts: string[]) => parts.join('/');
    return [
      ...current.characters.slice(0, MAX_SHOWN).map((c): Item => ({
        kind: 'character',
        id: key('c', c.region, c.realmSlug, c.characterName),
        data: c,
      })),
      ...current.guilds.slice(0, MAX_SHOWN).map((g): Item => ({
        kind: 'guild',
        id: key('g', g.region, g.realmSlug, g.name),
        data: g,
      })),
    ];
  }, [current]);

  const characters = items.filter((i) => i.kind === 'character');
  const guilds = items.filter((i) => i.kind === 'guild');
  const truncated =
    !!current && (current.characters.length > MAX_SHOWN || current.guilds.length > MAX_SHOWN);

  const choose = (item: Item) => {
    setInput('');
    setOpen(false);
    setActive(-1);
    (document.activeElement as HTMLElement | null)?.blur();
    const { region, realmSlug } = item.data;
    if (item.kind === 'character') {
      const params = {
        ...site,
        region,
        realm: realmSlug,
        name: item.data.characterName,
      };
      // Each mode has its own character page
      void navigate(
        mode === 'pvp'
          ? { to: '/$game/$locale/pvp/character/$region/$realm/$name', params }
          : { to: '/$game/$locale/pve/character/$region/$realm/$name', params },
      );
    } else {
      void navigate({
        to: '/$game/$locale/pve/guild/$region/$realm/$name',
        params: { ...site, region, realm: realmSlug, name: item.data.name },
      });
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        setOpen(true);
        if (!items.length) return;
        const step = e.key === 'ArrowDown' ? 1 : -1;
        setActive((a) => (a + step + items.length + (a < 0 && step < 0 ? 1 : 0)) % items.length);
        return;
      }
      case 'Enter': {
        const item = items[active] ?? items[0];
        if (item) {
          e.preventDefault();
          choose(item);
        }
        return;
      }
      case 'Escape':
        e.preventDefault();
        if (open && input) setOpen(false);
        else setInput('');
        setActive(-1);
        return;
    }
  };

  const status = (() => {
    if (typed === null) {
      return input.trim().length >= 2 ? t('search.invalidCharacters') : null;
    }
    if (error && !current) {
      return error instanceof ApiError && error.status === 503
        ? t('search.busy')
        : error instanceof ApiError && error.status === 400
          ? t('search.noMatches')
          : t('search.unavailable');
    }
    if (!current) return isFetching || q !== typed ? t('search.searching') : null;
    if (!items.length) return t('search.noMatches');
    return null;
  })();

  const expanded = open && (items.length > 0 || status !== null);
  const optionId = (i: number) => `${listId}-${i}`;

  const renderItem = (item: Item) => {
    const i = items.indexOf(item);
    return (
      <li
        key={item.id}
        className={styles.option}
        id={optionId(i)}
        role="option"
        aria-selected={i === active}
        // Keep focus in the box, so the list isn't closed by blur before the click lands
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => choose(item)}
        onMouseMove={() => setActive(i)}
      >
        {item.kind === 'character' ? (
          <CharacterRow c={item.data} mode={mode} />
        ) : (
          <GuildRow g={item.data} />
        )}
      </li>
    );
  };

  return (
    <div className={styles.wrap}>
      <label className={styles.field}>
        <span className={styles.glyph} aria-hidden />
        <input
          className={styles.input}
          type="search"
          role="combobox"
          aria-label={t(`search.placeholder.${mode}`)}
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? optionId(active) : undefined}
          placeholder={t(`search.placeholder.${mode}`)}
          autoComplete="off"
          spellCheck={false}
          maxLength={64}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
      </label>

      {expanded && (
        <div className={styles.popup}>
          <ul id={listId} role="listbox" aria-label={t('search.suggestions')}>
            {characters.length > 0 && (
              <li role="presentation">
                <div className={styles.groupLabel}>{t('search.characters')}</div>
                <ul role="group" aria-label={t('search.characters')}>
                  {characters.map(renderItem)}
                </ul>
              </li>
            )}
            {guilds.length > 0 && (
              <li role="presentation">
                <div className={styles.groupLabel}>{t('search.guilds')}</div>
                <ul role="group" aria-label={t('search.guilds')}>
                  {guilds.map(renderItem)}
                </ul>
              </li>
            )}
          </ul>
          {status && (
            <p className={styles.status} role="status">
              {status}
            </p>
          )}
          {!status && truncated && <p className={styles.status}>{t('search.keepTyping')}</p>}
        </div>
      )}
    </div>
  );
}

function CharacterRow({ c, mode }: { c: CharacterSuggestion; mode: GameMode }) {
  // Ids first; names are the fallback (an unenriched PvP character has neither)
  const cls = c.classId ?? c.className;
  return (
    <CharacterLine
      name={c.characterName}
      realm={c.realmName ?? c.realmSlug}
      region={c.region}
      faction={c.faction}
      race={c.raceId ?? c.raceName}
      cls={cls}
      spec={c.specId ?? c.specName}
      heroTalent={c.heroTalentId ?? c.heroTalents}
      // PvE characters don't show a hero talent
      showHeroTalent={mode === 'pvp'}
    />
  );
}

function GuildRow({ g }: { g: GuildSuggestion }) {
  return (
    <GuildLine
      name={g.name}
      realm={g.realmName}
      region={g.region}
      logo={g.logo}
      faction={g.faction}
    />
  );
}
