import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { goal, durationDays = 30, reminderTime } = await req.json();
    if (!goal) return Response.json({ error: 'Goal is required' }, { status: 400 });

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Bible reading plan expert. Create a ${durationDays}-day Bible reading plan for someone with this goal: "${goal}"

Generate a structured daily reading plan. Each day should have:
- A short inspiring title
- 1-3 Bible verse references (short manageable readings)
- A brief devotional note (1-2 sentences of encouragement)

Return ONLY valid JSON in this exact format:
{
  "title": "A catchy plan title related to the goal",
  "days": [
    {
      "dayNumber": 1,
      "title": "Day title",
      "readings": ["Genesis 1:1-10", "Psalm 23"],
      "devotionalNote": "Short encouragement.",
      "completed": false
    }
  ]
}

Generate all ${durationDays} days. Keep readings short (1-3 per day). Vary across Old and New Testament. Match the theme: "${goal}".`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                dayNumber: { type: "number" },
                title: { type: "string" },
                readings: { type: "array", items: { type: "string" } },
                devotionalNote: { type: "string" },
                completed: { type: "boolean" }
              }
            }
          }
        }
      },
      model: "gemini_3_flash"
    });

    const plan = await base44.asServiceRole.entities.CustomReadingPlan.create({
      userEmail: user.email,
      title: aiResponse.title || `${goal} — ${durationDays}-Day Plan`,
      goal,
      durationDays,
      days: aiResponse.days || [],
      currentDay: 1,
      isActive: true,
      reminderTime: reminderTime || null,
      reminderEnabled: !!reminderTime,
      startedAt: new Date().toISOString()
    });

    return Response.json({ success: true, plan });
  } catch (error) {
    console.error('generateCustomReadingPlan error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});