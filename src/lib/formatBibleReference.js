export const bibleBookNames = {
  en: {
    GEN: 'Genesis', EXO: 'Exodus', LEV: 'Leviticus', NUM: 'Numbers', DEU: 'Deuteronomy',
    JOS: 'Joshua', JDG: 'Judges', RUT: 'Ruth', '1SA': '1 Samuel', '2SA': '2 Samuel',
    '1KI': '1 Kings', '2KI': '2 Kings', '1CH': '1 Chronicles', '2CH': '2 Chronicles',
    EZR: 'Ezra', NEH: 'Nehemiah', EST: 'Esther', JOB: 'Job', PSA: 'Psalms',
    PRO: 'Proverbs', ECC: 'Ecclesiastes', SNG: 'Song of Solomon', ISA: 'Isaiah',
    JER: 'Jeremiah', LAM: 'Lamentations', EZK: 'Ezekiel', DAN: 'Daniel', HOS: 'Hosea',
    JOL: 'Joel', AMO: 'Amos', OBA: 'Obadiah', JON: 'Jonah', MIC: 'Micah',
    NAM: 'Nahum', HAB: 'Habakkuk', ZEP: 'Zephaniah', HAG: 'Haggai', ZEC: 'Zechariah',
    MAL: 'Malachi', MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John',
    ACT: 'Acts', ROM: 'Romans', '1CO': '1 Corinthians', '2CO': '2 Corinthians',
    GAL: 'Galatians', EPH: 'Ephesians', PHP: 'Philippians', COL: 'Colossians',
    '1TH': '1 Thessalonians', '2TH': '2 Thessalonians', '1TI': '1 Timothy',
    '2TI': '2 Timothy', TIT: 'Titus', PHM: 'Philemon', HEB: 'Hebrews',
    JAM: 'James', '1PE': '1 Peter', '2PE': '2 Peter', '1JN': '1 John',
    '2JN': '2 John', '3JN': '3 John', JUD: 'Jude', REV: 'Revelation',
  },
  om: {
    GEN: 'Uumama', EXO: 'Ba\'uu', LEV: 'Leewii', NUM: 'Lakkoofsaa', DEU: 'Seera Lammaffaa',
    JOS: 'Yooshuwa', PSA: 'Faarfannaa', PRO: 'Fakkeenya', ISA: 'Ishaayyaas',
    JER: 'Yirmiyas', MAT: 'Maatewoos', MRK: 'Maarkoos', LUK: 'Luuqaas', JHN: 'Yohaannis',
    ACT: 'Hojii', ROM: 'Roomaa', '1CO': '1 Qoronxoos', '2CO': '2 Qoronxoos',
    GAL: 'Galaatiyaa', EPH: 'Efesoos', PHP: 'Filiphisiyus', COL: 'Qolasiyaas',
    '1TH': '1 Tasalooqee', '2TH': '2 Tasalooqee', '1TI': '1 Xiimootooos',
    '2TI': '2 Xiimootooos', HEB: 'Ibroota', JAM: 'Yaaqoob', '1PE': '1 Phexroos',
    '2PE': '2 Phexroos', REV: 'Mul\'ata',
  },
  am: {
    GEN: 'ዘፍጥረት', EXO: 'ዘጸአት', PSA: 'መዝሙር', PRO: 'ምሳሌ', ISA: 'ኢሳይያስ',
    MAT: 'ማቴዎስ', MRK: 'ማርቆስ', LUK: 'ሉቃስ', JHN: 'ዮሐንስ', ACT: 'ሐዋርያት',
    ROM: 'ሮሜ', '1CO': '1 ቆሮ', '2CO': '2 ቆሮ', GAL: 'ገላትያ', EPH: 'ኤፌሶን',
    PHP: 'ፊልጵስዩስ', COL: 'ቆላስይስ', HEB: 'ዕብራውያን', REV: 'ራእይ',
  },
  sw: {
    GEN: 'Mwanzo', EXO: 'Kutoka', PSA: 'Zaburi', PRO: 'Methali', ISA: 'Isaya',
    MAT: 'Mathayo', MRK: 'Marko', LUK: 'Luka', JHN: 'Yohana', ACT: 'Matendo',
    ROM: 'Warumi', '1CO': '1 Wakorintho', '2CO': '2 Wakorintho', GAL: 'Wagalatia',
    EPH: 'Waefeso', PHP: 'Wafilipi', COL: 'Wakolosai', HEB: 'Waebrania', REV: 'Ufunuo',
  },
  fr: {
    GEN: 'Genèse', EXO: 'Exode', PSA: 'Psaumes', PRO: 'Proverbes', ISA: 'Ésaïe',
    MAT: 'Matthieu', MRK: 'Marc', LUK: 'Luc', JHN: 'Jean', ACT: 'Actes',
    ROM: 'Romains', '1CO': '1 Corinthiens', '2CO': '2 Corinthiens', GAL: 'Galates',
    EPH: 'Éphésiens', PHP: 'Philippiens', COL: 'Colossiens', HEB: 'Hébreux', REV: 'Apocalypse',
  },
  ar: {
    GEN: 'التكوين', EXO: 'الخروج', PSA: 'المزامير', PRO: 'الأمثال', ISA: 'إشعياء',
    MAT: 'متى', MRK: 'مرقس', LUK: 'لوقا', JHN: 'يوحنا', ACT: 'أعمال',
    ROM: 'رومية', '1CO': '1 كورنثوس', '2CO': '2 كورنثوس', GAL: 'غلاطية',
    EPH: 'أفسس', PHP: 'فيلبي', COL: 'كولوسي', HEB: 'عبرانيين', REV: 'رؤيا',
  },
};

export function getLocalizedBookName(bookCode, bibleLanguage) {
  return (
    bibleBookNames[bibleLanguage]?.[bookCode] ||
    bibleBookNames.en[bookCode] ||
    bookCode
  );
}

export function formatBibleReference(bookCode, chapter, verse, bibleLanguage) {
  const bookName = getLocalizedBookName(bookCode, bibleLanguage);
  return `${bookName} ${chapter}:${verse}`;
}