import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Generate AI-powered Bible study plan based on user goals/topics
 * Creates 7-day or 30-day reading tracks with daily passages
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      topic, 
      duration = 7, // 7 or 30
      language_code = 'en',
      spiritual_goals = []
    } = await req.json();

    if (!topic || topic.trim().length === 0) {
      return Response.json({ error: 'Topic required' }, { status: 400 });
    }

    if (![7, 30].includes(duration)) {
      return Response.json({ error: 'Duration must be 7 or 30 days' }, { status: 400 });
    }

    // Step 1: Get all books in language
    const books = await base44.entities.BibleBook.filter(
      { language_code },
      'book_order',
      66
    );

    const booksList = books.map(b => `${b.book_name} (${b.chapters_count} chapters)`).join(', ');

    // Step 2: Use AI to generate study plan structure
    const planPrompt = `Create a ${duration}-day Bible study plan on the topic: "${topic}"
Spiritual goals: ${spiritual_goals.join(', ') || 'General spiritual growth'}

Available books: ${booksList}

Return JSON with structure:
{
  "title": "Plan title",
  "description": "Brief description",
  "days": [
    {
      "day": 1,
      "theme": "Daily theme",
      "passages": [
        {
          "book": "Book name",
          "chapter": 1,
          "verse_start": 1,
          "verse_end": 10,
          "reflection_question": "Question for daily reflection"
        }
      ],
      "daily_focus": "What to focus on today"
    }
  ]
}`;

    const planResponse = await base44.integrations.Core.InvokeLLM({
      prompt: planPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          days: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: { type: 'number' },
                theme: { type: 'string' },
                daily_focus: { type: 'string' },
                passages: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      book: { type: 'string' },
                      chapter: { type: 'number' },
                      verse_start: { type: 'number' },
                      verse_end: { type: 'number' },
                      reflection_question: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!planResponse?.days) {
      return Response.json({ error: 'Failed to generate study plan' }, { status: 500 });
    }

    // Step 3: Save study plan to database
    const user = await base44.auth.me().catch(() => null);
    const userId = user?.id || 'anonymous';

    const savedPlan = await base44.entities.BibleStudyPlan.create({
      user_id: userId,
      title: planResponse.title,
      description: planResponse.description,
      topic,
      duration,
      language_code,
      spiritual_goals,
      daily_structure: planResponse.days,
      status: 'active',
      started_date: new Date().toISOString()
    });

    return Response.json({
      success: true,
      plan: {
        id: savedPlan.id,
        ...planResponse,
        duration,
        topic,
        language_code
      }
    });
  } catch (error) {
    console.error('Study plan generation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});