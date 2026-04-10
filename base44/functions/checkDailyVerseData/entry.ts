import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check DailyVerse for today
    const todayVerse = await base44.asServiceRole.entities.DailyVerse.filter({ date: today });
    
    // Check DailyVerse count
    const allVerses = await base44.asServiceRole.entities.DailyVerse.list('-date', 10);
    
    // Check BibleVerse count
    const bibleCount = await base44.asServiceRole.entities.BibleVerse.list('', 1);

    const diagnostics = {
      today: today,
      dailyVerseForToday: todayVerse?.[0] || null,
      totalDailyVerseRecords: allVerses?.length || 0,
      recentDailyVerses: (allVerses || []).slice(0, 5).map(v => ({
        date: v.date,
        reference: `${v.bookCode} ${v.chapter}:${v.verse}`,
      })),
      bibleVerseTableExists: bibleCount?.length >= 0,
      recommendation: todayVerse?.length === 0 
        ? 'No verse found for today. Call seedDailyVerseComplete to populate 90 days of data.'
        : 'Daily verse data looks good.',
    };

    return Response.json({
      success: true,
      diagnostics,
    });
  } catch (error) {
    console.error('checkDailyVerseData error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});