import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SPELL_CACHE_KEY,
  SPELL_CACHE_MAX,
  readSpell,
  resetSpellCacheForTests,
  writeSpell,
} from './spellCache';

const iceForm = { icon: 'https://x/ice.jpg', name: 'Ice Form', html: '<div class="q">Cold</div>' };
const DAY = 24 * 60 * 60 * 1000;

describe('Wowhead spell cache', () => {
  beforeEach(() => {
    localStorage.clear();
    resetSpellCacheForTests();
    vi.useFakeTimers();
  });

  it('keeps a lookup between visits, per language', () => {
    writeSpell('en', 198144, iceForm, 1000);
    vi.runAllTimers();
    resetSpellCacheForTests(); // a new visit: read back from storage
    expect(readSpell('en', 198144, 2000)).toEqual({ ...iceForm, at: 1000 });
    expect(readSpell('de', 198144, 2000)).toBeUndefined();
  });

  it('forgets a lookup after 7 days', () => {
    writeSpell('en', 198144, iceForm, 0);
    expect(readSpell('en', 198144, 7 * DAY)).toBeDefined();
    expect(readSpell('en', 198144, 7 * DAY + 1)).toBeUndefined();
  });

  it('keeps the newest entries only, and saves once for many writes', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    for (let i = 0; i < SPELL_CACHE_MAX + 5; i++) writeSpell('en', i, iceForm, i);
    vi.runAllTimers();
    expect(setItem).toHaveBeenCalledTimes(1);
    const saved = JSON.parse(localStorage.getItem(SPELL_CACHE_KEY)!).entries;
    expect(Object.keys(saved)).toHaveLength(SPELL_CACHE_MAX);
    expect(saved['en:0']).toBeUndefined();
    setItem.mockRestore();
  });

  it('makes stored HTML safe again, and survives bad storage', () => {
    localStorage.setItem(
      SPELL_CACHE_KEY,
      JSON.stringify({
        v: 1,
        entries: { 'en:1': { ...iceForm, html: '<img src=x onerror=alert(1)>ok', at: 0 } },
      }),
    );
    expect(readSpell('en', 1, 0)?.html).toBe('ok');
    resetSpellCacheForTests();
    localStorage.setItem(SPELL_CACHE_KEY, '{broken');
    expect(readSpell('en', 1, 0)).toBeUndefined();
  });
});
