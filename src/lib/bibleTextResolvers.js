/**
 * Unified Bible text and language resolution for Bible Reader, Search, and Audio
 * Single source of truth for all language and text availability logic
 */

export const OLD_TESTAMENT_BOOKS = new Set([
  "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT",
  "1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH",
  "EST","JOB","PSA","PRO","ECC","SNG","ISA","JER",
  "LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON",
  "MIC","NAM","HAB","ZEP","HAG","ZEC","MAL"
]);

export function isOldTestament(bookId) {
  return OLD_TESTAMENT_BOOKS.has((bookId || "").toUpperCase());
}

/**
 * Resolve app language code (hae, gaz, om, en, etc.) to reader language
 */
export function resolveReaderLanguage(appLanguage) {
  switch (appLanguage) {
    case "hae":
    case "om_eastern":
      return "om_eastern";

    case "gaz":
    case "om_west_central":
    case "om":
      return "om_west_central";

    case "am":
    case "ar":
    case "sw":
    case "fr":
    case "ti":
    case "en":
      return appLanguage;

    default:
      return "en";
  }
}

/**
 * Bible text configuration - single source of truth
 * Defines which languages have OT/NT coverage
 */
export const BIBLE_TEXT_CONFIG = {
  en: {
    label: "English",
    languageCode: "eng",
    bibleId: "ENGESV",
    textFilesetId: "ENGESV",
    hasOT: true,
    hasNT: true,
  },

  om_eastern: {
    label: "Afaan Oromoo (Bahaa)",
    languageCode: "hae",
    bibleId: "HAEBSE",
    textFilesetId: "HAEBSEN_ET-json",
    hasOT: false,
    hasNT: true,
  },

  om_west_central: {
    label: "Afaan Oromoo (Lixaa Giddugaleessa)",
    languageCode: "gaz",
    bibleId: "GAZBIB",
    textFilesetId: "GAZBIBN_ET-json",
    hasOT: false,
    hasNT: true,
  },

  am: {
    label: "Amharic",
    languageCode: "amh",
    bibleId: "AMHBSE",
    textFilesetId: "AMHBSE_ET-json",
    hasOT: true,
    hasNT: true,
  },

  ar: {
    label: "Arabic",
    languageCode: "ara",
    bibleId: "ARABSE",
    textFilesetId: "ARABSE_ET-json",
    hasOT: true,
    hasNT: true,
  },

  sw: {
    label: "Swahili",
    languageCode: "swa",
    bibleId: "SWABSE",
    textFilesetId: "SWABSE_ET-json",
    hasOT: true,
    hasNT: true,
  },

  fr: {
    label: "French",
    languageCode: "fra",
    bibleId: "FRABSE",
    textFilesetId: "FRABSE_ET-json",
    hasOT: true,
    hasNT: true,
  },

  ti: {
    label: "Tigrinya",
    languageCode: "tir",
    bibleId: "TIBSE",
    textFilesetId: "TIBSE_ET-json",
    hasOT: false,
    hasNT: true,
  },
};

/**
 * Check if text is available for a language and book testament
 */
export function isTextAvailableForLanguage(appLanguage, bookId) {
  const resolved = resolveReaderLanguage(appLanguage);
  const config = BIBLE_TEXT_CONFIG[resolved];

  if (!config) return false;

  return isOldTestament(bookId) ? config.hasOT : config.hasNT;
}

/**
 * User-friendly messages for unavailable content
 */
export const CHAPTER_UNAVAILABLE_MESSAGES = {
  en: "This chapter is not available. Please try another chapter.",
  om_eastern: "Boqonnaan kun Afaan Oromoo (Bahaa)tti yeroo ammaa hin argamu. Boqonnaa biraa yaali.",
  om_west_central: "Boqonnaan kun Afaan Oromoo (Lixaa)tti yeroo ammaa hin argamu. Boqonnaa biraa yaali.",
  am: "ይህ ምዕራፍ አሁን አይገኝም። ሌላ ምዕራፍ ይሞክሩ።",
  ar: "هذا الفصل غير متوفر حالياً. يرجى محاولة فصل آخر.",
  sw: "Sura hii haipatikani sasa. Tafadhali jaribu sura nyingine.",
  fr: "Ce chapitre n'est pas disponible pour le moment. Veuillez essayer un autre chapitre.",
  ti: "እዚ ምዕራፍ ሕጂ ኣይርከብን። ካልእ ምዕራፍ ፈትን።",
};