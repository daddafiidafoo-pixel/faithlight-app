import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate personalized daily devotional
 * Uses user's spiritual level, interests, and recent activity
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { user_id } = body;

    if (!user_id) {
      return Response.json({ success: true, devotional: null, message: 'No user_id provided' });
    }

    // Get user data
    const [userProgress, userInterests, dailyDevoCount] = await Promise.all([
      base44.asServiceRole.entities.UserProgress.filter({ user_id }),
      base44.asServiceRole.entities.UserInterests.filter({ user_id }),
      base44.asServiceRole.entities.PersonalizedDevotional.filter({
        user_id,
        devotional_date: new Date().toISOString().split('T')[0],
      }),
    ]);

    const progress = userProgress[0];
    const interests = userInterests[0];

    if (!progress) {
      return Response.json({ success: true, devotional: null, message: 'No user progress yet' });
    }

    // Check if devotional already exists for today
    if (dailyDevoCount.length > 0) {
      return Response.json({
        success: true,
        devotional: dailyDevoCount[0],
        message: 'Devotional already generated for today',
      });
    }

    // Build devotional prompt
    const spiritualLevelDescriptions = {
      1: 'New Believer - just starting their faith journey, learning foundational concepts',
      2: 'Growing Believer - developing deeper understanding, exploring personal faith',
      3: 'Mature Believer - serving others, mentoring relationships, theological depth',
      4: 'Leader/Teacher - guiding communities, spiritual authority, apostolic vision',
    };

    const prompt = `You are creating a short Christian devotional based on Scripture for a FaithLight user.

User Profile:
- Spiritual Level: ${spiritualLevelDescriptions[progress.current_level]}
- Progress: ${progress.current_level_progress_percent}% through current level
- Learning Streak: ${progress.learning_streak_current} days
- Lessons Completed: ${progress.completed_lesson_count}
- Interests: ${interests?.interests?.join(', ') || 'General Christian growth'}
- Struggles: ${interests?.struggle_areas?.join(', ') || 'Not specified'}

Write the devotional with these sections:
1. Title
2. Scripture Reflection — explain the meaning of a relevant verse in simple language.
3. Daily Application — encourage the reader to apply the message in their life today.
4. Reflection Question — ask one thoughtful question for personal reflection tailored to their interests or struggles.
5. Short Prayer — a short, sincere prayer inspired by the verse.

Important rules:
- Keep the devotional encouraging and grounded in Scripture.
- Avoid presenting personal opinions as absolute doctrine.
- Respect the diversity of Christian traditions.
- Focus on spiritual growth, faith, and hope.
- Do not claim prophetic messages from God.
- Use humble language such as "this verse reminds us…" or "many believers find…".

Format as JSON: {
  "title": "string",
  "scriptureReference": "string",
  "scriptureText": "string",
  "devotionalInsight": "string",
  "reflectionPrompt": "string",
  "relevanceNote": "why this is relevant for this user"
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          scriptureReference: { type: 'string' },
          scriptureText: { type: 'string' },
          devotionalInsight: { type: 'string' },
          reflectionPrompt: { type: 'string' },
          relevanceNote: { type: 'string' },
        },
      },
    });

    // Create devotional record
    const devotional = await base44.asServiceRole.entities.PersonalizedDevotional.create({
      user_id,
      devotional_date: new Date().toISOString().split('T')[0],
      title: response.title,
      scripture_reference: response.scriptureReference,
      scripture_text: response.scriptureText,
      reflection_prompt: response.reflectionPrompt,
      personalized_insight: response.devotionalInsight,
    });

    // Create notification
    await base44.functions.invoke('createCommunityNotification', {
      user_id,
      type: 'progress_milestone',
      actor_id: 'system',
      actor_name: 'FaithLight',
      title: '📖 Your Daily Devotional is Ready',
      message: response.title,
      related_id: devotional.id,
      related_type: 'devotional',
      action_url: '/Home?tab=devotional',
    });

    return Response.json({
      success: true,
      devotional,
    });
  } catch (error) {
    console.error('Devotional generation error:', error);
    return Response.json({ success: true, devotional: null });
  }
});