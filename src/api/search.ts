/**
 * `GET /search/suggestions?type=pvp|pve&q=<prefix>`: names starting with `q`, as
 * the visitor types. Current seasons only, in name order.
 *
 *   pvp  up to 100 characters from the PvP ladders; `guilds` is always empty
 *   pve  up to 100 Mythic+ characters and up to 100 guilds
 *
 * Matching ignores case and accents (`biba` finds `Bìbà`). Types mirror
 * Soulseeker's `src/search/search.types.ts`.
 */
import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import type { GameMode } from '@/lib/gameMode';
import { api } from '.';

export interface CharacterSuggestion {
  characterName: string;
  region: string;
  realmSlug: string;
  realmName: string | null;
  /** Null for a PvP character Rankwarden hasn't enriched yet */
  className: string | null;
  classId: number | null;
  specName: string | null;
  specId: number | null;
  /** Always null for Mythic+ characters */
  heroTalents: string | null;
  heroTalentId: number | null;
  raceName: string | null;
  raceId: number | null;
  /** Lowercase: `alliance` or `horde` */
  faction: string | null;
}

export interface GuildSuggestion {
  name: string;
  region: string;
  realmSlug: string;
  realmName: string;
  /** Lowercase: `alliance` or `horde`, as on characters; null when not stored */
  faction: string | null;
  /** Raider.io's logo image URL, as Rankwarden stores it; null when the guild has none */
  logo: string | null;
}

export interface SuggestionsResponse {
  type: GameMode;
  /** The folded prefix Soulseeker searched */
  query: string;
  characters: CharacterSuggestion[];
  /** Always empty for a PvP search */
  guilds: GuildSuggestion[];
}

/** Soulseeker's limits on `q` (`suggestions-query.dto.ts`). */
export const MIN_QUERY_LENGTH = 2;
export const MAX_QUERY_LENGTH = 32;
/** Everything a stored name can contain: letters of any script, digits, space, `!`, `*`, `-`. */
const NAME_CHARACTERS = /^[\p{L}\p{N} !*-]+$/u;

/**
 * The query to send for what the visitor typed, or null when Soulseeker would refuse it
 * (too short, too long, or a character no name has). Checked here so a refused query
 * never becomes a request. Soulseeker folds accents itself; a 2-letter query that folds
 * to 1 is still refused there (400), which the search box shows as no matches.
 */
export function searchQueryOf(input: string): string | null {
  const q = input.trim().replace(/\s+/g, ' ');
  if (q.length < MIN_QUERY_LENGTH || q.length > MAX_QUERY_LENGTH) return null;
  return NAME_CHARACTERS.test(q) ? q : null;
}

export const searchSuggestionsQuery = (type: GameMode, q: string) =>
  queryOptions({
    queryKey: ['search', 'suggestions', type, q.toLowerCase()],
    queryFn: ({ signal }) =>
      api.get<SuggestionsResponse>('/search/suggestions', { type, q }, signal),
    staleTime: 60_000,
    // Keep the last list on screen while the next keystroke's answer loads.
    placeholderData: keepPreviousData,
    retry: false,
  });
