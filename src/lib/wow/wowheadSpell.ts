/**
 * Spell icons from Wowhead (the user's choice for PvP talents, 2026-11-27). Wowhead's
 * tooltip API is open to other sites (`Access-Control-Allow-Origin: *`):
 * `https://nether.wowhead.com/tooltip/spell/<id>` gives the spell's icon name, and the
 * picture is on Wowhead's image host. The lookup is in the site's language (`locale=<n>`),
 * so the spell's name on hover is translated too.
 *
 * Each spell is asked for once: rows sharing a talent share one query (one request per
 * spell and language), and the answer is kept between visits for 7 days (spellCache.ts),
 * so a page asks Wowhead only for talents it has not seen. The pictures themselves are
 * kept by the browser's own cache.
 */
import { useQuery } from '@tanstack/react-query';
import type { LocaleSlug } from '@/i18n/locales';
import { readSpell, writeSpell } from './spellCache';
import { wowheadTooltipHtml } from './wowheadTooltipHtml';

const TOOLTIP = 'https://nether.wowhead.com/tooltip/spell';
const ICONS = 'https://wow.zamimg.com/images/wow/icons/large';

/** Wowhead's language numbers (each checked against Ice Form, 198144, 2026-11-27) */
export const WOWHEAD_LOCALE: Record<LocaleSlug, number> = {
  en: 0,
  ko: 1,
  fr: 2,
  de: 3,
  cn: 4,
  es: 6,
  ru: 7,
  pt: 8,
};

/** Icon names are file names (`ability_mage_iceform`); anything else is not used */
const ICON_NAME = /^[a-z0-9_-]+$/i;

/** The picture of a Wowhead icon name (56 px, `large`), or undefined for a bad name */
export const wowheadIconUrl = (icon: string): string | undefined =>
  ICON_NAME.test(icon) ? `${ICONS}/${icon.toLowerCase()}.jpg` : undefined;

export interface SpellTooltip {
  /** The icon's picture; null when Wowhead gives none */
  icon: string | null;
  /** The spell's name in the requested language; null when Wowhead gives none */
  name: string | null;
  /** Wowhead's tooltip (cost, cast, cooldown, description), made safe: wowheadTooltipHtml */
  html: string | null;
}

async function fetchSpellTooltip(
  spellId: number,
  locale: LocaleSlug,
  signal: AbortSignal,
): Promise<SpellTooltip> {
  const url = `${TOOLTIP}/${spellId}?dataEnv=1&locale=${WOWHEAD_LOCALE[locale]}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Wowhead tooltip ${spellId}: ${res.status}`);
  const { icon, name, tooltip } = (await res.json()) as {
    icon?: unknown;
    name?: unknown;
    tooltip?: unknown;
  };
  const spell = {
    icon: typeof icon === 'string' ? (wowheadIconUrl(icon) ?? null) : null,
    name: typeof name === 'string' && name.trim() ? name : null,
    html: typeof tooltip === 'string' ? wowheadTooltipHtml(tooltip) : null,
  };
  writeSpell(locale, spellId, spell);
  return spell;
}

/** A spell's icon and name in the site's language; undefined while loading */
export function useSpellTooltip(spellId: number | null, locale: LocaleSlug) {
  return useQuery({
    queryKey: ['wowhead', 'spell', spellId, locale],
    queryFn: ({ signal }) => fetchSpellTooltip(spellId!, locale, signal),
    enabled: spellId != null,
    // Seen in the last 7 days: shown at once, and not asked for again (staleTime below)
    initialData: () => (spellId != null ? readSpell(locale, spellId) : undefined),
    initialDataUpdatedAt: () => (spellId != null ? readSpell(locale, spellId)?.at : undefined),
    // On a language change, keep the icon (the same in every language) while the new one loads
    placeholderData: (previous) => previous,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
}
