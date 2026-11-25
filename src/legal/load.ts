import type { LocaleSlug } from '@/i18n/locales';
import type { LegalDocName, LegalDocument } from './types';

const docs = import.meta.glob<{ default: LegalDocument }>('./*/*.json');

export interface LoadedLegalDocument {
  doc: LegalDocument;
  /** The language the text is in: the requested one, or English when it has no translation */
  slug: LocaleSlug;
}

/**
 * A legal document in a language, else in English. English is the authoritative version;
 * translations are added as `src/legal/<slug>/<doc>.json` with the same section ids.
 */
export async function loadLegalDocument(
  slug: LocaleSlug,
  name: LegalDocName,
): Promise<LoadedLegalDocument> {
  const translated = docs[`./${slug}/${name}.json`];
  if (translated) return { doc: (await translated()).default, slug };
  return { doc: (await docs[`./en/${name}.json`]!()).default, slug: 'en' };
}
