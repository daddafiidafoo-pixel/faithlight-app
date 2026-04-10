import languagePack from './languagePack.json';

/**
 * Get a translated string from the language pack
 * @param {string} path - Dot notation path (e.g., "quiz.startQuiz")
 * @param {string} lang - Language code (en, om, am, ar, sw, fr)
 * @returns {string} Translated text
 */
export function t(path, lang = 'en') {
  try {
    const keys = path.split('.');
    let value = languagePack;
    
    for (const key of keys) {
      value = value[key];
      if (!value) return path; // Fallback to path if not found
    }
    
    return value[lang] || value.en || path;
  } catch {
    return path; // Fallback to path on error
  }
}

/**
 * Get all translations for a key across all languages
 * @param {string} path - Dot notation path
 * @returns {object} Object with language codes as keys
 */
export function getAll(path) {
  try {
    const keys = path.split('.');
    let value = languagePack;
    
    for (const key of keys) {
      value = value[key];
      if (!value) return {};
    }
    
    return value;
  } catch {
    return {};
  }
}

/**
 * Check if a translation key exists
 * @param {string} path - Dot notation path
 * @returns {boolean}
 */
export function exists(path) {
  try {
    const keys = path.split('.');
    let value = languagePack;
    
    for (const key of keys) {
      if (!value[key]) return false;
      value = value[key];
    }
    
    return true;
  } catch {
    return false;
  }
}

export default { t, getAll, exists };