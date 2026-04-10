import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Bible book list with IDs, names, chapter counts
const BIBLE_BOOKS = [
  { id: 1, name: "Genesis", abbrev: "GEN", chapters: 50 },
  { id: 2, name: "Exodus", abbrev: "EXO", chapters: 40 },
  { id: 3, name: "Leviticus", abbrev: "LEV", chapters: 27 },
  { id: 4, name: "Numbers", abbrev: "NUM", chapters: 36 },
  { id: 5, name: "Deuteronomy", abbrev: "DEU", chapters: 34 },
  { id: 6, name: "Joshua", abbrev: "JOS", chapters: 24 },
  { id: 7, name: "Judges", abbrev: "JDG", chapters: 21 },
  { id: 8, name: "Ruth", abbrev: "RUT", chapters: 4 },
  { id: 9, name: "1 Samuel", abbrev: "1SA", chapters: 31 },
  { id: 10, name: "2 Samuel", abbrev: "2SA", chapters: 24 },
  { id: 11, name: "1 Kings", abbrev: "1KI", chapters: 22 },
  { id: 12, name: "2 Kings", abbrev: "2KI", chapters: 25 },
  { id: 13, name: "1 Chronicles", abbrev: "1CH", chapters: 29 },
  { id: 14, name: "2 Chronicles", abbrev: "2CH", chapters: 36 },
  { id: 15, name: "Ezra", abbrev: "EZR", chapters: 10 },
  { id: 16, name: "Nehemiah", abbrev: "NEH", chapters: 13 },
  { id: 17, name: "Esther", abbrev: "EST", chapters: 10 },
  { id: 18, name: "Job", abbrev: "JOB", chapters: 42 },
  { id: 19, name: "Psalm", abbrev: "PSA", chapters: 150 },
  { id: 20, name: "Proverbs", abbrev: "PRO", chapters: 31 },
  { id: 21, name: "Ecclesiastes", abbrev: "ECC", chapters: 12 },
  { id: 22, name: "Song of Songs", abbrev: "SNG", chapters: 8 },
  { id: 23, name: "Isaiah", abbrev: "ISA", chapters: 66 },
  { id: 24, name: "Jeremiah", abbrev: "JER", chapters: 52 },
  { id: 25, name: "Lamentations", abbrev: "LAM", chapters: 5 },
  { id: 26, name: "Ezekiel", abbrev: "EZK", chapters: 48 },
  { id: 27, name: "Daniel", abbrev: "DAN", chapters: 12 },
  { id: 28, name: "Hosea", abbrev: "HOS", chapters: 14 },
  { id: 29, name: "Joel", abbrev: "JOL", chapters: 3 },
  { id: 30, name: "Amos", abbrev: "AMO", chapters: 9 },
  { id: 31, name: "Obadiah", abbrev: "OBA", chapters: 1 },
  { id: 32, name: "Jonah", abbrev: "JON", chapters: 4 },
  { id: 33, name: "Micah", abbrev: "MIC", chapters: 7 },
  { id: 34, name: "Nahum", abbrev: "NAH", chapters: 3 },
  { id: 35, name: "Habakkuk", abbrev: "HAB", chapters: 3 },
  { id: 36, name: "Zephaniah", abbrev: "ZEP", chapters: 3 },
  { id: 37, name: "Haggai", abbrev: "HAG", chapters: 2 },
  { id: 38, name: "Zechariah", abbrev: "ZEC", chapters: 14 },
  { id: 39, name: "Malachi", abbrev: "MAL", chapters: 4 },
  { id: 40, name: "Matthew", abbrev: "MAT", chapters: 28 },
  { id: 41, name: "Mark", abbrev: "MRK", chapters: 16 },
  { id: 42, name: "Luke", abbrev: "LUK", chapters: 24 },
  { id: 43, name: "John", abbrev: "JHN", chapters: 21 },
  { id: 44, name: "Acts", abbrev: "ACT", chapters: 28 },
  { id: 45, name: "Romans", abbrev: "ROM", chapters: 16 },
  { id: 46, name: "1 Corinthians", abbrev: "1CO", chapters: 16 },
  { id: 47, name: "2 Corinthians", abbrev: "2CO", chapters: 13 },
  { id: 48, name: "Galatians", abbrev: "GAL", chapters: 6 },
  { id: 49, name: "Ephesians", abbrev: "EPH", chapters: 6 },
  { id: 50, name: "Philippians", abbrev: "PHP", chapters: 4 },
  { id: 51, name: "Colossians", abbrev: "COL", chapters: 4 },
  { id: 52, name: "1 Thessalonians", abbrev: "1TH", chapters: 5 },
  { id: 53, name: "2 Thessalonians", abbrev: "2TH", chapters: 3 },
  { id: 54, name: "1 Timothy", abbrev: "1TI", chapters: 6 },
  { id: 55, name: "2 Timothy", abbrev: "2TI", chapters: 4 },
  { id: 56, name: "Titus", abbrev: "TIT", chapters: 3 },
  { id: 57, name: "Philemon", abbrev: "PHM", chapters: 1 },
  { id: 58, name: "Hebrews", abbrev: "HEB", chapters: 13 },
  { id: 59, name: "James", abbrev: "JAS", chapters: 5 },
  { id: 60, name: "1 Peter", abbrev: "1PE", chapters: 5 },
  { id: 61, name: "2 Peter", abbrev: "2PE", chapters: 3 },
  { id: 62, name: "1 John", abbrev: "1JN", chapters: 5 },
  { id: 63, name: "2 John", abbrev: "2JN", chapters: 1 },
  { id: 64, name: "3 John", abbrev: "3JN", chapters: 1 },
  { id: 65, name: "Jude", abbrev: "JUD", chapters: 1 },
  { id: 66, name: "Revelation", abbrev: "REV", chapters: 22 },
];

