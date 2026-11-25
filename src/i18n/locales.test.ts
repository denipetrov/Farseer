import { describe, expect, it } from 'vitest';
import { LOCALES, localeFromBrowser, resolveLocaleSlug } from './locales';

describe('locales', () => {
  it('has the eight languages, with Soulseeker codes', () => {
    expect(LOCALES.map((l) => `${l.slug}:${l.code}`)).toEqual([
      'en:en_US',
      'es:es_ES',
      'pt:pt_BR',
      'fr:fr_FR',
      'de:de_DE',
      'ru:ru_RU',
      'ko:ko_KR',
      'cn:zh_CN',
    ]);
  });

  it('reads every spelling of a language as its slug', () => {
    expect(resolveLocaleSlug('de')).toBe('de');
    expect(resolveLocaleSlug('DE')).toBe('de');
    expect(resolveLocaleSlug('de_DE')).toBe('de');
    expect(resolveLocaleSlug('de-de')).toBe('de');
    expect(resolveLocaleSlug('pt-BR')).toBe('pt');
    expect(resolveLocaleSlug('kr')).toBe('ko');
    expect(resolveLocaleSlug('zh')).toBe('cn');
    expect(resolveLocaleSlug('zh_CN')).toBe('cn');
  });

  it('names no language for other segments', () => {
    for (const v of ['pvp', 'pve', 'character', 'leaderboards', '', null, undefined, 'xx']) {
      expect(resolveLocaleSlug(v)).toBeNull();
    }
  });

  it("picks the first of the browser's languages that the site has", () => {
    expect(localeFromBrowser(['de-AT', 'en'])).toBe('de');
    expect(localeFromBrowser(['nl-NL', 'fr-CA'])).toBe('fr');
    expect(localeFromBrowser(['zh-Hans-CN'])).toBe('cn');
    expect(localeFromBrowser(['ko'])).toBe('ko');
    expect(localeFromBrowser(['pt-PT'])).toBe('pt');
    expect(localeFromBrowser(['nl', 'sv'])).toBeNull();
    expect(localeFromBrowser([])).toBeNull();
  });
});
