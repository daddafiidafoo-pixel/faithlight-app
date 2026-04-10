import { base44 } from '@/api/base44Client';

// Module-level cache: { [lang]: { key: value } }
const CACHE = {};

// Built-in hardcoded fallback strings for priority languages
// Ensures nav works immediately even before DB loads
const BUILTIN = {
  en: {
    'nav.home': 'Home',
    'nav.bible': 'Bible',
    'nav.study': 'Study Plans',
    'nav.groups': 'Groups',
    'nav.live': 'Live Events',
    'nav.messages': 'Messages',
    'nav.friends': 'Friends',
    'nav.feed': 'Feed',
    'nav.forum': 'Forum',
    'nav.prayer': 'Prayer',
    'nav.audio': 'Audio',
    'nav.discover': 'Discover',
    'nav.goals': 'Goals',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.downloads': 'Downloads',
    'nav.askai': 'Ask AI',
    'nav.offline': 'Offline',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading…',
    'common.search': 'Search',
    'common.error': 'An error occurred',
  },
  om: {
    'nav.home': 'Mana',
    'nav.bible': 'Macaafa Qulqulluu',
    'nav.study': 'Karooraa Barnoota',
    'nav.groups': 'Garee',
    'nav.live': 'Sagantaa Live',
    'nav.messages': 'Ergaawwan',
    'nav.friends': 'Hiriyoota',
    'nav.feed': 'Oduu',
    'nav.forum': 'Marii',
    'nav.prayer': 'Kadhannaa',
    'nav.audio': 'Dhageettii',
    'nav.discover': 'Argadhu',
    'nav.goals': 'Galma',
    'nav.login': 'Seeni',
    'nav.logout': "Ba'i",
    'nav.settings': "Qindaa'ina",
    'nav.profile': 'Seenaa',
    'nav.downloads': 'Buusaa',
    'nav.askai': 'AI Gaafii',
    'nav.offline': 'Offline',
    'common.save': 'Kuusi',
    'common.cancel': 'Dhiisi',
    'common.loading': "Fe'aa jira…",
    'common.search': 'Barbaadi',
    'common.error': 'Dogoggora tokko uumame',
  },
  am: {
    'nav.home': 'ቤት',
    'nav.bible': 'መጽሐፍ ቅዱስ',
    'nav.study': 'የጥናት እቅዶች',
    'nav.groups': 'ቡድኖች',
    'nav.live': 'ቀጥታ ዝግጅቶች',
    'nav.messages': 'መልዕክቶች',
    'nav.friends': 'ጓደኞች',
    'nav.feed': 'ዜና',
    'nav.forum': 'ውይይት',
    'nav.prayer': 'ጸሎት',
    'nav.audio': 'ድምፅ',
    'nav.discover': 'ፈልግ',
    'nav.goals': 'ዓላማዎች',
    'nav.login': 'ግባ',
    'nav.logout': 'ውጣ',
    'nav.settings': 'ቅንብሮች',
    'nav.profile': 'መገለጫ',
    'nav.downloads': 'ደውሎ ያውርዱ',
    'nav.askai': 'AIን ይጠይቁ',
    'nav.offline': 'ከመስመር ውጭ',
    'common.save': 'አስቀምጥ',
    'common.cancel': 'ሰርዝ',
    'common.loading': 'በመጫን ላይ…',
    'common.search': 'ፈልግ',
    'common.error': 'ስህተት ተከስተ',
  },
};

/**
 * Load all translations for a language from DB
 * Caches result in memory to avoid repeated queries
 */
export async function loadTranslations(lang) {
  if (CACHE[lang]) {
    return CACHE[lang];
  }

  try {
    const strings = await base44.entities.LocaleStrings.filter(
      { lang },
      '-updated_at',
      1000
    );
    const dict = {};
    strings.forEach(s => {
      dict[s.key] = s.value;
    });
    CACHE[lang] = dict;
    return dict;
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error);
    return {};
  }
}

/**
 * Translation function with 3-level fallback:
 * 1. Try selected language
 * 2. Try English (en)
 * 3. Return built-in or safe default
 */
export async function t(key, lang = 'en', fallback = null) {
  // Start with built-in hardcoded fallback (fastest)
  if (BUILTIN[lang] && BUILTIN[lang][key]) {
    return BUILTIN[lang][key];
  }

  // Try cached translations for selected lang
  const langDict = CACHE[lang] || (await loadTranslations(lang));
  if (langDict[key]) {
    return langDict[key];
  }

  // Fallback to English if not same lang
  if (lang !== 'en') {
    if (BUILTIN.en && BUILTIN.en[key]) {
      return BUILTIN.en[key];
    }
    const enDict = CACHE.en || (await loadTranslations('en'));
    if (enDict[key]) {
      return enDict[key];
    }
  }

  // Last resort: return provided fallback or safe dev indicator
  if (fallback) return fallback;
  return import.meta.env.DEV ? `[missing: ${key}]` : '';
}

/**
 * Synchronous fallback version for immediate rendering
 * (uses only built-in + cached data, no DB lookup)
 */
export function tSync(key, lang = 'en', fallback = null) {
  // Built-in first
  if (BUILTIN[lang] && BUILTIN[lang][key]) {
    return BUILTIN[lang][key];
  }

  // Cached
  if (CACHE[lang] && CACHE[lang][key]) {
    return CACHE[lang][key];
  }

  // English fallback if not EN
  if (lang !== 'en') {
    if (BUILTIN.en && BUILTIN.en[key]) {
      return BUILTIN.en[key];
    }
    if (CACHE.en && CACHE.en[key]) {
      return CACHE.en[key];
    }
  }

  // Last resort
  if (fallback) return fallback;
  return import.meta.env.DEV ? `[missing: ${key}]` : '';
}

/**
 * Preload translations for multiple languages
 */
export async function preloadLanguages(langs) {
  const promises = langs.map(lang => loadTranslations(lang));
  await Promise.all(promises);
}