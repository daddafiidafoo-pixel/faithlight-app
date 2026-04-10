/**
 * Bible Language Configuration
 * 
 * IMPORTANT: Do not guess audio fileset IDs
 * Text and audio filesets are separate in Bible Brain
 * Only enable features for verified, confirmed fileset IDs
 * 
 * Verified Sources:
 * - HAEBSE (Oromo text) confirmed on Bible.is
 * - Audio fileset IDs must be looked up via Bible Brain API
 */

export const BIBLE_LANG_CONFIG = {
  en: {
    source: "biblebrain",
    textFilesetId: "ENGESV",
    audioFilesetId: "ENGESVN2DA",
    enabledText: true,
    enabledAudio: true,
    displayName: "English",
    nativeName: "English",
    direction: "ltr",
  },
  // Eastern Oromo — ISO 639-3: hae
  hae: {
    source: "biblebrain",
    textFilesetId: "HAEBSEN_ET-json",
    audioFilesetId: "HAEBSEN2SA",
    enabledText: true,
    enabledAudio: true,
    displayName: "Afaan Oromoo (Eastern)",
    nativeName: "Afaan Oromoo (Bahaa)",
    direction: "ltr",
  },
  // West Central Oromo — ISO 639-3: gaz
  gaz: {
    source: "biblebrain",
    textFilesetId: "GAZBIBN_ET-json",
    audioFilesetId: "GAZBIBN1DA",
    enabledText: true,
    enabledAudio: true,
    displayName: "Afaan Oromoo (West Central)",
    nativeName: "Afaan Oromoo (Lixaa Giddugaleessa)",
    direction: "ltr",
  },
  // Legacy om — resolves to West Central Oromo (gaz)
  om: {
    source: "biblebrain",
    textFilesetId: "GAZBIBN_ET-json",
    audioFilesetId: "GAZBIBN1DA",
    enabledText: true,
    enabledAudio: true,
    displayName: "Afaan Oromoo",
    nativeName: "Afaan Oromoo",
    direction: "ltr",
    note: "Legacy code — resolves to West Central Oromo (gaz)",
  },
  am: {
    source: "biblebrain",
    textFilesetId: null,
    audioFilesetId: null,
    enabledText: false,
    enabledAudio: false,
    displayName: "Amharic",
    nativeName: "አማርኛ",
    direction: "ltr",
    note: "Requires Bible Brain lookup for verified fileset IDs",
  },
  sw: {
    source: "biblebrain",
    textFilesetId: null,
    audioFilesetId: null,
    enabledText: false,
    enabledAudio: false,
    displayName: "Swahili",
    nativeName: "Kiswahili",
    direction: "ltr",
    note: "Requires Bible Brain lookup for verified fileset IDs",
  },
  ti: {
    source: "biblebrain",
    textFilesetId: null,
    audioFilesetId: null,
    enabledText: false,
    enabledAudio: false,
    displayName: "Tigrinya",
    nativeName: "ትግርኛ",
    direction: "ltr",
    note: "Requires Bible Brain lookup for verified fileset IDs",
  },
  ar: {
    source: "biblebrain",
    textFilesetId: null,
    audioFilesetId: null,
    enabledText: false,
    enabledAudio: false,
    displayName: "Arabic",
    nativeName: "العربية",
    direction: "rtl",
    note: "Requires Bible Brain lookup for verified fileset IDs",
  },
};

/**
 * Get config for a language
 * @param {string} langCode - Language code (en, om, am, sw, ti, ar)
 * @returns {object} Language config or null if not found
 */
export function getBibleLangConfig(langCode) {
  return BIBLE_LANG_CONFIG[langCode] || null;
}

/**
 * Check if text is enabled for language
 * @param {string} langCode
 * @returns {boolean}
 */
export function isTextEnabled(langCode) {
  const config = getBibleLangConfig(langCode);
  return config?.enabledText === true && config?.textFilesetId !== null;
}

/**
 * Check if audio is enabled and verified
 * @param {string} langCode
 * @returns {boolean}
 */
export function isAudioEnabled(langCode) {
  const config = getBibleLangConfig(langCode);
  return config?.enabledAudio === true && config?.audioFilesetId !== null;
}

/**
 * List all languages with text available
 * @returns {array} Array of language codes with verified text
 */
export function getLanguagesWithText() {
  return Object.entries(BIBLE_LANG_CONFIG)
    .filter(([_, config]) => config.enabledText && config.textFilesetId)
    .map(([code, _]) => code);
}

/**
 * List all languages with audio available
 * @returns {array} Array of language codes with verified audio
 */
export function getLanguagesWithAudio() {
  return Object.entries(BIBLE_LANG_CONFIG)
    .filter(([_, config]) => config.enabledAudio && config.audioFilesetId)
    .map(([code, _]) => code);
}