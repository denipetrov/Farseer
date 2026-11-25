/**
 * The site's languages. Each has:
 *   - `slug`: the first URL segment (`/de/pvp`), short as the user chose;
 *   - `code`: Blizzard's spelling, as Soulseeker's `locale` parameter takes it (`de_DE`);
 *   - `htmlLang`: the BCP 47 tag for `<html lang>`;
 *   - `name`: the language's own name, shown in the language dropdown (never translated).
 */
export const LOCALES = [
  { slug: 'en', code: 'en_US', htmlLang: 'en-US', name: 'English' },
  { slug: 'es', code: 'es_ES', htmlLang: 'es-ES', name: 'Español' },
  { slug: 'pt', code: 'pt_BR', htmlLang: 'pt-BR', name: 'Português' },
  { slug: 'fr', code: 'fr_FR', htmlLang: 'fr-FR', name: 'Français' },
  { slug: 'de', code: 'de_DE', htmlLang: 'de-DE', name: 'Deutsch' },
  { slug: 'ru', code: 'ru_RU', htmlLang: 'ru-RU', name: 'Русский' },
  { slug: 'ko', code: 'ko_KR', htmlLang: 'ko-KR', name: '한국어' },
  { slug: 'cn', code: 'zh_CN', htmlLang: 'zh-CN', name: '简体中文' },
] as const;

export type Locale = (typeof LOCALES)[number];
export type LocaleSlug = Locale['slug'];
export type LocaleCode = Locale['code'];

export const DEFAULT_LOCALE: Locale = LOCALES[0];

export const LOCALE_SLUGS = LOCALES.map((l) => l.slug) as readonly LocaleSlug[];

export const isLocaleSlug = (v: unknown): v is LocaleSlug =>
  typeof v === 'string' && (LOCALE_SLUGS as readonly string[]).includes(v);

export const localeBySlug = (slug: LocaleSlug): Locale => LOCALES.find((l) => l.slug === slug)!;

/** Other spellings of a language that lead to its slug: `kr`, `zh`, `de_DE`, `de-de`, `pt-br`. */
const ALIASES: Readonly<Record<string, LocaleSlug>> = {
  kr: 'ko',
  zh: 'cn',
  ...Object.fromEntries(
    LOCALES.flatMap((l) => [
      [l.code.toLowerCase(), l.slug],
      [l.code.toLowerCase().replace('_', '-'), l.slug],
    ]),
  ),
};

/**
 * The language a URL segment (or any spelling) names: `de`, `DE`, `de_DE`, `de-de`, `kr`,
 * `zh`. Null when it names none (`pvp`, `character`).
 */
export function resolveLocaleSlug(segment: string | null | undefined): LocaleSlug | null {
  const v = segment?.trim().toLowerCase();
  if (!v) return null;
  if (isLocaleSlug(v)) return v;
  return ALIASES[v] ?? null;
}

/**
 * The best of the site's languages for a browser's preferences (`navigator.languages`):
 * the first one whose language matches (`de-AT` → `de`, `zh-Hans-CN` → `cn`), else null.
 */
export function localeFromBrowser(languages: readonly string[]): LocaleSlug | null {
  for (const tag of languages) {
    const lang = tag.toLowerCase().split(/[-_]/)[0];
    const match = LOCALES.find((l) => l.code.toLowerCase().split('_')[0] === lang);
    if (match) return match.slug;
  }
  return null;
}
