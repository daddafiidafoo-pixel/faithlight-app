import { base44 } from '@/api/base44Client';

// FaithLight English → Oromo (Afaan Oromo) Glossary
export const OROMO_GLOSSARY = {
  // Core UI
  'ui.translation': 'Hiikkaa',
  'ui.explanation': 'Ibsa',
  'ui.verse': 'Aayata',
  'ui.verses': 'Aayatawwan',
  'ui.bibleVerse': 'Aayata Kitaaba Qulqulluu',
  'ui.bigIdea': 'Yaada guddaa',
  'ui.topic': 'Mata-duree',
  'ui.audience': 'Hirmaattota',
  'ui.length': 'Dheerina',
  'ui.style': 'Akkaataa',
  'ui.point': 'Qabxii',
  'ui.keyPoint': 'Qabxii Ijoo',
  'ui.illustration': 'Fakkeenya',

  // Training & Education
  'training.lesson': 'Barnoota',
  'training.course': 'Sagantaa Barnootaa',
  'training.training': 'Leenjii',
  'training.leadership': 'Hoggansa',
  'training.leader': 'Hogganaa',
  'training.teaching': 'Barsiisuu',
  'training.teacher': 'Barsiisaa',
  'training.quiz': 'Gaaffilee Qormaataa',
  'training.exam': 'Qormaata',
  'training.finalExam': 'Qormaata Xumuraa',
  'training.certificate': 'Ragaa Xumuraa',
  'training.completion': 'Xumurameera',
  'training.progress': 'Adeemsa Barnootaa',
  'training.startCourse': 'Sagantaa Jalqabi',
  'training.continueLearning': 'Itti Fufi',

  // Actions & Buttons
  'action.start': 'Jalqabi',
  'action.continue': 'Itti fufi',
  'action.submit': 'Ergi',
  'action.save': 'Olkaa\'u',
  'action.cancel': 'Dhiisi',
  'action.delete': 'Haquu',
  'action.edit': 'Gulali',
  'action.close': 'Cuf',
  'action.next': 'Itti Fufi',
  'action.back': 'Deebi\'i',

  // Audio/Media
  'media.audioBible': 'Kitaaba Qulqulluu Sagalee',
  'media.listen': 'Dhaggeeffadhu',
  'media.read': 'Dubbisi',
  'media.chapter': 'Boqonnaa',
  'media.language': 'Afaan',
  'media.chooseLanguage': 'Afaan Filadhu',

  // Settings
  'settings.settings': 'Qindaa\'ina',
  'settings.language': 'Afaan',
  'settings.country': 'Biyyaa',
  'settings.verified': 'Mirkanaa\'e',
  'settings.profile': 'Proofiila',
  'settings.account': 'Akkaawuntii',
  'settings.privacy': 'Ichaatii',

  // Community
  'community.pastor': 'Luba',
  'community.trainer': 'Leenjisaa',
  'community.ambassador': 'Ergaa Dhaqqabsiisaa',
  'community.group': 'Garee',
  'community.church': 'Mana Amantaa',
  'community.members': 'Miseensota',
  'community.liveSession': 'Tajaajila Kallattii',
  'community.mute': 'Sagalee Cufi',
  'community.unmute': 'Sagalee Bani',
  'community.requestToSpeak': 'Akka dubbatu gaafadhu',
  'community.host': 'Bulchaa Tajaajilaa',

  // Messages
  'message.translatedByAI': 'Hiikkaan kun AI\'n hojjetameera – ni fooyya\'a',
  'message.reportTranslation': 'Hiikka Malaa Faa\'u',
  'message.selectLanguage': 'Afaan Filadhu',
  'message.languageChanged': 'Afaan Jijjiirame',

  // Home & Navigation
  'nav.home': 'Mana',
  'nav.learn': 'Baruu',
  'nav.community': 'Hawaasa',
  'nav.forum': 'Mariin Dubbii',
  'nav.groups': 'Garoota',
  'nav.mentors': 'Looganoota',
  'nav.messages': 'Ergaa',
  'nav.settings': 'Qindaa\'ina',
  'nav.profile': 'Proofiila',
  'nav.logout': 'Ba\'a',

  // Quick Actions
  'quickActions.title': 'Gocha Ariifataa',
  'quickActions.bibleTutor': 'Barsiisaa Kitaaba Qulqulluu',
  'quickActions.bibleReader': 'Dubbisaa Kitaaba Qulqulluu',
  'quickActions.audioBible': 'Kitaaba Qulqulluu Sagalee',
  'quickActions.groups': 'Gareewwan',

  // Spiritual Growth Path
  'growth.title': 'Imala Kee Itti Fufi',
  'growth.subtitle': 'Sadarkaa Buusaa Gara Geggeessummaa',
  'growth.level1': 'Hidda Gad Fageeffadhu',
  'growth.level1Desc': 'Beginner - Amantii haaraa jalqabi',
  'growth.level2': 'Jabaadhu',
  'growth.level2Desc': 'Growing - Amantii jabeessuu fi guddina hafuuraa',
  'growth.level3': 'Dhugaa Keessatti Hundeeffadhu',
  'growth.level3Desc': 'Deep Study - Barsiisa sirrii qabaachuu',
  'growth.level4': 'Geggeessaa Amantii',
  'growth.level4Desc': 'Leadership - Tajaajilaa fi geggeessaa ta\'uu',
  'growth.startJourney': 'Imala Jalqabi',
  'growth.continueJourney': 'Itti Fufi',
  'growth.completed': 'Xumurameera',

  // New to Faith
  'faith.newTitle': 'Amantii Haaraa?',
  'faith.newSubtitle': 'Asitti Jalqabi',
  'faith.sevenDayPath': '7 Guyyaa Akkaataa Jalqabuu',

  // Spiritual Topics
  'spiritual.whoIsJesus': 'Yesus Eenyu?',
  'spiritual.salvation': 'Fayyini Maali?',
  'spiritual.prayer': 'Akkamitti Kadhannaa Jalqabna?',
  'spiritual.readBible': 'Akkamitti Kitaaba Qulqulluu Dubbisna?',
  'spiritual.holySpirit': 'Hafuura Qulqulluu',
  'spiritual.community': 'Waldaa fi Waliif Deeggarsa',
  'spiritual.newLife': 'Imala Haaraa Jalqabdeetta',

  // Home Page Main Sections
  'home.newToFaith': 'Amantii Keessatti Haaraa? Asitti Jalqabi',
  'home.continueJourney': 'Imala Kee Itti Fufi',
  'home.spiritualGrowth': 'Guddina Hafuuraa',
  'home.leadershipTraining': 'Leenjii Hogganummaa',
  'home.safetySupport': 'Nageenya fi Deeggarsa',

  // Safety & Moderation
  'safety.report': 'Gabaasi',
  'safety.block': 'Ugguri',
  'safety.warning': 'FaithLight si irraa jecha darbe hin gaafatu — jecha iccitii (password), koodii mirkaneessuu, yookaan maallaqa.',
  'safety.neverAsk': 'FaithLight si irraa jecha darbe hin gaafatu',
  'safety.notAsking': 'Jecha iccitii, koodii mirkaneessuu, yookaan maallaqa',

  // 7-Day Beginner Audio Series (Day 1-7 Scripts)
  'audio.day1Title': 'Yesus Kiristoos Eenyu?',
  'audio.day2Title': 'Fayyinni Maali?',
  'audio.day3Title': 'Akkamitti Kadhannaa Jalqabna?',
  'audio.day4Title': 'Akkamitti Kitaaba Qulqulluu Dubbisna?',
  'audio.day5Title': 'Hafuura Qulqulluu',
  'audio.day6Title': 'Waldaa fi Waliif Deeggarsa',
  'audio.day7Title': 'Imala Kee Itti Fufi',
  'audio.seriesTitle': 'Hidda Gad Fageeffadhu',
  'audio.recordingTip': 'Tasgabbaa\'aa – Abbaa gorsa fakkaata',

  // Onboarding
  'onboarding.welcome': 'Akka Deebina Gaarii!',
  'onboarding.chooseLanguage': 'Afaan Filadhu',
  'onboarding.subtitle': 'Yeroo fedhuu qindaa\'ina keessa jijjiira dandeessa',
  'onboarding.continueBtn': 'Itti Fufi',
};

