import { base44 } from '@/api/base44Client';

/**
 * Language availability cache with 1-hour TTL
 */
const availabilityCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * All supported languages (whether data is loaded or not)
 */
export const ALL_LANGUAGES = {
  en: { name: 'English', native: 'English', order: 1 },
  om: { name: 'Afaan Oromoo', native: 'Afaan Oromoo', order: 2 },
  am: { name: 'Amharic', native: 'አማርኛ', order: 3 },
  sw: { name: 'Swahili', native: 'Kiswahili', order: 4 },
  fr: { name: 'French', native: 'Français', order: 5 },
  ti: { name: 'Tigrinya', native: 'ትግርኛ', order: 6 },
  ar: { name: 'Arabic', native: 'العربية', order: 7 },
};

/**
 * Check if a language has Bible data loaded and ready
 * Returns: { available: boolean, verseCount: number, message: string }
 */
export async function isBibleLanguageReady(languageCode) {
  // Check cache first
  const cached = availabilityCache.get(languageCode);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Quick count check: see if language has verses
    const verses = await base44.entities.BibleVerseText.filter(
      { language_code: languageCode },
      null,
      1 // Just need 1 record to verify existence
    );

    const available = verses && verses.length > 0;
    const result = {
      available,
      languageCode,
      message: available
        ? `${languageCode} Bible data is available`
        : `${languageCode} Bible data is not yet loaded`,
    };

    // Cache the result
    availabilityCache.set(languageCode, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    console.error(`Error checking ${languageCode} availability:`, error);
    return {
      available: false,
      languageCode,
      message: `Error checking ${languageCode}: ${error.message}`,
    };
  }
}

/**
 * Get all available languages (filters out unavailable ones)
 * Returns array of { code, name, native }
 */
export async function getAvailableLanguages() {
  const checks = await Promise.all(
    Object.entries(ALL_LANGUAGES).map(async ([code, info]) => {
      const ready = await isBibleLanguageReady(code);
      return {
        code,
        ...info,
        available: ready.available,
      };
    })
  );

  return checks
    .filter(l => l.available)
    .sort((a, b) => a.order - b.order);
}

/**
 * Clear the availability cache (run after importing new language)
 */
export function clearLanguageCache() {
  availabilityCache.clear();
}

/**
 * Get language info by code
 */
export function getLanguageInfo(code) {
  return ALL_LANGUAGES[code] || null;
}

/**
 * Format language for dropdown display
 */
export function formatLanguageOption(code) {
  const info = getLanguageInfo(code);
  if (!info) return code;
  return `${info.native} (${info.name})`;
}