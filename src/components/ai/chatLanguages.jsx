// ─── 30-Language registry ────────────────────────────────────────────────────
export const LANGUAGES = [
  { code: 'en', name: 'English',          nativeName: 'English',          rtl: false, bibleVersion: 'KJV / NIV / ESV' },
  { code: 'om', name: 'Afaan Oromoo',     nativeName: 'Afaan Oromoo',     rtl: false, bibleVersion: 'Macaafa Qulqulluu' },
  { code: 'am', name: 'Amharic',          nativeName: 'አማርኛ',             rtl: false, bibleVersion: 'መጽሐፍ ቅዱስ' },
  { code: 'fr', name: 'French',           nativeName: 'Français',         rtl: false, bibleVersion: 'Louis Segond' },
  { code: 'ar', name: 'Arabic',           nativeName: 'العربية',          rtl: true,  bibleVersion: 'الكتاب المقدس (Van Dyke)' },
  { code: 'fa', name: 'Persian',          nativeName: 'فارسی',            rtl: true,  bibleVersion: 'کتاب مقدس فارسی' },
  { code: 'ur', name: 'Urdu',             nativeName: 'اردو',             rtl: true,  bibleVersion: 'اردو بائبل' },
  { code: 'es', name: 'Spanish',          nativeName: 'Español',          rtl: false, bibleVersion: 'Reina-Valera' },
  { code: 'pt', name: 'Portuguese',       nativeName: 'Português',        rtl: false, bibleVersion: 'Almeida Revista' },
  { code: 'de', name: 'Deutsch',          nativeName: 'Deutsch',          rtl: false, bibleVersion: 'Lutherbibel' },
  { code: 'it', name: 'Italian',          nativeName: 'Italiano',         rtl: false, bibleVersion: 'La Sacra Bibbia' },
  { code: 'nl', name: 'Dutch',            nativeName: 'Nederlands',       rtl: false, bibleVersion: 'NBG-vertaling' },
  { code: 'sv', name: 'Swedish',          nativeName: 'Svenska',          rtl: false, bibleVersion: 'Bibel 2000' },
  { code: 'no', name: 'Norwegian',        nativeName: 'Norsk',            rtl: false, bibleVersion: 'Bibelen' },
  { code: 'da', name: 'Danish',           nativeName: 'Dansk',            rtl: false, bibleVersion: 'Bibelen' },
  { code: 'fi', name: 'Finnish',          nativeName: 'Suomi',            rtl: false, bibleVersion: 'Raamattu' },
  { code: 'pl', name: 'Polish',           nativeName: 'Polski',           rtl: false, bibleVersion: 'Biblia Tysiąclecia' },
  { code: 'cs', name: 'Czech',            nativeName: 'Čeština',          rtl: false, bibleVersion: 'Česká Bible' },
  { code: 'ro', name: 'Romanian',         nativeName: 'Română',           rtl: false, bibleVersion: 'Biblia Cornilescu' },
  { code: 'hu', name: 'Hungarian',        nativeName: 'Magyar',           rtl: false, bibleVersion: 'Károli Biblia' },
  { code: 'el', name: 'Greek',            nativeName: 'Ελληνικά',         rtl: false, bibleVersion: 'Η Αγία Γραφή' },
  { code: 'ru', name: 'Russian',          nativeName: 'Русский',          rtl: false, bibleVersion: 'Синодальный перевод' },
  { code: 'uk', name: 'Ukrainian',        nativeName: 'Українська',       rtl: false, bibleVersion: 'Біблія (Огієнко)' },
  { code: 'tr', name: 'Turkish',          nativeName: 'Türkçe',           rtl: false, bibleVersion: 'Kutsal Kitap' },
  { code: 'hi', name: 'Hindi',            nativeName: 'हिन्दी',            rtl: false, bibleVersion: 'पवित्र बाइबिल' },
  { code: 'bn', name: 'Bengali',          nativeName: 'বাংলা',             rtl: false, bibleVersion: 'বাংলা বাইবেল' },
  { code: 'ta', name: 'Tamil',            nativeName: 'தமிழ்',             rtl: false, bibleVersion: 'தமிழ் வேதாகமம்' },
  { code: 'te', name: 'Telugu',           nativeName: 'తెలుగు',            rtl: false, bibleVersion: 'తెలుగు బైబిల్' },
  { code: 'id', name: 'Indonesian',       nativeName: 'Bahasa Indonesia',  rtl: false, bibleVersion: 'Alkitab (TB)' },
  { code: 'sw', name: 'Swahili',          nativeName: 'Kiswahili',        rtl: false, bibleVersion: 'Biblia Takatifu' },
];

