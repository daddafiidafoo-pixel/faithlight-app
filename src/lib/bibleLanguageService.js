import { base44 } from '@/api/base44Client';

// Cache for BibleLanguage records
let _bibleLanguagesCache = null;

/**
 * Get all available Bible languages with caching
 */
export async function getBibleLanguages() {
  if (_bibleLanguagesCache) return _bibleLanguagesCache;
  
  const results = await base44.entities.BibleLanguage.filter({ is_active: true });
  _bibleLanguagesCache = results.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  return _bibleLanguagesCache;
}

/**
 * Get Bible language config by language_code
 * Returns { language_code, bible_id, audio_fileset_id, is_rtl, ... }
 */
export async function getBibleLanguageConfig(languageCode) {
  const languages = await getBibleLanguages();
  return languages.find(l => l.language_code === languageCode) || null;
}

/**
 * Resolve language_code to bible_id
 * Returns empty string if not available
 */
export async function resolveBibleId(languageCode) {
  const config = await getBibleLanguageConfig(languageCode);
  return config?.bible_id || '';
}

/**
 * Resolve language_code to audio_fileset_id
 * Returns empty string if not available
 */
export async function resolveAudioFilesetId(languageCode) {
  const config = await getBibleLanguageConfig(languageCode);
  return config?.audio_fileset_id || '';
}

/**
 * Check if a language has Bible content available
 */
export async function isBibleAvailableForLanguage(languageCode) {
  const bibleId = await resolveBibleId(languageCode);
  return !!bibleId;
}

/**
 * Clear cache (call when languages updated)
 */
export function clearBibleLanguagesCache() {
  _bibleLanguagesCache = null;
}