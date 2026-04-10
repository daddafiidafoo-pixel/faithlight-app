import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { BUILTIN } from './i18nBuiltin';
import { BUILTIN_EXT } from './i18nExtensions';
import { flattenLocale } from './i18n/index';
import { useLanguageStore } from './languageStore';
import { detectLanguage, saveLanguage } from '../lib/languageDetection';

// Stub for global language sync
const setGlobalLanguage = () => {};

// Merge extension keys into BUILTIN, then overlay structured locale JSONs on top
// Support chat + verse widget + home page translations
const UI_TRANSLATIONS = {
  en: {
    // ── Bottom Navigation ──
    'navigation.home': 'Home',
    'navigation.bible': 'Bible',
    'navigation.audio': 'Audio',
    'navigation.study': 'Study',
    'navigation.plans': 'Plans',
    'navigation.downloads': 'Downloads',
    'navigation.saved': 'Saved',
    'navigation.profile': 'Profile',
    'navigation.settings': 'Settings',
    'navigation.notifications': 'Notifications',
    // ── Prayer Board ──
    'prayer.board.title': 'Community Prayer Board',
    'prayer.board.subtitle': 'Pray for one another',
    'prayer.board.newRequest': 'New Request',
    'prayer.board.prayNow': 'Pray',
    'prayer.board.prayed': 'Prayed',
    'prayer.board.answered': 'Answered',
    'prayer.board.anonymous': 'Anonymous',
    'prayer.board.category': 'Category',
    'prayer.board.allCategories': 'All',
    'prayer.board.noRequests': 'No prayer requests yet. Be the first to share.',
    'prayer.board.sharePrayer': 'Share a Prayer Request',
    // ── Settings ──
    'settings.changeLanguage': 'Change Language',
    'settings.languageNote': 'This changes the entire app UI language.',
    'settings.languageSaved': 'Language saved!',
    'supportChat.title': 'FaithLight Support',
    'supportChat.subtitle': 'AI Help Assistant',
    'supportChat.greeting': 'Hi! 👋 I\'m the FaithLight Support Assistant.',
    'supportChat.intro': 'How can I help you today? You can pick a common issue below or type your own question.',
    'supportChat.issue.page': 'Page not loading',
    'supportChat.issue.language': 'Language not changing',
    'supportChat.issue.ai': 'AI response failed',
    'supportChat.issue.quiz': 'Quiz not working',
    'supportChat.issue.audio': 'Audio Bible problem',
    'supportChat.issue.share': 'Verse sharing problem',
    'supportChat.issue.other': 'Something else',
    'supportChat.placeholder': 'Describe your issue...',
    'supportChat.emailHelp': 'Can\'t resolve it? Email',
    'supportChat.send': 'Send',
    'supportChat.refresh': 'Refresh',
    'shareVerse.title': 'Faith Widget',
    'shareVerse.subtitle': 'Create a beautiful verse card to share with the world',
    'shareVerse.label': 'Verse of the Day',
    'shareVerse.background': 'Background',
    'shareVerse.fontStyle': 'Font Style',
    'actions.download': 'Download',
    'actions.exporting': 'Exporting…',
    'actions.copied': 'Copied!',
    'actions.copy': 'Copy',
    'actions.shareInstagram': 'Instagram / Stories',
    'actions.shareWhatsApp': 'Share to WhatsApp',
    'actions.share': 'Share',
    'actions.save': 'Save',
    'common.settings': 'Settings',
    'defaults.verse': 'I can do all things through Christ who strengthens me.',
    'defaults.psalm': 'The LORD is my shepherd; I shall not want.',
    'home.dayStreak': 'Day Streak',
    'home.nextStep': 'Next Step',
    'home.reel': 'Reel',
    'home.listenToVerseLabel': 'Listen to Today\'s Verse',
    'home.reflection': 'Reflection',
    'home.tools.readBible': 'Read Bible',
    'home.tools.bibleQuiz': 'Bible Quiz',
    'home.tools.journal': 'Journal',
    'home.tools.prayer': 'Prayer',
    'home.tools.studyRooms': 'Study Rooms',
    'home.tools.audioBible': 'Audio Bible',
    'home.tools.churchStudy': 'Church Study',
    'home.ai.explainVerse': 'Explain today\'s verse',
    'home.ai.helpPray': 'Help me pray',
    'home.ai.findVerses': 'Find Bible verses',
    'home.ai.askQuestion': 'Ask a question',
    // AI Bible Companion
    'bible.companion_title': 'AI Bible Companion',
    'bible.companion_desc': 'Ask questions about Scripture',
    'bible.what_fear': 'What does the Bible say about fear?',
    'bible.forgiveness': 'Explain forgiveness in Scripture',
    'bible.faith': 'How do I strengthen my faith?',
    'bible.pray': 'How should I pray?',
    'bible.grief': 'What does the Bible say about grief?',
    'bible.start_question': 'Ask me anything about Scripture',
    'bible.ask_placeholder': 'What does Romans 8:28 mean?',
    'bible.thinking': 'Thinking...',
    'bible.powered_by': 'Powered by AI • Always consult Scripture',
    'bible.references': 'Scripture References',
    'common.send': 'Send',
    'common.retry': 'Try again',
    'common.copy': 'Copy',
    'common.copied': 'Copied',
    'common.share': 'Share',
    'bible.error': 'We could not get a response right now. Please try again in a moment.',
  },
  om: {
    // ── Bottom Navigation ──
    'navigation.home': 'Fuula Jalqabaa',
    'navigation.bible': 'Macaafa Qulqulluu',
    'navigation.audio': 'Sagalee',
    'navigation.study': "Qo'annoo",
    'navigation.plans': 'Karoora',
    'navigation.downloads': 'Buufannaa',
    'navigation.saved': 'Kuufaman',
    'navigation.profile': 'Piroofaayila',
    'navigation.settings': 'Sirna',
    'navigation.notifications': 'Beeksisa',
    // ── Prayer Board ──
    'prayer.board.title': 'Kadhannaa Hawaasaa',
    'prayer.board.subtitle': 'Waliif kadhachaa',
    'prayer.board.newRequest': 'Kadhannaa Haaraa',
    'prayer.board.prayNow': 'Kadhadhu',
    'prayer.board.prayed': 'Kadhate',
    'prayer.board.answered': 'Deebii Argame',
    'prayer.board.anonymous': 'Maqaa Malee',
    'prayer.board.allCategories': 'Hunda',
    'prayer.board.noRequests': "Ammaaf kadhannaan hin jiru. Kan jalqabaa taate.",
    'prayer.board.sharePrayer': 'Kadhannaa Qoodi',
    // ── Settings ──
    'settings.changeLanguage': 'Afaan Jijjiiri',
    'settings.languageNote': 'Kun afaan UI appii guutuu jijjiira.',
    'settings.languageSaved': 'Afaan kuufame!',
    'supportChat.title': 'Gargaarsa FaithLight',
    'supportChat.subtitle': 'Gargaaraa AI',
    'supportChat.greeting': 'Akkam! 👋 Ani Gargaaraa FaithLight AI dha.',
    'supportChat.intro': 'Har\'a akkam si gargaaruu danda\'a? Rakkoo beekamaa keessaa filadhu yookaan gaaffii kee barreessi.',
    'supportChat.issue.page': 'Fuulli hin banamu',
    'supportChat.issue.language': 'Afaan hin jijjiiramu',
    'supportChat.issue.ai': 'Deebiin AI hin hojjanne',
    'supportChat.issue.quiz': 'Quiz hin hojjatu',
    'supportChat.issue.audio': 'Rakkoo Audio Bible',
    'supportChat.issue.share': 'Rakkoo qoodinsa kutaa',
    'supportChat.issue.other': 'Kan biraa',
    'supportChat.placeholder': 'Rakkoo kee barreessi...',
    'supportChat.emailHelp': 'Yoo hin furamne, email godhi',
    'supportChat.send': 'Ergi',
    'supportChat.refresh': 'Haaromsi',
    'shareVerse.title': 'Gadacha Amantaa',
    'shareVerse.subtitle': 'Kaardii aayataa bareedaa uumi addunyaa qooduuf',
    'shareVerse.label': 'Kutaa Macaaba Qulqulluu kan Guyyaa',
    'shareVerse.background': 'Duubira',
    'shareVerse.fontStyle': 'Haala Seenaa',
    'actions.download': 'Buufadhu',
    'actions.exporting': 'Baasaa jira…',
    'actions.copied': 'Koppii ta\'eera!',
    'actions.copy': 'Koppii',
    'actions.shareInstagram': 'Instagram / Stories',
    'actions.shareWhatsApp': 'Whatsapp tti qoodi',
    'actions.share': 'Qoodi',
    'actions.save': 'Ol kaasuu',
    'common.settings': 'Filannoo',
    'defaults.verse': 'Waan hundinuu Kiristoosni waan hunda na jajjabachisuudhaan gochuu danda\'a.',
    'defaults.psalm': 'Waaqayyo suuta\'ee ti; namni waan tokko dhabuu hin qaba.',
    'home.dayStreak': 'Guyyaa Jijjiirama',
    'home.nextStep': 'Sarri Itti Aanaa',
    'home.reel': 'Reel',
    'home.listenToVerseLabel': 'Ayaata Har\'a Dhaggeeffadhu',
    'home.reflection': 'Yaadannaa',
    'home.tools.readBible': 'Macaaba Dubbisi',
    'home.tools.bibleQuiz': 'Quiz Macaaba',
    'home.tools.journal': 'Jeequu',
    'home.tools.prayer': 'Kadhannoo',
    'home.tools.studyRooms': 'Kutaa Barumsa',
    'home.tools.audioBible': 'Macaaba Audio',
    'home.tools.churchStudy': 'Mana Giddu-galeessaa',
    'home.ai.explainVerse': 'Ayaata har\'a ibsii',
    'home.ai.helpPray': 'Kadhannoo na gargaaruu',
    'home.ai.findVerses': 'Aayaalee barbadi',
    'home.ai.askQuestion': 'Gaaffii gaafadhu',
    // AI Bible Companion - Afaan Oromoo
    'bible.companion_title': 'Gargaaraa Kitaaba Qulqulluu AI',
    'bible.companion_desc': "Waa'ee Kitaaba Qulqulluu gaaffii gaafadhu",
    'bible.what_fear': "Kitaabni Qulqulluun waa'ee sodaa maal jedhu?",
    'bible.forgiveness': 'Dhiifama Kitaaba Qulqulluu keessatti ibsi',
    'bible.faith': 'Akkamitti amantii koo jabeessa?',
    'bible.pray': 'Akkamitti kadhachuu qaba?',
    'bible.grief': "Kitaabni Qulqulluun waa'ee gadda maal jedhu?",
    'bible.start_question': "Waa'ee Macaafa Qulqulluu waa hunda na gaafadhu",
    'bible.ask_placeholder': 'Roomaa 8:28 maal jechuu dha?',
    'bible.thinking': 'Yaadaa jira...',
    'bible.powered_by': "AI'n hojjetame • Yeroo hunda Kitaaba Qulqulluu ilaali",
    'bible.references': 'Aayaalee Kitaaba Qulqulluu',
    'common.send': 'Ergi',
    'common.retry': "Irra deebi'i",
    'common.copy': 'Koppii',
    'common.copied': "Koppii ta'eera",
    'common.share': 'Qoodi',
    'bible.error': "Amma deebii argachuu hin dandeenye. Mee yeroo muraasa booda irra deebi'i.",
  },
  am: {
    // ── Bottom Navigation ──
    'navigation.home': 'ዋና ገጽ',
    'navigation.bible': 'መጽሐፍ ቅዱስ',
    'navigation.audio': 'ድምፅ',
    'navigation.study': 'ጥናት',
    'navigation.plans': 'እቅዶች',
    'navigation.downloads': 'ውርዶች',
    'navigation.saved': 'የተቀመጡ',
    'navigation.profile': 'መገለጫ',
    'navigation.settings': 'ቅንብሮች',
    'navigation.notifications': 'ማሳወቂያዎች',
    // ── Prayer Board ──
    'prayer.board.title': 'የማህበረሰብ ጸሎት ሰሌዳ',
    'prayer.board.subtitle': 'ለአንዳቸው ለሌላው ጸልዩ',
    'prayer.board.newRequest': 'አዲስ ጥያቄ',
    'prayer.board.prayNow': 'ጸልዩ',
    'prayer.board.prayed': 'ጸለዩ',
    'prayer.board.answered': 'የተመለሰ',
    'prayer.board.anonymous': 'ስም-አልባ',
    'prayer.board.allCategories': 'ሁሉም',
    'prayer.board.noRequests': 'ገና ምንም የጸሎት ጥያቄ የለም። የመጀመሪያው ሁኑ።',
    'prayer.board.sharePrayer': 'የጸሎት ጥያቄ አጋሩ',
    // ── Settings ──
    'settings.changeLanguage': 'ቋንቋ ቀይር',
    'settings.languageNote': 'ይህ የሙሉ መተግበሪያ UI ቋንቋን ይቀይራል።',
    'settings.languageSaved': 'ቋንቋ ተቀምጧል!',
    // AI Bible Companion - Amharic
    'bible.companion_title': 'የመጽሐፍ ቅዱስ AI አጋር',
    'bible.companion_desc': 'ስለ መጽሐፍ ቅዱስ ጥያቄ ይጠይቁ',
    'bible.what_fear': 'መጽሐፍ ቅዱስ ስለ ፍርሃት ምን ይላል?',
    'bible.forgiveness': 'በመጽሐፍ ቅዱስ ያለውን ይቅርታ ያብራሩ',
    'bible.faith': 'እምነቴን እንዴት ላጠናክር?',
    'bible.pray': 'እንዴት መጸለይ አለብኝ?',
    'bible.grief': 'መጽሐፍ ቅዱስ ስለ ሀዘን ምን ይላል?',
    'bible.start_question': 'ስለ መጽሐፍ ቅዱስ ማንኛውንም ጥያቄ ይጠይቁኝ',
    'bible.ask_placeholder': 'ሮሜ 8፥28 ምን ማለት ነው?',
    'bible.thinking': 'በማሰብ ላይ...',
    'bible.powered_by': 'በAI የተጎላበተ • ሁልጊዜ መጽሐፍ ቅዱስን ያማክሩ',
    'bible.references': 'የመጽሐፍ ቅዱስ ማጣቀሻዎች',
    'common.send': 'ላክ',
    'common.retry': 'እንደገና ሞክር',
    'common.copy': 'ቅዳ',
    'common.copied': 'ተቅድቷል',
    'common.share': 'አጋራ',
    'bible.error': 'አሁን ምላሽ ማግኘት አልቻልንም። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።',
  },
};