export const SUPPORTED_CODES = new Set(LANGUAGES.map(l => l.code));
export const RTL_CODES = new Set(['ar', 'fa', 'ur']);

export const getLang = (code) => LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
export const isRtl = (code) => RTL_CODES.has(code);

// ─── i18n translations ────────────────────────────────────────────────────────
const I18N = {
  en: {
    language: 'Language',
    findVerses: 'Find Verses',
    explainPassage: 'Explain Passage',
    sermonOutline: 'Sermon Outline',
    studyPlan: 'Study Plan',
    prayerPoints: 'Prayer Points',
    discussionQs: 'Discussion Questions',
    appHelp: 'App Help',
    tryAsking: 'TRY ASKING',
    placeholder: 'Ask about Scripture, sermon help, study plans…',
    warning: 'AI-generated content may contain errors. Always verify with Scripture.',
    thinking: 'Thinking…',
    title: 'FaithLight AI',
    subtitle: 'Your Bible study companion. Ask anything about Scripture, sermons, study plans, and more.',
    signInTitle: 'Sign in to use FaithLight AI',
    signInDesc: 'FaithLight AI helps with Bible study, sermons, study plans, and app guidance.',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    newConversation: 'New conversation',
    copy: 'Copy',
    copied: 'Copied',
    saveSermon: 'Save Draft',
    savePlan: 'Save as Plan',
    openBible: 'Open Bible',
    switchSuggestTitle: 'Switch language?',
    switchSuggestBody: "It looks like you're writing in {lang}. Switch FaithLight AI to {lang}?",
    switch: 'Switch',
    keep: 'Keep current',
    examples: [
      'Explain John 3 in simple words',
      "Find verses about God's peace",
      'Sermon outline: Grace & Forgiveness',
      '14-day study plan on prayer',
      'How do I download the Bible for offline?',
      'Summarize Romans 8',
    ],
  },
  om: {
    language: 'Afaan',
    findVerses: 'Aayata Barbaadi',
    explainPassage: 'Kutaa kana hiiki',
    explainVerse: 'Aaya kana hiiki',
    sermonOutline: 'Qabiyyee Lallabaa',
    studyPlan: 'Karoora Qorannoo',
    prayerPoints: 'Iddoo Kadhannaa',
    discussionQs: 'Gaaffii Marii',
    appHelp: 'Gargaarsa Appii',
    tryAsking: 'YAALI GAAFACHUU',
    placeholder: 'Gaaffii kee barreessi…',
    warning: "Qabiyyeen AI uumame dogoggora qabaachuu danda'a. Mee Macaafa Qulqulluu ilaali mirkaneeffadhu.",
    thinking: 'Yaadaa jira…',
    title: 'FaithLight AI',
    subtitle: 'Hiriyyaa qorannoo Macaafa Qulqulluu kee.',
    signInTitle: 'FaithLight AI fayyadamuuf seeni',
    signInDesc: 'FaithLight AI qorannoo Macaafa Qulqulluu, lallaba, karoora qorannoo waliin si gargaara.',
    signIn: 'Seeni',
    createAccount: 'Herreega Uumi',
    newConversation: 'Haasawa haaraa',
    copy: 'Gadi qabi',
    copied: 'Haftee',
    saveSermon: 'Kaayyii',
    savePlan: 'Karoora kaayyii',
    openBible: 'Macaafa Qulqulluu bani',
    askQuestion: 'Gaaffii gaafadhu',
    followUp: 'Gaaffii itti aansuu',
    chooseLanguage: 'Afaan filadhu',
    bibleExplanation: 'Ibsa Macaafa Qulqulluu',
    switchSuggestTitle: 'Afaan jijjiiruu?',
    switchSuggestBody: 'Fakkaata akka ati {lang} barreessitu. FaithLight AI {lang}tti jijjiiruu?',
    switch: 'Jijjiiri',
    keep: 'Akkuma jirutti dhiisi',
    examples: [
      'Yohannis 3 jechoota salphaan ibsi',
      "Aayata nagaa waa'ee Waaqayyoo barbaadi",
      'Lallabaa: Araara fi Dhiifama',
      'Karoora qorannoo guyyaa 14 kadhannaa',
      'Akkamitti Macaafa offline buusu?',
      'Roomaa 8 cuunfaa',
    ],
  },
  am: {
    language: 'ቋንቋ',
    findVerses: 'ቁጥር ፈልግ',
    explainPassage: 'ክፍል አብራራ',
    sermonOutline: 'የስብከት እቅድ',
    studyPlan: 'የጥናት እቅድ',
    prayerPoints: 'የጸሎት ነጥቦች',
    discussionQs: 'የውይይት ጥያቄዎች',
    appHelp: 'የመተግበሪያ እገዛ',
    tryAsking: 'ይሞክሩ ይጠይቁ',
    placeholder: 'ስለ መጽሐፍ ቅዱስ፣ ስብከት ወይም ጥናት ጠይቅ…',
    warning: 'በAI የተፈጠረ ይዘት ስህተት ሊኖረው ይችላል። ሁልጊዜ በመጽሐፍ ቅዱስ ያረጋግጡ።',
    thinking: 'እያሰብኩ ነው…',
    title: 'FaithLight AI',
    subtitle: 'የመጽሐፍ ቅዱስ ጥናት ጓደኛዎ።',
    signInTitle: 'FaithLight AI ለመጠቀም ይግቡ',
    signInDesc: 'FaithLight AI ለጥናት፣ ስብከቶች፣ እቅዶች ይረዳዎታል።',
    signIn: 'ግባ',
    createAccount: 'መለያ ፍጠር',
    newConversation: 'አዲስ ውይይት',
    copy: 'ቅዳ',
    copied: 'ተቀድቷል',
    saveSermon: 'ረቂቅ አስቀምጥ',
    savePlan: 'እቅድ አስቀምጥ',
    openBible: 'መጽሐፍ ቅዱስ ክፈት',
    switchSuggestTitle: 'ቋንቋ ትቀይር?',
    switchSuggestBody: 'የምትጻፉት {lang} ይመስላል። FaithLight AIን ወደ {lang} ትቀይር?',
    switch: 'ቀይር',
    keep: 'እንደአሁኑ ተው',
    examples: [
      'ዮሐንስ 3ን በቀላሉ አብራራ',
      'ስለ እግዚአብሔር ሰላም ጥቅሶችን ፈልግ',
      'ስብከት: ጸጋ እና ይቅርታ',
      '14 ቀን ስለ ጸሎት የጥናት እቅድ',
      'ቅዱሳት መጻሕፍትን ከኢንተርኔት ውጭ እንዴት ማውረድ?',
      'ሮሜ 8ን ጠቅለለ',
    ],
  },
  fr: {
    language: 'Langue',
    findVerses: 'Trouver des versets',
    explainPassage: 'Expliquer le passage',
    sermonOutline: 'Plan de sermon',
    studyPlan: "Plan d'étude",
    prayerPoints: 'Points de prière',
    discussionQs: 'Questions de discussion',
    appHelp: "Aide de l'application",
    tryAsking: 'ESSAYEZ DE DEMANDER',
    placeholder: 'Posez une question sur les Écritures, le sermon…',
    warning: "Le contenu généré par l'IA peut contenir des erreurs. Vérifiez toujours avec les Écritures.",
    thinking: 'Réflexion…',
    title: 'FaithLight IA',
    subtitle: "Votre compagnon d'étude biblique.",
    signInTitle: 'Connectez-vous pour utiliser FaithLight IA',
    signInDesc: "FaithLight IA aide à l'étude biblique, aux sermons et aux plans d'étude.",
    signIn: 'Se connecter',
    createAccount: 'Créer un compte',
    newConversation: 'Nouvelle conversation',
    copy: 'Copier',
    copied: 'Copié',
    saveSermon: 'Sauvegarder',
    savePlan: 'Sauvegarder le plan',
    openBible: 'Ouvrir la Bible',
    switchSuggestTitle: 'Changer de langue ?',
    switchSuggestBody: 'Il semble que vous écriviez en {lang}. Passer FaithLight IA en {lang} ?',
    switch: 'Changer',
    keep: 'Garder',
    examples: [
      'Expliquer Jean 3 en mots simples',
      'Versets sur la paix de Dieu',
      'Plan de sermon: Grâce et Pardon',
      "Plan d'étude de 14 jours sur la prière",
      'Comment télécharger la Bible hors ligne?',
      'Résumer Romains 8',
    ],
  },
  ar: {
    language: 'اللغة',
    findVerses: 'ابحث عن آيات',
    explainPassage: 'شرح المقطع',
    sermonOutline: 'مخطط عظة',
    studyPlan: 'خطة دراسة',
    prayerPoints: 'نقاط صلاة',
    discussionQs: 'أسئلة للنقاش',
    appHelp: 'مساعدة التطبيق',
    tryAsking: 'جرّب أن تسأل',
    placeholder: 'اسأل عن الكتاب المقدس أو الموعظة أو خطة الدراسة…',
    warning: 'قد يحتوي المحتوى المُنشأ بواسطة الذكاء الاصطناعي على أخطاء. تحقق دائمًا من الكتاب المقدس.',
    thinking: 'أفكّر…',
    title: 'فيث لايت AI',
    subtitle: 'رفيقك في دراسة الكتاب المقدس.',
    signInTitle: 'سجّل الدخول لاستخدام فيث لايت AI',
    signInDesc: 'فيث لايت AI يساعدك في دراسة الكتاب المقدس والعظات وخطط الدراسة.',
    signIn: 'تسجيل الدخول',
    createAccount: 'إنشاء حساب',
    newConversation: 'محادثة جديدة',
    copy: 'نسخ',
    copied: 'تم النسخ',
    saveSermon: 'حفظ المسودة',
    savePlan: 'حفظ الخطة',
    openBible: 'فتح الكتاب المقدس',
    switchSuggestTitle: 'تغيير اللغة؟',
    switchSuggestBody: 'يبدو أنك تكتب بـ {lang}. هل تريد تغيير FaithLight AI إلى {lang}؟',
    switch: 'تغيير',
    keep: 'الإبقاء',
    examples: [
      'اشرح يوحنا 3 بكلمات بسيطة',
      'ابحث عن آيات عن سلام الله',
      'مخطط عظة: النعمة والمغفرة',
      'خطة دراسة 14 يومًا للصلاة',
      'كيف أحمّل الكتاب المقدس دون إنترنت؟',
      'لخّص رومية 8',
    ],
  },
  fa: {
    language: 'زبان',
    findVerses: 'یافتن آیات',
    explainPassage: 'توضیح عبور',
    sermonOutline: 'طرح موعظه',
    studyPlan: 'برنامه مطالعه',
    prayerPoints: 'نکات دعا',
    discussionQs: 'سؤالات بحث',
    appHelp: 'راهنمای برنامه',
    tryAsking: 'امتحان کنید بپرسید',
    placeholder: 'درباره کتاب مقدس، موعظه یا برنامه مطالعه بپرسید…',
    warning: 'محتوای تولید شده توسط هوش مصنوعی ممکن است خطا داشته باشد. همیشه با کتاب مقدس تأیید کنید.',
    thinking: 'در حال فکر کردن…',
    title: 'فیث لایت AI',
    subtitle: 'همراه مطالعه کتاب مقدس شما.',
    signInTitle: 'برای استفاده از فیث لایت AI وارد شوید',
    signInDesc: 'فیث لایت AI در مطالعه کتاب مقدس، موعظه‌ها و برنامه‌های مطالعه کمک می‌کند.',
    signIn: 'ورود',
    createAccount: 'ایجاد حساب',
    newConversation: 'مکالمه جدید',
    copy: 'کپی',
    copied: 'کپی شد',
    saveSermon: 'ذخیره پیش‌نویس',
    savePlan: 'ذخیره برنامه',
    openBible: 'باز کردن کتاب مقدس',
    switchSuggestTitle: 'تغییر زبان؟',
    switchSuggestBody: 'به نظر می‌رسد به {lang} می‌نویسید. به {lang} بروید؟',
    switch: 'تغییر',
    keep: 'نگه داشتن',
    examples: [
      'یوحنا ۳ را به زبان ساده توضیح دهید',
      'آیاتی درباره آرامش خداوند',
      'طرح موعظه: فیض و بخشش',
      'برنامه مطالعه ۱۴ روزه درباره دعا',
      'چگونه کتاب مقدس را آفلاین دانلود کنیم؟',
      'رومیان ۸ را خلاصه کنید',
    ],
  },
  ur: {
    language: 'زبان',
    findVerses: 'آیات تلاش کریں',
    explainPassage: 'اقتباس سمجھائیں',
    sermonOutline: 'خطبے کا خاکہ',
    studyPlan: 'مطالعہ منصوبہ',
    prayerPoints: 'دعا کے نکات',
    discussionQs: 'بحث کے سوالات',
    appHelp: 'ایپ مدد',
    tryAsking: 'پوچھنے کی کوشش کریں',
    placeholder: 'بائبل، خطبہ یا مطالعہ منصوبے کے بارے میں پوچھیں…',
    warning: 'AI سے تیار کردہ مواد میں غلطیاں ہو سکتی ہیں۔ ہمیشہ بائبل سے تصدیق کریں۔',
    thinking: 'سوچ رہا ہوں…',
    title: 'فیتھ لائٹ AI',
    subtitle: 'بائبل مطالعہ میں آپ کا ساتھی۔',
    signInTitle: 'فیتھ لائٹ AI استعمال کرنے کے لیے سائن ان کریں',
    signInDesc: 'فیتھ لائٹ AI بائبل مطالعہ، خطبوں اور مطالعہ منصوبوں میں مدد کرتا ہے۔',
    signIn: 'سائن ان',
    createAccount: 'اکاؤنٹ بنائیں',
    newConversation: 'نئی گفتگو',
    copy: 'کاپی',
    copied: 'کاپی ہو گئی',
    saveSermon: 'مسودہ محفوظ کریں',
    savePlan: 'منصوبہ محفوظ کریں',
    openBible: 'بائبل کھولیں',
    switchSuggestTitle: 'زبان بدلیں؟',
    switchSuggestBody: 'لگتا ہے آپ {lang} میں لکھ رہے ہیں۔ {lang} میں تبدیل کریں؟',
    switch: 'تبدیل',
    keep: 'برقرار رکھیں',
    examples: [
      'یوحنا 3 کو آسان الفاظ میں سمجھائیں',
      'خدا کی سلامتی کے بارے میں آیات',
      'خطبہ: فضل اور معافی',
      'دعا پر 14 دن کا مطالعہ منصوبہ',
      'بائبل آف لائن کیسے ڈاؤن لوڈ کریں؟',
      'رومیوں 8 کا خلاصہ',
    ],
  },
  es: {
    language: 'Idioma',
    findVerses: 'Encontrar versículos',
    explainPassage: 'Explicar pasaje',
    sermonOutline: 'Plan de sermón',
    studyPlan: 'Plan de estudio',
    prayerPoints: 'Puntos de oración',
    discussionQs: 'Preguntas de debate',
    appHelp: 'Ayuda de la app',
    tryAsking: 'PRUEBA PREGUNTAR',
    placeholder: 'Pregunta sobre las Escrituras, sermones o planes de estudio…',
    warning: 'El contenido generado por IA puede contener errores. Verifica siempre con las Escrituras.',
    thinking: 'Pensando…',
    title: 'FaithLight IA',
    subtitle: 'Tu compañero de estudio bíblico.',
    signInTitle: 'Inicia sesión para usar FaithLight IA',
    signInDesc: 'FaithLight IA ayuda con el estudio bíblico, sermones y planes de estudio.',
    signIn: 'Iniciar sesión',
    createAccount: 'Crear cuenta',
    newConversation: 'Nueva conversación',
    copy: 'Copiar',
    copied: 'Copiado',
    saveSermon: 'Guardar borrador',
    savePlan: 'Guardar plan',
    openBible: 'Abrir Biblia',
    switchSuggestTitle: '¿Cambiar idioma?',
    switchSuggestBody: 'Parece que estás escribiendo en {lang}. ¿Cambiar FaithLight IA a {lang}?',
    switch: 'Cambiar',
    keep: 'Mantener',
    examples: [
      'Explicar Juan 3 en palabras simples',
      'Versículos sobre la paz de Dios',
      'Sermón: Gracia y Perdón',
      'Plan de estudio de 14 días sobre oración',
      '¿Cómo descargar la Biblia sin conexión?',
      'Resumir Romanos 8',
    ],
  },
};

