// Canonical 66-book Bible catalog with chapter counts and bilingual names
export const BIBLE_BOOKS = [
  { code: "GEN", name_en: "Genesis", name_om: "Uumama", testament: "old", order: 1, chapters: 50 },
  { code: "EXO", name_en: "Exodus", name_om: "Ba'uu", testament: "old", order: 2, chapters: 40 },
  { code: "LEV", name_en: "Leviticus", name_om: "Lewwota", testament: "old", order: 3, chapters: 27 },
  { code: "NUM", name_en: "Numbers", name_om: "Lakkoobsa", testament: "old", order: 4, chapters: 36 },
  { code: "DEU", name_en: "Deuteronomy", name_om: "Keessa Deebii", testament: "old", order: 5, chapters: 34 },
  { code: "JOS", name_en: "Joshua", name_om: "Iyyaasuu", testament: "old", order: 6, chapters: 24 },
  { code: "JDG", name_en: "Judges", name_om: "Abbootii Murtii", testament: "old", order: 7, chapters: 21 },
  { code: "RUT", name_en: "Ruth", name_om: "Ruut", testament: "old", order: 8, chapters: 4 },
  { code: "1SA", name_en: "1 Samuel", name_om: "1 Saamu'el", testament: "old", order: 9, chapters: 31 },
  { code: "2SA", name_en: "2 Samuel", name_om: "2 Saamu'el", testament: "old", order: 10, chapters: 24 },
  { code: "1KI", name_en: "1 Kings", name_om: "1 Mootota", testament: "old", order: 11, chapters: 22 },
  { code: "2KI", name_en: "2 Kings", name_om: "2 Mootota", testament: "old", order: 12, chapters: 25 },
  { code: "1CH", name_en: "1 Chronicles", name_om: "1 Seenaa Bara", testament: "old", order: 13, chapters: 29 },
  { code: "2CH", name_en: "2 Chronicles", name_om: "2 Seenaa Bara", testament: "old", order: 14, chapters: 36 },
  { code: "EZR", name_en: "Ezra", name_om: "Izraa", testament: "old", order: 15, chapters: 10 },
  { code: "NEH", name_en: "Nehemiah", name_om: "Nahimiyaa", testament: "old", order: 16, chapters: 13 },
  { code: "EST", name_en: "Esther", name_om: "Astheer", testament: "old", order: 17, chapters: 10 },
  { code: "JOB", name_en: "Job", name_om: "Iyoob", testament: "old", order: 18, chapters: 42 },
  { code: "PSA", name_en: "Psalms", name_om: "Faarfannaa", testament: "old", order: 19, chapters: 150 },
  { code: "PRO", name_en: "Proverbs", name_om: "Fakkeenya", testament: "old", order: 20, chapters: 31 },
  { code: "ECC", name_en: "Ecclesiastes", name_om: "Lallaba", testament: "old", order: 21, chapters: 12 },
  { code: "SNG", name_en: "Song of Solomon", name_om: "Faarfannaa Solomoon", testament: "old", order: 22, chapters: 8 },
  { code: "ISA", name_en: "Isaiah", name_om: "Isaayyaas", testament: "old", order: 23, chapters: 66 },
  { code: "JER", name_en: "Jeremiah", name_om: "Ermiyaas", testament: "old", order: 24, chapters: 52 },
  { code: "LAM", name_en: "Lamentations", name_om: "Boo'icha Ermiyaas", testament: "old", order: 25, chapters: 5 },
  { code: "EZK", name_en: "Ezekiel", name_om: "Hisqi'eel", testament: "old", order: 26, chapters: 48 },
  { code: "DAN", name_en: "Daniel", name_om: "Daani'el", testament: "old", order: 27, chapters: 12 },
  { code: "HOS", name_en: "Hosea", name_om: "Hosee", testament: "old", order: 28, chapters: 14 },
  { code: "JOL", name_en: "Joel", name_om: "Yo'el", testament: "old", order: 29, chapters: 3 },
  { code: "AMO", name_en: "Amos", name_om: "Amoos", testament: "old", order: 30, chapters: 9 },
  { code: "OBA", name_en: "Obadiah", name_om: "Obadiyaa", testament: "old", order: 31, chapters: 1 },
  { code: "JON", name_en: "Jonah", name_om: "Yoonaas", testament: "old", order: 32, chapters: 4 },
  { code: "MIC", name_en: "Micah", name_om: "Miikiyaas", testament: "old", order: 33, chapters: 7 },
  { code: "NAM", name_en: "Nahum", name_om: "Naahoom", testament: "old", order: 34, chapters: 3 },
  { code: "HAB", name_en: "Habakkuk", name_om: "Habaaquuq", testament: "old", order: 35, chapters: 3 },
  { code: "ZEP", name_en: "Zephaniah", name_om: "Zefaaniyaa", testament: "old", order: 36, chapters: 3 },
  { code: "HAG", name_en: "Haggai", name_om: "Haggaay", testament: "old", order: 37, chapters: 2 },
  { code: "ZEC", name_en: "Zechariah", name_om: "Zakkaariyaas", testament: "old", order: 38, chapters: 14 },
  { code: "MAL", name_en: "Malachi", name_om: "Malaaki", testament: "old", order: 39, chapters: 4 },
  { code: "MAT", name_en: "Matthew", name_om: "Maatewos", testament: "new", order: 40, chapters: 28 },
  { code: "MRK", name_en: "Mark", name_om: "Maarqoos", testament: "new", order: 41, chapters: 16 },
  { code: "LUK", name_en: "Luke", name_om: "Luqaas", testament: "new", order: 42, chapters: 24 },
  { code: "JHN", name_en: "John", name_om: "Yohaannis", testament: "new", order: 43, chapters: 21 },
  { code: "ACT", name_en: "Acts", name_om: "Hojii Ergamootaa", testament: "new", order: 44, chapters: 28 },
  { code: "ROM", name_en: "Romans", name_om: "Roomaa", testament: "new", order: 45, chapters: 16 },
  { code: "1CO", name_en: "1 Corinthians", name_om: "1 Qorontos", testament: "new", order: 46, chapters: 16 },
  { code: "2CO", name_en: "2 Corinthians", name_om: "2 Qorontos", testament: "new", order: 47, chapters: 13 },
  { code: "GAL", name_en: "Galatians", name_om: "Galaatiyaa", testament: "new", order: 48, chapters: 6 },
  { code: "EPH", name_en: "Ephesians", name_om: "Efesoon", testament: "new", order: 49, chapters: 6 },
  { code: "PHP", name_en: "Philippians", name_om: "Filiphisiyus", testament: "new", order: 50, chapters: 4 },
  { code: "COL", name_en: "Colossians", name_om: "Qolosaayis", testament: "new", order: 51, chapters: 4 },
  { code: "1TH", name_en: "1 Thessalonians", name_om: "1 Tasalonqee", testament: "new", order: 52, chapters: 5 },
  { code: "2TH", name_en: "2 Thessalonians", name_om: "2 Tasalonqee", testament: "new", order: 53, chapters: 3 },
  { code: "1TI", name_en: "1 Timothy", name_om: "1 Ximotewos", testament: "new", order: 54, chapters: 6 },
  { code: "2TI", name_en: "2 Timothy", name_om: "2 Ximotewos", testament: "new", order: 55, chapters: 4 },
  { code: "TIT", name_en: "Titus", name_om: "Tiitoos", testament: "new", order: 56, chapters: 3 },
  { code: "PHM", name_en: "Philemon", name_om: "Filemoona", testament: "new", order: 57, chapters: 1 },
  { code: "HEB", name_en: "Hebrews", name_om: "Ibroota", testament: "new", order: 58, chapters: 13 },
  { code: "JAS", name_en: "James", name_om: "Yaaqoob", testament: "new", order: 59, chapters: 5 },
  { code: "1PE", name_en: "1 Peter", name_om: "1 Pheexiros", testament: "new", order: 60, chapters: 5 },
  { code: "2PE", name_en: "2 Peter", name_om: "2 Pheexiros", testament: "new", order: 61, chapters: 3 },
  { code: "1JN", name_en: "1 John", name_om: "1 Yohaannis", testament: "new", order: 62, chapters: 5 },
  { code: "2JN", name_en: "2 John", name_om: "2 Yohaannis", testament: "new", order: 63, chapters: 1 },
  { code: "3JN", name_en: "3 John", name_om: "3 Yohaannis", testament: "new", order: 64, chapters: 1 },
  { code: "JUD", name_en: "Jude", name_om: "Yihudaa", testament: "new", order: 65, chapters: 1 },
  { code: "REV", name_en: "Revelation", name_om: "Mul'ata", testament: "new", order: 66, chapters: 22 },
];

