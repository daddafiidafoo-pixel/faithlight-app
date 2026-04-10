import { base44 } from '@/api/base44Client';
import { BOOK_MAPPING, API_CODE_TO_BOOK } from './bibleBookMapping';

// Build alias lookup once at startup: O(1) map from alias → {book_id, name}
const ALIAS_TO_BOOK = new Map(
  BOOK_MAPPING.map(b => [b.name_en.toLowerCase(), { name: b.name_en, api_code: b.api_code }])
);

// Normalize reference text: remove em-dashes, collapse whitespace, trim punctuation
function normalizeRefText(s) {
  return s
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[)\].,;:!?]+$/, '');
}

/**
 * Parse a single Bible reference
 * @param {string} input - e.g., "John 3:16", "1 John 1:9", "Romans 8"
 * @param {string} defaultTranslation - Default translation (e.g., "WEB")
 * @returns {Object|null} Parsed reference or null if invalid
 */
export function parseBibleReference(input, defaultTranslation = 'WEB') {
  const raw = input;
  const s = normalizeRefText(input).toLowerCase();

  // Regex: (book part) + (chapter) + optional :(verse) + optional -(end_verse)
  const m = s.match(/^(.+?)\s+(\d{1,3})(?::(\d{1,3}))?(?:\s*-\s*(\d{1,3}))?$/);
  if (!m) return null;

  const bookPart = m[1].trim();
  const chapter = parseInt(m[2], 10);
  const verse1 = m[3] ? parseInt(m[3], 10) : null;
  const verse2 = m[4] ? parseInt(m[4], 10) : null;

  // Direct alias lookup
  let book = ALIAS_TO_BOOK.get(bookPart);

  // Fallback: try removing periods (e.g., "1 jn." → "1 jn")
  if (!book) {
    const bookPartNoDots = bookPart.replace(/\./g, '').trim();
    book = ALIAS_TO_BOOK.get(bookPartNoDots);
  }

  if (!book) return null;

  let kind = 'chapter';
  let verse_start = null;
  let verse_end = null;

  if (verse1 !== null) {
    kind = verse2 !== null ? 'range' : 'verse';
    verse_start = verse1;
    verse_end = verse2 ?? verse1;
  }

  return {
    raw,
    translation: defaultTranslation,
    book: book.name,
    book_id: BOOK_MAPPING.findIndex(b => b.api_code === book.api_code) + 1,
    chapter,
    verse_start,
    verse_end,
    kind
  };
}

/**
 * Extract all Bible references from free text (e.g., chat message)
 * @param {string} text - Free text containing zero or more Bible references
 * @param {string} defaultTranslation - Default translation
 * @returns {Array} Array of parsed references (deduped)
 */
