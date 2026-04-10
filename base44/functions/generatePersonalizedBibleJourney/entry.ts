import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Generate a personalized 7-14 day Bible journey
 * Returns daily scripture, reflection questions, and prayers
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      goal, // e.g., "overcome anxiety", "deepen faith"
      daysCount = 7, // 7-14
      dailyMinutes = 15,
      userLanguage = 'en'
    } = await req.json();

    if (!goal || daysCount < 7 || daysCount > 14) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const languageMap = {
      'om': 'Afaan Oromoo',
      'sw': 'Swahili',
      'ar': 'Arabic',
      'am': 'Amharic',
      'en': 'English',
    };

    const language = languageMap[userLanguage] || 'English';

    // Generate journey using AI
    const prompt = `Create a ${daysCount}-day personalized Bible journey for someone who wants to: "${goal}"

Daily time commitment: ${dailyMinutes} minutes
Language: ${language}

For EACH day (Day 1 through Day ${daysCount}), provide:

Day [NUMBER]:
Scripture: [Bible verse reference and short quote]
Reflection: [1-2 sentence reflection question for the user to think about]
Prayer: [1-2 sentence prayer they can pray]
Key Insight: [One sentence takeaway]

Important:
- Each day should build on the previous day
- Use actual Bible verses (do not invent)
- Make reflections personal and practical
- Keep prayers simple and heartfelt
- Ensure content is culturally appropriate and encouraging

Format as clear, numbered days so users can follow along.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
    });

    // Store the journey
    const journey = {
      goal,
      daysCount,
      dailyMinutes,
      userLanguage,
      content: response,
      createdAt: new Date().toISOString(),
      userId: user.id,
      title: `${daysCount}-Day Journey: ${goal}`,
    };

    return Response.json({
      success: true,
      journey,
    });
  } catch (error) {
    console.error('Error generating journey:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});