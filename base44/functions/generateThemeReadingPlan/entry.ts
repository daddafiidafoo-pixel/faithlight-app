/**
 * Generate Theme-Based Reading Plan
 * 
 * Creates a 7-day personalized reading plan based on selected theme
 * Selects verses from Bible dataset that match the theme
 * 
 * Usage:
 * POST /functions/generateThemeReadingPlan
 * { "theme": "hope" }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const THEME_VERSES = {
  hope: [
    { book_id: 'ROM', chapter: 15, verse_start: 13, verse_end: 13 },
    { book_id: 'PSA', chapter: 23, verse_start: 1, verse_end: 6 },
    { book_id: 'JER', chapter: 29, verse_start: 11, verse_end: 11 },
    { book_id: 'HEB', chapter: 10, verse_start: 23, verse_end: 23 },
    { book_id: 'PSA', chapter: 42, verse_start: 5, verse_end: 5 },
    { book_id: '1PE', chapter: 1, verse_start: 3, verse_end: 5 },
    { book_id: 'ROM', chapter: 8, verse_start: 24, verse_end: 28 },
  ],
  anxiety: [
    { book_id: 'PHP', chapter: 4, verse_start: 6, verse_end: 7 },
    { book_id: 'MAT', chapter: 6, verse_start: 31, verse_end: 34 },
    { book_id: '1JN', chapter: 4, verse_start: 18, verse_end: 18 },
    { book_id: 'PSA', chapter: 55, verse_start: 22, verse_end: 22 },
    { book_id: '1PE', chapter: 5, verse_start: 7, verse_end: 7 },
    { book_id: 'PSA', chapter: 27, verse_start: 1, verse_end: 1 },
    { book_id: 'PRO', chapter: 12, verse_start: 25, verse_end: 25 },
  ],
  peace: [
    { book_id: 'JHN', chapter: 14, verse_start: 27, verse_end: 27 },
    { book_id: 'PHP', chapter: 4, verse_start: 4, verse_end: 9 },
    { book_id: 'COL', chapter: 3, verse_start: 15, verse_end: 15 },
    { book_id: 'PSA', chapter: 29, verse_start: 11, verse_end: 11 },
    { book_id: 'ISA', chapter: 26, verse_start: 3, verse_end: 3 },
    { book_id: '1JN', chapter: 3, verse_start: 18, verse_end: 22 },
    { book_id: 'MAT', chapter: 11, verse_start: 28, verse_end: 29 },
  ],
  faith: [
    { book_id: 'ROM', chapter: 10, verse_start: 17, verse_end: 17 },
    { book_id: 'HEB', chapter: 11, verse_start: 1, verse_end: 1 },
    { book_id: 'MAR', chapter: 11, verse_start: 24, verse_end: 25 },
    { book_id: '2CO', chapter: 5, verse_start: 7, verse_end: 7 },
    { book_id: 'JAM', chapter: 1, verse_start: 6, verse_end: 8 },
    { book_id: 'JHN', chapter: 3, verse_start: 16, verse_end: 16 },
    { book_id: 'ROM', chapter: 3, verse_start: 22, verse_end: 26 },
  ],
  gratitude: [
    { book_id: '1TH', chapter: 5, verse_start: 16, verse_end: 18 },
    { book_id: 'COL', chapter: 3, verse_start: 12, verse_end: 17 },
    { book_id: 'PSA', chapter: 100, verse_start: 1, verse_end: 5 },
    { book_id: 'PHP', chapter: 4, verse_start: 4, verse_end: 7 },
    { book_id: 'LUK', chapter: 17, verse_start: 11, verse_end: 19 },
    { book_id: 'PSA', chapter: 103, verse_start: 1, verse_end: 5 },
    { book_id: '1JN', chapter: 1, verse_start: 4, verse_end: 4 },
  ],
  healing: [
    { book_id: '3JN', chapter: 1, verse_start: 2, verse_end: 2 },
    { book_id: 'ISA', chapter: 53, verse_start: 4, verse_end: 5 },
    { book_id: 'EXO', chapter: 15, verse_start: 26, verse_end: 26 },
    { book_id: 'JER', chapter: 17, verse_start: 14, verse_end: 14 },
    { book_id: 'PSA', chapter: 41, verse_start: 4, verse_end: 4 },
    { book_id: '1PE', chapter: 2, verse_start: 24, verse_end: 24 },
    { book_id: 'MAR', chapter: 5, verse_start: 34, verse_end: 34 },
  ],
};

const THEME_LABELS = {
  hope: 'Hope',
  anxiety: 'Anxiety Relief',
  peace: 'Peace',
  faith: 'Faith',
  gratitude: 'Gratitude',
  healing: 'Healing',
};

const THEME_DESCRIPTIONS = {
  hope: 'A journey through verses that inspire hope and encourage you toward a brighter future.',
  anxiety: 'Finding peace and comfort in Scripture to ease anxiety and worry.',
  peace: 'Discovering inner peace and tranquility through God\'s word.',
  faith: 'Building and strengthening your faith through powerful Bible passages.',
  gratitude: 'Cultivating gratitude and thanksgiving in your daily life.',
  healing: 'Finding comfort and restoration through verses about healing.',
};

Deno.serve(async (req) => {
  try {
    const { theme } = await req.json();
    const base44 = createClientFromRequest(req);

    if (!THEME_VERSES[theme]) {
      throw new Error(`Invalid theme: ${theme}`);
    }

    const verseSelection = THEME_VERSES[theme];
    const days = [];

    // Fetch verse details from database
    for (let i = 0; i < verseSelection.length; i++) {
      const selection = verseSelection[i];
      
      try {
        const results = await base44.entities.BibleVerseText.filter({
          language_code: 'en',
          book_id: selection.book_id,
          chapter: selection.chapter,
          verse: selection.verse_start,
        });

        if (results.length > 0) {
          const verse = results[0];
          days.push({
            day: i + 1,
            book_id: selection.book_id,
            chapter: selection.chapter,
            verse_start: selection.verse_start,
            verse_end: selection.verse_end,
            reference: verse.reference,
            reflection_prompt: `How does this verse relate to the theme of ${THEME_LABELS[theme]} in your life today?`,
          });
        }
      } catch (err) {
        console.warn(`Failed to fetch verse: ${selection.book_id} ${selection.chapter}:${selection.verse_start}`);
      }
    }

    // Create reading plan record
    const plan = {
      theme,
      user_email: 'anonymous', // Public app - no auth
      title: `${THEME_LABELS[theme]} - 7 Day Journey`,
      description: THEME_DESCRIPTIONS[theme],
      days,
      started_date: new Date().toISOString(),
    };

    try {
      const created = await base44.entities.ReadingPlan.create(plan);
      return Response.json({ plan: created });
    } catch (err) {
      // Still return the plan even if DB save fails
      console.error('Failed to save plan to database:', err);
      return Response.json({ plan });
    }

  } catch (error) {
    console.error('Reading plan generation error:', error);
    return Response.json(
      { 
        error: error.message,
        details: 'Failed to generate reading plan',
      },
      { status: 500 }
    );
  }
});