// Country → Language Mapping (ISO codes)
export const COUNTRY_LANGUAGE_MAP = {
  CA: { country: 'Canada', primary: 'en', languages: ['en', 'fr'] },
  US: { country: 'United States', primary: 'en', languages: ['en', 'es'] },
  ET: { country: 'Ethiopia', primary: 'om', languages: ['om', 'am', 'en'] },
  KE: { country: 'Kenya', primary: 'sw', languages: ['sw', 'en'] },
  NG: { country: 'Nigeria', primary: 'en', languages: ['en'] },
  EG: { country: 'Egypt', primary: 'ar', languages: ['ar', 'en'] },
  GB: { country: 'United Kingdom', primary: 'en', languages: ['en'] },
  FR: { country: 'France', primary: 'fr', languages: ['fr', 'en'] },
  ES: { country: 'Spain', primary: 'es', languages: ['es', 'en'] },
  CM: { country: 'Cameroon', primary: 'fr', languages: ['fr', 'en'] },
  SN: { country: 'Senegal', primary: 'fr', languages: ['fr', 'en'] },
  ZA: { country: 'South Africa', primary: 'en', languages: ['en'] },
};

/**
 * Detect user language from device/browser
 */
export function detectDeviceLanguage() {
  try {
    const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
    return browserLang || 'en';
  } catch {
    return 'en';
  }
}

