import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * AI Spiritual Growth Companion
 * Analyzes user's reading history, highlights, notes, and study patterns
 * to generate personalized spiritual guidance suggestions.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user activity signals in parallel
    const [highlights, notes, readingHistory, studyPlans, prayerJournal] = await Promise.all([
      base44.entities.VerseHighlight.filter({ user_id: user.id }, '-created_date', 30).catch(() => []),
      base44.entities.VerseNote.filter({ user_id: user.id }, '-created_date', 20).catch(() => []),
      base44.entities.ReadingSession.filter({ user_id: user.id }, '-created_date', 30).catch(() => []),
      base44.entities.PersonalReadingPlan.filter({ user_id: user.id }, '-created_date', 5).catch(() => []),
      base44.entities.PrayerJournal.filter({ user_id: user.id }, '-created_date', 10).catch(() => []),
    ]);

    // Build a lightweight activity summary to send to the LLM
    const highlightTopics = highlights.map(h => h.verse_ref || h.reference || '').filter(Boolean).slice(0, 15);
    const noteTexts = notes.map(n => n.note || n.content || '').filter(Boolean).slice(0, 5).map(t => t.substring(0, 80));
    const recentBooks = [...new Set(
      readingHistory.map(r => r.book || r.book_name || '').filter(Boolean)
    )].slice(0, 8);
    const activePlanTitles = studyPlans.filter(p => p.status === 'active').map(p => p.title || '').filter(Boolean);
    const prayerTopics = prayerJournal.map(p => p.category || p.title || '').filter(Boolean).slice(0, 8);

    const daysSinceLastRead = readingHistory.length > 0
      ? Math.floor((Date.now() - new Date(readingHistory[0].created_date).getTime()) / 86400000)
      : null;

    const activitySummary = {
      total_reading_sessions: readingHistory.length,
      days_since_last_read: daysSinceLastRead,
      recent_books_read: recentBooks,
      total_highlights: highlights.length,
      highlighted_verses: highlightTopics,
      recent_note_snippets: noteTexts,
      active_study_plans: activePlanTitles,
      prayer_topics: prayerTopics,
    };

    const hasActivity = highlights.length > 0 || readingHistory.length > 0 || notes.length > 0;

    const prompt = `You are a compassionate AI Spiritual Growth Companion for a Bible study app called FaithLight.

Based on the user's recent Bible study activity below, generate one personalized spiritual insight and suggestion.

User Activity Summary:
${JSON.stringify(activitySummary, null, 2)}

Your task:
1. Identify the most prominent spiritual theme(s) from the user's activity (e.g. faith, trust, anxiety, hope, forgiveness, courage).
2. Generate ONE warm, personalized suggestion for their next spiritual step.
3. The suggestion can be one of these types: "reading" (a specific passage), "devotional" (a short reflection topic), "prayer" (a prayer theme), "challenge" (a multi-day reading challenge).
4. Choose whichever type fits most naturally given the activity.

Important rules:
- Be warm, gentle, and encouraging. Never judgmental.
- Ground suggestions in actual Bible books and passages. Only reference real books of the Bible.
- Do not claim to know what God is saying to the user. Use humble language like "You may find encouragement in…" or "Many believers in similar seasons have found comfort in…"
- If the user has not read recently (days_since_last_read > 3 or null), offer a gentle "come back" suggestion.
- Respect all Christian traditions. Avoid denominational language.
- Keep the insight_message under 40 words. Keep the suggestion_description under 35 words.

${!hasActivity ? 'The user is new or has not used the app much yet. Give a welcoming first-step suggestion.' : ''}

Return JSON only:
{
  "theme": "1-3 word theme label, e.g. Trust in God",
  "insight_message": "Short personal message to the user based on what you noticed",
  "suggestion_type": "reading | devotional | prayer | challenge",
  "suggestion_title": "Short title of the suggestion",
  "suggestion_description": "Brief description of the suggestion",
  "passage": "Bible passage reference, e.g. Psalm 46 or Matthew 6:25-34 (required for reading/challenge types, optional otherwise)",
  "cta_label": "Button label, e.g. Start Reading or Begin Reflection or Open Prayer Guide",
  "cta_page": "One of: BibleReader, DailyPrayerGenerator, BibleStudyPlans, PersonalReadingPlans, AIBibleGuide"
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          theme: { type: 'string' },
          insight_message: { type: 'string' },
          suggestion_type: { type: 'string' },
          suggestion_title: { type: 'string' },
          suggestion_description: { type: 'string' },
          passage: { type: 'string' },
          cta_label: { type: 'string' },
          cta_page: { type: 'string' },
        },
      },
    });

    console.log('[generateSpiritualInsights] Generated for user:', user.id, 'theme:', result?.theme);

    return Response.json({
      success: true,
      insight: result,
      stats: {
        total_highlights: highlights.length,
        total_reading_sessions: readingHistory.length,
        active_plans: activePlanTitles.length,
        prayer_entries: prayerJournal.length,
      },
    });
  } catch (error) {
    console.error('[generateSpiritualInsights] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});