import { base44 } from '@/api/base44Client';

export async function importBibleVerses(verses, options = {}) {
  const { batchSize = 25, logProgress = true } = options;
  
  if (!Array.isArray(verses)) {
    throw new Error('verses must be an array');
  }

  let inserted = 0;
  let duplicates = 0;
  let skipped = 0;
  const errors = [];

  try {
    for (let i = 0; i < verses.length; i += batchSize) {
      const batch = verses.slice(i, i + batchSize);
      
      for (const verse of batch) {
        try {
          // Validate verse structure
          if (!verse.book || !verse.chapter || !verse.verse || !verse.text) {
            skipped++;
            if (logProgress) console.log(`Skipped invalid verse at index ${i}`);
            continue;
          }

          // Check if verse already exists
          const existing = await base44.entities.BibleVerse.filter({
            book: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            language: verse.language || 'en'
          }, '', 1);

          if (existing.length > 0) {
            duplicates++;
            if (logProgress) console.log(`Duplicate: ${verse.book} ${verse.chapter}:${verse.verse}`);
            continue;
          }

          // Create new verse
          await base44.entities.BibleVerse.create(verse);
          inserted++;
          if (logProgress) console.log(`Inserted: ${verse.book} ${verse.chapter}:${verse.verse}`);
        } catch (err) {
          errors.push(`Error processing ${verse.book} ${verse.chapter}:${verse.verse}: ${err.message}`);
          skipped++;
        }
      }
    }
  } catch (err) {
    errors.push(`Batch processing error: ${err.message}`);
  }

  return { inserted, duplicates, skipped, errors };
}