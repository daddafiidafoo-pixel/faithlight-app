import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const VERSES_BY_THEME = {
  hope: [
    { bookCode: 'PSA', chapter: 27, verse: 10, theme: 'hope' },
    { bookCode: 'ROM', chapter: 15, verse: 13, theme: 'hope' },
    { bookCode: 'JER', chapter: 29, verse: 11, theme: 'hope' },
    { bookCode: 'PHP', chapter: 4, verse: 4, theme: 'hope' },
    { bookCode: 'PSA', chapter: 42, verse: 5, theme: 'hope' },
  ],
  faith: [
    { bookCode: 'HEB', chapter: 11, verse: 1, theme: 'faith' },
    { bookCode: 'ROM', chapter: 3, verse: 28, theme: 'faith' },
    { bookCode: 'MAT', chapter: 21, verse: 22, theme: 'faith' },
    { bookCode: 'MRK', chapter: 11, verse: 24, theme: 'faith' },
    { bookCode: 'JHN', chapter: 3, verse: 16, theme: 'faith' },
  ],
  prayer: [
    { bookCode: 'PHP', chapter: 4, verse: 6, theme: 'prayer' },
    { bookCode: '1JN', chapter: 5, verse: 14, theme: 'prayer' },
    { bookCode: 'MAT', chapter: 7, verse: 7, theme: 'prayer' },
    { bookCode: 'COL', chapter: 4, verse: 2, theme: 'prayer' },
    { bookCode: '1TH', chapter: 5, verse: 17, theme: 'prayer' },
  ],
  strength: [
    { bookCode: 'PHP', chapter: 4, verse: 13, theme: 'strength' },
    { bookCode: 'ISA', chapter: 41, verse: 10, theme: 'strength' },
    { bookCode: 'DEU', chapter: 31, verse: 6, theme: 'strength' },
    { bookCode: '2TI', chapter: 2, verse: 1, theme: 'strength' },
    { bookCode: 'PSA', chapter: 73, verse: 26, theme: 'strength' },
  ],
  peace: [
    { bookCode: 'JHN', chapter: 14, verse: 27, theme: 'peace' },
    { bookCode: 'PHP', chapter: 4, verse: 7, theme: 'peace' },
    { bookCode: 'ISA', chapter: 26, verse: 3, theme: 'peace' },
    { bookCode: 'COL', chapter: 3, verse: 15, theme: 'peace' },
    { bookCode: 'PSA', chapter: 29, verse: 11, theme: 'peace' },
  ],
  encouragement: [
    { bookCode: '1TH', chapter: 5, verse: 11, theme: 'encouragement' },
    { bookCode: '2COR', chapter: 1, verse: 3, theme: 'encouragement' },
    { bookCode: 'ROM', chapter: 12, verse: 15, theme: 'encouragement' },
    { bookCode: 'JOB', chapter: 6, verse: 14, theme: 'encouragement' },
    { bookCode: 'PRO', chapter: 27, verse: 12, theme: 'encouragement' },
  ],
  wisdom: [
    { bookCode: 'PRO', chapter: 3, verse: 5, theme: 'wisdom' },
    { bookCode: 'JAM', chapter: 1, verse: 5, theme: 'wisdom' },
    { bookCode: 'PRO', chapter: 9, verse: 10, theme: 'wisdom' },
    { bookCode: 'ECE', chapter: 12, verse: 13, theme: 'wisdom' },
    { bookCode: 'COL', chapter: 3, verse: 16, theme: 'wisdom' },
  ],
};

const THEMES = Object.keys(VERSES_BY_THEME);

function getDateKey(date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDateISO(date) {
  return date.toISOString().split('T')[0];
}

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
    let themeIndex = 0;

    // Generate 90 days of verses
    for (let i = 0; i < 90; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const currentTheme = THEMES[themeIndex % THEMES.length];
      const verseList = VERSES_BY_THEME[currentTheme];
      const verse = verseList[Math.floor(Math.random() * verseList.length)];

      records.push({
        dateKey: getDateKey(currentDate),
        date: getDateISO(currentDate),
        bookCode: verse.bookCode,
        chapter: verse.chapter,
        verse: verse.verse,
        theme: currentTheme,
      });

      themeIndex++;
    }

    // Bulk create
    const created = await base44.asServiceRole.entities.DailyVerse.bulkCreate(records);

    return Response.json({
      success: true,
      message: `Seeded ${records.length} DailyVerse records for 90 days`,
      count: created?.length || records.length,
      startDate: records[0].date,
      endDate: records[records.length - 1].date,
    });
  } catch (error) {
    console.error('seedDailyVerse90Days error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});