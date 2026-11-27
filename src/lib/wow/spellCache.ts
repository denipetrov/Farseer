/**
 * Wowhead spell lookups kept between visits (the user's request, 2026-11-27): one entry per
 * spell and language, in localStorage under one key, so a page shows the talents it has
 * seen before at once and asks Wowhead only for new ones.
 *
 * - An entry lasts 7 days: tooltips change with game patches.
 * - At most 600 entries (a few hundred PvP talents, in the languages used); the oldest go.
 * - Writes are gathered and saved once, shortly after the last one.
 * - The tooltip HTML is made safe again when read back (wowheadTooltipHtml), whatever is
 *   in storage.
 */
import { wowheadTooltipHtml } from './wowheadTooltipHtml';

export const SPELL_CACHE_KEY = 'farseer:wowhead-spells';
const VERSION = 1;
export const SPELL_CACHE_DAYS = 7;
export const SPELL_CACHE_MAX = 600;
const DAY = 24 * 60 * 60 * 1000;

export interface CachedSpell {
  icon: string | null;
  name: string | null;
  html: string | null;
}

interface Entry extends CachedSpell {
  /** When it was fetched (ms) */
  at: number;
}

let entries: Map<string, Entry> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const keyOf = (locale: string, spellId: number) => `${locale}:${spellId}`;
const str = (v: unknown) => (typeof v === 'string' ? v : null);

function load(): Map<string, Entry> {
  if (entries) return entries;
  entries = new Map();
  try {
    const raw = JSON.parse(localStorage.getItem(SPELL_CACHE_KEY) ?? 'null') as {
      v?: unknown;
      entries?: Record<string, Partial<Entry>>;
    } | null;
    if (raw?.v === VERSION && raw.entries && typeof raw.entries === 'object') {
      for (const [k, e] of Object.entries(raw.entries)) {
        if (typeof e?.at === 'number') {
          entries.set(k, { icon: str(e.icon), name: str(e.name), html: str(e.html), at: e.at });
        }
      }
    }
  } catch {
    // Unreadable or blocked storage: start empty
  }
  return entries;
}

function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const all = load();
    // Newest first, at most SPELL_CACHE_MAX
    const kept = [...all].sort((a, b) => b[1].at - a[1].at).slice(0, SPELL_CACHE_MAX);
    entries = new Map(kept);
    try {
      localStorage.setItem(
        SPELL_CACHE_KEY,
        JSON.stringify({ v: VERSION, entries: Object.fromEntries(kept) }),
      );
    } catch {
      // Full or blocked storage: the lookups still work for this visit
    }
  }, 500);
}

/** The stored lookup of a spell in a language, with when it was fetched; none when expired */
export function readSpell(
  locale: string,
  spellId: number,
  now = Date.now(),
): (CachedSpell & { at: number }) | undefined {
  const e = load().get(keyOf(locale, spellId));
  if (!e || now - e.at > SPELL_CACHE_DAYS * DAY) return undefined;
  return { ...e, html: e.html ? wowheadTooltipHtml(e.html) : null };
}

/** Keeps a fresh lookup */
export function writeSpell(locale: string, spellId: number, spell: CachedSpell, now = Date.now()) {
  load().set(keyOf(locale, spellId), { ...spell, at: now });
  save();
}

/** Tests: forget what was loaded, so the next read reads storage again */
export function resetSpellCacheForTests() {
  clearTimeout(saveTimer);
  entries = null;
}
