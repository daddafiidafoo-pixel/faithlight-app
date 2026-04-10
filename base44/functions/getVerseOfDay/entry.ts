import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ALLOWED_LANGUAGES = ['en', 'om', 'am', 'ar', 'fr', 'sw'];

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const uiLanguage = url.searchParams.get('uiLanguage') || 'en';
    const bibleLanguage = url.searchParams.get('bibleLanguage') || 'en';
    const version = url.searchParams.get('version') || 'default';

    // Validate languages
    if (!ALLOWED_LANGUAGES.includes(uiLanguage) || !ALLOWED_LANGUAGES.includes(bibleLanguage)) {
      return Response.json({
        success: false,
        error: {
          code: 'INVALID_LANGUAGE',
          message: 'Unsupported language',
        },
      }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Step 1: Find verse of day for today
    const verseOfDayRecords = await base44.asServiceRole.entities.VerseOfDay.filter({
      date_key: today,
    });

    if (!verseOfDayRecords || verseOfDayRecords.length === 0) {
      return Response.json({
        success: false,
        error: {
          code: 'VERSE_OF_DAY_NOT_FOUND',
          message: 'Verse of the day not found',
        },
      }, { status: 404 });
    }

    const verseOfDay = verseOfDayRecords[0];

    // Step 2: Get book name using uiLanguage
    const bookRecords = await base44.asServiceRole.entities.BibleBook.filter({
      book_code: verseOfDay.book_code,
      language: uiLanguage,
    });

    const bookName = bookRecords && bookRecords.length > 0 
      ? bookRecords[0].display_name 
      : verseOfDay.book_code;

    // Step 3: Get verse text using bibleLanguage
    const verseRecords = await base44.asServiceRole.entities.BibleVerse.filter({
      language: bibleLanguage,
      version,
      book_code: verseOfDay.book_code,
      chapter_number: verseOfDay.chapter_number,
      verse_number: verseOfDay.verse_number,
    });

    if (!verseRecords || verseRecords.length === 0) {
      return Response.json({
        success: false,
        error: {
          code: 'VERSE_NOT_FOUND',
          message: 'Verse text not found for selected language',
        },
      }, { status: 404 });
    }

    const verse = verseRecords[0];

    return Response.json({
      success: true,
      data: {
        date: verseOfDay.date_key,
        bookCode: verseOfDay.book_code,
        bookName,
        chapter: verseOfDay.chapter_number,
        verse: verseOfDay.verse_number,
        text: verse.verse_text,
        theme: verseOfDay.theme,
      },
    });
  } catch (err) {
    console.error('getVerseOfDay error:', err);
    return Response.json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch verse of the day',
      },
    }, { status: 500 });
  }
});