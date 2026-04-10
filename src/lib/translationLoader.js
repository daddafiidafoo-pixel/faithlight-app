import { base44 } from '@/api/base44Client';

// Cache for translations
let translationCache = {};

/**
 * Load all translations for a specific language
 */
export async function loadTranslations(languageCode) {
  if (translationCache[languageCode]) {
    return translationCache[languageCode];
  }

  try {
    const records = await base44.entities.Translation.filter(
      { language_code: languageCode },
      undefined,
      1000
    );
    
    const translations = {};
    records.forEach(record => {
      translations[record.key] = record.text;
    });
    
    translationCache[languageCode] = translations;
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for ${languageCode}:`, error);
    return {};
  }
}

/**
 * Get a single translation string
 */
export async function getTranslation(key, languageCode, fallback = key) {
  const translations = await loadTranslations(languageCode);
  return translations[key] || fallback;
}

/**
 * Clear the cache (useful for testing)
 */
export function clearTranslationCache() {
  translationCache = {};
}