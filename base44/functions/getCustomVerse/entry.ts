import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * Fetches a specific Bible verse by reference
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { reference } = await req.json();

    if (!reference) {
      return Response.json({ error: 'Missing verse reference' }, { status: 400 });
    }

    // Sample verse data - in production, integrate with Bible API
    const verseDatabase = {
      'John 3:16': {
        reference: 'John 3:16',
        text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        translation: 'NIV',
        book: 'John',
        chapter: 3,
        verse: 16,
      },
      'Psalm 23:1': {
        reference: 'Psalm 23:1',
        text: 'The Lord is my shepherd, I lack nothing.',
        translation: 'NIV',
        book: 'Psalm',
        chapter: 23,
        verse: 1,
      },
      'Romans 8:28': {
        reference: 'Romans 8:28',
        text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
        translation: 'NIV',
        book: 'Romans',
        chapter: 8,
        verse: 28,
      },
      'Philippians 4:13': {
        reference: 'Philippians 4:13',
        text: 'I can do all this through him who gives me strength.',
        translation: 'NIV',
        book: 'Philippians',
        chapter: 4,
        verse: 13,
      },
      'Proverbs 3:5-6': {
        reference: 'Proverbs 3:5-6',
        text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
        translation: 'NIV',
        book: 'Proverbs',
        chapter: 3,
        verse: 5,
      },
    };

    const verse = verseDatabase[reference];

    if (!verse) {
      return Response.json(
        { error: 'Verse not found', reference },
        { status: 404 }
      );
    }

    console.log(`Fetched verse: ${reference}`);

    return Response.json(verse);
  } catch (error) {
    console.error('Error fetching custom verse:', error);
    return Response.json(
      { error: 'Failed to fetch verse', details: error.message },
      { status: 500 }
    );
  }
});