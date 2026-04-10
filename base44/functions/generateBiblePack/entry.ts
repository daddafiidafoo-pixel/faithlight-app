/**
 * Generate Offline Bible Pack
 * Fetches Bible data from provider and creates downloadable offline pack
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BIBLE_BRAIN_API = 'https://4.dbt.io/api';

/**
 * Fetch all books for a version from Bible Brain
 */
async function fetchBooksFromBibleBrain(versionId) {
  try {
    const url = `${BIBLE_BRAIN_API}/bibles/${versionId}/books`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Bible Brain API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

/**
 * Fetch all chapters for a book from Bible Brain
 */
async function fetchChaptersFromBibleBrain(versionId, bookId) {
  try {
    const url = `${BIBLE_BRAIN_API}/bibles/${versionId}/chapters/${bookId}?include=verses`;
    const response = await fetch(url);
    
    if (!response.ok) return [];

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching chapters for ${bookId}:`, error);
    return [];
  }
}

/**
 * Normalize verses into offline format
 */
function normalizeVerses(chapterData) {
  if (!chapterData.verses || chapterData.verses.length === 0) return [];
  
  return chapterData.verses.map(v => ({
    verse: v.verse_start,
    text: v.verse_text,
  }));
}

/**
 * Build chapter JSON for offline storage
 */
function buildChapterJSON(bookName, bookId, chaptersData) {
  const chapters = chaptersData.map(ch => ({
    chapterNumber: ch.chapter,
    verses: normalizeVerses(ch),
  }));

  return {
    book: bookName,
    bookId,
    chapters,
  };
}

/**
 * Generate complete pack data structure
 */
async function generatePackData(versionId, providerId) {
  try {
    const books = await fetchBooksFromBibleBrain(providerId);
    
    if (books.length === 0) {
      throw new Error(`No books found for ${versionId}`);
    }

    let totalChapters = 0;
    let totalVerses = 0;
    const packData = {};

    // Fetch chapters for each book
    for (const book of books) {
      console.log(`Fetching chapters for ${book.name}...`);
      
      const chapters = await fetchChaptersFromBibleBrain(providerId, book.id);
      if (chapters.length === 0) continue;

      const bookJSON = buildChapterJSON(book.name, book.id, chapters);
      packData[book.id] = bookJSON;

      // Count totals
      totalChapters += chapters.length;
      chapters.forEach(ch => {
        totalVerses += ch.verses?.length || 0;
      });
    }

    return {
      books: packData,
      stats: {
        bookCount: books.length,
        chapterCount: totalChapters,
        verseCount: totalVerses,
      },
    };
  } catch (error) {
    console.error('Error generating pack data:', error);
    return null;
  }
}

/**
 * Calculate rough pack size in MB
 */
function estimatePackSize(packData) {
  // Rough estimate: ~500 bytes per verse
  const estimatedBytes = packData.stats.verseCount * 500;
  return Math.ceil(estimatedBytes / (1024 * 1024)); // Convert to MB
}

/**
 * Create metadata for pack
 */
function createPackMetadata(versionId, versionName, language, languageName, packData, sizeMB) {
  return {
    versionId,
    versionName,
    language,
    languageName,
    books: packData.stats.bookCount,
    chapters: packData.stats.chapterCount,
    verses: packData.stats.verseCount,
    packSizeMB: sizeMB,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Main handler
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body = await req.json();
    const { versionId, versionName, language, languageName, provider, providerId } = body;

    // Validate inputs
    if (!versionId || !providerId) {
      return Response.json(
        { error: 'Missing versionId or providerId' },
        { status: 400 }
      );
    }

    console.log(`Generating pack for ${versionId}...`);

    // Generate pack data from provider
    const packData = await generatePackData(versionId, providerId);
    if (!packData) {
      return Response.json(
        { error: 'Failed to generate pack data' },
        { status: 500 }
      );
    }

    // Calculate size and create metadata
    const sizeMB = estimatePackSize(packData);
    const metadata = createPackMetadata(
      versionId,
      versionName,
      language,
      languageName,
      packData,
      sizeMB
    );

    console.log(`Pack generated: ${versionId} - ${packData.stats.bookCount} books, ${sizeMB}MB`);

    return Response.json(
      {
        success: true,
        metadata,
        stats: packData.stats,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Pack generation error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});