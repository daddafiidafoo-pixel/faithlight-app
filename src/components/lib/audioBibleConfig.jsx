// Oromo Audio Bible Configuration (Bible.is / BibleBrain)
export const AUDIO_BIBLE_CONFIG = {
  om: {
    languageCode: 'om',
    languageName: 'Afaan Oromoo',
    provider: 'Bible.is',
    bibleId: 'GAZGAZ',
    label: 'Afaan Oromoo Audio Bible',
    supportsAudio: true,
    supportsText: true,
    defaultBookCode: 'GEN',
    defaultChapter: 1,
  }
};

// Complete book-code mapping for Bible.is API
export const BIBLE_IS_BOOK_CODES = {
  // Old Testament
  genesis: 'GEN',
  exodus: 'EXO',
  leviticus: 'LEV',
  numbers: 'NUM',
  deuteronomy: 'DEU',
  joshua: 'JOS',
  judges: 'JDG',
  ruth: 'RUT',
  '1-samuel': '1SA',
  '2-samuel': '2SA',
  '1-kings': '1KI',
  '2-kings': '2KI',
  '1-chronicles': '1CH',
  '2-chronicles': '2CH',
  ezra: 'EZR',
  nehemiah: 'NEH',
  esther: 'EST',
  job: 'JOB',
  psalms: 'PSA',
  proverbs: 'PRO',
  ecclesiastes: 'ECC',
  'song-of-solomon': 'SNG',
  isaiah: 'ISA',
  jeremiah: 'JER',
  lamentations: 'LAM',
  ezekiel: 'EZK',
  daniel: 'DAN',
  hosea: 'HOS',
  joel: 'JOL',
  amos: 'AMO',
  obadiah: 'OBA',
  jonah: 'JON',
  micah: 'MIC',
  nahum: 'NAM',
  habakkuk: 'HAB',
  zephaniah: 'ZEP',
  haggai: 'HAG',
  zechariah: 'ZEC',
  malachi: 'MAL',
  // New Testament
  matthew: 'MAT',
  mark: 'MRK',
  luke: 'LUK',
  john: 'JHN',
  acts: 'ACT',
  romans: 'ROM',
  '1-corinthians': '1CO',
  '2-corinthians': '2CO',
  galatians: 'GAL',
  ephesians: 'EPH',
  philippians: 'PHP',
  colossians: 'COL',
  '1-thessalonians': '1TH',
  '2-thessalonians': '2TH',
  '1-timothy': '1TI',
  '2-timothy': '2TI',
  titus: 'TIT',
  philemon: 'PHM',
  hebrews: 'HEB',
  james: 'JAS',
  '1-peter': '1PE',
  '2-peter': '2PE',
  '1-john': '1JN',
  '2-john': '2JN',
  '3-john': '3JN',
  jude: 'JUD',
  revelation: 'REV',
};

/**
 * Get audio Bible config for a language
 * @param {string} language - Language code (e.g., 'om')
 * @returns {object} Audio Bible configuration
 */
export function getAudioBibleConfig(language = 'om') {
  return AUDIO_BIBLE_CONFIG[language] || AUDIO_BIBLE_CONFIG.om;
}

/**
 * Get Bible.is book code for a book key
 * @param {string} bookKey - Book key (e.g., 'genesis', 'john')
 * @returns {string|null} Bible.is book code (e.g., 'GEN', 'JHN') or null if not found
 */
export function getBibleIsBookCode(bookKey) {
  return BIBLE_IS_BOOK_CODES[bookKey] || null;
}

/**
 * Build Bible.is API reference object
 * @param {string} bookKey - Book key (e.g., 'genesis')
 * @param {number} chapter - Chapter number
 * @returns {object} Reference object with bibleId, bookCode, chapter
 */
export function buildBibleIsReference(bookKey, chapter) {
  const config = getAudioBibleConfig('om');
  const bookCode = getBibleIsBookCode(bookKey);

  if (!bookCode) {
    throw new Error(`Unknown Bible.is book code for bookKey: ${bookKey}`);
  }

  return {
    bibleId: config.bibleId,
    bookCode,
    chapter,
    languageCode: config.languageCode,
  };
}

/**
 * Build Bible.is live website URL
 * @param {string} bookKey - Book key (e.g., 'genesis')
 * @param {number} chapter - Chapter number
 * @returns {string} Full URL to Bible.is live page
 */
export function buildBibleIsLiveUrl(bookKey, chapter) {
  const { bibleId, bookCode } = buildBibleIsReference(bookKey, chapter);
  return `https://live.bible.is/bible/${bibleId}/${bookCode}/${chapter}`;
}

/**
 * Build Bible.is API URL for audio/text content
 * @param {string} bookKey - Book key (e.g., 'genesis')
 * @param {number} chapter - Chapter number
 * @returns {string} Full API URL
 */
export function buildBibleIsApiUrl(bookKey, chapter) {
  const { bibleId, bookCode } = buildBibleIsReference(bookKey, chapter);
  return `https://api.bible.is/audio/${bibleId}/${bookCode}/${chapter}`;
}

/**
 * Reverse lookup: get book key from Bible.is book code
 * @param {string} bookCode - Bible.is book code (e.g., 'GEN', 'JHN')
 * @returns {string|null} Book key or null if not found
 */
export function getBookKeyFromBibleIsCode(bookCode) {
  for (const [key, code] of Object.entries(BIBLE_IS_BOOK_CODES)) {
    if (code === bookCode) return key;
  }
  return null;
}