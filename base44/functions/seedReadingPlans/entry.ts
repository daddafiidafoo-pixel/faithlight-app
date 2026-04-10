import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const plans = [
      {
        title: 'Finding Peace in Anxiety',
        description: 'A 7-day journey through Scripture to find calm and trust in God\'s presence.',
        theme_color: '#667eea',
        duration_days: 7,
        category: 'healing',
        difficulty: 'beginner',
        is_active: true,
        verses: [
          {
            day: 1,
            book_id: 'PHP',
            chapter: 4,
            verse_start: 6,
            verse_end: 7,
            reflection_prompt: 'What anxieties are weighing on your heart today?',
          },
          {
            day: 2,
            book_id: '1PE',
            chapter: 5,
            verse_start: 7,
            verse_end: 7,
            reflection_prompt: 'How can you cast your cares on God today?',
          },
          {
            day: 3,
            book_id: 'PSA',
            chapter: 27,
            verse_start: 1,
            verse_end: 5,
            reflection_prompt: 'What does it mean for God to be your light and salvation?',
          },
          {
            day: 4,
            book_id: 'MAT',
            chapter: 6,
            verse_start: 25,
            verse_end: 34,
            reflection_prompt: 'What worries have you brought to God this week?',
          },
          {
            day: 5,
            book_id: 'JHN',
            chapter: 14,
            verse_start: 27,
            verse_end: 27,
            reflection_prompt: 'How can Christ\'s peace transform your daily life?',
          },
          {
            day: 6,
            book_id: '2TI',
            chapter: 1,
            verse_start: 7,
            verse_end: 7,
            reflection_prompt: 'What areas need more discipline, devotion, and self-control?',
          },
          {
            day: 7,
            book_id: 'PSA',
            chapter: 23,
            verse_start: 1,
            verse_end: 6,
            reflection_prompt: 'Reflect on your journey this week. How has God guided you?',
          },
        ],
      },
      {
        title: 'Living with Gratitude',
        description: 'A 14-day plan to cultivate thankfulness in every circumstance.',
        theme_color: '#f4b400',
        duration_days: 14,
        category: 'gratitude',
        difficulty: 'beginner',
        is_active: true,
        verses: [
          {
            day: 1,
            book_id: '1TH',
            chapter: 5,
            verse_start: 16,
            verse_end: 18,
            reflection_prompt: 'What are three specific things you\'re grateful for?',
          },
          {
            day: 2,
            book_id: 'COL',
            chapter: 3,
            verse_start: 15,
            verse_end: 17,
            reflection_prompt: 'How can gratitude transform your relationships?',
          },
          {
            day: 3,
            book_id: 'PSA',
            chapter: 100,
            verse_start: 1,
            verse_end: 5,
            reflection_prompt: 'Why should we give thanks in all things?',
          },
          {
            day: 4,
            book_id: 'PHP',
            chapter: 4,
            verse_start: 4,
            verse_end: 5,
            reflection_prompt: 'What role does gratitude play in prayer?',
          },
          {
            day: 5,
            book_id: 'LUK',
            chapter: 17,
            verse_start: 11,
            verse_end: 19,
            reflection_prompt: 'Are you like the one leper who returned to give thanks?',
          },
          {
            day: 6,
            book_id: 'NEH',
            chapter: 12,
            verse_start: 27,
            verse_end: 47,
            reflection_prompt: 'How can praise and gratitude strengthen your faith?',
          },
          {
            day: 7,
            book_id: 'PSA',
            chapter: 119,
            verse_start: 164,
            verse_end: 165,
            reflection_prompt: 'Reflect on your first week of gratitude.',
          },
          {
            day: 8,
            book_id: '1JN',
            chapter: 3,
            verse_start: 1,
            verse_end: 3,
            reflection_prompt: 'How does God\'s love inspire gratitude?',
          },
          {
            day: 9,
            book_id: 'ROM',
            chapter: 6,
            verse_start: 17,
            verse_end: 18,
            reflection_prompt: 'What are the benefits of obedience and gratitude?',
          },
          {
            day: 10,
            book_id: 'HEB',
            chapter: 13,
            verse_start: 15,
            verse_end: 16,
            reflection_prompt: 'How is gratitude an offering to God?',
          },
          {
            day: 11,
            book_id: 'ECC',
            chapter: 12,
            verse_start: 13,
            verse_end: 14,
            reflection_prompt: 'What is the conclusion of a life lived with gratitude?',
          },
          {
            day: 12,
            book_id: '2CO',
            chapter: 9,
            verse_start: 11,
            verse_end: 15,
            reflection_prompt: 'How does gratitude lead to generosity?',
          },
          {
            day: 13,
            book_id: 'PSA',
            chapter: 30,
            verse_start: 1,
            verse_end: 12,
            reflection_prompt: 'What has God brought you through this month?',
          },
          {
            day: 14,
            book_id: 'REV',
            chapter: 7,
            verse_start: 9,
            verse_end: 17,
            reflection_prompt: 'Celebrate completing this gratitude journey. How has it changed you?',
          },
        ],
      },
    ];

    for (const plan of plans) {
      await base44.entities.ReadingPlan.create(plan);
    }

    return Response.json({ success: true, created: plans.length });
  } catch (error) {
    console.error('[seedReadingPlans] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});