/** t(langCode, key, { lang: 'French' }) — with fallback to English */
export function t(langCode, key, vars = {}) {
  const fallback = I18N.en?.[key] ?? key;
  let text = I18N[langCode]?.[key] ?? fallback;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replaceAll(`{${k}}`, v);
  }
  return text;
}

// ─── Skills config (IDs only; labels come from i18n) ─────────────────────────
export const SKILL_IDS = [
  { id: 'bible_search',        i18nKey: 'findVerses',     emoji: '🔍', prompt_en: 'Find Bible verses about: ' },
  { id: 'passage_explanation', i18nKey: 'explainPassage', emoji: '📖', prompt_en: 'Explain this passage: ', prompt_om: 'Kutaa kana hiiki: ' },
  { id: 'sermon_outline',      i18nKey: 'sermonOutline',  emoji: '📋', prompt_en: 'Create a sermon outline on: ' },
  { id: 'study_plan',          i18nKey: 'studyPlan',      emoji: '📅', prompt_en: 'Create a 7-day Bible study plan about: ' },
  { id: 'prayer_points',       i18nKey: 'prayerPoints',   emoji: '🙏', prompt_en: 'Give me 5 prayer points based on: ' },
  { id: 'discussion',          i18nKey: 'discussionQs',   emoji: '💬', prompt_en: 'Create 5 small group discussion questions on: ' },
  { id: 'app_help',            i18nKey: 'appHelp',        emoji: '❓', prompt_en: 'How do I ' },
];

