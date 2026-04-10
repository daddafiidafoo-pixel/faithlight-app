import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Check if today's verse already exists
    const today = new Date().toISOString().split('T')[0];
    const existing = await base44.asServiceRole.entities.DailyVerse.filter(
      { date: today },
      '-created_date',
      1
    );

    if (existing && existing.length > 0) {
      return Response.json({ 
        message: 'Daily verse already exists for today',
        data: existing[0] 
      });
    }

    // Fetch verse from Bible API (using a free endpoint)
    const verseResponse = await fetch('https://api.scripture.api.bible/v1/verses?q=daily&limit=1', {
      headers: {
        'api-key': Deno.env.get('BIBLE_BRAIN_API_KEY') || '',
      },
    });

    let verseData = {
      book: 'Psalm',
      chapter: 23,
      verse: 1,
      reference: 'Psalm 23:1',
      text: 'The Lord is my shepherd; I shall not want.',
      reflection: 'Trust in God\'s guidance and provision.',
    };

    if (verseResponse.ok) {
      try {
        const data = await verseResponse.json();
        if (data.verses && data.verses.length > 0) {
          const v = data.verses[0];
          verseData = {
            book: v.bookName || verseData.book,
            chapter: v.chapter || verseData.chapter,
            verse: v.verse || verseData.verse,
            reference: `${v.bookName || verseData.book} ${v.chapter || verseData.chapter}:${v.verse || verseData.verse}`,
            text: v.text || verseData.text,
            reflection: verseData.reflection,
          };
        }
      } catch {
        // Use default if API fails
      }
    }

    // Save to database
    const saved = await base44.asServiceRole.entities.DailyVerse.create({
      date: today,
      ...verseData,
    });

    return Response.json({ 
      message: 'Daily verse saved successfully',
      data: saved 
    });
  } catch (error) {
    console.error('Error fetching daily verse:', error);
    return Response.json({ 
      error: error.message,
      message: 'Failed to fetch daily verse'
    }, { status: 500 });
  }
});