// Lookup maps for O(1) access
export const BIBLE_BOOKS_BY_CODE = Object.fromEntries(BIBLE_BOOKS.map(b => [b.code, b]));
export const BIBLE_BOOKS_BY_ORDER = Object.fromEntries(BIBLE_BOOKS.map(b => [b.order, b]));

/** Return localized book name based on language code */
export function getLocalizedBookName(book, language) {
  if (!book) return '';
  return language === 'om' ? (book.name_om || book.name_en) : book.name_en;
}

/** Get book by code (case-insensitive) */
export function getBookByCode(code) {
  return BIBLE_BOOKS_BY_CODE[code?.toUpperCase()] || null;
}

/** Generate an array of chapter numbers [1..n] for a book */
export function getChapterNumbers(bookCode) {
  const book = getBookByCode(bookCode);
  if (!book) return [];
  return Array.from({ length: book.chapters }, (_, i) => i + 1);
}

/** Get the next book in canonical order (returns null at Revelation) */
export function getNextBook(bookCode) {
  const book = getBookByCode(bookCode);
  if (!book) return null;
  return BIBLE_BOOKS_BY_ORDER[book.order + 1] || null;
}

/** Get the previous book in canonical order (returns null at Genesis) */
export function getPrevBook(bookCode) {
  const book = getBookByCode(bookCode);
  if (!book) return null;
  return BIBLE_BOOKS_BY_ORDER[book.order - 1] || null;
}