// Fetch a chapter from bible-api.com (free, no key needed, WEB translation)
async function fetchChapterFromAPI(bookName, chapter) {
  const query = encodeURIComponent(`${bookName} ${chapter}`);
  const url = `https://bible-api.com/${query}?translation=web`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status} for ${bookName} ${chapter}`);
  const data = await res.json();
  return data.verses || [];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    // Options: book_id (1-66), chapters (array of ints), or book_range [start_id, end_id]
    const { book_id, chapters, book_range, translation = 'WEB' } = body;

    let booksToProcess = [];

    if (book_id) {
      const book = BIBLE_BOOKS.find(b => b.id === book_id);
      if (!book) return Response.json({ error: `Book ID ${book_id} not found` }, { status: 400 });
      const chapList = chapters || Array.from({ length: book.chapters }, (_, i) => i + 1);
      booksToProcess = [{ book, chapters: chapList }];
    } else if (book_range) {
      const [start, end] = book_range;
      for (let id = start; id <= end; id++) {
        const book = BIBLE_BOOKS.find(b => b.id === id);
        if (book) {
          booksToProcess.push({ book, chapters: Array.from({ length: book.chapters }, (_, i) => i + 1) });
        }
      }
    } else {
      // Default: import NT (Matthew through Revelation = books 40-66)
      for (let id = 40; id <= 66; id++) {
        const book = BIBLE_BOOKS.find(b => b.id === id);
        if (book) {
          booksToProcess.push({ book, chapters: Array.from({ length: book.chapters }, (_, i) => i + 1) });
        }
      }
    }

    let totalInserted = 0;
    let totalSkipped = 0;
    const errors = [];
    const results = [];

    for (const { book, chapters: chapList } of booksToProcess) {
      let bookInserted = 0;
      for (const chapterNum of chapList) {
        try {
          // Check if already imported
          const existing = await base44.asServiceRole.entities.BibleVerse.filter({
            book: book.name,
            chapter: chapterNum,
            translation
          }, 'verse', 1);

          if (existing.length > 0) {
            console.log(`Already exists: ${book.name} ${chapterNum} — skipping`);
            totalSkipped++;
            continue;
          }

          const apiVerses = await fetchChapterFromAPI(book.name, chapterNum);
          if (!apiVerses.length) {
            console.warn(`No verses returned for ${book.name} ${chapterNum}`);
            continue;
          }

          // Small delay to avoid rate-limiting
          await new Promise(r => setTimeout(r, 120));

          const records = apiVerses.map(v => ({
            book: book.name,
            book_id: book.id,
            chapter: Number(v.chapter),
            verse: Number(v.verse),
            text: v.text.trim(),
            translation,
            reference: `${book.name} ${v.chapter}:${v.verse}`,
            language_code: 'en',
          }));

          await base44.asServiceRole.entities.BibleVerse.bulkCreate(records);
          bookInserted += records.length;
          totalInserted += records.length;
          console.log(`Imported ${book.name} ${chapterNum}: ${records.length} verses`);
        } catch (err) {
          const msg = `${book.name} ${chapterNum}: ${err.message}`;
          errors.push(msg);
          console.error(msg);
        }
      }
      results.push({ book: book.name, inserted: bookInserted });
    }

    return Response.json({
      success: true,
      total_inserted: totalInserted,
      total_skipped: totalSkipped,
      errors,
      books: results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});