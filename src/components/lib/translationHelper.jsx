/**
 * Global Translation Helper
 * Ensures consistent language usage across entire app
 * If translation missing → fallback to English
 */

let currentLanguage = 'en';

export function setGlobalLanguage(lang) {
  currentLanguage = lang;
}

export function getGlobalLanguage() {
  return currentLanguage;
}

/**
 * Universal translation function
 * @param {Record<string, string>} labels - Object with language keys (e.g., { en: "Read Bible", om: "Macaafa Qulqulluu Dubbisi" })
 * @returns {string} Translated string in current language, falls back to English
 */
export function t(labels) {
  if (!labels) return '';
  
  // Handle objects with nested structure
  if (typeof labels === 'object' && !Array.isArray(labels)) {
    const translation = labels[currentLanguage] || labels['en'] || '';
    return translation;
  }
  
  return String(labels);
}