import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, duration_days = 7, focus_area = 'general' } = await req.json();

    if (!topic || topic.trim().length === 0) {
      return Response.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Generate study plan using InvokeLLM
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a comprehensive, personalized ${duration_days}-day Bible study plan on the topic: "${topic}". 
      Focus area: ${focus_area}.
      
      Format the response as JSON with this exact structure:
      {
        "title": "Study plan title",
        "description": "Brief description of the study plan",
        "daily_plan": [
          {
            "day": 1,
            "title": "Day title",
            "scripture_reading": "Book Chapter:Verse-Verse (e.g., John 3:16-18)",
            "commentary": "2-3 sentences of theological commentary",
            "reflection_questions": ["Question 1", "Question 2"],
            "actionable_insight": "One practical, actionable insight for daily life"
          }
        ]
      }
      
      Ensure all Scripture references are valid and the plan progresses logically day by day.
      Make reflection questions thought-provoking and applicable to life.
      Make actionable insights specific and implementable.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          daily_plan: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: { type: 'number' },
                title: { type: 'string' },
                scripture_reading: { type: 'string' },
                commentary: { type: 'string' },
                reflection_questions: { type: 'array', items: { type: 'string' } },
                actionable_insight: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Save study plan to database
    const studyPlan = await base44.entities.StudyPlan.create({
      user_id: user.id,
      title: response.title,
      description: response.description,
      duration_days,
      topics: [topic, focus_area].filter(Boolean),
      daily_plan: response.daily_plan,
      status: 'active',
      progress_percentage: 0,
      generated_content: JSON.stringify(response.daily_plan)
    });

    return Response.json({
      success: true,
      study_plan: {
        id: studyPlan.id,
        ...studyPlan
      }
    });
  } catch (error) {
    console.error('Study path generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});