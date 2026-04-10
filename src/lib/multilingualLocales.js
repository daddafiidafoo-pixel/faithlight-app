/**
 * Multilingual Localization Helper
 * Centralized access to all reviewed locale files
 * 
 * CRITICAL RULE: Never use Bible verse text from locale files
 * Bible verses come ONLY from Bible Brain or licensed Bible datasets
 */

import amharicStrings from '@/locales/am.json';
import arabicStrings from '@/locales/ar.json';
import tigrignaStrings from '@/locales/ti.json';
import frenchStrings from '@/locales/fr.json';
import oromoStrings from '@/locales/om.json';

const LOCALE_MAP = {
  am: amharicStrings,
  ar: arabicStrings,
  ti: tigrignaStrings,
  fr: frenchStrings,
  om: oromoStrings,
};

const SUPPORTED_LANGUAGES = {
  am: { name: 'Amharic', native: 'አማርኛ', isRTL: false },
  ar: { name: 'Arabic', native: 'العربية', isRTL: true },
  ti: { name: 'Tigrigna', native: 'ትግርኛ', isRTL: false },
  fr: { name: 'French', native: 'Français', isRTL: false },
  om: { name: 'Oromo', native: 'Afaan Oromoo', isRTL: false },
};

/**
 * Get a translation string by key path and language
 * e.g., getLocaleString('am', 'home.verseOfDay')
 * 
 * Falls back to English if key is missing (with console warning)
 */
export function getLocaleString(languageCode, keyPath, defaultFallback = null) {
  if (!LOCALE_MAP[languageCode]) {
    console.warn(`[MultilingualLocales] Unknown language: ${languageCode}`);
    return defaultFallback || keyPath;
  }

  const strings = LOCALE_MAP[languageCode];
  const keys = keyPath.split('.');
  let value = strings;

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      console.warn(`[MultilingualLocales] Missing translation key for ${languageCode}: ${keyPath}`);
      return defaultFallback || keyPath;
    }
  }

  return value || defaultFallback || keyPath;
}

/**
 * Get entire section of translations for a language
 * e.g., getLocaleSection('am', 'bible') returns all bible.* strings
 */
export function getLocaleSection(languageCode, section) {
  if (!LOCALE_MAP[languageCode]) {
    console.warn(`[MultilingualLocales] Unknown language: ${languageCode}`);
    return {};
  }
  return LOCALE_MAP[languageCode][section] || {};
}

/**
 * Check if a translation key exists in a language
 */
export function hasLocaleString(languageCode, keyPath) {
  if (!LOCALE_MAP[languageCode]) {
    return false;
  }

  const strings = LOCALE_MAP[languageCode];
  const keys = keyPath.split('.');
  let value = strings;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Get language metadata (name, RTL status, etc.)
 */
export function getLanguageInfo(languageCode) {
  return SUPPORTED_LANGUAGES[languageCode] || null;
}

/**
 * Check if language uses RTL (Right-to-Left) layout
 */
export function isLanguageRTL(languageCode) {
  const info = getLanguageInfo(languageCode);
  return info?.isRTL || false;
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages() {
  return Object.keys(SUPPORTED_LANGUAGES).map(code => ({
    code,
    ...SUPPORTED_LANGUAGES[code],
  }));
}

/**
 * Export raw strings for direct reference
 */
export const LOCALES = LOCALE_MAP;

export default LOCALE_MAP;