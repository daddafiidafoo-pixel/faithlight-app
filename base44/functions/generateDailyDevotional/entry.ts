/**
 * Generate Daily Devotional
 * 
 * Fetches a verse from the Bible dataset and generates
 * an encouraging reflection using AI.
 * 
 * Usage:
 * POST /functions/generateDailyDevotional
 * { "language": "om" }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Daily verse rotation - uses day of year for consistent daily verse
function getDailyVerseSelection(dayOfYear) {
  const verses = [
    { book: 'john', chapter: 3, verse: 16 },
    { book: 'psalms', chapter: 23, verse: 1 },
    { book: 'john', chapter: 1, verse: 1 },
    { book: 'romans', chapter: 8, verse: 28 },
    { book: 'psalms', chapter: 139, verse: 14 },
  ];
  return verses[dayOfYear % verses.length];
}

Deno.serve(async (req) => {
  try {
    const { language = 'en' } = await req.json();
    const base44 = createClientFromRequest(req);

    // Get daily verse selection
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const selection = getDailyVerseSelection(dayOfYear);

    // Fetch verse from database
    let verse = null;
    try {
      const results = await base44.entities.BibleVerseText.filter({
        language_code: language,
        book_id: selection.book,
        chapter: selection.chapter,
        verse: selection.verse,
      });
      
      if (results.length > 0) {
        verse = results[0];
      }
    } catch (err) {
      console.log(`Verse not found in database: ${language}/${selection.book}/${selection.chapter}:${selection.verse}`);
    }

    // Fallback to English if not found
    if (!verse && language !== 'en') {
      const results = await base44.entities.BibleVerseText.filter({
        language_code: 'en',
        book_id: selection.book,
        chapter: selection.chapter,
        verse: selection.verse,
      });
      
      if (results.length > 0) {
        verse = results[0];
      }
    }

    if (!verse) {
      throw new Error('Could not find verse in database');
    }

    // Generate reflection using AI
    const prompt = `You are a spiritual guide. Generate a short, encouraging daily reflection (2-3 sentences) based on this Bible verse:

"${verse.text}"

Reference: ${verse.reference}

The reflection should:
- Be warm, encouraging, and hopeful
- Connect the verse to daily Christian life
- Inspire the reader to apply it today
- Be suitable for all Christian traditions

Also provide a short prayer prompt (1 sentence) that the reader can pray based on this verse.

Format your response as JSON:
{
  "reflection": "...",
  "prayer_prompt": "..."
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          reflection: { type: 'string' },
          prayer_prompt: { type: 'string' },
        },
        required: ['reflection', 'prayer_prompt'],
      },
    });

    return Response.json({
      reference: verse.reference,
      verse_text: verse.text,
      language: language,
      reflection: response.reflection,
      prayer_prompt: response.prayer_prompt,
      book_id: verse.book_id,
      chapter: verse.chapter,
      verse: verse.verse,
      generated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Daily devotional generation error:', error);
    return Response.json(
      { 
        error: error.message,
        details: 'Failed to generate daily devotional',
      },
      { status: 500 }
    );
  }
});