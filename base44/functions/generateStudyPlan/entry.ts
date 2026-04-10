import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.id) {
      return Response.json({ error: 'User must be authenticated' }, { status: 401 });
    }

    const { topic, language = 'en' } = await req.json();

    if (!topic) {
      return Response.json({ error: 'Topic is required' }, { status: 400 });
    }

    const prompt = `Create a 7-day spiritual study plan focused on "${topic}". 
    Return a JSON object with a "days" array containing 7 objects, each with:
    - "dayNumber": 1-7
    - "reference": A Bible verse reference (e.g., "Philippians 4:6")
    - "reflection_question": A thoughtful reflection question
    - "key_insight": A brief spiritual insight for that day
    
    Choose verses that progressively build understanding of the topic "${topic}".
    Make it inspiring and practical.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          days: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                dayNumber: { type: 'number' },
                reference: { type: 'string' },
                reflection_question: { type: 'string' },
                key_insight: { type: 'string' },
              },
            },
          },
        },
      },
    });

    // Save the study plan
    const plan = await base44.entities.CustomStudyPlan.create({
      user_id: user.id,
      topic,
      title: `7-Day ${topic} Study Plan`,
      description: `A personalized study plan focusing on ${topic}`,
      days: response.days || [],
      start_date: new Date().toISOString().split('T')[0],
      is_active: true,
    });

    return Response.json({
      plan_id: plan.id,
      ...response,
    });
  } catch (error) {
    console.error('Study plan generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});