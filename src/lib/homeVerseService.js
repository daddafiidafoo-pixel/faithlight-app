import { base44 } from '@/api/base44Client';

/**
 * Get verse of the day for a specific language
 * Prioritizes verified local data, falls back to Bible Brain
 */
export async function getVerseOfDayForLanguage(language = 'en') {
  try {
    // For Oromo: fetch from verified local data first
    if (language === 'om') {
      try {
        const oromoVerses = await base44.entities.BibleVerseText?.filter?.(
          { language_code: 'om' },
          '-created_date',
          1
        ) || [];

        if (oromoVerses.length > 0) {
          const verse = oromoVerses[0];
          return {
            reference: verse.reference,
            text: verse.text,
            language: 'om',
            source: 'local-oromo',
          };
        }
      } catch (err) {
        console.error('Failed to fetch Oromo verse from local DB:', err);
      }

      // Oromo not available
      return {
        unavailable: true,
        language: 'om',
        message: 'Aayatni Afaan Oromootiin yeroo ammaa hin argamu',
      };
    }

    // For English: use existing service
    if (language === 'en') {
      try {
        const englishVerses = await base44.entities.BibleVerseText?.filter?.(
          { language_code: 'en' },
          '-created_date',
          1
        ) || [];

        if (englishVerses.length > 0) {
          const verse = englishVerses[0];
          return {
            reference: verse.reference,
            text: verse.text,
            language: 'en',
            source: 'local-en',
          };
        }
      } catch (err) {
        console.error('Failed to fetch English verse:', err);
      }
    }

    // Default fallback
    return {
      unavailable: true,
      language,
      message: language === 'om' 
        ? 'Aayatni Afaan Oromootiin yeroo ammaa hin argamu'
        : 'Verse not available right now',
    };
  } catch (err) {
    console.error('Error in getVerseOfDayForLanguage:', err);
    return {
      unavailable: true,
      language,
      message: 'Error loading verse',
    };
  }
}