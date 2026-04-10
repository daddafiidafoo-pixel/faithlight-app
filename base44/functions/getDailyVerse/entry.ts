import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * Returns the daily verse of the day
 * Can be customized based on date or seed
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Sample verses - in production, fetch from database or API
    const dailyVerses = [
      {
        reference: 'John 3:16',
        text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        translation: 'NIV',
        book: 'John',
        chapter: 3,
        verse: 16,
      },
      {
        reference: 'Psalm 23:1',
        text: 'The Lord is my shepherd, I lack nothing.',
        translation: 'NIV',
        book: 'Psalm',
        chapter: 23,
        verse: 1,
      },
      {
        reference: 'Romans 8:28',
        text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
        translation: 'NIV',
        book: 'Romans',
        chapter: 8,
        verse: 28,
      },
      {
        reference: 'Philippians 4:13',
        text: 'I can do all this through him who gives me strength.',
        translation: 'NIV',
        book: 'Philippians',
        chapter: 4,
        verse: 13,
      },
      {
        reference: 'Proverbs 3:5-6',
        text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
        translation: 'NIV',
        book: 'Proverbs',
        chapter: 3,
        verse: 5,
      },
    ];

    // Get verse based on day of year
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const verse = dailyVerses[dayOfYear % dailyVerses.length];

    console.log(`Daily verse for day ${dayOfYear}:`, verse.reference);

    return Response.json({ ...verse });
  } catch (error) {
    console.error('Error fetching daily verse:', error);
    return Response.json(
      { error: 'Failed to fetch daily verse', details: error.message },
      { status: 500 }
    );
  }
});