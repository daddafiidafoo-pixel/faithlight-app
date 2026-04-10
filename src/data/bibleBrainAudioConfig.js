/**
 * Bible Brain Audio Configuration
 * Maps supported languages to their FilesetIds for audio playback
 * 
 * FilesetIds retrieved from Bible Brain Digital Bible Platform (DBP) v4
 * API Key required: BIBLE_BRAIN_API_KEY
 * 
 * To discover filesetIds:
 * 1. Go to Bible Brain Available Content API
 * 2. Filter by language and format=audio
 * 3. Save the filesetId for each language/version combination
 */

export const bibleBrainAudioConfigs = {
  en: {
    languageCode: "en",
    label: "English",
    nativeLabel: "English",
    direction: "ltr",
    enabled: true,
    filesetId: "ENGESVN2DA", // ESV audio fileset (example)
    bibleId: "ENGESV",
  },
  om: {
    languageCode: "om",
    label: "Afaan Oromoo",
    nativeLabel: "Afaan Oromoo",
    direction: "ltr",
    enabled: true,
    filesetId: "GAZBIB", // Oromo Bible (check actual fileset)
    bibleId: "GAZBIB",
  },
  am: {
    languageCode: "am",
    label: "Amharic",
    nativeLabel: "አማርኛ",
    direction: "ltr",
    enabled: true,
    filesetId: "HAEBSEN2SA", // Amharic audio (check actual fileset)
    bibleId: "HAEBSE",
  },
  fr: {
    languageCode: "fr",
    label: "French",
    nativeLabel: "Français",
    direction: "ltr",
    enabled: true,
    filesetId: "FRSBSBV2DA", // French audio (example)
    bibleId: "FRSBSB",
  },
  sw: {
    languageCode: "sw",
    label: "Swahili",
    nativeLabel: "Kiswahili",
    direction: "ltr",
    enabled: true,
    filesetId: "SWSBA2N2DA", // Swahili audio (check actual fileset)
    bibleId: "SWSBA2N",
  },
  ar: {
    languageCode: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    direction: "rtl",
    enabled: true,
    filesetId: "ARABBT2N2DA", // Arabic audio (check actual fileset)
    bibleId: "ARABBT2N",
  },
  ti: {
    languageCode: "ti",
    label: "Tigrinya",
    nativeLabel: "ትግርኛ",
    direction: "ltr",
    enabled: true,
    filesetId: "TIWBBN2SA", // Tigrinya audio (check actual fileset)
    bibleId: "TIWBBN",
  },
};

/**
 * Get audio config for a language
 */
export function getAudioConfig(languageCode) {
  return bibleBrainAudioConfigs[languageCode] || null;
}

/**
 * Check if audio is available for a language
 */
export function isAudioAvailable(languageCode) {
  const config = getAudioConfig(languageCode);
  return config && config.enabled && config.filesetId;
}