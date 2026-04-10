/**
 * Bible Brain Fileset Configuration
 * 
 * Tracks verified and unverified filesets for each language.
 * Only enable languages after verification with the API.
 * 
 * To test a fileset:
 * https://4.dbt.io/api/bibles/filesets/{filesetId}/PSA/23?key={API_KEY}
 */

export const BIBLE_SOURCES = {
  en: {
    source: "local",
    name: "English",
    nativeName: "English",
    textFilesetId: "ENGESV",
    audioFilesetId: "ENGESVN2DA",
    enabledText: true,
    enabledAudio: true,
    verified: true,
  },
  // Eastern Oromo (Afaan Oromoo Bahaa) — ISO 639-3: hae
  hae: {
    source: "biblebrain",
    name: "Afaan Oromoo (Eastern)",
    nativeName: "Afaan Oromoo (Bahaa)",
    bibleId: "HAEBSE",
    textFilesetId: "HAEBSEN_ET-json",
    audioFilesetId: "HAEBSEN2SA",
    audioDramaId: "HAEBSEN2DA",
    videoStreamId: "HAEBSEP2DV",
    enabledText: true,
    enabledAudio: true,
    verified: true,
    notes: "Eastern Oromo — Bible Brain ISO code: hae",
  },
  // West Central Oromo (Afaan Oromoo Lixaa Giddugaleessa) — ISO 639-3: gaz
  gaz: {
    source: "biblebrain",
    name: "Afaan Oromoo (West Central)",
    nativeName: "Afaan Oromoo (Lixaa Giddugaleessa)",
    bibleId: "GAZBIB",
    textFilesetId: "GAZBIBN_ET-json",
    audioFilesetId: "GAZBIBN1DA",
    otAudioId: "GAZBIBO1DA",
    altBibleId: "GAZGAZ",
    altTextId: "GAZBSE",
    altAudioDramaId: "GAZBSEN2DA",
    altOtAudioId: "GAZBSEO1DA",
    altVideoStreamId: "GAZBSEP2DV",
    enabledText: true,
    enabledAudio: true,
    verified: true,
    notes: "West Central Oromo — Bible Brain ISO code: gaz",
  },
  // Legacy 'om' key — maps to gaz (West Central) as default fallback
  om: {
    source: "biblebrain",
    name: "Afaan Oromoo",
    nativeName: "Afaan Oromoo",
    bibleId: "GAZBIB",
    textFilesetId: "GAZBIBN_ET-json",
    audioFilesetId: "GAZBIBN1DA",
    enabledText: true,
    enabledAudio: true,
    verified: true,
    notes: "Legacy code — resolves to West Central Oromo (gaz). Use hae or gaz directly.",
  },
  am: {
    source: "biblebrain",
    name: "Amharic",
    nativeName: "አማርኛ",
    textFilesetId: "AMHEVG",
    audioFilesetId: null,
    enabledText: false,
    enabledAudio: false,
    verified: false,
    notes: "Multiple versions exist — verify correct one",
  },
  sw: {
    source: "biblebrain",
    name: "Swahili",
    nativeName: "Kiswahili",
    textFilesetId: "SWAKJV",
    audioFilesetId: null,
    enabledText: false,
    enabledAudio: false,
    verified: false,
  },
  fr: {
    source: "biblebrain",
    name: "French",
    nativeName: "Français",
    textFilesetId: null,
    audioFilesetId: null,
    enabledText: false,
    enabledAudio: false,
    verified: false,
  },
  ar: {
    source: "biblebrain",
    name: "Arabic",
    nativeName: "العربية",
    textFilesetId: null,
    audioFilesetId: null,
    enabledText: false,
    enabledAudio: false,
    verified: false,
  },
  ti: {
    source: "biblebrain",
    name: "Tigrinya",
    nativeName: "ትግርኛ",
    textFilesetId: null, // ❌ No text fileset available
    audioFilesetId: "TIGN2DA",
    enabledText: false,
    enabledAudio: false,
    verified: false,
    notes: "Audio-only support — text reader not available",
  },
};

/**
 * Resolve Oromo language variant to the correct Bible Brain ISO code.
 * Use this before making any API call.
 *
 * hae = Eastern Oromo
 * gaz = West Central Oromo
 * om  = legacy fallback → resolves to gaz
 */
export function resolveOromoLanguageCode(selectedLanguage) {
  if (selectedLanguage === "om_eastern" || selectedLanguage === "hae") return "hae";
  if (selectedLanguage === "om_west_central" || selectedLanguage === "gaz") return "gaz";
  if (selectedLanguage === "om") return "gaz"; // temporary default
  return selectedLanguage;
}

/**
 * Language code map for Bible Brain API calls.
 * Maps app language codes to Bible Brain ISO language codes.
 */
