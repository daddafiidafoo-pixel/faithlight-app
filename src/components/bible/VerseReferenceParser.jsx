import bibleData from '@/components/bibleData.json';
import bibleAbbreviations from '@/components/bibleAbbreviations.json';

/**
 * Parse verse references in multiple formats:
 * - "John 3:16"
 * - "Jn 3 16"
 * - "Jn 3:16"
 * - "john3:16"
 * - "ዮሐ 3:16" (Amharic)
 * - "يو 3:16" (Arabic)
 * - "Yoh 3:16" (Oromo)
 * - etc.
 */

export function parseVerseReference(input, language = 'en') {
  if (!input || typeof input !== 'string') return null;

  const cleaned = input.trim();

  // Try to match: "BookName/Abbrev chapter:verse" or "BookName/Abbrev chapter verse"
  const patterns = [
    /^([a-zA-Z0-9ዮሐሳሙኤነገሥፋየኢኤረድኪጊሰመኮጰቀበከከህሙገፈምስየቀተአየ\u0600-\u06FF]+)\s*(\d+)\s*[:.]?\s*(\d+)$/i,
    /^([a-zA-Z0-9ዮሐሳሙኤነገሥፋየኢኤረድኪጊሰመኮጰቀበከከህሙገፈምስየቀተአየ\u0600-\u06FF]+)\s*[:.]?\s*(\d+)\s*[:.]?\s*(\d+)$/i,
  ];

  let match;
  for (const pattern of patterns) {
    match = cleaned.match(pattern);
    if (match) break;
  }

  if (!match) return null;

  const bookInput = match[1].toLowerCase().trim();
  const chapter = parseInt(match[2], 10);
  const verse = parseInt(match[3], 10);

  if (isNaN(chapter) || isNaN(verse) || chapter < 1 || verse < 1) return null;

  // Find book by name or abbreviation in any language
  const book = findBookByNameOrAbbrev(bookInput, language);

  if (!book) return null;

  // Validate chapter number
  if (chapter > book.chapters) return null;

  return {
    bookKey: book.key,
    bookId: book.id,
    bookName: book.name[language] || book.name.en,
    chapter,
    verse,
    language,
    testament: book.testament,
  };
}

/**
 * Find a book by its name or abbreviation across all languages
 */
function findBookByNameOrAbbrev(input, currentLang) {
  const lower = input.toLowerCase();

  // Check direct key match
  let found = bibleData.bibleBooks.find(b => b.key.toLowerCase() === lower);
  if (found) return found;

  // Check book names in all languages
  for (const book of bibleData.bibleBooks) {
    for (const lang in book.name) {
      if (book.name[lang].toLowerCase() === lower) {
        return book;
      }
    }
  }

  // Check abbreviations in all languages
  for (const abbr of bibleAbbreviations.bibleAbbreviations) {
    for (const lang in abbr.abbreviation) {
      if (abbr.abbreviation[lang].toLowerCase() === lower) {
        const book = bibleData.bibleBooks.find(b => b.key === abbr.bookKey);
        if (book) return book;
      }
    }
  }

  return null;
}

/**
 * Format a verse reference with proper abbreviation based on language
 */
export function formatVerseReference(bookKey, chapter, verse, language = 'en') {
  const abbr = bibleAbbreviations.bibleAbbreviations.find(
    a => a.bookKey === bookKey
  );

  if (!abbr) return `${bookKey} ${chapter}:${verse}`;

  const abbrText = abbr.abbreviation[language] || abbr.abbreviation.en;
  return `${abbrText} ${chapter}:${verse}`;
}

/**
 * Get all available formats for a verse reference
 */
export function getVerseReferenceFormats(bookKey, chapter, verse) {
  const formats = {};

  const book = bibleData.bibleBooks.find(b => b.key === bookKey);
  if (!book) return formats;

  const abbr = bibleAbbreviations.bibleAbbreviations.find(
    a => a.bookKey === bookKey
  );

  const langs = ['en', 'om', 'am', 'ar', 'sw', 'fr'];

  for (const lang of langs) {
    const bookName = book.name[lang] || book.name.en;
    const abbrText = abbr?.abbreviation[lang] || abbr?.abbreviation.en || bookKey;

    formats[lang] = {
      long: `${bookName} ${chapter}:${verse}`,
      short: `${abbrText} ${chapter}:${verse}`,
      compact: `${abbrText}${chapter}:${verse}`,
    };
  }

  return formats;
}