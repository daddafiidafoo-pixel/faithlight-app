import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Curated verses for 90 days with verified existence
const VERSE_REFERENCES = [
  { bookCode: 'PHP', chapter: 4, verse: 13, text: 'I can do all things through Christ who strengthens me.' },
  { bookCode: 'ISA', chapter: 41, verse: 10, text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.' },
  { bookCode: 'PSA', chapter: 46, verse: 1, text: 'God is our refuge and strength, a very present help in trouble.' },
  { bookCode: 'JHN', chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
  { bookCode: 'ROM', chapter: 8, verse: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
  { bookCode: 'PRO', chapter: 3, verse: 5, text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.' },
  { bookCode: 'PSA', chapter: 27, verse: 1, text: 'The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?' },
  { bookCode: 'JER', chapter: 29, verse: 11, text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.' },
  { bookCode: '1PE', chapter: 5, verse: 7, text: 'Casting all your care upon him; for he careth for you.' },
  { bookCode: 'PHP', chapter: 4, verse: 6, text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.' },
  { bookCode: 'MAT', chapter: 6, verse: 34, text: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.' },
  { bookCode: 'PSA', chapter: 139, verse: 14, text: 'I praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.' },
  { bookCode: 'HEB', chapter: 11, verse: 1, text: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
  { bookCode: 'JHN', chapter: 14, verse: 27, text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.' },
  { bookCode: 'COL', chapter: 3, verse: 16, text: 'Let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another in psalms and hymns and spiritual songs, singing with grace in your hearts to the Lord.' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin check
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const startDate = new Date();
    const records = [];
    let createdCount = 0;

    // Generate 90 days of verses
    for (let i = 0; i < 90; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const verse = VERSE_REFERENCES[i % VERSE_REFERENCES.length];
      const dateISO = currentDate.toISOString().split('T')[0];
      const dateKey = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

      records.push({
        date: dateISO,
        dateKey: dateKey,
        bookCode: verse.bookCode,
        chapter: verse.chapter,
        verse: verse.verse,
      });

      // Ensure BibleVerse exists for English
      try {
        const existing = await base44.asServiceRole.entities.BibleVerse.filter({
          language: 'en',
          book_code: verse.bookCode,
          chapter_number: verse.chapter,
          verse_number: verse.verse,
        });

        if (!existing || existing.length === 0) {
          await base44.asServiceRole.entities.BibleVerse.create({
            language: 'en',
            version: 'en_web',
            book_code: verse.bookCode,
            chapter_number: verse.chapter,
            verse_number: verse.verse,
            verse_text: verse.text,
          });
        }
      } catch (err) {
        console.error(`Warning: Failed to create/verify BibleVerse ${verse.bookCode} ${verse.chapter}:${verse.verse}`, err.message);
      }
    }

    // Clear existing DailyVerse records (optional - remove if you want to preserve)
    const existing = await base44.asServiceRole.entities.DailyVerse.list();
    if (existing && existing.length > 0) {
      for (const rec of existing) {
        try {
          await base44.asServiceRole.entities.DailyVerse.delete(rec.id);
        } catch (err) {
          console.error(`Failed to delete old DailyVerse ${rec.id}`, err.message);
        }
      }
    }

    // Bulk create DailyVerse records
    const created = await base44.asServiceRole.entities.DailyVerse.bulkCreate(records);
    createdCount = created?.length || records.length;

    return Response.json({
      success: true,
      message: `Seeded ${createdCount} DailyVerse records for 90 days`,
      count: createdCount,
      startDate: records[0].date,
      endDate: records[records.length - 1].date,
      verseCount: VERSE_REFERENCES.length,
    });
  } catch (error) {
    console.error('seedDailyVerseComplete error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});