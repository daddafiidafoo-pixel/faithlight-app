/**
 * BIBLE_CONFIG — single source of truth for language → Bible source mapping.
 *
 * textId: Bible Brain fileset ID for text
 * audioId: Bible Brain fileset ID for audio (null = not available)
 * fallbackToEnglish: show English text with a notice if true
 * fallbackNotice: message shown when falling back
 */
export const BIBLE_CONFIG = {
  en: {
    uiLabel: 'English',
    textId: 'ENGESV',
    audioId: null,
    fallbackToEnglish: false,
    fallbackNotice: null,
  },
  am: {
    uiLabel: 'አማርኛ',
    textId: null, // not yet verified
    audioId: null,
    fallbackToEnglish: true,
    fallbackNotice: 'መጽሐፍ ቅዱስ በአማርኛ አሁን አይገኝም። ለጊዜው በእንግሊዝኛ እየታየ ነው።',
    fallbackNoticeEn: 'Amharic Bible text is not yet available. Showing English temporarily.',
  },
  om: {
    uiLabel: 'Afaan Oromoo',
    textId: 'GAZGAZ', // available but may be partial
    audioId: null,
    fallbackToEnglish: true,
    fallbackNotice: 'Kitaabni Qulqulluun Afaan Oromootiin amma hin argamu. Yeroo ammaa Ingiliffaan agarsiifamaa jira.',
    fallbackNoticeEn: 'Afaan Oromoo Bible text is not yet fully available. Showing English temporarily.',
  },
  sw: {
    uiLabel: 'Kiswahili',
    textId: null,
    audioId: null,
    fallbackToEnglish: true,
    fallbackNotice: 'Biblia kwa Kiswahili haipatikani bado. Inonyeshwa kwa Kiingereza kwa sasa.',
    fallbackNoticeEn: 'Swahili Bible text is not yet available. Showing English temporarily.',
  },
  fr: {
    uiLabel: 'Français',
    textId: null,
    audioId: null,
    fallbackToEnglish: true,
    fallbackNotice: null,
    fallbackNoticeEn: 'French Bible text is not yet available. Showing English temporarily.',
  },
  ar: {
    uiLabel: 'العربية',
    textId: null,
    audioId: null,
    fallbackToEnglish: true,
    fallbackNotice: null,
    fallbackNoticeEn: 'Arabic Bible text is not yet available. Showing English temporarily.',
  },
  ti: {
    uiLabel: 'ትግርኛ',
    textId: null,
    audioId: null,
    fallbackToEnglish: true,
    fallbackNotice: null,
    fallbackNoticeEn: 'Tigrinya Bible text is not yet available. Showing English temporarily.',
  },
};

export function getBibleConfig(lang) {
  return BIBLE_CONFIG[lang] || BIBLE_CONFIG.en;
}

/** Returns the effective text ID to use (falls back to English). */
export function getEffectiveTextId(lang) {
  const config = getBibleConfig(lang);
  return config.textId || BIBLE_CONFIG.en.textId;
}

/** Returns the fallback notice for a language (native preferred, English fallback). */
export function getFallbackNotice(lang) {
  const config = getBibleConfig(lang);
  if (!config.fallbackToEnglish) return null;
  return config.fallbackNotice || config.fallbackNoticeEn || null;
}