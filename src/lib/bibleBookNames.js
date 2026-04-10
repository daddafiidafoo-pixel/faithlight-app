/**
 * Bible Book Names Utility
 * Single source of truth for all 66 books in English and Afaan Oromoo.
 * Names sourced from BibleBook entity / authoritative table.
 * Usage: getBookName(bookId, langCode) → localized name
 *        getBookAbbr(bookId, langCode) → localized abbreviation
 *        getBooksForTestament(testament, langCode) → sorted book list
 */

export const BIBLE_BOOKS = [
  // ── OLD TESTAMENT (Kakuu Moofaa) ──────────────────────────────
  { book_id: "GEN", testament: "Kakuu Moofaa", order_number: 1,  name_en: "Genesis",          name_om: "Seera Uumamaa",       abbreviation_en: "Gen", abbreviation_om: "Uma",  chapters_count: 50  },
  { book_id: "EXO", testament: "Kakuu Moofaa", order_number: 2,  name_en: "Exodus",            name_om: "Ba'uu",               abbreviation_en: "Exo", abbreviation_om: "Bau",  chapters_count: 40  },
  { book_id: "LEV", testament: "Kakuu Moofaa", order_number: 3,  name_en: "Leviticus",         name_om: "Lewwota",             abbreviation_en: "Lev", abbreviation_om: "Lew",  chapters_count: 27  },
  { book_id: "NUM", testament: "Kakuu Moofaa", order_number: 4,  name_en: "Numbers",           name_om: "Lakkoobsa",           abbreviation_en: "Num", abbreviation_om: "Lak",  chapters_count: 36  },
  { book_id: "DEU", testament: "Kakuu Moofaa", order_number: 5,  name_en: "Deuteronomy",       name_om: "Keessa Deebii Seeraa",abbreviation_en: "Deu", abbreviation_om: "KDS",  chapters_count: 34  },
  { book_id: "JOS", testament: "Kakuu Moofaa", order_number: 6,  name_en: "Joshua",            name_om: "Iyaasuu",             abbreviation_en: "Jos", abbreviation_om: "Iya",  chapters_count: 24  },
  { book_id: "JDG", testament: "Kakuu Moofaa", order_number: 7,  name_en: "Judges",            name_om: "Abbootii Murtii",     abbreviation_en: "Jdg", abbreviation_om: "AbM",  chapters_count: 21  },
  { book_id: "RUT", testament: "Kakuu Moofaa", order_number: 8,  name_en: "Ruth",              name_om: "Ruut",                abbreviation_en: "Rut", abbreviation_om: "Ruu",  chapters_count: 4   },
  { book_id: "1SA", testament: "Kakuu Moofaa", order_number: 9,  name_en: "1 Samuel",          name_om: "1 Saamu'eel",         abbreviation_en: "1Sa", abbreviation_om: "1Sam", chapters_count: 31  },
  { book_id: "2SA", testament: "Kakuu Moofaa", order_number: 10, name_en: "2 Samuel",          name_om: "2 Saamu'eel",         abbreviation_en: "2Sa", abbreviation_om: "2Sam", chapters_count: 24  },
  { book_id: "1KI", testament: "Kakuu Moofaa", order_number: 11, name_en: "1 Kings",           name_om: "1 Mootota",           abbreviation_en: "1Ki", abbreviation_om: "1Mot", chapters_count: 22  },
  { book_id: "2KI", testament: "Kakuu Moofaa", order_number: 12, name_en: "2 Kings",           name_om: "2 Mootota",           abbreviation_en: "2Ki", abbreviation_om: "2Mot", chapters_count: 25  },
  { book_id: "1CH", testament: "Kakuu Moofaa", order_number: 13, name_en: "1 Chronicles",      name_om: "1 Seenaa",            abbreviation_en: "1Ch", abbreviation_om: "1Sen", chapters_count: 29  },
  { book_id: "2CH", testament: "Kakuu Moofaa", order_number: 14, name_en: "2 Chronicles",      name_om: "2 Seenaa",            abbreviation_en: "2Ch", abbreviation_om: "2Sen", chapters_count: 36  },
  { book_id: "EZR", testament: "Kakuu Moofaa", order_number: 15, name_en: "Ezra",              name_om: "Izraa",               abbreviation_en: "Ezr", abbreviation_om: "Izr",  chapters_count: 10  },
  { book_id: "NEH", testament: "Kakuu Moofaa", order_number: 16, name_en: "Nehemiah",          name_om: "Nahimiyaa",           abbreviation_en: "Neh", abbreviation_om: "Nah",  chapters_count: 13  },
  { book_id: "EST", testament: "Kakuu Moofaa", order_number: 17, name_en: "Esther",            name_om: "Astheer",             abbreviation_en: "Est", abbreviation_om: "Ast",  chapters_count: 10  },
  { book_id: "JOB", testament: "Kakuu Moofaa", order_number: 18, name_en: "Job",               name_om: "Iyoob",               abbreviation_en: "Job", abbreviation_om: "Iyo",  chapters_count: 42  },
  { book_id: "PSA", testament: "Kakuu Moofaa", order_number: 19, name_en: "Psalms",            name_om: "Faarfannaa",          abbreviation_en: "Psa", abbreviation_om: "Faar", chapters_count: 150 },
  { book_id: "PRO", testament: "Kakuu Moofaa", order_number: 20, name_en: "Proverbs",          name_om: "Fakkeenya",           abbreviation_en: "Pro", abbreviation_om: "Fak",  chapters_count: 31  },
  { book_id: "ECC", testament: "Kakuu Moofaa", order_number: 21, name_en: "Ecclesiastes",      name_om: "Lallaba",             abbreviation_en: "Ecc", abbreviation_om: "Lal",  chapters_count: 12  },
  { book_id: "SNG", testament: "Kakuu Moofaa", order_number: 22, name_en: "Song of Songs",     name_om: "Weedduu Weedduu",     abbreviation_en: "Sng", abbreviation_om: "Weed", chapters_count: 8   },
  { book_id: "ISA", testament: "Kakuu Moofaa", order_number: 23, name_en: "Isaiah",            name_om: "Isaayaas",            abbreviation_en: "Isa", abbreviation_om: "Isa",  chapters_count: 66  },
  { book_id: "JER", testament: "Kakuu Moofaa", order_number: 24, name_en: "Jeremiah",          name_om: "Ermiyaas",            abbreviation_en: "Jer", abbreviation_om: "Erm",  chapters_count: 52  },
  { book_id: "LAM", testament: "Kakuu Moofaa", order_number: 25, name_en: "Lamentations",      name_om: "Waaqeffannaa Boo'aa", abbreviation_en: "Lam", abbreviation_om: "Boo",  chapters_count: 5   },
  { book_id: "EZK", testament: "Kakuu Moofaa", order_number: 26, name_en: "Ezekiel",           name_om: "Hisqi'el",            abbreviation_en: "Ezk", abbreviation_om: "His",  chapters_count: 48  },
  { book_id: "DAN", testament: "Kakuu Moofaa", order_number: 27, name_en: "Daniel",            name_om: "Daani'el",            abbreviation_en: "Dan", abbreviation_om: "Dan",  chapters_count: 12  },
  { book_id: "HOS", testament: "Kakuu Moofaa", order_number: 28, name_en: "Hosea",             name_om: "Hosee",               abbreviation_en: "Hos", abbreviation_om: "Hos",  chapters_count: 14  },
  { book_id: "JOL", testament: "Kakuu Moofaa", order_number: 29, name_en: "Joel",              name_om: "Yo'el",               abbreviation_en: "Jol", abbreviation_om: "Yoe",  chapters_count: 3   },
  { book_id: "AMO", testament: "Kakuu Moofaa", order_number: 30, name_en: "Amos",              name_om: "Amoos",               abbreviation_en: "Amo", abbreviation_om: "Amo",  chapters_count: 9   },
  { book_id: "OBA", testament: "Kakuu Moofaa", order_number: 31, name_en: "Obadiah",           name_om: "Obaadyaa",            abbreviation_en: "Oba", abbreviation_om: "Oba",  chapters_count: 1   },
  { book_id: "JON", testament: "Kakuu Moofaa", order_number: 32, name_en: "Jonah",             name_om: "Yoonaas",             abbreviation_en: "Jon", abbreviation_om: "Yoo",  chapters_count: 4   },
  { book_id: "MIC", testament: "Kakuu Moofaa", order_number: 33, name_en: "Micah",             name_om: "Miikiyaas",           abbreviation_en: "Mic", abbreviation_om: "Mii",  chapters_count: 7   },
  { book_id: "NAM", testament: "Kakuu Moofaa", order_number: 34, name_en: "Nahum",             name_om: "Naahoom",             abbreviation_en: "Nam", abbreviation_om: "Naa",  chapters_count: 3   },
  { book_id: "HAB", testament: "Kakuu Moofaa", order_number: 35, name_en: "Habakkuk",          name_om: "Habaaqquuq",          abbreviation_en: "Hab", abbreviation_om: "Hab",  chapters_count: 3   },
  { book_id: "ZEP", testament: "Kakuu Moofaa", order_number: 36, name_en: "Zephaniah",         name_om: "Sefaaniyaa",          abbreviation_en: "Zep", abbreviation_om: "Sef",  chapters_count: 3   },
  { book_id: "HAG", testament: "Kakuu Moofaa", order_number: 37, name_en: "Haggai",            name_om: "Haggaay",             abbreviation_en: "Hag", abbreviation_om: "Hag",  chapters_count: 2   },
  { book_id: "ZEC", testament: "Kakuu Moofaa", order_number: 38, name_en: "Zechariah",         name_om: "Zakkaariyaas",        abbreviation_en: "Zec", abbreviation_om: "Zak",  chapters_count: 14  },
  { book_id: "MAL", testament: "Kakuu Moofaa", order_number: 39, name_en: "Malachi",           name_om: "Malaaki",             abbreviation_en: "Mal", abbreviation_om: "Mal",  chapters_count: 4   },

  // ── NEW TESTAMENT (Kakuu Haaraa) ─────────────────────────────
  { book_id: "MAT", testament: "Kakuu Haaraa", order_number: 40, name_en: "Matthew",           name_om: "Maatewos",            abbreviation_en: "Mat", abbreviation_om: "Mat",  chapters_count: 28  },
  { book_id: "MRK", testament: "Kakuu Haaraa", order_number: 41, name_en: "Mark",              name_om: "Maarqos",             abbreviation_en: "Mrk", abbreviation_om: "Mar",  chapters_count: 16  },
  { book_id: "LUK", testament: "Kakuu Haaraa", order_number: 42, name_en: "Luke",              name_om: "Luqaas",              abbreviation_en: "Luk", abbreviation_om: "Luq",  chapters_count: 24  },
  { book_id: "JHN", testament: "Kakuu Haaraa", order_number: 43, name_en: "John",              name_om: "Yohaannis",           abbreviation_en: "Jhn", abbreviation_om: "Yoh",  chapters_count: 21  },
  { book_id: "ACT", testament: "Kakuu Haaraa", order_number: 44, name_en: "Acts",              name_om: "Hojii Ergamootaa",    abbreviation_en: "Act", abbreviation_om: "Hoj",  chapters_count: 28  },
  { book_id: "ROM", testament: "Kakuu Haaraa", order_number: 45, name_en: "Romans",            name_om: "Roomaa",              abbreviation_en: "Rom", abbreviation_om: "Roo",  chapters_count: 16  },
  { book_id: "1CO", testament: "Kakuu Haaraa", order_number: 46, name_en: "1 Corinthians",     name_om: "1 Qorontos",          abbreviation_en: "1Co", abbreviation_om: "1Qor", chapters_count: 16  },
  { book_id: "2CO", testament: "Kakuu Haaraa", order_number: 47, name_en: "2 Corinthians",     name_om: "2 Qorontos",          abbreviation_en: "2Co", abbreviation_om: "2Qor", chapters_count: 13  },
  { book_id: "GAL", testament: "Kakuu Haaraa", order_number: 48, name_en: "Galatians",         name_om: "Galaatiyaa",          abbreviation_en: "Gal", abbreviation_om: "Gal",  chapters_count: 6   },
  { book_id: "EPH", testament: "Kakuu Haaraa", order_number: 49, name_en: "Ephesians",         name_om: "Efesoon",             abbreviation_en: "Eph", abbreviation_om: "Efe",  chapters_count: 6   },
  { book_id: "PHP", testament: "Kakuu Haaraa", order_number: 50, name_en: "Philippians",       name_om: "Filiphisiyus",        abbreviation_en: "Php", abbreviation_om: "Fili", chapters_count: 4   },
  { book_id: "COL", testament: "Kakuu Haaraa", order_number: 51, name_en: "Colossians",        name_om: "Qolosaayis",          abbreviation_en: "Col", abbreviation_om: "Qol",  chapters_count: 4   },
  { book_id: "1TH", testament: "Kakuu Haaraa", order_number: 52, name_en: "1 Thessalonians",   name_om: "1 Tasalonqee",        abbreviation_en: "1Th", abbreviation_om: "1Tas", chapters_count: 5   },
  { book_id: "2TH", testament: "Kakuu Haaraa", order_number: 53, name_en: "2 Thessalonians",   name_om: "2 Tasalonqee",        abbreviation_en: "2Th", abbreviation_om: "2Tas", chapters_count: 3   },
  { book_id: "1TI", testament: "Kakuu Haaraa", order_number: 54, name_en: "1 Timothy",         name_om: "1 Ximotewos",         abbreviation_en: "1Ti", abbreviation_om: "1Xim", chapters_count: 6   },
  { book_id: "2TI", testament: "Kakuu Haaraa", order_number: 55, name_en: "2 Timothy",         name_om: "2 Ximotewos",         abbreviation_en: "2Ti", abbreviation_om: "2Xim", chapters_count: 4   },
  { book_id: "TIT", testament: "Kakuu Haaraa", order_number: 56, name_en: "Titus",             name_om: "Tiitoos",             abbreviation_en: "Tit", abbreviation_om: "Tit",  chapters_count: 3   },
  { book_id: "PHM", testament: "Kakuu Haaraa", order_number: 57, name_en: "Philemon",          name_om: "Filemon",             abbreviation_en: "Phm", abbreviation_om: "Fil",  chapters_count: 1   },
  { book_id: "HEB", testament: "Kakuu Haaraa", order_number: 58, name_en: "Hebrews",           name_om: "Ibroota",             abbreviation_en: "Heb", abbreviation_om: "Ibr",  chapters_count: 13  },
  { book_id: "JAS", testament: "Kakuu Haaraa", order_number: 59, name_en: "James",             name_om: "Yaaqoob",             abbreviation_en: "Jas", abbreviation_om: "Yaq",  chapters_count: 5   },
  { book_id: "1PE", testament: "Kakuu Haaraa", order_number: 60, name_en: "1 Peter",           name_om: "1 Pheexiroos",        abbreviation_en: "1Pe", abbreviation_om: "1Phe", chapters_count: 5   },
  { book_id: "2PE", testament: "Kakuu Haaraa", order_number: 61, name_en: "2 Peter",           name_om: "2 Pheexiroos",        abbreviation_en: "2Pe", abbreviation_om: "2Phe", chapters_count: 3   },
  { book_id: "1JN", testament: "Kakuu Haaraa", order_number: 62, name_en: "1 John",            name_om: "1 Yohaannis",         abbreviation_en: "1Jn", abbreviation_om: "1Yoh", chapters_count: 5   },
  { book_id: "2JN", testament: "Kakuu Haaraa", order_number: 63, name_en: "2 John",            name_om: "2 Yohaannis",         abbreviation_en: "2Jn", abbreviation_om: "2Yoh", chapters_count: 1   },
  { book_id: "3JN", testament: "Kakuu Haaraa", order_number: 64, name_en: "3 John",            name_om: "3 Yohaannis",         abbreviation_en: "3Jn", abbreviation_om: "3Yoh", chapters_count: 1   },
  { book_id: "JUD", testament: "Kakuu Haaraa", order_number: 65, name_en: "Jude",              name_om: "Yihudaa",             abbreviation_en: "Jud", abbreviation_om: "Yih",  chapters_count: 1   },
  { book_id: "REV", testament: "Kakuu Haaraa", order_number: 66, name_en: "Revelation",        name_om: "Mul'ata",             abbreviation_en: "Rev", abbreviation_om: "Mul",  chapters_count: 22  },
];