const MERGED = {};
Object.keys({ ...BUILTIN, ...BUILTIN_EXT }).forEach(lang => {
  const structured = flattenLocale(lang); // structured locale JSON (highest priority)
  MERGED[lang] = {
    ...(BUILTIN[lang] || {}),
    ...(BUILTIN_EXT[lang] || {}),
    ...(UI_TRANSLATIONS[lang] || {}),
    ...structured,
  };
});

const STORAGE_KEY = 'faithlight_language';
const CACHE = {}; // module-level cache: { [lang]: { key: value } }

const I18nContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key, fallback) => fallback ?? key,
  safeT: (key, fallback = '') => fallback,
  isRTL: false,
  isLoading: false,
});

export function useI18n() {
  return useContext(I18nContext);
}

// Validate a language code is a real string (not 0, null, "0", etc.)
function validLangCode(code) {
  return typeof code === 'string' && code.length >= 2 && code.length <= 10 && /^[a-z]+(-[a-zA-Z]+)?$/.test(code);
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('en');
  const [strings, setStrings] = useState(MERGED['en']);
  const [isLoading, setIsLoading] = useState(true);
  const initDone = useRef(false);

  // Init: pick language from user profile → localStorage → default en
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    (async () => {
       // Use browser detection for first-time users, saved choice for returning users
       let picked = await detectLanguage();

       // If user is authenticated, their profile preference takes highest priority
       try {
         const authed = await base44.auth.isAuthenticated();
         if (authed) {
           try {
             const me = await base44.auth.me();
             const pref = me?.preferred_language_code;
             if (validLangCode(pref)) picked = pref;
           } catch (err) {
             console.warn('[I18nProvider] Error fetching user language:', err);
           }
         }
       } catch (err) {
         console.warn('[I18nProvider] Auth check failed:', err);
       }

       applyLang(picked, false);
       setIsLoading(false);
     })();
  }, []);

  const applyLang = useCallback((code, persist = true) => {
    if (!validLangCode(code)) code = 'en';

    // Apply direction — only truly RTL scripts (Arabic, Hebrew, Farsi, Urdu…)
    // Oromo (om), Amharic (am), all Latin/Ethiopic scripts → LTR
    const RTL_ONLY = new Set(['ar', 'fa', 'ur', 'he', 'yi', 'ps', 'dv', 'ckb', 'sd', 'ug', 'syr']);
    const rtl = RTL_ONLY.has(code.toLowerCase().split('-')[0]);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', code);
    }

    setLangState(code);

    // ── CRITICAL: Sync Zustand store + appStore localStorage so ALL pages see the same language ──
    useLanguageStore.getState().setLanguage(code);
    // Sync appStore localStorage directly (AppStore reads this on mount)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('faithlight.uiLanguage', JSON.stringify(code));
        localStorage.setItem('faithlight.bibleLanguage', JSON.stringify(code));
        localStorage.setItem('faithlight.audioLanguage', JSON.stringify(code));
      } catch {}
    }

    // Sync global language helper to prevent mixed-language pages
    setGlobalLanguage(code);

    // Use builtins immediately, then overlay DB strings
    const builtinStrings = MERGED[code] || MERGED['en'];
    setStrings(builtinStrings);

    if (persist) {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, code);
      }
      saveLanguage(code); // also write to the canonical detection key
      // ── Broadcast so GlobalLanguageContext (and any listener) stays in sync ──
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('faithlight-lang-changed', { detail: code }));
        } catch {}
      }
      // Save to profile silently (non-blocking)
      base44.auth.isAuthenticated().then(authed => {
        if (authed) base44.auth.updateMe({ preferred_language_code: code }).catch(() => {});
      }).catch(() => {});
    }

    // Load DB translations (overlay on top of builtins)
    if (CACHE[code]) {
      setStrings({ ...builtinStrings, ...CACHE[code] });
      return;
    }

    if (typeof window === 'undefined') return;

    base44.auth.isAuthenticated().then(authed => {
      if (!authed) return;
      return base44.entities.Translation.filter(
        { language_code: code, status: 'published' }, '-created_date', 2000
      ).then(rows => {
        if (!Array.isArray(rows)) return;
        const map = {};
        rows.forEach(r => { if (r?.key && r?.value) map[r.key] = r.value; });
        CACHE[code] = map;
        setStrings(prev => ({ ...builtinStrings, ...map }));
      }).catch(() => {
        // Translation entity fetch failed — use builtins only (silently)
        CACHE[code] = {};
      });
    }).catch(() => {});
    }, []);

  const setLang = useCallback((code) => {
    applyLang(code, true);
  }, [applyLang]);

  // Listen for language changes fired by HomeLangSwitcher or other components
  // that use the Zustand store directly instead of I18nProvider
  useEffect(() => {
    const handler = (e) => {
      const code = e.detail;
      if (typeof code === 'string' && code !== lang) {
        applyLang(code, false); // already persisted by the caller
      }
    };
    window.addEventListener('faithlight-lang-changed', handler);
    return () => window.removeEventListener('faithlight-lang-changed', handler);
  }, [lang, applyLang]);

  const t = useCallback((key, fallback) => {
    const val = strings[key];
    if (val !== undefined) return val;
    // Dev-mode warning for missing translation keys
    if (import.meta.env.DEV && fallback === undefined) {
      console.warn(`[FaithLight i18n] Missing translation: ${lang}.${key}`);
    }
    // fallback=null means caller wants to detect missing key (used by safeT)
    if (fallback === null) return null;
    return fallback ?? key;
  }, [strings, lang]);

  /** Safe translation — never returns raw key, uses fallbackText instead */
  const safeT = useCallback((key, fallbackText = '') => {
    const val = strings[key];
    if (val !== undefined && val !== key) return val;
    return fallbackText;
  }, [strings]);

  // Arabic and other RTL scripts only — Oromo, Amharic, Swahili, etc. are LTR
  const RTL_ONLY = new Set(['ar', 'fa', 'ur', 'he', 'yi', 'ps', 'dv', 'ckb', 'sd', 'ug', 'syr']);
  const isRTL = RTL_ONLY.has((lang || 'en').toLowerCase().split('-')[0]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, safeT, isRTL, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}