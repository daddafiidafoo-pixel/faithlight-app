import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { studyPlanId, dayIndex, contentType = 'multiple_choice' } = await req.json();

    if (!studyPlanId) {
      return new Response(JSON.stringify({ error: 'Missing studyPlanId' }), { status: 400 });
    }

    // Fetch the study plan
    const plan = await base44.entities.StudyPlan.filter({ id: studyPlanId, user_id: user.email });
    
    if (!plan || plan.length === 0) {
      return new Response(JSON.stringify({ error: 'Study plan not found' }), { status: 404 });
    }

    const studyPlan = plan[0];
    const dayData = studyPlan.plan_items?.[dayIndex];

    if (!dayData) {
      return new Response(JSON.stringify({ error: 'Day not found in plan' }), { status: 404 });
    }

    const bookRef = dayData.book ? `${dayData.book} ${dayData.chapter}${dayData.verse ? `:${dayData.verse}` : ''}` : '';
    const focusText = dayData.focus || dayData.label || 'Bible study material';

    const prompt = `Generate a practice quiz for Bible study based on this material:

Scripture: ${bookRef}
Focus/Topic: ${focusText}
Activity: ${dayData.activity || 'Scripture reading and reflection'}

Create a ${contentType} quiz with 5 questions. Return as JSON:
{
  "questions": [
    {
      "question": "Question text",
      "type": "${contentType}",
      ${contentType === 'multiple_choice' ? '"options": ["A", "B", "C", "D"],' : ''}
      ${contentType === 'multiple_choice' ? '"correct_answer": 0,' : ''}
      "difficulty": "easy|medium|hard"
    }
  ]
}

Make questions test understanding, not just memorization.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                type: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } },
                correct_answer: { type: 'number' },
                difficulty: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return new Response(JSON.stringify({ quiz: response }), { status: 200 });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});