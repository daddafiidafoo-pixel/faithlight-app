/**
 * Bible Language Availability Helper
 *
 * hae = Eastern Oromo (Afaan Oromoo Bahaa) — verified on Bible Brain
 * gaz = West Central Oromo (Lixaa Giddugaleessa) — verified on Bible Brain
 * om  = legacy code — resolves to gaz, treated as available
 */

const ENABLED_BIBLE_LANGUAGES = ['en', 'hae', 'gaz', 'om'];

// Languages that are UI-ready but Bible content is not yet wired
const COMING_SOON_LANGUAGES = ['am', 'ar', 'sw', 'fr', 'ti'];

export function isBibleLanguageAvailable(language) {
  return ENABLED_BIBLE_LANGUAGES.includes(language);
}

export function isBibleComingSoon(language) {
  return COMING_SOON_LANGUAGES.includes(language);
}