// ─── Browser language auto-detection ─────────────────────────────────────────
export function detectBrowserLanguage() {
  const raw = (navigator.language || navigator.languages?.[0] || 'en').toLowerCase().split('-')[0];
  return SUPPORTED_CODES.has(raw) ? raw : 'en';
}

// ─── Script-based heuristic language detection ───────────────────────────────
export function detectScriptLanguage(text) {
  if (!text || text.length < 4) return null;
  if (/[\u06A9\u06AF\u067E\u0686\u0698]/.test(text)) return 'fa'; // Persian-specific
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  if (/[\u0370-\u03FF]/.test(text)) return 'el';
  if (/[\u1200-\u137F]/.test(text)) return 'am';
  return null;
}

// ─── System prompt builder ────────────────────────────────────────────────────
export function buildSystemPrompt(langCode) {
  const lang = getLang(langCode);
  return `You are FaithLight AI, a Christian Bible study assistant.

CRITICAL LANGUAGE RULE:
- Reply ONLY in ${lang.name}.
- Do NOT switch languages unless the user explicitly asks to change language.
- If the user writes in another language, still reply in ${lang.name}.
- When citing Scripture, prefer the ${lang.bibleVersion} translation when available.

STYLE:
- Clear, respectful, and encouraging.
- Non-denominational unless the user requests a specific tradition.
- Include Bible references (Book Chapter:Verse) when helpful.
- If uncertain, say so and encourage verifying with Scripture.
- Use markdown for structured responses.
- End biblical claims with: ⚠️ *AI-generated content may contain errors. Always verify with Scripture.*

SKILLS: Bible search, passage explanation, sermon outlines, study plans, prayer points, discussion questions, app help.`.trim();
}

