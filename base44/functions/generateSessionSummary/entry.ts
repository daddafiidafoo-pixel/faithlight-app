import { base44 } from '@/api/base44Client';

/**
 * Generate AI summary for a completed live session
 * @param {string} sessionId - LiveSession ID
 * @returns {Promise<object>} SessionSummary data
 */
export async function generateSessionSummary(sessionId) {
  try {
    // Fetch session details
    const sessions = await base44.entities.LiveSession.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      throw new Error('Session not found');
    }
    const session = sessions[0];

    // Fetch chat messages
    const messages = await base44.entities.LiveSessionChat.filter({ 
      session_id: sessionId 
    });

    // Fetch participants
    const participants = await base44.entities.SessionParticipant.filter({ 
      session_id: sessionId 
    });

    // Prepare context for AI
    const chatContent = messages
      .map(m => `${m.user_name}: ${m.message}`)
      .join('\n');

    const participantList = participants
      .map(p => p.user_name)
      .filter((v, i, a) => a.indexOf(v) === i); // unique

    const duration = session.end_time && session.actual_start
      ? Math.round((new Date(session.end_time) - new Date(session.actual_start)) / 60000)
      : 0;

    // Call AI to generate summary
    const summaryData = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional meeting summarizer. Analyze the following live session transcript and provide a comprehensive summary.

SESSION TITLE: ${session.session_title}
SESSION TYPE: ${session.session_type}
DURATION: ${duration} minutes
PARTICIPANTS: ${participantList.join(', ')}

TRANSCRIPT:
${chatContent}

Please provide your response in the following JSON format (and ONLY in this format, no markdown, no extra text):
{
  "summary": "A 2-3 paragraph comprehensive summary of the session",
  "discussion_points": ["key point 1", "key point 2", "key point 3"],
  "decisions": ["decision 1", "decision 2"],
  "action_items": [
    {
      "item": "specific action to take",
      "owner": "person responsible (or 'Team' if general)",
      "due_date": "YYYY-MM-DD or null"
    }
  ]
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          discussion_points: { type: 'array', items: { type: 'string' } },
          decisions: { type: 'array', items: { type: 'string' } },
          action_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item: { type: 'string' },
                owner: { type: 'string' },
                due_date: { type: 'string' },
              },
            },
          },
        },
      },
    });

    // Create session summary record
    const summaryRecord = await base44.entities.SessionSummary.create({
      session_id: sessionId,
      session_title: session.session_title,
      summary_text: summaryData.summary,
      discussion_points: summaryData.discussion_points,
      decisions: summaryData.decisions,
      action_items: summaryData.action_items,
      participants: participantList,
      duration_minutes: duration,
      generated_at: new Date().toISOString(),
      generated_by_ai: true,
      status: 'completed',
    });

    return summaryRecord;
  } catch (error) {
    console.error('Error generating session summary:', error);
    
    // Create failed summary record
    try {
      await base44.entities.SessionSummary.create({
        session_id: sessionId,
        session_title: 'Unknown',
        summary_text: `Failed to generate summary: ${error.message}`,
        discussion_points: [],
        decisions: [],
        action_items: [],
        participants: [],
        generated_at: new Date().toISOString(),
        generated_by_ai: true,
        status: 'failed',
      });
    } catch (e) {
      console.error('Error creating failed summary record:', e);
    }
    
    throw error;
  }
}