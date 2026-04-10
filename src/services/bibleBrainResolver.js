/**
 * Bible Brain content resolver.
 * Resolves the correct BibleId for a given language by checking
 * the preferred list in LANGUAGES config against what's actually available.
 *
 * Bible Brain docs: content availability varies — always validate against the API,
 * never assume a BibleId exists just because we listed it.
 */

import { getLangConfig } from '@/config/languages';
import { base44 } from '@/api/base44Client';

// Module-level cache so we don't re-fetch within a session
const resolvedCache = {};

/**
 * Resolve the best available BibleId for a language.
 * Returns the first preferred BibleId that is confirmed available,
 * or null if none work.
 */
export async function resolveBibleIdForLanguage(lang) {
  if (resolvedCache[lang] !== undefined) return resolvedCache[lang];

  const config = getLangConfig(lang);
  const { preferredBibleIds, bibleBrainLanguageCode } = config;

  // Try each preferred ID by fetching a known short verse (John 3:16 = JHN 3:16)
  for (const bibleId of preferredBibleIds) {
    try {
      const res = await base44.functions.invoke('bibleBrainAPI', {
        action: 'validateBibleId',
        bibleId,
        lang,
      });
      if (res?.data?.available) {
        resolvedCache[lang] = bibleId;
        return bibleId;
      }
    } catch {
      // try next
    }
  }

  resolvedCache[lang] = null;
  return null;
}

/**
 * Check if Bible text is available for a language.
 * Returns { available: boolean, bibleId: string|null }
 */
export async function checkBibleAvailability(lang) {
  const bibleId = await resolveBibleIdForLanguage(lang);
  return { available: !!bibleId, bibleId };
}

/** Clear the cache (call when language config changes) */
export function clearResolverCache() {
  Object.keys(resolvedCache).forEach(k => delete resolvedCache[k]);
}