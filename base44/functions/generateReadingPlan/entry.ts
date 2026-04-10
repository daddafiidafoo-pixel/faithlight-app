import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { bookCode, bookName, totalChapters, durationDays, planName } = await req.json();

    if (!bookCode || !totalChapters || !durationDays) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate chapters per day
    const chaptersPerDay = Math.ceil(totalChapters / durationDays);
    const dailyReadings = [];

    let currentChapter = 1;

    for (let day = 1; day <= durationDays; day++) {
      const startChapter = currentChapter;
      const endChapter = Math.min(currentChapter + chaptersPerDay - 1, totalChapters);
      
      const chapterRange =
        startChapter === endChapter
          ? `${bookCode} ${startChapter}`
          : `${bookCode} ${startChapter}-${endChapter}`;

      // Estimate verses (average ~25 verses per chapter)
      const verseCount = (endChapter - startChapter + 1) * 25;

      dailyReadings.push({
        day,
        startChapter,
        endChapter,
        chapterRange,
        verseCount,
        startVerse: 1,
        endVerse: verseCount,
      });

      currentChapter = endChapter + 1;

      if (currentChapter > totalChapters) break;
    }

    // Generate unique plan ID
    const planId = `plan-${bookCode.toLowerCase()}-${Date.now()}`;

    return Response.json({
      success: true,
      plan: {
        id: planId,
        planName: planName || `${bookName} in ${durationDays} days`,
        bookCode,
        bookName,
        totalChapters,
        durationDays,
        dailyReadings,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Reading plan generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});