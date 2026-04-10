/**
 * Sermon Language Configuration
 * Defines supported languages for direct sermon generation
 */

export const SERMON_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    supported: true,
    description: 'Full sermon generation support',
  },
  om: {
    code: 'om',
    name: 'Afaan Oromoo',
    nativeName: 'Afaan Oromoo',
    supported: true,
    description: 'Full sermon generation support',
  },
  am: {
    code: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    supported: true,
    description: 'Full sermon generation support',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    supported: false,
    description: 'Generate in English + translation',
    fallback: 'en',
  },
  sw: {
    code: 'sw',
    name: 'Kiswahili',
    nativeName: 'Kiswahili',
    supported: false,
    description: 'Generate in English + translation',
    fallback: 'en',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    supported: false,
    description: 'Coming Soon',
    fallback: 'en',
  },
  ti: {
    code: 'ti',
    name: 'Tigrigna',
    nativeName: 'ትግርኛ',
    supported: false,
    description: 'Coming Soon',
    fallback: 'en',
  },
};

export const SERMON_TYPES = {
  sunday: {
    id: 'sunday',
    label: 'Sunday Sermon',
    description: 'General church gathering sermon',
    labelOm: 'Lallaba Dilbataa',
    descriptionOm: 'Lallaba waldaa waliigalaa',
    labelAm: 'የእሁድ ስብከት',
    descriptionAm: 'ለገዳዮች አጠቃላይ ስብከት',
    defaultLength: 30,
  },
  youth: {
    id: 'youth',
    label: 'Youth Sermon',
    description: 'Tailored for young adults/teens',
    labelOm: 'Lallaba Dargaggootaa',
    descriptionOm: 'Dargaggootaa fi mootummaa isaanii irratti xiyyeeffata',
    labelAm: 'ለወጣቶች ስብከት',
    descriptionAm: 'ለወጣትና ሚድያስ ብቻ የታሰበ',
    defaultLength: 20,
  },
  studyGuide: {
    id: 'study_guide',
    label: 'Bible Study Guide',
    description: 'Detailed study with discussion questions',
    labelOm: 'Qajeelfama Qo\'annoo Kitaaba Qulqulluu',
    descriptionOm: 'Qo\'annoo bal\'aa gaaffii marii waliin',
    labelAm: 'ለመጽሐፍ ቅዱስ ጥናት መመሪያ',
    descriptionAm: 'ዝርዝር ጥናት ከውይይት ጥያቄዎች ጋር',
    defaultLength: 25,
  },
  funeral: {
    id: 'funeral',
    label: 'Funeral Sermon',
    description: 'Comfort and hope in loss',
    labelOm: 'Lallaba Awwaalchaa',
    descriptionOm: 'Jajjabinaa fi abdii yeroo gaddaa',
    labelAm: 'የሙታት ስብከት',
    descriptionAm: 'ምኞት እና ተስፋ በሞት ወቅት',
    defaultLength: 15,
  },
  wedding: {
    id: 'wedding',
    label: 'Wedding Sermon',
    description: 'Marriage and commitment',
    labelOm: 'Lallaba Fudhachuu',
    descriptionOm: 'Ni\'i fi galedduu',
    labelAm: 'ለጋብቻ ስብከት',
    descriptionAm: 'ጋብቻ እና ቁርጠኝነት',
    defaultLength: 15,
  },
  custom: {
    id: 'custom',
    label: 'Custom Sermon',
    description: 'Your own specifications',
    labelOm: 'Lallaba Adda Addaa',
    descriptionOm: 'Qophiin kee',
    labelAm: 'ብቁ ስብከት',
    descriptionAm: 'የራስዎ መሰናዶ',
    defaultLength: 20,
  },
};

export const AUDIENCE_TYPES = {
  general: 'General church audience',
  youth: 'Youth/young adults',
  children: 'Children/families',
  leaders: 'Church leaders/pastors',
  newBelievers: 'New believers',
  smallGroup: 'Small group/home study',
};

export const AUDIENCE_TYPES_OM = {
  general: 'Dhaggeeffattoota waldaa waliigalaa',
  youth: 'Dargaggootaa/mootummaa',
  children: 'Ijoollee/maatiiwwan',
  leaders: 'Hoggantoonni waldaa/tajaajilaa',
  newBelievers: 'Amantoota haaraa',
  smallGroup: 'Garee xixiqqaa/qo\'annoo mana',
};

export const AUDIENCE_TYPES_AM = {
  general: 'ለደብ ዋሉ ክህበት',
  youth: 'ወጣቶች / ወጣት ሰዎች',
  children: 'ሕጻናት / ቤተሰቦች',
  leaders: 'የበጎ ሰዎች / ታዋቂዎች',
  newBelievers: 'አዳዲስ አምናቶች',
  smallGroup: 'ትንሽ ቡድን / ቤት ጥናት',
};

