/**
 * Single source of truth for every language FaithLight supports.
 * All language-aware code must import from here — never hardcode language strings.
 */

export const LANGUAGES = {
  en: {
    app: 'en',
    label: 'English',
    nativeLabel: 'English',
    rtl: false,
    bibleBrainLanguageCode: 'ENG',
    // Ordered fallback list — first available wins
    preferredBibleIds: ['ENGKJV', 'ENGESV', 'ENGWEB'],
    aiName: 'English',
    unavailableMessage: 'Bible text is not available in this language yet.',
    networkErrorMessage: 'Network error. Please check your connection and try again.',
  },
  om: {
    app: 'om',
    label: 'Afaan Oromoo',
    nativeLabel: 'Afaan Oromoo',
    rtl: false,
    bibleBrainLanguageCode: 'ORM',
    preferredBibleIds: ['ORMWHM', 'ORMBLB'],
    aiName: 'Afaan Oromoo',
    unavailableMessage: 'Barreeffamni Macaafa Qulqulluu afaan kanaan ammatti hin jiru.',
    networkErrorMessage: 'Dhaabbii intarneetii. Maaloo deebi\'i yaali.',
  },
  am: {
    app: 'am',
    label: 'Amharic',
    nativeLabel: 'አማርኛ',
    rtl: false,
    bibleBrainLanguageCode: 'AMH',
    preferredBibleIds: ['AMHEVG', 'AMHNIV'],
    aiName: 'Amharic',
    unavailableMessage: 'የመጽሐፍ ቅዱስ ጽሑፍ በዚህ ቋንቋ አሁን አይገኝም።',
    networkErrorMessage: 'የኔትወርክ ስህተት። እባክዎ ድጋሚ ይሞክሩ።',
  },
  fr: {
    app: 'fr',
    label: 'French',
    nativeLabel: 'Français',
    rtl: false,
    bibleBrainLanguageCode: 'FRA',
    preferredBibleIds: ['FRALSG', 'FRASEG'],
    aiName: 'French',
    unavailableMessage: "Le texte biblique n'est pas encore disponible dans cette langue.",
    networkErrorMessage: 'Erreur réseau. Veuillez réessayer.',
  },
  sw: {
    app: 'sw',
    label: 'Kiswahili',
    nativeLabel: 'Kiswahili',
    rtl: false,
    bibleBrainLanguageCode: 'SWH',
    preferredBibleIds: ['SWHNEN', 'SWHULB'],
    aiName: 'Kiswahili',
    unavailableMessage: 'Maandishi ya Biblia hayapatikani kwa lugha hii kwa sasa.',
    networkErrorMessage: 'Hitilafu ya mtandao. Tafadhali jaribu tena.',
  },
  ar: {
    app: 'ar',
    label: 'Arabic',
    nativeLabel: 'العربية',
    rtl: true,
    bibleBrainLanguageCode: 'ARB',
    preferredBibleIds: ['ARBVDV', 'ARBSV'],
    aiName: 'Arabic',
    unavailableMessage: 'نص الكتاب المقدس غير متاح بهذه اللغة حالياً.',
    networkErrorMessage: 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.',
  },
};

/** All supported app language codes */
export const SUPPORTED_LANGS = Object.keys(LANGUAGES);

/** Return config or fall back to English */
export function getLangConfig(lang) {
  return LANGUAGES[lang] || LANGUAGES.en;
}

/** Is this language RTL? */
export function isRTL(lang) {
  return getLangConfig(lang).rtl === true;
}

/** Apply lang + dir to the document root — call on every language switch */
export function applyDocumentLanguage(lang) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = isRTL(lang) ? 'rtl' : 'ltr';
}