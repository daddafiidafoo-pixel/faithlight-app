import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import crypto from 'crypto';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { duration_days, daily_minutes, difficulty, focus_areas } = await req.json();

    if (!duration_days || !daily_minutes || !difficulty) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create cache hash from parameters
    const cacheHash = crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          user_id: user.id,
          duration_days,
          daily_minutes,
          difficulty,
          focus_areas: focus_areas || [],
        })
      )
      .digest('hex');

    // Check if plan already exists with same hash
    const existing = await base44.entities.DynamicStudyPlan.filter(
      { user_id: user.id, cache_hash: cacheHash, status: 'active' },
      '-created_date',
      1
    );

    if (existing && existing.length > 0) {
      console.log(`Returning cached plan for user ${user.id}`);
      return Response.json(existing[0]);
    }

    // Generate AI-powered study plan using InvokeLLM
    const prompt = buildStudyPlanPrompt(
      duration_days,
      daily_minutes,
      difficulty,
      focus_areas
    );

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          focus_question: { type: 'string' },
          daily_activities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: { type: 'number' },
                book: { type: 'string' },
                chapters: {
                  type: 'array',
                  items: { type: 'number' },
                },
                theme: { type: 'string' },
                reflection: { type: 'string' },
              },
            },
          },
          key_themes: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      add_context_from_internet: false,
    });

    // Transform AI response into plan items
    const planItems = (aiResponse.daily_activities || []).map((activity) => ({
      day: activity.day,
      book: activity.book,
      chapter: activity.chapters?.[0] || 1,
      verses: activity.chapters || [1],
      focus_question: activity.reflection || activity.theme,
      completed: false,
    }));

    // Create study plan entity
    const studyPlan = await base44.entities.DynamicStudyPlan.create({
      user_id: user.id,
      title: aiResponse.title || `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Study Plan`,
      description: aiResponse.description || 'Personalized study plan for Oromo Bible learning',
      language_code: 'om',
      duration_days,
      daily_minutes,
      difficulty,
      focus_areas: focus_areas || aiResponse.key_themes || [],
      plan_items: planItems,
      ai_generated_content: JSON.stringify(aiResponse),
      cache_hash: cacheHash,
      status: 'active',
      progress_percentage: 0,
    });

    console.log(`Created study plan ${studyPlan.id} for user ${user.id}`);

    return Response.json(studyPlan);
  } catch (error) {
    console.error('Error generating study plan:', error.message);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});

function buildStudyPlanPrompt(
  durationDays,
  dailyMinutes,
  difficulty,
  focusAreas
) {
  const focusText = focusAreas && focusAreas.length > 0
    ? `Focus on these areas: ${focusAreas.join(', ')}.`
    : 'Balance across all Bible books.';

  const difficultyGuide = {
    beginner: 'Start with foundational books like Genesis and Matthew. Simple, clear passages.',
    intermediate: 'Mix Old and New Testament. Include some prophetic and epistolic books.',
    advanced: 'Include complex theology, prophecy, and deep scriptural connections.',
  };

  return `Create a personalized ${durationDays}-day Bible study plan for Oromo language learners.

Requirements:
- Daily study time: ${dailyMinutes} minutes
- Difficulty level: ${difficulty}
- Total duration: ${durationDays} days
- Language: Oromo
${focusText}

Guidance: ${difficultyGuide[difficulty] || difficultyGuide.intermediate}

For each day, suggest:
1. Specific Bible book and chapters to study
2. A meaningful reflection question in Oromo context
3. A connecting theme to previous teachings

Format the response with a compelling title, description, list of daily activities with book/chapters, and key themes to explore throughout the plan.`;
}