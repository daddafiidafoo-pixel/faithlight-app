/**
 * Multilingual Daily Verse Service
 * Provides date-based, language-aware verse selection with translations
 */

const VERSE_DATABASE = [
  {
    id: 1,
    reference: {
      en: "Psalm 23:1",
      fr: "Psaume 23:1",
      sw: "Zaburi 23:1",
      ar: "المزمور 23:1",
      ti: "ምዕራፍ ስብእ 23:1",
      am: "መዝሙር 23:1",
      om: "Faarfannaa 23:1"
    },
    text: {
      en: "The LORD is my shepherd; I shall not want.",
      fr: "L'Éternel est mon berger; je ne manquerai de rien.",
      sw: "Bwana ni mchungaji wangu; sitakosa kitu.",
      ar: "الرب راعيّ فلا يعوزني شيء.",
      ti: "ጃህ ሌሊተይ ስሪት; ወሃቡ ኢሙሳሰር።",
      am: "እግዚአብሔር እረኛዬ ነው፤ የሚያሳጣኝ ነገር የለም።",
      om: "Gooftaan tiksee kiyya; wantii na dhabsiisu hin jiru."
    }
  },
  {
    id: 2,
    reference: {
      en: "John 3:16",
      fr: "Jean 3:16",
      sw: "Yohana 3:16",
      ar: "يوحنا 3:16",
      ti: "ዮሐንስ 3:16",
      am: "ዮሐንስ 3:16",
      om: "Yohaannis 3:16"
    },
    text: {
      en: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
      fr: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.",
      sw: "Kwa maana Mungu akupenda ulimwengu hivi kiasi, hata akamtoa Mwanawe anayetaka, ili kila anayemwamini bila kumtao angekufa, bali akuwa na uzima wa milele.",
      ar: "لأنه هكذا أحب الله العالم حتى بذل ابنه الوحيد لكي لا يهلك كل من يؤمن به بل تكون له الحياة الأبدية.",
      ti: "ምክንያቱም አምላክ ዓለምን ሊበጅ ወደ ሞት እንዳይገባ እና ዘለዓለማዊ ህይወት እንዲኖር ብቻ ፈርዖሙ የወልዱን ሰጠ።",
      am: "እግዚአብሔር ዓለምን እጅግ ወዶ ስለሆነ፣ የሚያምን ሁሉ ሳይጠፋ የዘለዓለም ሕይወት እንዲኖረው አንድያ ልጁን ሰጠ።",
      om: "Waaqayyo addunyaa kana akkaan jaallateef, isa amanu hundi badu osoo hin taane jireenya bara baraa akka qabaatu, ilma isaa tokkicha kenne."
    }
  },
  {
    id: 3,
    reference: {
      en: "Philippians 4:6",
      fr: "Philippiens 4:6",
      sw: "Wafilipeni 4:6",
      ar: "فيلبي 4:6",
      ti: "ፊሊጵናውያን 4:6",
      am: "ፊልጵስዩስ 4:6",
      om: "Filipisiyuus 4:6"
    },
    text: {
      en: "Rejoice in the Lord always; again I will say, rejoice. Let your gentleness be known to everyone.",
      fr: "Réjouissez-vous toujours dans le Seigneur; je le répète, réjouissez-vous. Que votre douceur soit connue de tous les hommes.",
      sw: "Furahia kila wakati katika Bwana; tena nikasema, furahia. Kiburi chako kijulikane kwa wote.",
      ar: "افرحوا بالرب كل حين، وأقول أيضا افرحوا. ليعلم جميع الناس حلمكم.",
      ti: "በጃህ ሁልጊዜ ደስ ይበሉ; ደግሞ እላለሁ ደስ ይበሉ። ሰላም አልፍቶ ሁሉንም ሰው ይነግራል።",
      am: "በጌታ ሁልጊዜ ደስ ይበላችሁ፤ ደግሜ እላለሁ ደስ ይበላችሁ። ልስላሴያችሁ ለሰው ሁሉ ይታወቅ።",
      om: "Yeroo hundumaa keessatti Gooftaa keessatti gammadaa; ammas nan jedhu, gammadaa. Garraamummaan keessan namoota hunda biratti haa beekamu."
    }
  },
  {
    id: 4,
    reference: {
      en: "Proverbs 3:5-6",
      fr: "Proverbes 3:5-6",
      sw: "Mithali 3:5-6",
      ar: "أمثال 3:5-6",
      ti: "መሊሳ 3:5-6",
      am: "ምሳሌ 3:5-6",
      om: "Macaafa Hiika 3:5-6"
    },
    text: {
      en: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways acknowledge him, and he will make your paths straight.",
      fr: "Confie-toi à l'Éternel de tout ton cœur, et ne t'appuie pas sur ta propre intelligence. Reconnais-le dans toutes tes voies, et il dirigera tes sentiers.",
      sw: "Mkamate Bwana kwa moyo wako wote, wala usitegemeze akili yako mwenyewe. Katika njia zako zote, mjue, naye atakamilisha njia zako.",
      ar: "اطلب من الرب بكل قلبك، ولا تعتمد على فهمك الخاص. اعترف به في جميع طرقك، وسيجعل مساراتك مستقيمة.",
      ti: "በሃያ ልብ አደር ጃህን ታመን። በንብርት ይሙር አላለ። በሁሉም ምዕራፍ ጃህን ታወቅ፣ እናም እርሱ መንገድሮ ልናጸናተር።",
      am: "በፍጹም ልብህ በጌታ ላይ ታመን፤ በራስህ ማስተዋል አትደገፍ። በሁሉ መንገድህ እርሱን እወቀው፣ እርሱም ጎዳናህን ያቃናልሃል።",
      om: "Gooftaa kee garaa guutuu keetiin amani; beekumsa kee dhuunfaa irratti hin hirkatin. Karaa kee hundumaa keessatti isa beeki, innis karaa kee sirreessa."
    }
  },
  {
    id: 5,
    reference: {
      en: "Romans 8:28",
      fr: "Romains 8:28",
      sw: "Warumi 8:28",
      ar: "رومية 8:28",
      ti: "ሮማውያን 8:28",
      am: "ሮሜ 8:28",
      om: "Roomaa 8:28"
    },
    text: {
      en: "We know that in all things God works for the good of those who love him, who have been called according to his purpose.",
      fr: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.",
      sw: "Tunajua kwamba Mungu hufanya mambo mema kwa ajili ya wale wanayeMwupenda, kwa ajili ya wale ambao wameitwa sawa na muhtasari wake.",
      ar: "نعلم أن جميع الأشياء تعمل معا لخير الذين يحبون الله، الذين دعوا وفقا لمقصده.",
      ti: "አውቀን ምክንያቱም አምላክ ሁሉንም ነገር ለበጎ መገበር ለሚፈለጋቸው እና ተጠርተው እንደ ዓላማው।",
      am: "እርሱን ለሚወዱት፣ እንደ አሳቡም ለተጠሩት፣ ሁሉም ነገር ለበጎ እንደሚሠራ እናውቃለን።",
      om: "Warra isa jaallatan, kan karoora isaa irratti waamaman hundaaf, wanti hundi tokkummaan gaarii akka ta'uuf akka hojjetu ni beekna."
    }
  },
  {
    id: 6,
    reference: {
      en: "Psalm 27:1",
      fr: "Psaume 27:1",
      sw: "Zaburi 27:1",
      ar: "المزمور 27:1",
      ti: "ምዕራፍ ስብእ 27:1",
      am: "መዝሙር 27:1",
      om: "Faarfannaa 27:1"
    },
    text: {
      en: "The LORD is my light and my salvation—whom shall I fear?",
      fr: "L'Éternel est ma lumière et mon salut; de qui aurais-je peur?",
      sw: "Bwana ni mwanga wangu na wokovu wangu; ni nani nitakayeitaka?",
      ar: "الرب نوري وخلاصي؛ ممن أخاف؟",
      ti: "ጃህ ብርሃን እና መዳን ነኝ; ከማን እፍራ?",
      am: "እግዚአብሔር ብርሃኔና መዳኔ ነው፤ ከማን እፈራለሁ?",
      om: "Gooftaan ifaa kiyyaa fi fayyinaa kiyya dha; eenyurraa nan sodaata?"
    }
  }
];

