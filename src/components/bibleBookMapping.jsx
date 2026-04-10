/**
 * Bible Book Mapping
 * Single source of truth for all 66 canonical books
 * Includes: API codes, English names, Afaan Oromoo names, chapter counts
 */

export const BOOK_MAPPING = [
  // Old Testament (39 books)
  { order: 1, api_code: 'GEN', name_en: 'Genesis', name_om: 'Seera Uumamaa', testament: 'old', chapters: 50 },
  { order: 2, api_code: 'EXO', name_en: 'Exodus', name_om: 'Ba\'uu', testament: 'old', chapters: 40 },
  { order: 3, api_code: 'LEV', name_en: 'Leviticus', name_om: 'Lewwota', testament: 'old', chapters: 27 },
  { order: 4, api_code: 'NUM', name_en: 'Numbers', name_om: 'Lakkoobsa', testament: 'old', chapters: 36 },
  { order: 5, api_code: 'DEU', name_en: 'Deuteronomy', name_om: 'Keessa Deebii Seeraa', testament: 'old', chapters: 34 },
  { order: 6, api_code: 'JOS', name_en: 'Joshua', name_om: 'Iyyaasuu', testament: 'old', chapters: 24 },
  { order: 7, api_code: 'JDG', name_en: 'Judges', name_om: 'Abbootii Murtii', testament: 'old', chapters: 21 },
  { order: 8, api_code: 'RUT', name_en: 'Ruth', name_om: 'Ruut', testament: 'old', chapters: 4 },
  { order: 9, api_code: '1SA', name_en: '1 Samuel', name_om: '1 Saamu\'eel', testament: 'old', chapters: 31 },
  { order: 10, api_code: '2SA', name_en: '2 Samuel', name_om: '2 Saamu\'eel', testament: 'old', chapters: 24 },
  { order: 11, api_code: '1KI', name_en: '1 Kings', name_om: '1 Mootota', testament: 'old', chapters: 22 },
  { order: 12, api_code: '2KI', name_en: '2 Kings', name_om: '2 Mootota', testament: 'old', chapters: 25 },
  { order: 13, api_code: '1CH', name_en: '1 Chronicles', name_om: '1 Seenaa', testament: 'old', chapters: 29 },
  { order: 14, api_code: '2CH', name_en: '2 Chronicles', name_om: '2 Seenaa', testament: 'old', chapters: 36 },
  { order: 15, api_code: 'EZR', name_en: 'Ezra', name_om: 'Izraa', testament: 'old', chapters: 10 },
  { order: 16, api_code: 'NEH', name_en: 'Nehemiah', name_om: 'Nahimiyaa', testament: 'old', chapters: 13 },
  { order: 17, api_code: 'EST', name_en: 'Esther', name_om: 'Esteer', testament: 'old', chapters: 10 },
  { order: 18, api_code: 'JOB', name_en: 'Job', name_om: 'Iyoob', testament: 'old', chapters: 42 },
  { order: 19, api_code: 'PSA', name_en: 'Psalms', name_om: 'Faarfannaa', testament: 'old', chapters: 150 },
  { order: 20, api_code: 'PRO', name_en: 'Proverbs', name_om: 'Fakkeenya', testament: 'old', chapters: 31 },
  { order: 21, api_code: 'ECC', name_en: 'Ecclesiastes', name_om: 'Lallaba', testament: 'old', chapters: 12 },
  { order: 22, api_code: 'SNG', name_en: 'Song of Songs', name_om: 'Faarfannaa Solomoon', testament: 'old', chapters: 8 },
  { order: 23, api_code: 'ISA', name_en: 'Isaiah', name_om: 'Isaayaas', testament: 'old', chapters: 66 },
  { order: 24, api_code: 'JER', name_en: 'Jeremiah', name_om: 'Ermiyaas', testament: 'old', chapters: 52 },
  { order: 25, api_code: 'LAM', name_en: 'Lamentations', name_om: 'Imimmaan Ermiyaas', testament: 'old', chapters: 5 },
  { order: 26, api_code: 'EZK', name_en: 'Ezekiel', name_om: 'Hisqi\'eel', testament: 'old', chapters: 48 },
  { order: 27, api_code: 'DAN', name_en: 'Daniel', name_om: 'Daani\'el', testament: 'old', chapters: 12 },
  { order: 28, api_code: 'HOS', name_en: 'Hosea', name_om: 'Hoose\'aa', testament: 'old', chapters: 14 },
  { order: 29, api_code: 'JOL', name_en: 'Joel', name_om: 'Yo\'eel', testament: 'old', chapters: 3 },
  { order: 30, api_code: 'AMO', name_en: 'Amos', name_om: 'Aamoos', testament: 'old', chapters: 9 },
  { order: 31, api_code: 'OBA', name_en: 'Obadiah', name_om: 'Obaadiyaa', testament: 'old', chapters: 1 },
  { order: 32, api_code: 'JON', name_en: 'Jonah', name_om: 'Yoonaas', testament: 'old', chapters: 4 },
  { order: 33, api_code: 'MIC', name_en: 'Micah', name_om: 'Miikiyaas', testament: 'old', chapters: 7 },
  { order: 34, api_code: 'NAH', name_en: 'Nahum', name_om: 'Naahoom', testament: 'old', chapters: 3 },
  { order: 35, api_code: 'HAB', name_en: 'Habakkuk', name_om: 'Habbaquuq', testament: 'old', chapters: 3 },
  { order: 36, api_code: 'ZEP', name_en: 'Zephaniah', name_om: 'Sefaaniyaa', testament: 'old', chapters: 3 },
  { order: 37, api_code: 'HAG', name_en: 'Haggai', name_om: 'Haggay', testament: 'old', chapters: 2 },
  { order: 38, api_code: 'ZEC', name_en: 'Zechariah', name_om: 'Zakkaariyaas', testament: 'old', chapters: 14 },
  { order: 39, api_code: 'MAL', name_en: 'Malachi', name_om: 'Malaaki', testament: 'old', chapters: 4 },
  
  // New Testament (27 books)
  { order: 40, api_code: 'MAT', name_en: 'Matthew', name_om: 'Maatewos', testament: 'new', chapters: 28 },
  { order: 41, api_code: 'MRK', name_en: 'Mark', name_om: 'Maarqos', testament: 'new', chapters: 16 },
  { order: 42, api_code: 'LUK', name_en: 'Luke', name_om: 'Luqaas', testament: 'new', chapters: 24 },
  { order: 43, api_code: 'JHN', name_en: 'John', name_om: 'Yohaannis', testament: 'new', chapters: 21 },
  { order: 44, api_code: 'ACT', name_en: 'Acts', name_om: 'Hojii Ergamootaa', testament: 'new', chapters: 28 },
  { order: 45, api_code: 'ROM', name_en: 'Romans', name_om: 'Roomaa', testament: 'new', chapters: 16 },
  { order: 46, api_code: '1CO', name_en: '1 Corinthians', name_om: '1 Qorontos', testament: 'new', chapters: 16 },
  { order: 47, api_code: '2CO', name_en: '2 Corinthians', name_om: '2 Qorontos', testament: 'new', chapters: 13 },
  { order: 48, api_code: 'GAL', name_en: 'Galatians', name_om: 'Galaatiyaa', testament: 'new', chapters: 6 },
  { order: 49, api_code: 'EPH', name_en: 'Ephesians', name_om: 'Efesoon', testament: 'new', chapters: 6 },
  { order: 50, api_code: 'PHP', name_en: 'Philippians', name_om: 'Filiphisiyus', testament: 'new', chapters: 4 },
  { order: 51, api_code: 'COL', name_en: 'Colossians', name_om: 'Qolosaayis', testament: 'new', chapters: 4 },
  { order: 52, api_code: '1TH', name_en: '1 Thessalonians', name_om: '1 Tasaloniiqee', testament: 'new', chapters: 5 },
  { order: 53, api_code: '2TH', name_en: '2 Thessalonians', name_om: '2 Tasaloniiqee', testament: 'new', chapters: 3 },
  { order: 54, api_code: '1TI', name_en: '1 Timothy', name_om: '1 Ximotewos', testament: 'new', chapters: 6 },
  { order: 55, api_code: '2TI', name_en: '2 Timothy', name_om: '2 Ximotewos', testament: 'new', chapters: 4 },
  { order: 56, api_code: 'TIT', name_en: 'Titus', name_om: 'Tiitoos', testament: 'new', chapters: 3 },
  { order: 57, api_code: 'PHM', name_en: 'Philemon', name_om: 'Filemoona', testament: 'new', chapters: 1 },
  { order: 58, api_code: 'HEB', name_en: 'Hebrews', name_om: 'Ibroota', testament: 'new', chapters: 13 },
  { order: 59, api_code: 'JAS', name_en: 'James', name_om: 'Yaaqoob', testament: 'new', chapters: 5 },
  { order: 60, api_code: '1PE', name_en: '1 Peter', name_om: '1 Pheexiros', testament: 'new', chapters: 5 },
  { order: 61, api_code: '2PE', name_en: '2 Peter', name_om: '2 Pheexiros', testament: 'new', chapters: 3 },
  { order: 62, api_code: '1JN', name_en: '1 John', name_om: '1 Yohaannis', testament: 'new', chapters: 5 },
  { order: 63, api_code: '2JN', name_en: '2 John', name_om: '2 Yohaannis', testament: 'new', chapters: 1 },
  { order: 64, api_code: '3JN', name_en: '3 John', name_om: '3 Yohaannis', testament: 'new', chapters: 1 },
  { order: 65, api_code: 'JUD', name_en: 'Jude', name_om: 'Yihuudaa', testament: 'new', chapters: 1 },
  { order: 66, api_code: 'REV', name_en: 'Revelation', name_om: 'Mul\'ata Yohaannis', testament: 'new', chapters: 22 },
];

/**
 * Index for fast lookups
 */
export const API_CODE_TO_BOOK = BOOK_MAPPING.reduce((acc, book) => {
  acc[book.api_code] = book;
  return acc;
}, {});

export const BOOK_ID_TO_API_CODE = BOOK_MAPPING.reduce((acc, book, idx) => {
  acc[idx + 1] = book.api_code;
  return acc;
}, {});

/**
 * Get book name by API code and language
 * @param {string} apiCode - e.g. "JHN"
 * @param {string} lang - 'en' or 'om' (default 'en')
 * @returns {string}
 */
export const getBookName = (apiCode, lang = 'en') => {
  const book = API_CODE_TO_BOOK[apiCode?.toUpperCase()];
  if (!book) return apiCode;
  
  if (lang === 'om') return book.name_om;
  return book.name_en;
};

/**
 * Get testament for a book
 * @param {string} apiCode
 * @returns {string} 'old' or 'new'
 */
export const getTestament = (apiCode) => {
  const book = API_CODE_TO_BOOK[apiCode?.toUpperCase()];
  return book ? book.testament : null;
};

export default {
  BOOK_MAPPING,
  API_CODE_TO_BOOK,
  BOOK_ID_TO_API_CODE,
  getBookName,
  getTestament,
};