// Fast lookup maps
const _byId = Object.fromEntries(BIBLE_BOOKS.map(b => [b.book_id, b]));

/**
 * Get localized book name.
 * @param {string} bookId  - e.g. "PSA"
 * @param {string} lang    - "en" | "om"
 * @returns {string}
 */
export function getBookName(bookId, lang = 'en') {
  const book = _byId[bookId?.toUpperCase()];
  if (!book) return bookId || '';
  return lang === 'om' ? book.name_om : book.name_en;
}

/**
 * Get localized book abbreviation.
 * @param {string} bookId
 * @param {string} lang
 * @returns {string}
 */
export function getBookAbbr(bookId, lang = 'en') {
  const book = _byId[bookId?.toUpperCase()];
  if (!book) return bookId || '';
  return lang === 'om' ? book.abbreviation_om : book.abbreviation_en;
}

/**
 * Get book record by ID.
 */
export function getBook(bookId) {
  return _byId[bookId?.toUpperCase()] || null;
}

/**
 * Get all books for a testament, ordered canonically.
 * @param {'Kakuu Moofaa'|'Kakuu Haaraa'|'OT'|'NT'|'all'} testament
 * @param {string} lang
 * @returns {Array}
 */
export function getBooksForTestament(testament, lang = 'en') {
  let filtered;
  if (!testament || testament === 'all') {
    filtered = BIBLE_BOOKS;
  } else if (testament === 'OT') {
    filtered = BIBLE_BOOKS.filter(b => b.testament === 'Kakuu Moofaa');
  } else if (testament === 'NT') {
    filtered = BIBLE_BOOKS.filter(b => b.testament === 'Kakuu Haaraa');
  } else {
    filtered = BIBLE_BOOKS.filter(b => b.testament === testament);
  }
  return filtered.map(b => ({
    ...b,
    displayName: lang === 'om' ? b.name_om : b.name_en,
    displayAbbr: lang === 'om' ? b.abbreviation_om : b.abbreviation_en,
  }));
}