/**
 * Get suggested languages for a country
 */
export function getSuggestedLanguagesForCountry(countryCode) {
  if (!countryCode) return ['en'];
  const mapping = COUNTRY_LANGUAGE_MAP[countryCode?.toUpperCase()];
  return mapping?.languages || ['en'];
}

/**
 * Fetch all available translations for a language
 */
export async function fetchTranslations(languageCode) {
  try {
    // Handle both string and object parameter formats
    const code = typeof languageCode === 'string' ? languageCode : languageCode?.language_code || 'en';
    
    const translations = await base44.entities.Translation.filter(
      { language_code: code, status: 'published' }
    );

    const dict = {};
    translations.forEach(t => {
      dict[t.key] = t.value;
    });

    return dict;
  } catch (error) {
    console.error('Error fetching translations:', error);
    return {};
  }
}

/**
 * Get translation with fallback to English
 */
export async function getTranslation(key, languageCode = 'en', fallbackDict = {}) {
  try {
    // Try exact match first
    const trans = await base44.entities.Translation.filter(
      { key, language_code: languageCode },
      '-created_date',
      1
    );

    if (trans.length > 0) {
      return trans[0].value;
    }

    // Fallback to English
    if (languageCode !== 'en') {
      const engTrans = await base44.entities.Translation.filter(
        { key, language_code: 'en' },
        '-created_date',
        1
      );
      if (engTrans.length > 0) {
        return engTrans[0].value;
      }
    }

    return fallbackDict[key] || key;
  } catch (error) {
    console.error('Error getting translation:', error);
    return fallbackDict[key] || key;
  }
}

/**
 * Create batch translations (for seeding)
 */
export async function seedTranslations(languageCode, translations) {
  const batch = Object.entries(translations).map(([key, value]) => ({
    key,
    language_code: languageCode,
    value,
    category: 'ui',
    status: 'published',
  }));

  try {
    await base44.entities.Translation.bulkCreate(batch);
    return true;
  } catch (error) {
    console.error('Error seeding translations:', error);
    return false;
  }
}

/**
 * Seed country-language mappings
 */
export async function seedCountryMaps() {
  const batch = Object.entries(COUNTRY_LANGUAGE_MAP).map(([code, data]) => ({
    country_code: code,
    country_name: data.country,
    primary_language: data.primary,
    suggested_languages: data.languages.map((lang, idx) => ({
      language_code: lang,
      priority: idx,
    })),
  }));

  try {
    await base44.entities.CountryLanguageMap.bulkCreate(batch);
    return true;
  } catch (error) {
    console.error('Error seeding country maps:', error);
    return false;
  }
}