/**
 * Centralized language configuration
 * Maps language codes to UI/Bible availability and sources
 */

export const LANGUAGE_CONFIG = {
  en: {
    code: 'en',
    displayName: 'English',
    nativeName: 'English',
    uiAvailable: true,
    bibleAvailable: true,
    bibleId: 'ENGESV', // English Standard Version
    bibleAudioFileset: 'ENGESVN2DA',
    fallbackLanguage: null,
  },
  hae: {
    code: 'hae',
    displayName: 'Afaan Oromoo (Eastern)',
    nativeName: 'Afaan Oromoo (Bahaa)',
    uiAvailable: true,
    bibleAvailable: true,
    bibleId: 'HAEBSE',
    bibleAudioFileset: 'HAEBSEN2SA',
    fallbackLanguage: 'en',
  },
  gaz: {
    code: 'gaz',
    displayName: 'Afaan Oromoo (West Central)',
    nativeName: 'Afaan Oromoo (Lixaa Giddugaleessa)',
    uiAvailable: true,
    bibleAvailable: true,
    bibleId: 'GAZBIB',
    bibleAudioFileset: 'GAZBIBN1DA',
    fallbackLanguage: 'en',
  },
  om: {
    code: 'om',
    displayName: 'Afaan Oromoo',
    nativeName: 'Afaan Oromoo',
    uiAvailable: true,
    bibleAvailable: true,
    bibleId: 'GAZBIB', // legacy — resolves to West Central Oromo
    bibleAudioFileset: 'GAZBIBN1DA',
    fallbackLanguage: 'en',
  },
  am: {
    code: 'am',
    displayName: 'Amharic',
    nativeName: 'አማርኛ',
    uiAvailable: true,
    bibleAvailable: true,
    bibleId: 'AMHENTA', // Amharic Bible
    bibleAudioFileset: null,
    fallbackLanguage: 'en',
  },
  ti: {
    code: 'ti',
    displayName: 'Tigrinya',
    nativeName: 'ትግርኛ',
    uiAvailable: true,
    bibleAvailable: false, // No Tigrinya Bible source yet
    bibleId: null,
    bibleAudioFileset: null,
    fallbackLanguage: 'en',
  },
  ar: {
    code: 'ar',
    displayName: 'Arabic',
    nativeName: 'العربية',
    uiAvailable: true,
    bibleAvailable: true,
    bibleId: 'ARBNAV', // Arabic Bible
    bibleAudioFileset: null,
    fallbackLanguage: 'en',
  },
  sw: {
    code: 'sw',
    displayName: 'Swahili',
    nativeName: 'Kiswahili',
    uiAvailable: true,
    bibleAvailable: true,
    bibleId: 'SWAHILI', // Swahili Bible
    bibleAudioFileset: null,
    fallbackLanguage: 'en',
  },
  fr: {
    code: 'fr',
    displayName: 'French',
    nativeName: 'Français',
    uiAvailable: true,
    bibleAvailable: true,
    bibleId: 'FREFBJ', // French Bible
    bibleAudioFileset: null,
    fallbackLanguage: 'en',
  },
};

/**
 * Get language config by code.
 * Legacy 'om' code is supported and resolves to West Central Oromo (gaz).
 */
export function getLanguageConfig(code) {
  return LANGUAGE_CONFIG[code] || LANGUAGE_CONFIG.en;
}

/**
 * Get all languages with UI support
 */
export function getUILanguages() {
  return Object.values(LANGUAGE_CONFIG).filter(lang => lang.uiAvailable);
}

/**
 * Get all languages with Bible support
 */
export function getBibleLanguages() {
  return Object.values(LANGUAGE_CONFIG).filter(lang => lang.bibleAvailable);
}

/**
 * Check if Bible is available for a language
 */
export function isBibleAvailable(languageCode) {
  const config = getLanguageConfig(languageCode);
  return config.bibleAvailable && config.bibleId;
}

/**
 * Get the Bible ID for a language, with fallback
 */
export function getBibleIdForLanguage(languageCode) {
  const config = getLanguageConfig(languageCode);
  
  if (config.bibleAvailable && config.bibleId) {
    return config.bibleId;
  }
  
  // Fall back to fallback language
  if (config.fallbackLanguage) {
    const fallbackConfig = getLanguageConfig(config.fallbackLanguage);
    return fallbackConfig.bibleId || null;
  }
  
  return null;
}

/**
 * Get actual Bible language that will be used (may differ from requested).
 * om_eastern → hae, om_west_central → gaz, om → gaz (legacy fallback)
 */
export function getActualBibleLanguage(requestedLanguage) {
  // Handle variant aliases
  if (requestedLanguage === 'om_eastern') return 'hae';
  if (requestedLanguage === 'om_west_central') return 'gaz';

  const config = getLanguageConfig(requestedLanguage);

  if (config.bibleAvailable && config.bibleId) {
    return requestedLanguage;
  }

  if (config.fallbackLanguage) {
    return config.fallbackLanguage;
  }

  return 'en'; // Ultimate fallback
}