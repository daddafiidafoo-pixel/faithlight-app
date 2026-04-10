import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// 90-day curated verse schedule with balanced themes
const DAILY_VERSES = [
  // Week 1: Hope & Strength
  { bookCode: 'ISA', chapter: 41, verse: 10, theme: 'Strength' },
  { bookCode: 'PHP', chapter: 4, verse: 13, theme: 'Strength' },
  { bookCode: 'JER', chapter: 29, verse: 11, theme: 'Hope' },
  { bookCode: 'PSA', chapter: 27, verse: 1, theme: 'Strength' },
  { bookCode: 'ROM', chapter: 8, verse: 28, theme: 'Hope' },
  { bookCode: 'LAM', chapter: 3, verse: 22, theme: 'Hope' },
  { bookCode: 'PSA', chapter: 46, verse: 1, theme: 'Strength' },

  // Week 2: Peace & Trust
  { bookCode: 'JHN', chapter: 14, verse: 27, theme: 'Peace' },
  { bookCode: 'PHP', chapter: 4, verse: 7, theme: 'Peace' },
  { bookCode: 'PRO', chapter: 3, verse: 5, theme: 'Trust' },
  { bookCode: 'PSA', chapter: 37, verse: 5, theme: 'Trust' },
  { bookCode: 'MAT', chapter: 6, verse: 34, theme: 'Trust' },
  { bookCode: 'PSA', chapter: 23, verse: 4, theme: 'Peace' },
  { bookCode: '1PE', chapter: 5, verse: 7, theme: 'Peace' },

  // Week 3: Faith & Prayer
  { bookCode: 'HEB', chapter: 11, verse: 1, theme: 'Faith' },
  { bookCode: 'MRK', chapter: 11, verse: 24, theme: 'Faith' },
  { bookCode: 'PHP', chapter: 4, verse: 6, theme: 'Prayer' },
  { bookCode: '1TH', chapter: 5, verse: 17, theme: 'Prayer' },
  { bookCode: 'JAM', chapter: 5, verse: 15, theme: 'Prayer' },
  { bookCode: 'MAT', chapter: 21, verse: 22, theme: 'Faith' },
  { bookCode: 'LUK', chapter: 11, verse: 9, theme: 'Prayer' },

  // Week 4: Encouragement & Wisdom
  { bookCode: 'PSA', chapter: 139, verse: 14, theme: 'Encouragement' },
  { bookCode: 'JHN', chapter: 15, verse: 5, theme: 'Strength' },
  { bookCode: 'PRO', chapter: 22, verse: 6, theme: 'Wisdom' },
  { bookCode: 'PRO', chapter: 27, verse: 12, theme: 'Wisdom' },
  { bookCode: 'COL', chapter: 3, verse: 16, theme: 'Encouragement' },
  { bookCode: 'THI', chapter: 5, verse: 11, theme: 'Encouragement' },
  { bookCode: 'ROM', chapter: 15, verse: 4, theme: 'Encouragement' },

  // Week 5: Love & Grace
  { bookCode: 'JHN', chapter: 3, verse: 16, theme: 'Grace' },
  { bookCode: 'ROM', chapter: 5, verse: 8, theme: 'Love' },
  { bookCode: '1JN', chapter: 4, verse: 7, theme: 'Love' },
  { bookCode: 'EPH', chapter: 2, verse: 8, theme: 'Grace' },
  { bookCode: 'TIT', chapter: 2, verse: 11, theme: 'Grace' },
  { bookCode: '1PE', chapter: 1, verse: 3, theme: 'Hope' },
  { bookCode: 'JHN', chapter: 1, verse: 9, theme: 'Grace' },

  // Week 6: Purpose & Direction
  { bookCode: 'ROM', chapter: 12, verse: 2, theme: 'Purpose' },
  { bookCode: 'PRO', chapter: 16, verse: 9, theme: 'Purpose' },
  { bookCode: 'COL', chapter: 1, verse: 27, theme: 'Hope' },
  { bookCode: 'EPH', chapter: 4, verse: 1, theme: 'Purpose' },
  { bookCode: 'PHP', chapter: 3, verse: 14, theme: 'Purpose' },
  { bookCode: '2TI', chapter: 2, verse: 15, theme: 'Wisdom' },
  { bookCode: 'JAM', chapter: 1, verse: 22, theme: 'Wisdom' },

  // Week 7: Perseverance & Endurance
  { bookCode: 'ROM', chapter: 5, verse: 3, theme: 'Strength' },
  { bookCode: 'GAL', chapter: 6, verse: 9, theme: 'Perseverance' },
  { bookCode: 'HEB', chapter: 12, verse: 1, theme: 'Perseverance' },
  { bookCode: '1PE', chapter: 1, verse: 6, theme: 'Strength' },
  { bookCode: 'JAM', chapter: 1, verse: 2, theme: 'Perseverance' },
  { bookCode: '2CO', chapter: 4, verse: 8, theme: 'Encouragement' },
  { bookCode: '2TI', chapter: 1, verse: 7, theme: 'Strength' },

  // Week 8: Joy & Praise
  { bookCode: 'PHP', chapter: 4, verse: 4, theme: 'Joy' },
  { bookCode: 'PSA', chapter: 100, verse: 1, theme: 'Joy' },
  { bookCode: 'NEH', chapter: 8, verse: 10, theme: 'Joy' },
  { bookCode: 'PSA', chapter: 150, verse: 1, theme: 'Joy' },
  { bookCode: '1TH', chapter: 5, verse: 16, theme: 'Joy' },
  { bookCode: 'HEB', chapter: 13, verse: 15, theme: 'Praise' },
  { bookCode: 'PSA', chapter: 34, verse: 1, theme: 'Praise' },

  // Week 9: Guidance & Trust
  { bookCode: 'PRO', chapter: 16, verse: 3, theme: 'Trust' },
  { bookCode: 'PSA', chapter: 32, verse: 8, theme: 'Guidance' },
  { bookCode: 'ISA', chapter: 58, verse: 11, theme: 'Guidance' },
  { bookCode: 'JHN', chapter: 16, verse: 13, theme: 'Guidance' },
  { bookCode: 'PRO', chapter: 19, verse: 23, theme: 'Wisdom' },
  { bookCode: 'JAM', chapter: 1, verse: 5, theme: 'Wisdom' },
  { bookCode: 'PSA', chapter: 119, verse: 105, theme: 'Guidance' },

  // Week 10: Compassion & Kindness
  { bookCode: 'COL', chapter: 3, verse: 12, theme: 'Compassion' },
  { bookCode: 'EPH', chapter: 4, verse: 32, theme: 'Compassion' },
  { bookCode: 'MAT', chapter: 25, verse: 35, theme: 'Compassion' },
  { bookCode: 'PRO', chapter: 31, verse: 8, theme: 'Compassion' },
  { bookCode: '1JN', chapter: 3, verse: 17, theme: 'Compassion' },
  { bookCode: 'LUK', chapter: 6, verse: 31, theme: 'Kindness' },
  { bookCode: 'GAL', chapter: 5, verse: 22, theme: 'Kindness' },

  // Week 11: Transformation & Growth
  { bookCode: '2CO', chapter: 5, verse: 17, theme: 'Transformation' },
  { bookCode: 'ROM', chapter: 12, verse: 9, theme: 'Love' },
  { bookCode: '2PE', chapter: 1, verse: 3, theme: 'Growth' },
  { bookCode: 'PHP', chapter: 1, verse: 6, theme: 'Growth' },
  { bookCode: '1PE', chapter: 2, verse: 2, theme: 'Growth' },
  { bookCode: 'EPH', chapter: 4, verse: 15, theme: 'Growth' },
  { bookCode: '2TI', chapter: 2, verse: 2, theme: 'Growth' },

  // Week 12: Redemption & Restoration
  { bookCode: 'EZE', chapter: 36, verse: 26, theme: 'Restoration' },
  { bookCode: 'JOE', chapter: 2, verse: 25, theme: 'Restoration' },
  { bookCode: 'MIC', chapter: 7, verse: 18, theme: 'Redemption' },
  { bookCode: 'ISA', chapter: 43, verse: 18, theme: 'Restoration' },
  { bookCode: 'PSA', chapter: 103, verse: 10, theme: 'Grace' },
  { bookCode: 'JER', chapter: 31, verse: 3, theme: 'Redemption' },
  { bookCode: '1PE', chapter: 1, verse: 18, theme: 'Redemption' },

  // Week 13: Strength in Trials
  { bookCode: '2CO', chapter: 12, verse: 9, theme: 'Strength' },
  { bookCode: 'ROM', chapter: 8, verse: 37, theme: 'Strength' },
  { bookCode: 'JAM', chapter: 4, verse: 7, theme: 'Strength' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Start from today
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    // Generate 90 records
    const records = [];
    const errors = [];

    for (let i = 0; i < 90; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const verseData = DAILY_VERSES[i % DAILY_VERSES.length];
      const dateISO = currentDate.toISOString().split('T')[0];

      // Check if BibleVerse exists
      try {
        const bibleVerseExists = await base44.asServiceRole.entities.BibleVerse.filter({
          language: 'en',
          book_code: verseData.bookCode,
          chapter_number: verseData.chapter,
          verse_number: verseData.verse,
        });

        if (!bibleVerseExists || bibleVerseExists.length === 0) {
          errors.push(`No BibleVerse found for ${verseData.bookCode} ${verseData.chapter}:${verseData.verse}`);
          continue;
        }

        // Check if DailyVerse already exists for this date
        const existing = await base44.asServiceRole.entities.DailyVerse.filter({
          date: dateISO,
        });

        if (existing && existing.length > 0) {
          // Skip if already exists
          continue;
        }

        records.push({
          date: dateISO,
          bookCode: verseData.bookCode,
          chapter: verseData.chapter,
          verse: verseData.verse,
        });
      } catch (err) {
        errors.push(`Error checking verse ${verseData.bookCode} ${verseData.chapter}:${verseData.verse}: ${err.message}`);
      }
    }

    // Bulk create
    let created = 0;
    if (records.length > 0) {
      try {
        const result = await base44.asServiceRole.entities.DailyVerse.bulkCreate(records);
        created = result?.length || records.length;
      } catch (err) {
        console.error('Bulk create failed:', err);
        return Response.json({
          success: false,
          message: 'Bulk create failed',
          error: err.message,
        }, { status: 500 });
      }
    }

    return Response.json({
      success: true,
      message: `Seeded ${created} DailyVerse records`,
      created,
      skipped: records.length - created,
      errors: errors.length > 0 ? errors : null,
      startDate: startDate.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('seed90DayVerse error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});