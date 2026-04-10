/**
 * FaithLight — Single Source of Truth for Bible Brain Configuration
 *
 * DO NOT scatter Bible IDs or fileset IDs across other files.
 * All components should import from here.
 *
 * Verified IDs marked with ✅. Unverified marked with ❌.
 * Never enable a language unless textFilesetId / audioFilesetId are confirmed.
 */

// ─── Core Config ────────────────────────────────────────────────────────────

export const BIBLE_BRAIN_CONFIG = {
  en: {
    label: "English",
    nativeName: "English",
    languageCode: "eng",
    direction: "ltr",
    // ✅ Verified
    textBibleId: "ENGESV",
    textFilesetId: "ENGESVN2ET",
    ntAudioFilesetId: "ENGESVN2DA",
    otAudioFilesetId: "ENGESVO2DA",
    hasOTText: true,
    hasNTText: true,
    hasOTAudio: true,
    hasNTAudio: true,
    textEnabled: true,
    audioEnabled: true,
  },

  om_eastern: {
    label: "Afaan Oromoo (Bahaa)",
    nativeName: "Afaan Oromoo (Bahaa)",
    languageCode: "hae",
    direction: "ltr",
    // ✅ Verified
    textBibleId: "HAEBSE",
    textFilesetId: "HAEBSEN_ET-json",
    ntAudioFilesetId: "HAEBSEN2SA",
    otAudioFilesetId: null,
    hasOTText: false,
    hasNTText: true,
    hasOTAudio: false,
    hasNTAudio: true,
    textEnabled: true,
    audioEnabled: true,
  },

  om_west_central: {
    label: "Afaan Oromoo (Lixaa Giddugaleessa)",
    nativeName: "Afaan Oromoo (Lixaa)",
    languageCode: "gaz",
    direction: "ltr",
    // ✅ Verified
    textBibleId: "GAZBIB",
    textFilesetId: "GAZBIBN_ET-json",
    ntAudioFilesetId: "GAZBIBN1DA",
    otAudioFilesetId: "GAZBIBO1DA",
    hasOTText: false,
    hasNTText: true,
    hasOTAudio: true,
    hasNTAudio: true,
    textEnabled: true,
    audioEnabled: true,
  },

  am: {
    label: "አማርኛ",
    nativeName: "አማርኛ",
    languageCode: "amh",
    direction: "ltr",
    // ❌ Unverified — real Bible Brain IDs needed before enabling
    textBibleId: null,
    textFilesetId: null,
    ntAudioFilesetId: null,
    otAudioFilesetId: null,
    hasOTText: false,
    hasNTText: false,
    hasOTAudio: false,
    hasNTAudio: false,
    textEnabled: false,
    audioEnabled: false,
  },

  ar: {
    label: "العربية",
    nativeName: "العربية",
    languageCode: "arb",
    direction: "rtl",
    // ❌ Not wired yet
    textBibleId: null,
    textFilesetId: null,
    ntAudioFilesetId: null,
    otAudioFilesetId: null,
    hasOTText: false,
    hasNTText: false,
    hasOTAudio: false,
    hasNTAudio: false,
    textEnabled: false,
    audioEnabled: false,
  },

  sw: {
    label: "Kiswahili",
    nativeName: "Kiswahili",
    languageCode: "swh",
    direction: "ltr",
    // ❌ Not wired yet
    textBibleId: null,
    textFilesetId: null,
    ntAudioFilesetId: null,
    otAudioFilesetId: null,
    hasOTText: false,
    hasNTText: false,
    hasOTAudio: false,
    hasNTAudio: false,
    textEnabled: false,
    audioEnabled: false,
  },

  fr: {
    label: "Français",
    nativeName: "Français",
    languageCode: "fra",
    direction: "ltr",
    // ❌ Not wired yet
    textBibleId: null,
    textFilesetId: null,
    ntAudioFilesetId: null,
    otAudioFilesetId: null,
    hasOTText: false,
    hasNTText: false,
    hasOTAudio: false,
    hasNTAudio: false,
    textEnabled: false,
    audioEnabled: false,
  },

  ti: {
    label: "ትግርኛ",
    nativeName: "ትግርኛ",
    languageCode: "tir",
    direction: "ltr",
    // ❌ Not wired yet
    textBibleId: null,
    textFilesetId: null,
    ntAudioFilesetId: null,
    otAudioFilesetId: null,
    hasOTText: false,
    hasNTText: false,
    hasOTAudio: false,
    hasNTAudio: false,
    textEnabled: false,
    audioEnabled: false,
  },
};

