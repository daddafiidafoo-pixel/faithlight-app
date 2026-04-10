/**
 * Safe language switching with persistence only for valid languages
 * Prevents broken saved states and ensures feature-aware language handling
 */

const VALID_LANGUAGES = {
  en: { ui: true, bible: true, audio: true },
  om: { ui: true, bible: true, audio: false }, // Oromo has no audio
  am: { ui: true, bible: false, audio: false },
  sw: { ui: true, bible: false, audio: false },
  ar: { ui: true, bible: false, audio: false },
  fr: { ui: true, bible: false, audio: false },
};

/**
 * Check if a language is valid for a specific feature
 */
export function isLanguageValidFor(language, feature) {
  const config = VALID_LANGUAGES[language];
  if (!config) return false;
  
  switch (feature) {
    case 'ui':
      return config.ui === true;
    case 'bible':
      return config.bible === true;
    case 'audio':
      return config.audio === true;
    default:
      return config.ui === true;
  }
}

/**
 * Safe language initialization - only persist valid languages
 */
export function getSafeLanguage(savedLanguage, feature = 'ui', fallback = 'en') {
  // If saved language is valid for this feature, use it
  if (savedLanguage && isLanguageValidFor(savedLanguage, feature)) {
    return savedLanguage;
  }
  
  // Otherwise, fallback
  return fallback;
}

/**
 * Save language only if it's valid for the feature
 */
export function persistLanguageIfValid(language, feature, key) {
  if (isLanguageValidFor(language, feature)) {
    try {
      localStorage.setItem(key, language);
      return true;
    } catch (err) {
      console.error('Failed to persist language:', err);
    }
  }
  return false;
}

/**
 * Get unavailable message for a language/feature combination
 */
export function getUnavailableMessage(language, feature, uiLanguage = 'en') {
  const messages = {
    om: {
      audio: 'Sagaleen boqonnaa kanaaf Afaan Oromootiin amma hin jiru.',
      bible: 'Macaafa Qulqulluu Afaan Oromootiin amma hin argamu.',
    },
    am: {
      audio: 'ኦዲዮ ይህ ቋንቋ አገልግሎት አይሰጠም።',
      bible: 'ሂወት ይህ ቋንቋ ገና ስልች አልተገኘም።',
    },
  };

  return messages[language]?.[feature] || `${feature} not available for this language`;
}

/**
 * Keep verse reference when switching language
 * Returns { bookId, chapter, verse }
 */
export function preserveVerseReference(currentReference) {
  if (!currentReference) return null;
  
  // Parse reference like "John 3:16" or "Yohaannis 3:16"
  const match = currentReference.match(/(\w+)\s+(\d+)(?::(\d+))?/);
  if (!match) return null;
  
  return {
    bookName: match[1],
    chapter: parseInt(match[2]),
    verse: match[3] ? parseInt(match[3]) : null,
  };
}

/**
 * Clear stale content when language changes
 */
export function clearStaleContent(features) {
  const cleared = {};
  
  features.forEach(feature => {
    switch (feature) {
      case 'verse':
        cleared.verse = null;
        cleared.verseLoading = true;
        break;
      case 'audio':
        cleared.isPlaying = false;
        cleared.currentTrack = null;
        break;
      case 'labels':
        // UI labels will naturally re-render with new language
        break;
      default:
        break;
    }
  });
  
  return cleared;
}