export function extractBibleReferences(text, defaultTranslation = 'WEB') {
  const t = normalizeRefText(text);

  // MVP matcher: book words + chapter + optional verse/range
  const re = /\b(?:(?:[1-3]\s*)?(?:[A-Za-z]+\.?\s*){1,4})\s+\d{1,3}(?::\d{1,3})?(?:\s*[-–—]\s*\d{1,3})?\b/g;

  const matches = t.match(re) || [];
  const out = [];
  const seen = new Set();

  for (const match of matches) {
    const parsed = parseBibleReference(match, defaultTranslation);
    if (!parsed) continue;

    const key = `${parsed.translation}|${parsed.book_id}|${parsed.chapter}|${parsed.verse_start ?? ''}|${parsed.verse_end ?? ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(parsed);
    }
  }

  return out;
}

/**
 * Parse and fetch verses for a Bible reference
 * @param {string} text - Reference text e.g., "John 3:16-18"
 * @returns {Object|null} { reference, verses, fullChapter } or null if not found
 */
export async function parseAndFetchBibleReference(text) {
  const parsed = parseBibleReference(text);
  if (!parsed) return null;

  const { book, book_id, chapter, verse_start, verse_end } = parsed;

  try {
    const allChapterVerses = await base44.entities.BibleVerse.filter({
      book,
      book_id,
      chapter
    }, 'verse', 300);

    if (allChapterVerses.length === 0) return null;

    let relevantVerses = allChapterVerses;
    if (verse_start !== null && verse_end !== null) {
      relevantVerses = allChapterVerses.filter(v => v.verse >= verse_start && v.verse <= verse_end);
    }

    if (relevantVerses.length === 0) return null;

    const reference = verse_start !== null
      ? `${book} ${chapter}:${verse_start}${verse_end !== verse_start ? `–${verse_end}` : ''}`
      : `${book} ${chapter}`;

    return {
      reference,
      verses: relevantVerses,
      fullChapter: verse_start === null
    };
  } catch (error) {
    console.error(`Error fetching ${book} ${chapter}:`, error);
    return null;
  }
}

/**
 * Fetch verses by translation code
 * @param {string} translationCode - Translation code (e.g., 'WEB', 'ASV')
 * @param {string} book - Book name
 * @param {number} chapter - Chapter number
 * @param {number} verseStart - Starting verse (optional)
 * @param {number} verseEnd - Ending verse (optional)
 */
export async function fetchVersesByTranslation(translationCode, book, chapter, verseStart = null, verseEnd = null) {
  try {
    const verses = await base44.entities.BibleVerse.filter({
      translation: translationCode,
      book: book,
      chapter: chapter
    }, 'verse', 300);

    if (verseStart !== null) {
      return verses.filter(v => v.verse >= verseStart && (verseEnd ? v.verse <= verseEnd : true));
    }

    return verses;
  } catch (error) {
    console.error(`Error fetching verses for ${book} ${chapter}:`, error);
    return [];
  }
}

/**
 * Extract and fetch multiple Bible references from text with optional translation override
 * @param {string} text - Free text containing Bible references
 * @param {string} preferredTranslation - Optional translation override
 * @returns {Promise<Array>} Array of { reference, verses, fullChapter, translation }
 */
export async function extractAndFetchVerses(text, preferredTranslation = null) {
  const parsed = extractBibleReferences(text);
  if (parsed.length === 0) return [];

  const results = [];

  for (const ref of parsed) {
    try {
      const translation = preferredTranslation || ref.translation;
      const allChapterVerses = await fetchVersesByTranslation(translation, ref.book, ref.chapter);

      if (allChapterVerses.length === 0) continue;

      let relevantVerses = allChapterVerses;
      if (ref.verse_start !== null && ref.verse_end !== null) {
        relevantVerses = allChapterVerses.filter(v => v.verse >= ref.verse_start && v.verse <= ref.verse_end);
      }

      if (relevantVerses.length > 0) {
        const refString = ref.verse_start !== null
          ? `${ref.book} ${ref.chapter}:${ref.verse_start}${ref.verse_end !== ref.verse_start ? `–${ref.verse_end}` : ''}`
          : `${ref.book} ${ref.chapter}`;

        results.push({
          reference: refString,
          verses: relevantVerses,
          fullChapter: ref.verse_start === null,
          translation: translation
        });
      }
    } catch (error) {
      console.error(`Error fetching ${ref.book} ${ref.chapter}:`, error);
    }
  }

  return results;
}



export function createAIPromptWithVerses(verseReference, verseText, userQuestion) {
  return `You are a compassionate Bible tutor. Explain the following Scripture passage clearly with historical context, theological depth, and practical application for believers today.

SCRIPTURE PASSAGE:
${verseReference}
${verseText}

GUIDELINES:
- Explain the passage clearly with historical, cultural, and theological context
- Provide practical application for faith and Christian living
- Always cite verse references precisely
- Use simple, accessible language
- Be warm and encouraging
- Suggest related passages if helpful

USER QUESTION OR REQUEST: ${userQuestion || 'Explain this passage to me.'}`;
}