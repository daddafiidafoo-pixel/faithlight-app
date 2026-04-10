import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SCHEDULE = [
  { date: '2026-03-14', bookCode: 'PHP', chapter: 4, verse: 13, theme: 'Strength' },
  { date: '2026-03-15', bookCode: 'PSA', chapter: 23, verse: 1, theme: 'Trust' },
  { date: '2026-03-16', bookCode: 'JHN', chapter: 3, verse: 16, theme: 'Love' },
  { date: '2026-03-17', bookCode: 'ROM', chapter: 8, verse: 28, theme: 'Purpose' },
  { date: '2026-03-18', bookCode: 'PRV', chapter: 3, verse: 5, theme: 'Guidance' },
  { date: '2026-03-19', bookCode: 'MTT', chapter: 6, verse: 33, theme: 'Priority' },
  { date: '2026-03-20', bookCode: '1PE', chapter: 5, verse: 7, theme: 'Peace' }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const results = [];
    let created = 0;

    for (const entry of SCHEDULE) {
      // Find the verse ref ID
      const verseRefs = await base44.entities.BibleVerseRefs.filter({
        bookCode: entry.bookCode,
        chapter: entry.chapter,
        verse: entry.verse
      });

      if (!verseRefs || verseRefs.length === 0) {
        results.push({ status: 'error', date: entry.date, reason: 'Verse ref not found' });
        continue;
      }

      const verseRefId = verseRefs[0].id;

      // Check if schedule already exists
      const existing = await base44.entities.DailyVerseSchedule.filter({
        scheduleDate: entry.date
      });

      if (!existing || existing.length === 0) {
        await base44.entities.DailyVerseSchedule.create({
          scheduleDate: entry.date,
          verseRefId,
          theme: entry.theme
        });
        created++;
        results.push({ status: 'created', date: entry.date });
      } else {
        results.push({ status: 'exists', date: entry.date });
      }
    }

    return Response.json({
      success: true,
      message: `Seeded ${created} daily verse schedules`,
      results
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});