// ─── Passage explanation prompt (grounded to verse text) ─────────────────────
export function buildPassageExplanationPrompt(langCode, reference, passageText) {
  const lang = getLang(langCode);
  const isOromo = langCode === 'om';
  return `You are a Bible study assistant for FaithLight.

CRITICAL RULES:
- You MUST ONLY explain the passage text provided below. Do NOT invent words, names, or details not found in the passage.
- If something is unclear in the text, say "I'm not sure" and suggest reading the surrounding chapter.
- Reply ONLY in ${lang.name}.
- Do NOT fabricate verse numbers or content not in the passage text.

PASSAGE TO EXPLAIN:
Reference: ${reference}
Text: "${passageText}"

${isOromo ? `Use this structure for your explanation:
1) **Hiika gabaabaa** (Summary)
2) **Seenaa fi haala itti jedhu** (Context)
3) **Barumsa amantii** (Theological themes)
4) **Itti fayyadama jireenyaa** (Practical application)` : `Structure your explanation as:
1) **Summary** — what this passage says
2) **Context** — historical and scriptural background
3) **Theological themes** — key faith themes
4) **Practical application** — how to apply this today`}

End with: ⚠️ *${isOromo ? "AI-generated content — mirkaneeffadhuuf Macaafa Qulqulluu ilaali." : "AI-generated content may contain errors. Always verify with Scripture."}*`;
}