const REFLECTIONS = {
  en: {
    1: "Today, remember that God cares for you like a shepherd cares for his flock. Trust in His provision and guidance.",
    2: "God's love is infinite and unconditional. Reflect on how His sacrifice demonstrates the depth of His love for you.",
    3: "Let joy and gratitude fill your heart today. Share your peace with those around you.",
    4: "In every decision, seek God's wisdom first. He promises to guide your steps when you trust Him.",
    5: "Even when circumstances seem difficult, remember that God works all things for your good.",
    6: "Rest in God's protection and light. Fear has no place when you trust in the One who holds all power."
  },
  fr: {
    1: "Aujourd'hui, souvenez-vous que Dieu prend soin de vous comme un berger s'occupe de son troupeau. Faites confiance à Sa provision.",
    2: "L'amour de Dieu est infini et inconditionnel. Réfléchissez à la profondeur de Son amour envers vous.",
    3: "Laissez la joie et la gratitude remplir votre cœur aujourd'hui. Partagez votre paix avec ceux qui vous entourent.",
    4: "Dans chaque décision, cherchez d'abord la sagesse de Dieu. Il promet de guider vos pas.",
    5: "Même quand les circonstances semblent difficiles, rappelez-vous que Dieu œuvre pour votre bien.",
    6: "Reposez-vous dans la protection et la lumière de Dieu. La peur n'a pas sa place quand vous confiez en Celui qui détient tout pouvoir."
  },
  sw: {
    1: "Leo, kumbuka kwamba Mungu anakuangalia kama mchungaji anayetunza kundi lake. Mkamate katika utendaji wake.",
    2: "Upendo wa Mungu ni usio na kikomo. Fikiria jinsi sadaka yake inatuliza upendo wake kwa ajili yako.",
    3: "Acha furaha na shukrani zijaze moyo wako leo. Sambaza amani yako kwa wale wanaokuzunguka.",
    4: "Katika kila azimio, tafuta hekima ya Mungu kwanza. Anatangaza kwamba atakuongoza njia zako.",
    5: "Hata wakati mazoefu yanasikika magumu, kumbuka kwamba Mungu hufanya mambo yote kwa ajili yako.",
    6: "Pumzika katika ulinzi na mwanga wa Mungu. Woga haina mahali wakati unamkamate yule anayemiliki kila nguvu."
  },
  ar: {
    1: "اليوم، تذكر أن الله يعتني بك كراعٍ يعتني بقطيعه. ثق بعنايته وتوجيهه.",
    2: "حب الله غير محدود وغير مشروط. تأمل في عمق حبه لك من خلال تضحيته.",
    3: "دع الفرح والامتنان يملآن قلبك اليوم. شارك سلامك مع من حولك.",
    4: "في كل قرار، اطلب حكمة الله أولاً. إنه يعدك بأن يرشدك في كل خطواتك.",
    5: "حتى عندما تبدو الظروف صعبة، تذكر أن الله يعمل كل شيء لصالحك.",
    6: "استريح في حماية الله ونوره. لا مكان للخوف عندما تثق فيمن يملك كل القوة."
  },
  ti: {
    1: "ዛሬ አስታውስ ያውቃል አምላክ ሲያስጠብቅ አዳኝ ሁሳሳ የትጉህ። በአቅሪ ሐሜ።",
    2: "ምሕረተ አምላክ ላልተወሰነ እና ላልተመሰጠ። ተወሰደ ከቦታ ምስጢር ፍቅሩ ለእንስሳ።",
    3: "አድሮ ደስታ እና ምስጋና ሃብታ መልስ። ሰላም ራስዎ በአጠቂቱ።",
    4: "በእያንዳንዱ ውሳኔ ክህሊት አምላክ ተጠይቅ ብቅ። እርሱ አልኰ መንገድሮ።",
    5: "በምንም ውጪ ሁኖ ገሚሩ ሁሉ እርሱ በሚስ ትዕዛዝ።",
    6: "በሐይወት እና ብርሃን አምላክ ተኬዳ። ጥርጥር ወ ሀገር ትወሰን።"
  },
  am: {
    1: "ዛሬ፣ እግዚአብሔር እረኛ እንደሚጠብቅ መንጋውን እንደሚጠብቅህ አስታውስ። በአቅርቦቱ እና ምሪቱ ታምን።",
    2: "የእግዚአብሔር ፍቅር ወሰን የለውም። ለአንተ ያለው ፍቅር ምን ያህል ጥልቅ እንደሆነ አስብ።",
    3: "ዛሬ ደስታና ምስጋና ልብህን ይሙላ። ሰላምህን ከአካባቢህ ካሉት ጋር አካፍል።",
    4: "በእያንዳንዱ ውሳኔ፣ አስቀድሞ የእግዚአብሔርን ጥበብ ፈልግ። ርምጃህን ሲረዳህ ቃሉን ይዞሃል።",
    5: "ሁኔታዎቹ ከባድ ቢመስሉ፣ እግዚአብሔር ሁሉን ለበጎህ ሲሠራ እንዳለ አስታውስ።",
    6: "በእግዚአብሔር ጥበቃና ብርሃን ዕረፍ። ሁሉን ሥልጣን ባለው ሰው ስትታመን ፍርሃት ቦታ የለውም።"
  },
  om: {
    1: "Har'a, Waaqayyo akka tikseen hordaa isaa tiisu akkasumas si akka kunuunsuuf yaadadhu. Dhiyeessaa fi qajeelcha isaa irratti amani.",
    2: "Jaalala Waaqayyoo daangaa hin qabu. Karaa wareegama isaa jaallala isaa si'if qabu irratti xinxali.",
    3: "Har'a gammachuun fi galanni garaa kee haa guutan. Nagaa kee warra naannoo kee jiran wajjin qoodi.",
    4: "Murteewwan hundumaatti, jalqaba ogummaa Waaqayyoo barbaadi. Karaalee kee keessatti si qajeelcha.",
    5: "Haalli yeroo rakkisaa ta'e illee, Waaqayyo wantoota hunda gaarii keetiif akka hojjetu yaadadhu.",
    6: "Eegumsa fi ifaa Waaqayyoo keessatti boqodhu. Hundaa danda'a kan amantetti sodaan bakka hin qabu."
  }
};

