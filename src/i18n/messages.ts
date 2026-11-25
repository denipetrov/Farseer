/**
 * The front end's own text, one JSON file per language in `./messages/<slug>.json`.
 *
 * `en.json` is the source: its keys are the `MessageKey` type, and every other file must
 * have exactly the same keys and `{placeholders}` (`messages.test.ts` checks). English is
 * bundled; the others load on demand, once, before a route in that language renders.
 * A key missing from a language falls back to English.
 */
import en from './messages/en.json';
import type { LocaleSlug } from './locales';

export type Messages = typeof en;
export type MessageKey = keyof Messages;
export type MessageParams = Record<string, string | number>;

const loaders = import.meta.glob<{ default: Partial<Messages> }>('./messages/*.json');
const loaded = new Map<LocaleSlug, Partial<Messages>>([['en', en]]);

/** Load a language's messages (once). Resolves when `t` can use them. */
export async function loadMessages(slug: LocaleSlug): Promise<void> {
  if (loaded.has(slug)) return;
  const load = loaders[`./messages/${slug}.json`];
  if (!load) return;
  loaded.set(slug, (await load()).default);
}

/** `{name}` placeholders filled from `params`; an unknown placeholder is left as it is. */
export function format(message: string, params?: MessageParams): string {
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (all, name: string) =>
    name in params ? String(params[name]) : all,
  );
}

/** The translator for a language: its message, else English, filled with `params`. */
export function translator(slug: LocaleSlug) {
  const messages = loaded.get(slug) ?? en;
  return (key: MessageKey, params?: MessageParams): string =>
    format(messages[key] ?? en[key], params);
}

export type Translate = ReturnType<typeof translator>;
