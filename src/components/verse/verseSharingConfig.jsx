// Verse Sharing Generator Configuration
// Supports all FaithLight languages with multilingual labels

export const VERSE_SHARING_CONFIG = {
  branding: {
    appName: 'FaithLight',
    showAppName: true,
    showLogo: true,
    watermarkPosition: 'bottom'
  },
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'om', 'am', 'ar', 'sw', 'fr'],
  defaultFormat: 'square',
  formats: [
    {
      key: 'square',
      label: {
        en: 'Square',
        om: 'Iskuweerii',
        am: 'ካሬ',
        ar: 'مربع',
        sw: 'Mraba',
        fr: 'Carré'
      },
      width: 1080,
      height: 1080
    },
    {
      key: 'story',
      label: {
        en: 'Story',
        om: 'Seenaa',
        am: 'ስቶሪ',
        ar: 'قصة',
        sw: 'Story',
        fr: 'Story'
      },
      width: 1080,
      height: 1920
    },
    {
      key: 'portrait',
      label: {
        en: 'Portrait',
        om: 'Dheerataa',
        am: 'ቁም አቀማመጥ',
        ar: 'طولي',
        sw: 'Wima',
        fr: 'Portrait'
      },
      width: 1080,
      height: 1350
    }
  ],
  templates: [
    {
      key: 'clean-light',
      name: {
        en: 'Clean Light',
        om: 'Ifaa Qulqulluu',
        am: 'ንፁህ ብርሃን',
        ar: 'ضوء نظيف',
        sw: 'Mwanga Safi',
        fr: 'Lumière claire'
      },
      background: {
        type: 'solid',
        value: '#FFFFFF'
      },
      textColor: '#1F2937',
      accentColor: '#3B5BDB',
      showBorder: true,
      showShadow: false,
      alignment: 'center'
    },
    {
      key: 'faithlight-blue',
      name: {
        en: 'FaithLight Blue',
        om: 'Cuquliisa FaithLight',
        am: 'የFaithLight ሰማያዊ',
        ar: 'أزرق FaithLight',
        sw: 'Bluu ya FaithLight',
        fr: 'Bleu FaithLight'
      },
      background: {
        type: 'gradient',
        value: ['#EEF3FF', '#FFFFFF']
      },
      textColor: '#1F2937',
      accentColor: '#3B5BDB',
      showBorder: false,
      showShadow: true,
      alignment: 'center'
    },
    {
      key: 'soft-scripture',
      name: {
        en: 'Soft Scripture',
        om: 'Caaffata Laafaa',
        am: 'ለስላሳ ቃል',
        ar: 'نص ناعم',
        sw: 'Andiko Laini',
        fr: 'Écriture douce'
      },
      background: {
        type: 'gradient',
        value: ['#F9F5FF', '#FFFFFF']
      },
      textColor: '#111827',
      accentColor: '#F4B400',
      showBorder: false,
      showShadow: true,
      alignment: 'center'
    }
  ],
  actions: {
    shareImage: {
      en: 'Share Image',
      om: 'Suuraa Qoodi',
      am: 'ምስል አጋራ',
      ar: 'مشاركة صورة',
      sw: 'Shiriki Picha',
      fr: 'Partager l\'image'
    },
    saveImage: {
      en: 'Save Image',
      om: 'Suuraa Olkaa\'i',
      am: 'ምስል አስቀምጥ',
      ar: 'حفظ الصورة',
      sw: 'Hifadhi Picha',
      fr: 'Enregistrer l\'image'
    },
    copyVerse: {
      en: 'Copy Verse',
      om: 'Ayaata Garagalchi',
      am: 'ቃሉን ቅዳ',
      ar: 'نسخ الآية',
      sw: 'Nakili Aya',
      fr: 'Copier le verset'
    },
    shareWhatsApp: {
      en: 'WhatsApp',
      om: 'WhatsApp',
      am: 'WhatsApp',
      ar: 'WhatsApp',
      sw: 'WhatsApp',
      fr: 'WhatsApp'
    }
  }
};