/**
 * Get today's date key (YYYY-MM-DD format)
 */
export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Map UI language labels to language codes
 */
function normalizeLanguageCode(langLabel) {
  const mapping = {
    'en': 'en',
    'English': 'en',
    'fr': 'fr',
    'Français': 'fr',
    'French': 'fr',
    'sw': 'sw',
    'Kiswahili': 'sw',
    'ar': 'ar',
    'Arabic': 'ar',
    'العربية': 'ar',
    'ti': 'ti',
    'Tigrinya': 'ti',
    'ትግርኛ': 'ti',
    'am': 'am',
    'Amharic': 'am',
    'om': 'om',
    'Oromo': 'om'
  };
  return mapping[langLabel] || 'en';
}

/**
 * Get daily verse for a given language and date
 * Deterministically selects verse based on date string
 */
export function getDailyVerse(languageLabel) {
  const languageCode = normalizeLanguageCode(languageLabel);
  const dateKey = getTodayKey();
  
  // Deterministic selection: use date string to seed verse selection
  const dateHash = dateKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const verseIndex = dateHash % VERSE_DATABASE.length;
  const verse = VERSE_DATABASE[verseIndex];
  
  return {
    id: verse.id,
    reference: verse.reference[languageCode] || verse.reference.en,
    text: verse.text[languageCode] || verse.text.en,
    languageCode,
    dateKey,
    isRTL: ['ar', 'am'].includes(languageCode)
  };
}

/**
 * Get daily reflection for a given verse and language
 */
export function getDailyReflection(languageLabel, verseId = null) {
  const languageCode = normalizeLanguageCode(languageLabel);
  const dateKey = getTodayKey();
  
  // If no verseId provided, use the verse selected for today
  let reflectionVerseId = verseId;
  if (!reflectionVerseId) {
    const dateHash = dateKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    reflectionVerseId = (dateHash % VERSE_DATABASE.length) + 1;
  }
  
  const reflectionsByLang = REFLECTIONS[languageCode] || REFLECTIONS.en;
  const reflection = reflectionsByLang[reflectionVerseId] || reflectionsByLang[1];
  
  return {
    text: reflection,
    languageCode,
    dateKey,
    isRTL: ['ar', 'am'].includes(languageCode)
  };
}

/**
 * Get both verse and reflection together
 */
export function getDailyVerseWithReflection(languageLabel) {
  const verse = getDailyVerse(languageLabel);
  const reflection = getDailyReflection(languageLabel, verse.id);
  
  return {
    verse,
    reflection,
    dateKey: verse.dateKey
  };
}