/**
 * Localized testament labels.
 */
export const TESTAMENT_LABELS = {
  en: { ot: 'Old Testament', nt: 'New Testament' },
  om: { ot: 'Kakuu Moofaa',  nt: 'Kakuu Haaraa'  },
};

/**
 * All Bible UI labels — strictly no mixing.
 * Use: BIBLE_UI[lang].navigation.bible etc.
 */
export const BIBLE_UI = {
  en: {
    navigation: {
      bible: 'Bible',
      books: 'Books',
      chapters: 'Chapters',
      verses: 'Verses',
      oldTestament: 'Old Testament',
      newTestament: 'New Testament',
    },
    reader: {
      selectBook: 'Select Book',
      selectChapter: 'Select Chapter',
      nextChapter: 'Next Chapter',
      prevChapter: 'Previous Chapter',
    },
    verseActions: {
      explain: 'Explain This Verse',
      share: 'Share',
      bookmark: 'Bookmark',
      copy: 'Copy',
      highlight: 'Highlight',
    },
    audio: {
      play: 'Play Audio',
      pause: 'Pause',
      resume: 'Resume',
      notAvailable: 'Audio not available',
    },
    search: {
      title: 'Search Bible',
      byKeyword: 'Search by keyword',
      enterReference: 'Enter reference',
      noResults: 'No results found',
    },
    attachVerse: {
      add: 'Add Verse',
      attach: 'Attach Verse',
      selected: 'Selected Verse',
    },
    errors: {
      verseNotAvailable: 'Verse not available',
      chapterNotAvailable: 'Chapter not available',
      bookNotAvailable: 'Book not available',
      tryAgain: 'Try again later',
    },
  },
  om: {
    navigation: {
      bible: 'Macaafa Qulqulluu',
      books: 'Kitaabota',
      chapters: 'Boqonnaawwan',
      verses: 'Aayatawwan',
      oldTestament: 'Kakuu Moofaa',
      newTestament: 'Kakuu Haaraa',
    },
    reader: {
      selectBook: 'Kitaaba Filadhu',
      selectChapter: 'Boqonnaa Filadhu',
      nextChapter: 'Boqonnaa Itti Aanu',
      prevChapter: 'Boqonnaa Duraa',
    },
    verseActions: {
      explain: 'Hiika Aayata Kanaa',
      share: 'Qoodi',
      bookmark: 'Milikkita Godhi',
      copy: 'Waraabi',
      highlight: 'Calaqqisi',
    },
    audio: {
      play: 'Dhaggeeffadhu',
      pause: 'Dhaabi',
      resume: 'Itti Fufi',
      notAvailable: 'Sagaleen hin jiru',
    },
    search: {
      title: 'Macaafa Qulqulluu Barbaadi',
      byKeyword: 'Jecha barbaadi',
      enterReference: 'Aayata galchi',
      noResults: "Bu'aan hin argamne",
    },
    attachVerse: {
      add: 'Aayata Dabaluu',
      attach: 'Aayata Maxxansi',
      selected: 'Aayata Filatame',
    },
    errors: {
      verseNotAvailable: 'Aayanni hin argamne',
      chapterNotAvailable: 'Boqonnaan hin argamne',
      bookNotAvailable: 'Kitaabni hin argamne',
      tryAgain: "Booda irra deebi'i",
    },
  },
};

/**
 * Get Bible UI label safely.
 * @param {string} lang - "en" | "om"
 * @param {string} section - e.g. "navigation"
 * @param {string} key - e.g. "bible"
 * @returns {string}
 */
export function getBibleUI(lang, section, key) {
  const safelang = BIBLE_UI[lang] ? lang : 'en';
  return BIBLE_UI[safelang]?.[section]?.[key] || BIBLE_UI.en?.[section]?.[key] || key;
}

/**
 * Resolve book name from a mixed reference string (e.g. "Psalm 23:1" → PSA).
 * Tries both en and om names/abbreviations.
 */
export function resolveBookId(nameOrAbbr) {
  if (!nameOrAbbr) return null;
  const q = nameOrAbbr.trim().toLowerCase();
  return BIBLE_BOOKS.find(b =>
    b.name_en.toLowerCase() === q ||
    b.name_om.toLowerCase() === q ||
    b.abbreviation_en.toLowerCase() === q ||
    b.abbreviation_om.toLowerCase() === q ||
    b.book_id.toLowerCase() === q
  )?.book_id || null;
}