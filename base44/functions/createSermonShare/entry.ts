import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * createSermonShare - Create a public share link for a sermon session
 * Input: { sessionId, title, churchName, verseRefs, notesSummary, outlineJson }
 * Returns: { shareToken, shareUrl }
 */
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

    const body = await req.json();
    const { sessionId, title, churchName, verseRefs, notesSummary, outlineJson, isPublic } = body;

    if (!sessionId || !title) {
      return Response.json({ error: 'sessionId and title required' }, { status: 400 });
    }

    // Generate unique token
    const shareToken = Math.random().toString(36).substring(2, 12);

    // Create share record
    const share = await base44.entities.SermonShare.create({
      session_id: sessionId,
      share_token: shareToken,
      title,
      church_name: churchName || '',
      verse_refs: verseRefs || [],
      notes_summary: notesSummary || '',
      outline_json: outlineJson || {},
      is_public: isPublic !== false
    });

    const shareUrl = `${Deno.env.get('BASE44_APP_URL') || 'https://faithlight.app'}/share/sermon/${shareToken}`;

    console.log(`[SermonShare] Created share: ${shareToken} for session ${sessionId}`);

    return Response.json({
      shareToken,
      shareUrl,
      share
    });
  } catch (error) {
    console.error('[SermonShare] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});