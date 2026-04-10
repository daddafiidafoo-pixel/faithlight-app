import { createClient } from 'npm:@supabase/supabase-js@2.38.0';

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_KEY')
    );

    // Bible books metadata (66 books)
    const bibleBooks = [
      { id: 1, book_key: 'genesis', testament: 'old', chapters: 50 },
      { id: 2, book_key: 'exodus', testament: 'old', chapters: 40 },
      { id: 3, book_key: 'leviticus', testament: 'old', chapters: 27 },
      { id: 4, book_key: 'numbers', testament: 'old', chapters: 36 },
      { id: 5, book_key: 'deuteronomy', testament: 'old', chapters: 34 },
      { id: 6, book_key: 'joshua', testament: 'old', chapters: 24 },
      { id: 7, book_key: 'judges', testament: 'old', chapters: 21 },
      { id: 8, book_key: 'ruth', testament: 'old', chapters: 4 },
      { id: 9, book_key: '1-samuel', testament: 'old', chapters: 31 },
      { id: 10, book_key: '2-samuel', testament: 'old', chapters: 24 },
      { id: 11, book_key: '1-kings', testament: 'old', chapters: 22 },
      { id: 12, book_key: '2-kings', testament: 'old', chapters: 25 },
      { id: 13, book_key: '1-chronicles', testament: 'old', chapters: 29 },
      { id: 14, book_key: '2-chronicles', testament: 'old', chapters: 36 },
      { id: 15, book_key: 'ezra', testament: 'old', chapters: 10 },
      { id: 16, book_key: 'nehemiah', testament: 'old', chapters: 13 },
      { id: 17, book_key: 'esther', testament: 'old', chapters: 10 },
      { id: 18, book_key: 'job', testament: 'old', chapters: 42 },
      { id: 19, book_key: 'psalms', testament: 'old', chapters: 150 },
      { id: 20, book_key: 'proverbs', testament: 'old', chapters: 31 },
      { id: 21, book_key: 'ecclesiastes', testament: 'old', chapters: 12 },
      { id: 22, book_key: 'song-of-solomon', testament: 'old', chapters: 8 },
      { id: 23, book_key: 'isaiah', testament: 'old', chapters: 66 },
      { id: 24, book_key: 'jeremiah', testament: 'old', chapters: 52 },
      { id: 25, book_key: 'lamentations', testament: 'old', chapters: 5 },
      { id: 26, book_key: 'ezekiel', testament: 'old', chapters: 48 },
      { id: 27, book_key: 'daniel', testament: 'old', chapters: 12 },
      { id: 28, book_key: 'hosea', testament: 'old', chapters: 14 },
      { id: 29, book_key: 'joel', testament: 'old', chapters: 3 },
      { id: 30, book_key: 'amos', testament: 'old', chapters: 9 },
      { id: 31, book_key: 'obadiah', testament: 'old', chapters: 1 },
      { id: 32, book_key: 'jonah', testament: 'old', chapters: 4 },
      { id: 33, book_key: 'micah', testament: 'old', chapters: 7 },
      { id: 34, book_key: 'nahum', testament: 'old', chapters: 3 },
      { id: 35, book_key: 'habakkuk', testament: 'old', chapters: 3 },
      { id: 36, book_key: 'zephaniah', testament: 'old', chapters: 3 },
      { id: 37, book_key: 'haggai', testament: 'old', chapters: 2 },
      { id: 38, book_key: 'zechariah', testament: 'old', chapters: 14 },
      { id: 39, book_key: 'malachi', testament: 'old', chapters: 4 },
      { id: 40, book_key: 'matthew', testament: 'new', chapters: 28 },
      { id: 41, book_key: 'mark', testament: 'new', chapters: 16 },
      { id: 42, book_key: 'luke', testament: 'new', chapters: 24 },
      { id: 43, book_key: 'john', testament: 'new', chapters: 21 },
      { id: 44, book_key: 'acts', testament: 'new', chapters: 28 },
      { id: 45, book_key: 'romans', testament: 'new', chapters: 16 },
      { id: 46, book_key: '1-corinthians', testament: 'new', chapters: 16 },
      { id: 47, book_key: '2-corinthians', testament: 'new', chapters: 13 },
      { id: 48, book_key: 'galatians', testament: 'new', chapters: 6 },
      { id: 49, book_key: 'ephesians', testament: 'new', chapters: 6 },
      { id: 50, book_key: 'philippians', testament: 'new', chapters: 4 },
      { id: 51, book_key: 'colossians', testament: 'new', chapters: 4 },
      { id: 52, book_key: '1-thessalonians', testament: 'new', chapters: 5 },
      { id: 53, book_key: '2-thessalonians', testament: 'new', chapters: 3 },
      { id: 54, book_key: '1-timothy', testament: 'new', chapters: 6 },
      { id: 55, book_key: '2-timothy', testament: 'new', chapters: 4 },
      { id: 56, book_key: 'titus', testament: 'new', chapters: 3 },
      { id: 57, book_key: 'philemon', testament: 'new', chapters: 1 },
      { id: 58, book_key: 'hebrews', testament: 'new', chapters: 13 },
      { id: 59, book_key: 'james', testament: 'new', chapters: 5 },
      { id: 60, book_key: '1-peter', testament: 'new', chapters: 5 },
      { id: 61, book_key: '2-peter', testament: 'new', chapters: 3 },
      { id: 62, book_key: '1-john', testament: 'new', chapters: 5 },
      { id: 63, book_key: '2-john', testament: 'new', chapters: 1 },
      { id: 64, book_key: '3-john', testament: 'new', chapters: 1 },
      { id: 65, book_key: 'jude', testament: 'new', chapters: 1 },
      { id: 66, book_key: 'revelation', testament: 'new', chapters: 22 },
    ];

    // Book names - all 6 languages
    const bookNames = [
      { id: 1, en: 'Genesis', om: 'Seera Uumamaa', am: 'ኦሪት ዘፍጥረት', ar: 'التكوين', sw: 'Mwanzo', fr: 'Genèse' },
      { id: 2, en: 'Exodus', om: "Ba'uu", am: 'ኦሪት ዘጸአት', ar: 'الخروج', sw: 'Kutoka', fr: 'Exode' },
      { id: 3, en: 'Leviticus', om: 'Lewwota', am: 'ኦሪት ዘሌዋውያን', ar: 'اللاويين', sw: 'Mambo ya Walawi', fr: 'Lévitique' },
      { id: 4, en: 'Numbers', om: 'Lakkoobsa', am: 'ኦሪት ዘኍልቍ', ar: 'العدد', sw: 'Hesabu', fr: 'Nombres' },
      { id: 5, en: 'Deuteronomy', om: 'Keessa Deebii', am: 'ኦሪት ዘዳግም', ar: 'التثنية', sw: 'Kumbukumbu la Torati', fr: 'Deutéronome' },
      { id: 6, en: 'Joshua', om: 'Iyyaasuu', am: 'ኢያሱ', ar: 'يشوع', sw: 'Yoshua', fr: 'Josué' },
      { id: 7, en: 'Judges', om: 'Abbootii Murtii', am: 'መሳፍንት', ar: 'القضاة', sw: 'Waamuzi', fr: 'Juges' },
      { id: 8, en: 'Ruth', om: 'Ruut', am: 'ሩት', ar: 'راعوث', sw: 'Ruthu', fr: 'Ruth' },
      { id: 9, en: '1 Samuel', om: "1 Saamu'eel", am: '1 ሳሙኤል', ar: 'صموئيل الأول', sw: '1 Samweli', fr: '1 Samuel' },
      { id: 10, en: '2 Samuel', om: "2 Saamu'eel", am: '2 ሳሙኤል', ar: 'صموئيل الثاني', sw: '2 Samweli', fr: '2 Samuel' },
      { id: 11, en: '1 Kings', om: '1 Mootota', am: '1 ነገሥት', ar: 'الملوك الأول', sw: '1 Wafalme', fr: '1 Rois' },
      { id: 12, en: '2 Kings', om: '2 Mootota', am: '2 ነገሥት', ar: 'الملوك الثاني', sw: '2 Wafalme', fr: '2 Rois' },
      { id: 13, en: '1 Chronicles', om: '1 Seenaa Baraa', am: '1 ዜና መዋዕል', ar: 'أخبار الأيام الأول', sw: '1 Mambo ya Nyakati', fr: '1 Chroniques' },
      { id: 14, en: '2 Chronicles', om: '2 Seenaa Baraa', am: '2 ዜና መዋዕል', ar: 'أخبار الأيام الثاني', sw: '2 Mambo ya Nyakati', fr: '2 Chroniques' },
      { id: 15, en: 'Ezra', om: 'Izraa', am: 'ዕዝራ', ar: 'عزرا', sw: 'Ezra', fr: 'Esdras' },
      { id: 16, en: 'Nehemiah', om: 'Nehimiiyaa', am: 'ነህምያ', ar: 'نحميا', sw: 'Nehemia', fr: 'Néhémie' },
      { id: 17, en: 'Esther', om: 'Asteer', am: 'አስቴር', ar: 'أستير', sw: 'Esta', fr: 'Esther' },
      { id: 18, en: 'Job', om: 'Iyoob', am: 'ኢዮብ', ar: 'أيوب', sw: 'Ayubu', fr: 'Job' },
      { id: 19, en: 'Psalms', om: 'Faarfannaa', am: 'መዝሙረ ዳዊት', ar: 'المزامير', sw: 'Zaburi', fr: 'Psaumes' },
      { id: 20, en: 'Proverbs', om: 'Fakkeenya', am: 'ምሳሌ', ar: 'الأمثال', sw: 'Mithali', fr: 'Proverbes' },
      { id: 21, en: 'Ecclesiastes', om: 'Lallaba', am: 'መክብብ', ar: 'الجامعة', sw: 'Mhubiri', fr: 'Ecclésiaste' },
      { id: 22, en: 'Song of Solomon', om: 'Weedduu Solomoon', am: 'መኃልየ መኃልይ', ar: 'نشيد الأنشاد', sw: 'Wimbo Ulio Bora', fr: 'Cantique des Cantiques' },
      { id: 23, en: 'Isaiah', om: 'Isaayyaas', am: 'ኢሳይያስ', ar: 'إشعياء', sw: 'Isaya', fr: 'Ésaïe' },
      { id: 24, en: 'Jeremiah', om: 'Ermiyaas', am: 'ኤርምያስ', ar: 'إرميا', sw: 'Yeremia', fr: 'Jérémie' },
      { id: 25, en: 'Lamentations', om: "Bo'icha Ermiyaas", am: 'ሰቆቃወ ኤርምያስ', ar: 'مراثي إرميا', sw: 'Maombolezo', fr: 'Lamentations' },
      { id: 26, en: 'Ezekiel', om: "Hisqi'eel", am: 'ሕዝቅኤል', ar: 'حزقيال', sw: 'Ezekieli', fr: 'Ézéchiel' },
      { id: 27, en: 'Daniel', om: "Daani'eel", am: 'ዳንኤል', ar: 'دانيال', sw: 'Danieli', fr: 'Daniel' },
      { id: 28, en: 'Hosea', om: "Hoose'aa", am: 'ሆሴዕ', ar: 'هوشع', sw: 'Hosea', fr: 'Osée' },
      { id: 29, en: 'Joel', om: "Yo'el", am: 'ኢዮኤል', ar: 'يوئيل', sw: 'Yoeli', fr: 'Joël' },
      { id: 30, en: 'Amos', om: 'Aamoos', am: 'አሞጽ', ar: 'عاموس', sw: 'Amosi', fr: 'Amos' },
      { id: 31, en: 'Obadiah', om: 'Obaadiyaa', am: 'አብድዩ', ar: 'عوبديا', sw: 'Obadia', fr: 'Abdias' },
      { id: 32, en: 'Jonah', om: 'Yoonaas', am: 'ዮናስ', ar: 'يونان', sw: 'Yona', fr: 'Jonas' },
      { id: 33, en: 'Micah', om: 'Miikiyaas', am: 'ሚክያስ', ar: 'ميخا', sw: 'Mika', fr: 'Michée' },
      { id: 34, en: 'Nahum', om: 'Naahoom', am: 'ናሆም', ar: 'ناحوم', sw: 'Nahumu', fr: 'Nahum' },
      { id: 35, en: 'Habakkuk', om: 'Habaquuq', am: 'ዕንባቆም', ar: 'حبقوق', sw: 'Habakuki', fr: 'Habacuc' },
      { id: 36, en: 'Zephaniah', om: 'Sefaaniyaa', am: 'ሶፎንያስ', ar: 'صفنيا', sw: 'Sefania', fr: 'Sophonie' },
      { id: 37, en: 'Haggai', om: 'Hagayi', am: 'ሐጌ', ar: 'حجي', sw: 'Hagai', fr: 'Aggée' },
      { id: 38, en: 'Zechariah', om: 'Zakariyaas', am: 'ዘካርያስ', ar: 'زكريا', sw: 'Zekaria', fr: 'Zacharie' },
      { id: 39, en: 'Malachi', om: 'Malaaki', am: 'ሚልክያስ', ar: 'ملاخي', sw: 'Malaki', fr: 'Malachie' },
      { id: 40, en: 'Matthew', om: 'Maatewos', am: 'ማቴዎስ', ar: 'متى', sw: 'Mathayo', fr: 'Matthieu' },
      { id: 41, en: 'Mark', om: 'Maarqoos', am: 'ማርቆስ', ar: 'مرقس', sw: 'Marko', fr: 'Marc' },
      { id: 42, en: 'Luke', om: 'Luqaas', am: 'ሉቃስ', ar: 'لوقا', sw: 'Luka', fr: 'Luc' },
      { id: 43, en: 'John', om: 'Yohaannis', am: 'ዮሐንስ', ar: 'يوحنا', sw: 'Yohana', fr: 'Jean' },
      { id: 44, en: 'Acts', om: 'Hojii Ergamootaa', am: 'የሐዋርያት ሥራ', ar: 'أعمال الرسل', sw: 'Matendo ya Mitume', fr: 'Actes' },
      { id: 45, en: 'Romans', om: 'Roomaa', am: 'ሮሜ', ar: 'رومية', sw: 'Warumi', fr: 'Romains' },
      { id: 46, en: '1 Corinthians', om: '1 Qorontos', am: '1 ቆሮንቶስ', ar: 'كورنثوس الأولى', sw: '1 Wakorintho', fr: '1 Corinthiens' },
      { id: 47, en: '2 Corinthians', om: '2 Qorontos', am: '2 ቆሮንቶስ', ar: 'كورنثوس الثانية', sw: '2 Wakorintho', fr: '2 Corinthiens' },
      { id: 48, en: 'Galatians', om: 'Galaatiyaa', am: 'ገላትያ', ar: 'غلاطية', sw: 'Wagalatia', fr: 'Galates' },
      { id: 49, en: 'Ephesians', om: 'Efesoon', am: 'ኤፌሶን', ar: 'أفسس', sw: 'Waefeso', fr: 'Éphésiens' },
      { id: 50, en: 'Philippians', om: 'Filiphisiyuus', am: 'ፊልጵስዩስ', ar: 'فيلبي', sw: 'Wafilipi', fr: 'Philippiens' },
      { id: 51, en: 'Colossians', om: 'Qolosaayis', am: 'ቆላስይስ', ar: 'كولوسي', sw: 'Wakolosai', fr: 'Colossiens' },
      { id: 52, en: '1 Thessalonians', om: '1 Tasalonqee', am: '1 ተሰሎንቄ', ar: 'تسالونيكي الأولى', sw: '1 Wathesalonike', fr: '1 Thessaloniciens' },
      { id: 53, en: '2 Thessalonians', om: '2 Tasalonqee', am: '2 ተሰሎንቄ', ar: 'تسالونيكي الثانية', sw: '2 Wathesalonike', fr: '2 Thessaloniciens' },
      { id: 54, en: '1 Timothy', om: '1 Ximotewos', am: '1 ጢሞቴዎስ', ar: 'تيموثاوس الأولى', sw: '1 Timotheo', fr: '1 Timothée' },
      { id: 55, en: '2 Timothy', om: '2 Ximotewos', am: '2 ጢሞቴዎስ', ar: 'تيموثاوس الثانية', sw: '2 Timotheo', fr: '2 Timothée' },
      { id: 56, en: 'Titus', om: 'Tiitoos', am: 'ቲቶ', ar: 'تيطس', sw: 'Tito', fr: 'Tite' },
      { id: 57, en: 'Philemon', om: 'Filemoon', am: 'ፊልሞና', ar: 'فليمون', sw: 'Filemoni', fr: 'Philémon' },
      { id: 58, en: 'Hebrews', om: 'Ibroota', am: 'ዕብራውያን', ar: 'العبرانيين', sw: 'Waebrania', fr: 'Hébreux' },
      { id: 59, en: 'James', om: 'Yaaqoob', am: 'ያዕቆብ', ar: 'يعقوب', sw: 'Yakobo', fr: 'Jacques' },
      { id: 60, en: '1 Peter', om: '1 Phexiroos', am: '1 ጴጥሮስ', ar: 'بطرس الأولى', sw: '1 Petro', fr: '1 Pierre' },
      { id: 61, en: '2 Peter', om: '2 Phexiroos', am: '2 ጴጥሮስ', ar: 'بطرس الثانية', sw: '2 Petro', fr: '2 Pierre' },
      { id: 62, en: '1 John', om: '1 Yohaannis', am: '1 ዮሐንስ', ar: 'يوحنا الأولى', sw: '1 Yohana', fr: '1 Jean' },
      { id: 63, en: '2 John', om: '2 Yohaannis', am: '2 ዮሐንስ', ar: 'يوحنا الثانية', sw: '2 Yohana', fr: '2 Jean' },
      { id: 64, en: '3 John', om: '3 Yohaannis', am: '3 ዮሐንስ', ar: 'يوحنا الثالثة', sw: '3 Yohana', fr: '3 Jean' },
      { id: 65, en: 'Jude', om: 'Yihudaa', am: 'ይሁዳ', ar: 'يهوذا', sw: 'Yuda', fr: 'Jude' },
      { id: 66, en: 'Revelation', om: "Mul'ata Yohaannis", am: 'ራእይ ዮሐንስ', ar: 'الرؤيا', sw: 'Ufunuo', fr: 'Apocalypse' },
    ];

    // Abbreviations - all 6 languages
    const abbreviations = [
      { id: 1, en: 'Gen', om: 'Uma', am: 'ዘፍ', ar: 'تك', sw: 'Mwa', fr: 'Gn' },
      { id: 2, en: 'Exod', om: 'Bau', am: 'ዘጸ', ar: 'خر', sw: 'Kut', fr: 'Ex' },
      { id: 3, en: 'Lev', om: 'Lew', am: 'ዘሌ', ar: 'لا', sw: 'Wal', fr: 'Lv' },
      { id: 4, en: 'Num', om: 'Lak', am: 'ዘኍ', ar: 'عد', sw: 'Hes', fr: 'Nb' },
      { id: 5, en: 'Deut', om: 'Kee', am: 'ዘዳ', ar: 'تث', sw: 'Kum', fr: 'Dt' },
      { id: 6, en: 'Josh', om: 'Iyy', am: 'ኢያ', ar: 'يش', sw: 'Yos', fr: 'Jos' },
      { id: 7, en: 'Judg', om: 'Abb', am: 'መሳ', ar: 'قض', sw: 'Waa', fr: 'Jg' },
      { id: 8, en: 'Ruth', om: 'Ruu', am: 'ሩት', ar: 'را', sw: 'Rut', fr: 'Rt' },
      { id: 9, en: '1Sam', om: '1Sa', am: '1ሳ', ar: '1صم', sw: '1Sam', fr: '1S' },
      { id: 10, en: '2Sam', om: '2Sa', am: '2ሳ', ar: '2صم', sw: '2Sam', fr: '2S' },
      { id: 11, en: '1Kgs', om: '1Mo', am: '1ነ', ar: '1مل', sw: '1Waf', fr: '1R' },
      { id: 12, en: '2Kgs', om: '2Mo', am: '2ነ', ar: '2مل', sw: '2Waf', fr: '2R' },
      { id: 13, en: '1Chr', om: '1Se', am: '1ዜ', ar: '1أخ', sw: '1Mam', fr: '1Ch' },
      { id: 14, en: '2Chr', om: '2Se', am: '2ዜ', ar: '2أخ', sw: '2Mam', fr: '2Ch' },
      { id: 15, en: 'Ezra', om: 'Izr', am: 'ዕዝ', ar: 'عز', sw: 'Ezr', fr: 'Esd' },
      { id: 16, en: 'Neh', om: 'Neh', am: 'ነህ', ar: 'نح', sw: 'Neh', fr: 'Né' },
      { id: 17, en: 'Esth', om: 'Ast', am: 'አስ', ar: 'است', sw: 'Est', fr: 'Est' },
      { id: 18, en: 'Job', om: 'Iyo', am: 'ኢዮ', ar: 'أي', sw: 'Ayu', fr: 'Jb' },
      { id: 19, en: 'Ps', om: 'Far', am: 'መዝ', ar: 'مز', sw: 'Zab', fr: 'Ps' },
      { id: 20, en: 'Prov', om: 'Fak', am: 'ምሳ', ar: 'أم', sw: 'Mit', fr: 'Pr' },
      { id: 21, en: 'Eccl', om: 'Lal', am: 'መክ', ar: 'جا', sw: 'Mhu', fr: 'Ec' },
      { id: 22, en: 'Song', om: 'Wed', am: 'መኃ', ar: 'نش', sw: 'Wim', fr: 'Ct' },
      { id: 23, en: 'Isa', om: 'Isa', am: 'ኢሳ', ar: 'اش', sw: 'Isa', fr: 'Es' },
      { id: 24, en: 'Jer', om: 'Erm', am: 'ኤር', ar: 'إر', sw: 'Yer', fr: 'Jr' },
      { id: 25, en: 'Lam', om: 'Boo', am: 'ሰቆ', ar: 'مرا', sw: 'Mao', fr: 'Lm' },
      { id: 26, en: 'Ezek', om: 'His', am: 'ሕዝ', ar: 'حز', sw: 'Eze', fr: 'Ez' },
      { id: 27, en: 'Dan', om: 'Daa', am: 'ዳን', ar: 'دا', sw: 'Dan', fr: 'Dn' },
      { id: 28, en: 'Hos', om: 'Hoo', am: 'ሆሴ', ar: 'هو', sw: 'Hos', fr: 'Os' },
      { id: 29, en: 'Joel', om: 'Yoe', am: 'ኢዮ', ar: 'يو', sw: 'Yoe', fr: 'Jl' },
      { id: 30, en: 'Amos', om: 'Aam', am: 'አሞ', ar: 'عا', sw: 'Amo', fr: 'Am' },
      { id: 31, en: 'Obad', om: 'Oba', am: 'አብ', ar: 'عو', sw: 'Oba', fr: 'Ab' },
      { id: 32, en: 'Jonah', om: 'Yoo', am: 'ዮና', ar: 'يون', sw: 'Yon', fr: 'Jon' },
      { id: 33, en: 'Mic', om: 'Mii', am: 'ሚክ', ar: 'مي', sw: 'Mik', fr: 'Mi' },
      { id: 34, en: 'Nah', om: 'Naa', am: 'ናሆ', ar: 'نا', sw: 'Nah', fr: 'Na' },
      { id: 35, en: 'Hab', om: 'Hab', am: 'ዕንባ', ar: 'حب', sw: 'Hab', fr: 'Ha' },
      { id: 36, en: 'Zeph', om: 'Sef', am: 'ሶፍ', ar: 'صف', sw: 'Sef', fr: 'Sop' },
      { id: 37, en: 'Hag', om: 'Hag', am: 'ሐጌ', ar: 'حج', sw: 'Hag', fr: 'Ag' },
      { id: 38, en: 'Zech', om: 'Zak', am: 'ዘካ', ar: 'زك', sw: 'Zek', fr: 'Za' },
      { id: 39, en: 'Mal', om: 'Mal', am: 'ሚል', ar: 'ملا', sw: 'Mal', fr: 'Ml' },
      { id: 40, en: 'Matt', om: 'Mat', am: 'ማቴ', ar: 'مت', sw: 'Mat', fr: 'Mt' },
      { id: 41, en: 'Mark', om: 'Mar', am: 'ማር', ar: 'مر', sw: 'Mar', fr: 'Mc' },
      { id: 42, en: 'Luke', om: 'Luq', am: 'ሉቃ', ar: 'لو', sw: 'Luk', fr: 'Lc' },
      { id: 43, en: 'Jn', om: 'Yoh', am: 'ዮሐ', ar: 'يو', sw: 'Yoh', fr: 'Jn' },
      { id: 44, en: 'Acts', om: 'Hoj', am: 'የሐ', ar: 'أع', sw: 'Mat', fr: 'Ac' },
      { id: 45, en: 'Rom', om: 'Roo', am: 'ሮሜ', ar: 'رو', sw: 'War', fr: 'Rm' },
      { id: 46, en: '1Cor', om: '1Qo', am: '1ቆ', ar: '1كو', sw: '1Wak', fr: '1Co' },
      { id: 47, en: '2Cor', om: '2Qo', am: '2ቆ', ar: '2كو', sw: '2Wak', fr: '2Co' },
      { id: 48, en: 'Gal', om: 'Gal', am: 'ገላ', ar: 'غل', sw: 'Wag', fr: 'Ga' },
      { id: 49, en: 'Eph', om: 'Efe', am: 'ኤፌ', ar: 'أف', sw: 'Wae', fr: 'Ep' },
      { id: 50, en: 'Phil', om: 'Fil', am: 'ፊል', ar: 'في', sw: 'Waf', fr: 'Ph' },
      { id: 51, en: 'Col', om: 'Qol', am: 'ቆላ', ar: 'كو', sw: 'Wak', fr: 'Col' },
      { id: 52, en: '1Thess', om: '1Ta', am: '1ተ', ar: '1تس', sw: '1Wat', fr: '1Th' },
      { id: 53, en: '2Thess', om: '2Ta', am: '2ተ', ar: '2تس', sw: '2Wat', fr: '2Th' },
      { id: 54, en: '1Tim', om: '1Xi', am: '1ጢ', ar: '1تي', sw: '1Tim', fr: '1Tm' },
      { id: 55, en: '2Tim', om: '2Xi', am: '2ጢ', ar: '2تي', sw: '2Tim', fr: '2Tm' },
      { id: 56, en: 'Titus', om: 'Tii', am: 'ቲቶ', ar: 'تي', sw: 'Tit', fr: 'Tt' },
      { id: 57, en: 'Phlm', om: 'Fil', am: 'ፊል', ar: 'فل', sw: 'Fil', fr: 'Phm' },
      { id: 58, en: 'Heb', om: 'Ibr', am: 'ዕብራ', ar: 'عب', sw: 'Wae', fr: 'He' },
      { id: 59, en: 'Jas', om: 'Yaa', am: 'ያዕ', ar: 'يع', sw: 'Yak', fr: 'Jc' },
      { id: 60, en: '1Pet', om: '1Ph', am: '1ጴ', ar: '1بط', sw: '1Pet', fr: '1P' },
      { id: 61, en: '2Pet', om: '2Ph', am: '2ጴ', ar: '2بط', sw: '2Pet', fr: '2P' },
      { id: 62, en: '1Jn', om: '1Yoh', am: '1ዮሐ', ar: '1يو', sw: '1Yoh', fr: '1Jn' },
      { id: 63, en: '2Jn', om: '2Yoh', am: '2ዮሐ', ar: '2يو', sw: '2Yoh', fr: '2Jn' },
      { id: 64, en: '3Jn', om: '3Yoh', am: '3ዮሐ', ar: '3يو', sw: '3Yoh', fr: '3Jn' },
      { id: 65, en: 'Jude', om: 'Yih', am: 'ይሁ', ar: 'يه', sw: 'Yud', fr: 'Jude' },
      { id: 66, en: 'Rev', om: 'Mul', am: 'ራእ', ar: 'رؤ', sw: 'Ufu', fr: 'Ap' },
    ];

    // Seed bible_books
    const booksInsert = bibleBooks.map(b => ({
      id: b.id,
      book_key: b.book_key,
      testament: b.testament,
      chapters: b.chapters,
    }));

    const { error: booksError } = await supabase
      .from('bible_books')
      .upsert(booksInsert);

    if (booksError) throw new Error(`Failed to seed bible_books: ${booksError.message}`);

    // Seed bible_book_names
    const namesInsert = [];
    bookNames.forEach(book => {
      ['en', 'om', 'am', 'ar', 'sw', 'fr'].forEach(lang => {
        namesInsert.push({
          book_id: book.id,
          language_code: lang,
          name: book[lang],
        });
      });
    });

    const { error: namesError } = await supabase
      .from('bible_book_names')
      .upsert(namesInsert);

    if (namesError) throw new Error(`Failed to seed bible_book_names: ${namesError.message}`);

    // Seed bible_book_abbreviations
    const abbrsInsert = [];
    abbreviations.forEach(book => {
      ['en', 'om', 'am', 'ar', 'sw', 'fr'].forEach(lang => {
        abbrsInsert.push({
          book_id: book.id,
          language_code: lang,
          abbreviation: book[lang],
        });
      });
    });

    const { error: abbrsError } = await supabase
      .from('bible_book_abbreviations')
      .upsert(abbrsInsert);

    if (abbrsError) throw new Error(`Failed to seed bible_book_abbreviations: ${abbrsError.message}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Bible metadata seeded successfully',
      stats: {
        books: booksInsert.length,
        names: namesInsert.length,
        abbreviations: abbrsInsert.length,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[seedBibleMetadata] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});