// ─── Language Resolver ───────────────────────────────────────────────────────

/**
 * Resolve any app language code to a BIBLE_BRAIN_CONFIG key.
 * This is the single resolver all pages should use.
 *
 * @param {string} appLanguage - e.g. "en", "om", "hae", "gaz", "am"
 * @returns {string} key into BIBLE_BRAIN_CONFIG
 */
export function resolveBibleLanguage(appLanguage) {
  switch (appLanguage) {
    case "hae":
    case "om_eastern":
      return "om_eastern";
    case "gaz":
    case "om":
    case "om_west_central":
      return "om_west_central";
    case "am":
      return "am";
    case "ar":
      return "ar";
    case "sw":
      return "sw";
    case "fr":
      return "fr";
    case "ti":
    case "tigrigna":
    case "tigirgna":
      return "ti";
    default:
      return "en";
  }
}

/**
 * Get the full config for a given app language.
 * Always returns a valid config (falls back to English).
 *
 * @param {string} appLanguage
 * @returns {object}
 */
export function getBibleConfig(appLanguage) {
  const key = resolveBibleLanguage(appLanguage);
  return BIBLE_BRAIN_CONFIG[key] || BIBLE_BRAIN_CONFIG.en;
}

// ─── OT / NT Helpers ─────────────────────────────────────────────────────────

const OT_BOOKS = new Set([
  "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT",
  "1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH",
  "EST","JOB","PSA","PRO","ECC","SNG","ISA","JER",
  "LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON",
  "MIC","NAH","HAB","ZEP","HAG","ZEC","MAL",
]);

export function isOldTestament(bookId) {
  return OT_BOOKS.has((bookId || "").toUpperCase());
}

/**
 * Get the correct audio fileset for a given language + book.
 * Returns null if audio is not available.
 *
 * @param {string} appLanguage
 * @param {string} bookId - e.g. "PSA", "JHN"
 * @returns {string|null}
 */
export function getAudioFilesetId(appLanguage, bookId) {
  const config = getBibleConfig(appLanguage);
  if (!config.audioEnabled) return null;
  if (isOldTestament(bookId)) {
    return config.otAudioFilesetId || null;
  }
  return config.ntAudioFilesetId || null;
}

/**
 * Check whether text reading is available for a language + book.
 *
 * @param {string} appLanguage
 * @param {string} bookId
 * @returns {boolean}
 */
export function isTextAvailable(appLanguage, bookId) {
  const config = getBibleConfig(appLanguage);
  if (!config.textEnabled || !config.textFilesetId) return false;
  return isOldTestament(bookId) ? config.hasOTText : config.hasNTText;
}

/**
 * Check whether audio is available for a language + book.
 *
 * @param {string} appLanguage
 * @param {string} bookId
 * @returns {boolean}
 */
export function isAudioAvailable(appLanguage, bookId) {
  const config = getBibleConfig(appLanguage);
  if (!config.audioEnabled) return false;
  if (isOldTestament(bookId)) return config.hasOTAudio;
  return config.hasNTAudio;
}

// ─── Unavailability Messages ─────────────────────────────────────────────────

/**
 * Localized messages shown when Bible content is unavailable.
 * Never fall back silently to English content.
 */
export const UNAVAILABLE_MESSAGES = {
  en:             "This chapter is not available in the selected language.",
  om_eastern:     "Boqonnaan kun afaan filatameen hin argamne.",
  om_west_central:"Boqonnaan kun afaan filatameen hin argamne.",
  am:             "ይህ ምዕራፍ በተመረጠው ቋንቋ አይገኝም።",
  ar:             "هذا الأصحاح غير متوفر باللغة المحددة.",
  sw:             "Sura hii haipatikani kwa lugha iliyochaguliwa.",
  fr:             "Ce chapitre n'est pas disponible dans la langue sélectionnée.",
  ti:             "እዚ ምዕራፍ በዝተመረጸ ቋንቋ ኣይርከብን።",
};

/**
 * Get the localized unavailability message for a given app language.
 *
 * @param {string} appLanguage
 * @returns {string}
 */
export function getUnavailableMessage(appLanguage) {
  const key = resolveBibleLanguage(appLanguage);
  return UNAVAILABLE_MESSAGES[key] || UNAVAILABLE_MESSAGES.en;
}

export default BIBLE_BRAIN_CONFIG;