/**
 * Navigate: given a book + chapter, return {bookCode, chapter} for next chapter.
 * Rolls over to next book automatically.
 */
export function getNextChapter(bookCode, chapter) {
  const book = getBookByCode(bookCode);
  if (!book) return null;
  if (chapter < book.chapters) return { bookCode, chapter: chapter + 1 };
  const next = getNextBook(bookCode);
  return next ? { bookCode: next.code, chapter: 1 } : null;
}

/**
 * Navigate: given a book + chapter, return {bookCode, chapter} for previous chapter.
 * Rolls back to previous book automatically.
 */
export function getPrevChapter(bookCode, chapter) {
  const book = getBookByCode(bookCode);
  if (!book) return null;
  if (chapter > 1) return { bookCode, chapter: chapter - 1 };
  const prev = getPrevBook(bookCode);
  return prev ? { bookCode: prev.code, chapter: prev.chapters } : null;
}

/** Old Testament books in order */
export const OLD_TESTAMENT = BIBLE_BOOKS.filter(b => b.testament === 'old');

/** New Testament books in order */
export const NEW_TESTAMENT = BIBLE_BOOKS.filter(b => b.testament === 'new');

/**
 * Format a Bible reference string using localized book name.
 * e.g. formatRef("GEN", 1, "en") → "Genesis 1"
 */
export function formatRef(bookCode, chapter, language = 'en', verse = null) {
  const book = getBookByCode(bookCode);
  if (!book) return `${bookCode} ${chapter}`;
  const name = getLocalizedBookName(book, language);
  return verse ? `${name} ${chapter}:${verse}` : `${name} ${chapter}`;
}