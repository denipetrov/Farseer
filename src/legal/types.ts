/**
 * A legal document (privacy policy, terms of service) as data, one JSON file per language in
 * `src/legal/<slug>/<doc>.json`, rendered by `LegalPage`.
 *
 * Text may contain links written as `[label](url)`: `mailto:`, `https:` or a site path
 * starting with `/` (the current language is put in front: `/privacy` → `/de/privacy`).
 */
export interface LegalBlockParagraph {
  p: string;
}

export interface LegalBlockList {
  list: string[];
}

export type LegalBlock = LegalBlockParagraph | LegalBlockList;

export interface LegalSection {
  /** Anchor id, stable across languages (`#rights`) */
  id: string;
  heading: string;
  /** One sentence: the section in plain words */
  summary?: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  /** ISO date the text took effect */
  updated: string;
  intro: LegalBlock[];
  sections: LegalSection[];
}

export type LegalDocName = 'privacy' | 'terms';
