import { describe, expect, it } from 'vitest';
import { LOCALES } from './locales';
import { format, loadMessages, translator } from './messages';
import en from './messages/en.json';

const files = import.meta.glob<Record<string, string>>('./messages/*.json', {
  eager: true,
  import: 'default',
});
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('message files', () => {
  it('there is one per language, and no other', () => {
    expect(Object.keys(files).sort()).toEqual(
      LOCALES.map((l) => `./messages/${l.slug}.json`).sort(),
    );
  });

  it.each(LOCALES.filter((l) => l.slug !== 'en'))(
    '$slug has exactly the English keys and placeholders, none empty',
    ({ slug }) => {
      const messages = files[`./messages/${slug}.json`]!;
      expect(Object.keys(messages).sort()).toEqual(Object.keys(en).sort());
      for (const [key, english] of Object.entries(en)) {
        expect(messages[key]?.trim(), `${slug} ${key}`).toBeTruthy();
        expect(placeholders(messages[key]!), `${slug} ${key}`).toEqual(placeholders(english));
      }
    },
  );
});

describe('translator', () => {
  it('fills placeholders and leaves unknown ones', () => {
    expect(format('{a} and {b}', { a: 1 })).toBe('1 and {b}');
  });

  it('uses the loaded language, English before it loads', async () => {
    expect(translator('de')('header.language')).toBe('Language');
    await loadMessages('de');
    expect(translator('de')('header.language')).toBe('Sprache');
    expect(translator('de')('guild.logo', { name: 'Liquid' })).toBe('Logo von Liquid');
  });
});
