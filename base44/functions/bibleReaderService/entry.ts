import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Simple in-memory cache
const chapterCache = new Map();
const booksCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const getCacheKey = (bookId, chapterNumber, language) => `${bookId}-${chapterNumber}-${language}`;

const isCacheValid = (cachedItem) => {
  if (!cachedItem) return false;
  return Date.now() - cachedItem.timestamp < CACHE_TTL_MS;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, bookId, chapterNumber, language = 'en', reference } = await req.json();

    // ===== getBooks() =====
    if (action === 'getBooks') {
      // Check cache first
      if (booksCache.has('all') && isCacheValid(booksCache.get('all'))) {
        return Response.json({ success: true, data: booksCache.get('all').data });
      }

      const books = await base44.entities.BibleBook.list();
      const sortedBooks = books.sort((a, b) => a.order - b.order);

      // Cache books
      booksCache.set('all', { data: sortedBooks, timestamp: Date.now() });

      return Response.json({ success: true, data: sortedBooks });
    }

    // ===== getChapters(bookId) =====
    if (action === 'getChapters') {
      if (!bookId) {
        return Response.json({ success: false, error: 'bookId required' }, { status: 400 });
      }

      const chapters = await base44.entities.BibleChapter.filter({ book_id: bookId });
      const sorted = chapters.sort((a, b) => a.chapter_number - b.chapter_number);

      return Response.json({ success: true, data: sorted });
    }

    // ===== getChapter(bookId, chapterNumber, language) =====
    if (action === 'getChapter') {
      if (!bookId || !chapterNumber) {
        return Response.json(
          { success: false, error: 'bookId and chapterNumber required' },
          { status: 400 }
        );
      }

      const cacheKey = getCacheKey(bookId, chapterNumber, language);

      // Cache-first logic
      if (chapterCache.has(cacheKey) && isCacheValid(chapterCache.get(cacheKey))) {
        const cached = chapterCache.get(cacheKey);
        // Prefetch adjacent chapters in background (async, no await)
        prefetchAdjacentChapters(base44, bookId, chapterNumber, language).catch(err =>
          console.error('Prefetch error:', err.message)
        );
        return Response.json({ success: true, data: cached.data });
      }

      // Fetch from database
      const chapter = await base44.entities.BibleChapter.filter({
        book_id: bookId,
        chapter_number: chapterNumber,
      });

      if (!chapter || chapter.length === 0) {
        return Response.json({ success: false, error: 'Chapter not found' }, { status: 404 });
      }

      const chapterData = chapter[0];

      // Fetch verses for this chapter
      const verses = await base44.entities.BibleVerse.filter({
        book_id: bookId,
        chapter_number: chapterNumber,
      });

      const sortedVerses = verses
        .sort((a, b) => a.verse_number - b.verse_number)
        .map((v) => ({
          verse: v.verse_number,
          text: language === 'om' ? v.text_om : v.text_en,
          reference: v.reference,
        }));

      const response = {
        bookId: bookId,
        chapterNumber: chapterNumber,
        language: language,
        reference: `${bookId} ${chapterNumber}`,
        verses: sortedVerses,
        audioUrl: language === 'om' ? chapterData.audio_url_om : chapterData.audio_url_en,
        duration: chapterData.duration_seconds,
      };

      // Cache the result
      chapterCache.set(cacheKey, { data: response, timestamp: Date.now() });

      // Prefetch adjacent chapters in background
      prefetchAdjacentChapters(base44, bookId, chapterNumber, language).catch(err =>
        console.error('Prefetch error:', err.message)
      );

      return Response.json({ success: true, data: response });
    }

    // ===== getVerse(reference) =====
    if (action === 'getVerse') {
      if (!reference) {
        return Response.json({ success: false, error: 'reference required' }, { status: 400 });
      }

      // Parse reference like "JHN 3:16"
      const [bookId, chapterVerse] = reference.split(' ');
      const [chapterNum, verseNum] = chapterVerse.split(':').map(Number);

      const verse = await base44.entities.BibleVerse.filter({
        book_id: bookId,
        chapter_number: chapterNum,
        verse_number: verseNum,
      });

      if (!verse || verse.length === 0) {
        return Response.json({ success: false, error: 'Verse not found' }, { status: 404 });
      }

      const verseData = verse[0];
      return Response.json({
        success: true,
        data: {
          reference: verseData.reference,
          text_en: verseData.text_en,
          text_om: verseData.text_om,
          bookId: verseData.book_id,
          chapter: verseData.chapter_number,
          verse: verseData.verse_number,
        },
      });
    }

    // ===== getNextChapterRef(bookId, chapterNumber) =====
    if (action === 'getNextChapterRef') {
      if (!bookId || !chapterNumber) {
        return Response.json(
          { success: false, error: 'bookId and chapterNumber required' },
          { status: 400 }
        );
      }

      // Get current book info
      const books = await base44.entities.BibleBook.filter({ id: bookId });
      if (!books || books.length === 0) {
        return Response.json({ success: false, error: 'Book not found' }, { status: 404 });
      }

      const currentBook = books[0];
      const nextChapter = chapterNumber + 1;

      // If next chapter exists in current book
      if (nextChapter <= currentBook.chapters_count) {
        return Response.json({
          success: true,
          data: { bookId: bookId, chapterNumber: nextChapter },
        });
      }

      // Move to next book
      const allBooks = await base44.entities.BibleBook.list();
      const sortedBooks = allBooks.sort((a, b) => a.order - a.order);
      const currentIndex = sortedBooks.findIndex((b) => b.id === bookId);

      if (currentIndex === -1 || currentIndex === sortedBooks.length - 1) {
        // Last book, no next
        return Response.json({ success: true, data: null });
      }

      const nextBook = sortedBooks[currentIndex + 1];
      return Response.json({
        success: true,
        data: { bookId: nextBook.id, chapterNumber: 1 },
      });
    }

    // ===== getPreviousChapterRef(bookId, chapterNumber) =====
    if (action === 'getPreviousChapterRef') {
      if (!bookId || !chapterNumber) {
        return Response.json(
          { success: false, error: 'bookId and chapterNumber required' },
          { status: 400 }
        );
      }

      const previousChapter = chapterNumber - 1;

      // If previous chapter exists in current book
      if (previousChapter >= 1) {
        return Response.json({
          success: true,
          data: { bookId: bookId, chapterNumber: previousChapter },
        });
      }

      // Move to previous book
      const allBooks = await base44.entities.BibleBook.list();
      const sortedBooks = allBooks.sort((a, b) => a.order - b.order);
      const currentIndex = sortedBooks.findIndex((b) => b.id === bookId);

      if (currentIndex === -1 || currentIndex === 0) {
        // First book, no previous
        return Response.json({ success: true, data: null });
      }

      const prevBook = sortedBooks[currentIndex - 1];
      return Response.json({
        success: true,
        data: { bookId: prevBook.id, chapterNumber: prevBook.chapters_count },
      });
    }

    // Unknown action
    return Response.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('BibleReaderService error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Helper: Prefetch adjacent chapters in background
async function prefetchAdjacentChapters(base44, bookId, chapterNumber, language) {
  const previousChapter = chapterNumber - 1;
  const nextChapter = chapterNumber + 1;

  const prefetchTasks = [];

  // Prefetch previous chapter
  if (previousChapter >= 1) {
    const cacheKey = getCacheKey(bookId, previousChapter, language);
    if (!chapterCache.has(cacheKey) || !isCacheValid(chapterCache.get(cacheKey))) {
      prefetchTasks.push(fetchAndCacheChapter(base44, bookId, previousChapter, language));
    }
  }

  // Prefetch next chapter
  const cacheKey = getCacheKey(bookId, nextChapter, language);
  if (!chapterCache.has(cacheKey) || !isCacheValid(chapterCache.get(cacheKey))) {
    prefetchTasks.push(fetchAndCacheChapter(base44, bookId, nextChapter, language));
  }

  // Execute prefetch tasks concurrently but don't block the main response
  Promise.all(prefetchTasks).catch(err => console.error('Prefetch tasks failed:', err.message));
}

// Helper: Fetch and cache a chapter
async function fetchAndCacheChapter(base44, bookId, chapterNumber, language) {
  const cacheKey = getCacheKey(bookId, chapterNumber, language);

  const chapter = await base44.entities.BibleChapter.filter({
    book_id: bookId,
    chapter_number: chapterNumber,
  });

  if (!chapter || chapter.length === 0) return;

  const chapterData = chapter[0];
  const verses = await base44.entities.BibleVerse.filter({
    book_id: bookId,
    chapter_number: chapterNumber,
  });

  const sortedVerses = verses
    .sort((a, b) => a.verse_number - b.verse_number)
    .map((v) => ({
      verse: v.verse_number,
      text: language === 'om' ? v.text_om : v.text_en,
      reference: v.reference,
    }));

  const response = {
    bookId: bookId,
    chapterNumber: chapterNumber,
    language: language,
    reference: `${bookId} ${chapterNumber}`,
    verses: sortedVerses,
    audioUrl: language === 'om' ? chapterData.audio_url_om : chapterData.audio_url_en,
    duration: chapterData.duration_seconds,
  };

  chapterCache.set(cacheKey, { data: response, timestamp: Date.now() });
}