export const LANGUAGE_CODE_MAP = {
  en: "eng",
  om: "gaz",           // legacy → West Central Oromo
  hae: "hae",          // Eastern Oromo
  gaz: "gaz",          // West Central Oromo
  om_eastern: "hae",
  om_west_central: "gaz",
  am: "amh",
  sw: "swh",
  fr: "fra",
  ar: "ara",
  ti: "tir",
};

/**
 * Full Bible Brain config for each Oromo variant.
 */
export const BIBLE_BRAIN_CONFIG = {
  hae: {
    languageCode: "hae",
    bibleId: "HAEBSE",
    textId: "HAEBSE",
    textJsonId: "HAEBSEN_ET-json",
    audioStreamId: "HAEBSEN2SA",
    audioDramaId: "HAEBSEN2DA",
    videoStreamId: "HAEBSEP2DV",
  },
  gaz: {
    languageCode: "gaz",
    bibleId: "GAZBIB",
    textId: "GAZBIBN_ET",
    textJsonId: "GAZBIBN_ET-json",
    audioId: "GAZBIBN1DA",
    otAudioId: "GAZBIBO1DA",
    altBibleId: "GAZGAZ",
    altTextId: "GAZBSE",
    altAudioDramaId: "GAZBSEN2DA",
    altOtAudioId: "GAZBSEO1DA",
    altVideoStreamId: "GAZBSEP2DV",
  },
};

/**
 * Get the Bible Brain language config for an app language code.
 */
export function getBibleBrainLanguageConfig(appLanguage) {
  switch (appLanguage) {
    case "hae":
    case "om_eastern":
      return {
        iso: "hae",
        bibleId: "HAEBSE",
        textJsonId: "HAEBSEN_ET-json",
        audioId: "HAEBSEN2SA",
      };
    case "gaz":
    case "om_west_central":
      return {
        iso: "gaz",
        bibleId: "GAZBIB",
        textJsonId: "GAZBIBN_ET-json",
        audioId: "GAZBIBN1DA",
      };
    case "om":
      return {
        iso: "gaz",
        bibleId: "GAZBIB",
        textJsonId: "GAZBIBN_ET-json",
        audioId: "GAZBIBN1DA",
      };
    default:
      return null;
  }
}

/**
 * Get fileset configuration for a language
 */
export function getFileset(languageCode) {
  const resolved = resolveOromoLanguageCode(languageCode);
  return BIBLE_SOURCES[resolved] || BIBLE_SOURCES.en;
}

/**
 * Check if a language is enabled for text
 */
export function isTextReady(languageCode) {
  const source = getFileset(languageCode);
  return source.enabledText && source.verified;
}

/**
 * Check if a language is enabled for audio
 */
export function isAudioReady(languageCode) {
  const source = getFileset(languageCode);
  return source.enabledAudio && source.verified;
}

/**
 * Get all languages with enabled text
 */
export function getEnabledTextLanguages() {
  return Object.entries(BIBLE_SOURCES)
    .filter(([_, config]) => config.enabledText)
    .map(([code, config]) => ({
      code,
      ...config,
    }));
}

/**
 * Get all languages with enabled audio
 */
export function getEnabledAudioLanguages() {
  return Object.entries(BIBLE_SOURCES)
    .filter(([_, config]) => config.enabledAudio)
    .map(([code, config]) => ({
      code,
      ...config,
    }));
}

// testFileset removed — API key must never be used in frontend.
// Use the bibleBrainFetch backend function for all API calls.

/**
 * Fileset verification checklist
 * 
 * Before releasing to users:
 * 
 * 1. Test Eastern Oromo (hae) — HAEBSE
 *    - Run: testFileset('hae', 'PSA', 23)
 *    - Test chapters: PSA 23, PSA 25, MAT 1, JHN 3
 *    - If all pass → set enabledText: true, enabledAudio: true, verified: true
 *    - Update FILESET_REFERENCE.md with ✅
 *
 * 1b. Test West Central Oromo (gaz) — GAZBIB / GAZGAZ
 *    - Run: testFileset('gaz', 'PSA', 23)
 *    - Verify both bibleId GAZBIB and alt GAZGAZ
 * 
 * 2. Test Amharic (AM)
 *    - Run: testFileset('am')
 *    - Check which version is most accurate
 *    - If success → set enabledText: true, enabledAudio: true, verified: true
 * 
 * 3. Tigrinya (TI) — Audio only
 *    - textFilesetId: null (not available)
 *    - enabledText: false, enabledAudio: false
 *    - Keep disabled until text becomes available
 * 
 * TEST CHAPTERS (all languages):
 * - PSA 23 (common test)
 * - PSA 25 (Oromo priority)
 * - MAT 1 (start of NT)
 * - JHN 3 (famous verse)
 */

// Default export for use in components
export default BIBLE_SOURCES;