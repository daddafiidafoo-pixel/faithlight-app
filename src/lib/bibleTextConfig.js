/**
 * Bible Text Configuration
 * Single source of truth for supported reading languages and their Bible text sources
 */

export const BIBLE_TEXT_CONFIG = {
  en: {
    label: "English",
    nativeName: "English",
    languageCode: "eng",
    bibleId: "ENGESV",
    textFilesetId: "ENGESVN2ET",
    hasOT: true,
    hasNT: true,
  },

  om_eastern: {
    label: "Afaan Oromoo (Bahaa)",
    nativeName: "Afaan Oromoo (Bahaa)",
    languageCode: "hae",
    bibleId: "HAEBSE",
    textFilesetId: "HAEBSEN_ET-json",
    hasOT: false,
    hasNT: true,
  },

  om_west_central: {
    label: "Afaan Oromoo (Lixaa Giddugaleessa)",
    nativeName: "Afaan Oromoo (Lixaa)",
    languageCode: "gaz",
    bibleId: "GAZBIB",
    textFilesetId: "GAZBIBN_ET-json",
    hasOT: false,
    hasNT: true,
  },

  // These are placeholders — fill in real Bible IDs/filesets when text sources are confirmed
  am: {
    label: "አማርኛ",
    nativeName: "Amharic",
    languageCode: "am",
    bibleId: null,
    textFilesetId: null,
    hasOT: false,
    hasNT: false,
  },

  ar: {
    label: "العربية",
    nativeName: "Arabic",
    languageCode: "ar",
    bibleId: null,
    textFilesetId: null,
    hasOT: false,
    hasNT: false,
  },

  sw: {
    label: "Kiswahili",
    nativeName: "Swahili",
    languageCode: "sw",
    bibleId: null,
    textFilesetId: null,
    hasOT: false,
    hasNT: false,
  },

  fr: {
    label: "Français",
    nativeName: "French",
    languageCode: "fr",
    bibleId: null,
    textFilesetId: null,
    hasOT: false,
    hasNT: false,
  },

  ti: {
    label: "ትግርኛ",
    nativeName: "Tigrigna",
    languageCode: "ti",
    bibleId: null,
    textFilesetId: null,
    hasOT: false,
    hasNT: false,
  },
};

/**
 * Resolve app language to reader language
 * Maps app language codes to normalized reader language codes
 */
export function resolveReaderLanguage(appLanguage) {
  switch (appLanguage) {
    case "om_eastern":
    case "hae":
      return "om_eastern";
    case "om_west_central":
    case "gaz":
    case "om":
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
 * Check if a book is Old Testament
 */
export function isOldTestament(bookId) {
  const otBooks = new Set([
    "GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT",
    "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH",
    "EST", "JOB", "PSA", "PRO", "ECC", "SNG", "ISA", "JER",
    "LAM", "EZK", "DAN", "HOS", "JOL", "AMO", "OBA", "JON",
    "MIC", "NAH", "HAB", "ZEP", "HAG", "ZEC", "MAL"
  ]);
  return otBooks.has((bookId || "").toUpperCase());
}

/**
 * Get available reading languages for a specific book
 * Only returns languages with text for that testament
 */
export function getAvailableReadingLanguages(bookId) {
  const isOT = isOldTestament(bookId);

  return Object.entries(BIBLE_TEXT_CONFIG)
    .filter(([, cfg]) => {
      if (!cfg.textFilesetId) return false;
      return isOT ? cfg.hasOT : cfg.hasNT;
    })
    .map(([key, cfg]) => ({
      value: key,
      label: cfg.label,
    }));
}

/**
 * Resolve best reading language with smart fallback
 * If the requested language doesn't have text for the book,
 * fall back within Oromo variants if possible
 */
export function resolveBestReadingLanguage(appLanguage, bookId) {
  const requested = resolveReaderLanguage(appLanguage);
  const isOT = isOldTestament(bookId);

  // Check if requested language has text for this testament
  const requestedCfg = BIBLE_TEXT_CONFIG[requested];
  if (requestedCfg && requestedCfg.textFilesetId) {
    if (isOT ? requestedCfg.hasOT : requestedCfg.hasNT) {
      return requested;
    }
  }

  // Smart fallback: within Oromo variants only
  if (requested === "om_eastern" && !BIBLE_TEXT_CONFIG.om_eastern.hasOT && isOT) {
    if (BIBLE_TEXT_CONFIG.om_west_central.hasOT) {
      return "om_west_central";
    }
  }

  return requested;
}

/**
 * User-friendly error messages for unavailable chapters
 */
export const CHAPTER_UNAVAILABLE_MESSAGES = {
  en: "This chapter is not available in the selected language.",
  om_eastern: "Boqonnaan kun afaan filatameen hin argamne.",
  om_west_central: "Boqonnaan kun afaan filatameen hin argamne.",
  am: "ይህ ምዕራፍ በተመረጠው ቋንቋ አይገኝም።",
  ar: "هذا الأصحاح غير متوفر باللغة المحددة.",
  sw: "Sura hii haipatikani kwa lugha iliyochaguliwa.",
  fr: "Ce chapitre n'est pas disponible dans la langue sélectionnée.",
  ti: "እዚ ምዕራፍ በዝተመረጸ ቋንቋ ኣይርከብን።",
};