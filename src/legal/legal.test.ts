import { describe, expect, it } from 'vitest';
import { isLocaleSlug } from '@/i18n/locales';
import type { LegalBlock, LegalDocument } from './types';

const docs = import.meta.glob<LegalDocument>('./*/*.json', { eager: true, import: 'default' });
const entries = Object.entries(docs).map(([path, doc]) => {
  const [, slug, name] = /^\.\/(\w+)\/(\w+)\.json$/.exec(path)!;
  return { slug: slug!, name: name!, doc };
});
const english = (name: string) => entries.find((e) => e.slug === 'en' && e.name === name)!.doc;
const texts = (blocks: LegalBlock[]) => blocks.flatMap((b) => ('list' in b ? b.list : [b.p]));

describe('legal documents', () => {
  it('English, the authoritative version, has both documents', () => {
    expect(english('privacy')).toBeDefined();
    expect(english('terms')).toBeDefined();
  });

  it.each(entries)('$slug/$name is well formed', ({ slug, name, doc }) => {
    expect(isLocaleSlug(slug)).toBe(true);
    expect(['privacy', 'terms']).toContain(name);
    expect(doc.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // A translation has the same sections, in the same order, as English
    expect(doc.sections.map((s) => s.id)).toEqual(english(name).sections.map((s) => s.id));

    for (const s of doc.sections) {
      expect(s.heading.trim(), s.id).toBeTruthy();
      expect(s.blocks.length, s.id).toBeGreaterThan(0);
    }
    const all = [...texts(doc.intro), ...doc.sections.flatMap((s) => texts(s.blocks))];
    for (const text of all) {
      expect(text.trim()).toBeTruthy();
      for (const [, , href] of text.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
        expect(href, text.slice(0, 40)).toMatch(/^(mailto:|https:\/\/|\/[a-z])/);
      }
    }
  });
});
