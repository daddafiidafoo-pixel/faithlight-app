import { base44 } from '@/api/base44Client';

/**
 * Validate a verse record before import
 * @param {Object} verse
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateVerseRecord(verse) {
  const errors = [];

  if (!verse.translation || typeof verse.translation !== 'string') {
    errors.push('Missing or invalid translation');
  }
  if (typeof verse.book_id !== 'number' || verse.book_id < 1 || verse.book_id > 66) {
    errors.push(`Invalid book_id: ${verse.book_id}`);
  }
  if (typeof verse.chapter !== 'number' || verse.chapter < 1) {
    errors.push(`Invalid chapter: ${verse.chapter}`);
  }
  if (typeof verse.verse !== 'number' || verse.verse < 1) {
    errors.push(`Invalid verse: ${verse.verse}`);
  }
  if (!verse.book || typeof verse.book !== 'string') {
    errors.push('Missing or invalid book name');
  }
  if (!verse.text || typeof verse.text !== 'string') {
    errors.push('Missing or invalid verse text');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Import verses in batches with validation & dedup
 * @param {Array} verses - Array of verse objects
 * @param {Object} options - { batchSize: 50, logProgress: true }
 * @returns {Promise<Object>} { inserted: number, skipped: number, errors: Array }
 */
export async function importBibleVerses(verses, options = {}) {
  const { batchSize = 50, logProgress = true } = options;
  
  const results = {
    inserted: 0,
    skipped: 0,
    duplicates: 0,
    errors: []
  };

  const seen = new Set();

  if (!Array.isArray(verses) || verses.length === 0) {
    results.errors.push('No verses provided');
    return results;
  }

  // Validate all verses first
  const validVerses = [];
  for (const verse of verses) {
    const validation = validateVerseRecord(verse);
    if (!validation.valid) {
      results.errors.push(`Row invalid: ${JSON.stringify(verse)} — ${validation.errors.join(', ')}`);
      results.skipped++;
      continue;
    }

    // Check for duplicates
    const key = `${verse.translation}|${verse.book_id}|${verse.chapter}|${verse.verse}`;
    if (seen.has(key)) {
      results.duplicates++;
      if (logProgress) console.warn(`Duplicate skipped: ${key}`);
      continue;
    }
    seen.add(key);
    validVerses.push(verse);
  }

  if (logProgress) console.log(`Validated ${validVerses.length} unique verses, ${results.duplicates} duplicates, ${results.skipped} invalid`);

  // Batch insert
  for (let i = 0; i < validVerses.length; i += batchSize) {
    const batch = validVerses.slice(i, i + batchSize);

    try {
      const created = await base44.entities.BibleVerse.bulkCreate(batch);
      results.inserted += created.length;

      if (logProgress) {
        console.log(`Imported batch: rows ${i}-${i + batch.length} (${results.inserted} total inserted)`);
      }
    } catch (error) {
      const errorMsg = `Batch error (rows ${i}-${i + batch.length}): ${error.message}`;
      results.errors.push(errorMsg);
      if (logProgress) console.error(errorMsg);
    }
  }

  return results;
}

/**
 * Query verses for a reference (used by chat/reader)
 * @param {Object} ref - Parsed reference { book_id, chapter, verse_start?, verse_end? }
 * @param {string} translation - e.g., "WEB"
 * @returns {Promise<Array>} Array of verse objects
 */
export async function fetchBibleVerses(ref, translation = 'WEB') {
  try {
    const verses = await base44.entities.BibleVerse.filter({
      translation,
      book_id: ref.book_id,
      chapter: ref.chapter
    }, 'verse', 300);

    if (verses.length === 0) return [];

    // Filter by verse range if specified
    if (ref.verse_start !== null && ref.verse_end !== null) {
      return verses.filter(v => v.verse >= ref.verse_start && v.verse <= ref.verse_end);
    }

    return verses;
  } catch (error) {
    console.error('Error fetching Bible verses:', error);
    return [];
  }
}