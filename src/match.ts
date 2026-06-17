/**
 * German-aware keyword matching.
 *
 * Council subjects mix umlauts, ß, and spellings like "Straße" vs "Strasse".
 * We fold both the haystack and the keywords to a common form so a subscriber
 * who types "Bahnhofstrasse" still matches "Bahnhofstraße", and case/diacritics
 * never get in the way.
 */

/** Lowercase, expand umlauts/ß, strip remaining diacritics, collapse spaces. */
export function foldGerman(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface Keyword {
  /** Original text as the subscriber entered it (for display). */
  raw: string;
  /** Folded form used for matching. */
  folded: string;
}

export function prepareKeywords(list: string[]): Keyword[] {
  const seen = new Set<string>();
  const out: Keyword[] = [];
  for (const raw of list) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const folded = foldGerman(trimmed);
    if (!folded || seen.has(folded)) continue;
    seen.add(folded);
    out.push({ raw: trimmed, folded });
  }
  return out;
}

/**
 * Return the raw forms of every keyword found in `text`.
 * Substring match on the folded form — robust for street names and topics.
 */
export function matchKeywords(text: string, keywords: Keyword[]): string[] {
  const hay = foldGerman(text);
  if (!hay) return [];
  return keywords.filter((k) => hay.includes(k.folded)).map((k) => k.raw);
}