export const SERMON_TONES = {
  pastoral: 'Pastoral and caring',
  academic: 'Academic and scholarly',
  practical: 'Practical and applicable',
  prophetic: 'Prophetic and convicting',
  encouraging: 'Encouraging and hopeful',
  expository: 'Expository and detailed',
};

export const SERMON_FORMATS = {
  outline: 'Outline only (title, main points, verses)',
  full: 'Full sermon with introduction, body, and conclusion',
  bilingual: 'Bilingual (English + translation)',
};

export const SERMON_FORMATS_OM = {
  outline: 'Qabxii qofa (mata-duree, qabxii guddaa, fudhaa)',
  full: 'Lallaba guutuu (seensa, qaama guddaa, xumura)',
  bilingual: 'Afaan lamaa (Ingliffa + hiika)',
};

export const SERMON_FORMATS_AM = {
  outline: 'መገለጫ ብቻ (ርዕስ፣ ዋና ነጥቦች፣ ትርጓሜዎች)',
  full: 'ሙሉ ስብከት (ቅድመ ማውጫ፣ ተከላካይ፣ ማጠቃለያ)',
  bilingual: 'ሁለት ቋንቋ ( English + ትርጓሜ)',
};

export const PREACHING_STYLES = {
  pastoral: {
    id: 'pastoral',
    label: 'Pastoral',
    description: 'Warm, caring, compassionate',
    labelOm: 'Tajaajilaa',
    descriptionOm: 'Ho\'aa, kunuunsaa, gara-laafessa',
    labelAm: '牧ነት',
    descriptionAm: 'ሞቅ, ወዳጃዊ, ቶሞ',
    systemPrompt: 'Use warm, comforting language that shows deep care for the congregation. Focus on emotional connection and pastoral care.',
  },
  teaching: {
    id: 'teaching',
    label: 'Teaching',
    description: 'Structured, explanatory, scholarly',
    systemPrompt: 'Use clear, structured explanations. Break down concepts logically. Emphasize learning and understanding.',
  },
  evangelistic: {
    id: 'evangelistic',
    label: 'Evangelistic',
    description: 'Inviting, persuasive, transformative',
    systemPrompt: 'Use inviting and persuasive language. Include a clear call to action. Emphasize transformation and new life in Christ.',
  },
  prophetic: {
    id: 'prophetic',
    label: 'Prophetic',
    description: 'Bold, direct, convicting',
    systemPrompt: 'Use bold, direct language that convicts and challenges. Address sin, justice, and righteousness clearly.',
  },
  youth: {
    id: 'youth',
    label: 'Youth',
    description: 'Simple, energetic, relatable',
    systemPrompt: 'Use simple, energetic language. Make it relatable to young adults. Use modern examples and be conversational.',
  },
  encouragement: {
    id: 'encouragement',
    label: 'Encouragement',
    description: 'Uplifting, hopeful, inspiring',
    systemPrompt: 'Use uplifting and hopeful language. Emphasize God\'s promises, hope, and encouragement for daily life.',
  },
};

export const DENOMINATION_STYLES = {
  general: {
    id: 'general',
    label: 'General Christian',
    description: 'Inclusive, non-denominational',
    labelOm: 'Kiristaana Waliigalaa',
    descriptionOm: 'Hunda hammata, mootummaa tokko qofaan hin daangeffamne',
    labelAm: 'ሉዩ ክርስቶስ',
    descriptionAm: 'ሁሉንም ያካትታል፣ ያልታወቀ',
    adjustments: 'Keep theology broadly Christian, avoid specific denominational practices.',
  },
  protestant: {
    id: 'protestant',
    label: 'Protestant',
    description: 'Sola scriptura, justification by faith',
    adjustments: 'Emphasize Scripture authority and justification by faith. Respect Protestant theology.',
  },
  evangelical: {
    id: 'evangelical',
    label: 'Evangelical',
    description: 'Gospel-centered, conversion focus',
    adjustments: 'Emphasize gospel clarity, personal conversion, and transformation through Christ.',
  },
  pentecostal: {
    id: 'pentecostal',
    label: 'Pentecostal',
    description: 'Holy Spirit, power, healing',
    adjustments: 'Emphasize Holy Spirit power, gifts, and practical Christianity. Keep balanced and scriptural.',
  },
  orthodox: {
    id: 'orthodox',
    label: 'Orthodox',
    description: 'Tradition, liturgy, patristic theology',
    adjustments: 'Respect Orthodox theology and tradition. Use theologically sound patristic insights.',
  },
};

export const TTS_VOICES = {
  en: {
    provider: 'web-api',
    voice: 'Google US English (Pastoral)',
    description: 'Natural, clear English voice',
  },
  om: {
    provider: 'web-api',
    voice: 'Natural Oromo narration',
    description: 'Afaan Oromoo voice (native pronunciation)',
  },
  am: {
    provider: 'web-api',
    voice: 'Natural Amharic narration',
    description: 'Amharic voice (native pronunciation)',
  },
};