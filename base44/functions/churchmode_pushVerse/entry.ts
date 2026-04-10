import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ok = (data) => Response.json({ success: true, ...data }, { headers: { 'Access-Control-Allow-Origin': '*' } });
const fail = (code, message, status = 400) => Response.json({ success: false, error: code, message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
const handleOptions = (req) => req.method === 'OPTIONS'
  ? new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } })
  : null;

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== 'POST') return fail('METHOD_NOT_ALLOWED', 'Use POST.', 405);

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.id) return fail('UNAUTHENTICATED', 'Please sign in.', 401);

    const body = await req.json().catch(() => null);
    if (!body) return fail('BAD_REQUEST', 'Invalid JSON body.');

    const { sessionId, verseRef, verseText } = body;
    if (!sessionId || !verseRef) return fail('BAD_REQUEST', 'sessionId and verseRef are required.');

    // Verify the session exists and belongs to this user
    const sessions = await base44.asServiceRole.entities.SermonSession.filter({ id: sessionId }, null, 1);
    const session = sessions?.[0];
    if (!session) return fail('NOT_FOUND', 'Session not found.', 404);
    if (session.createdByUserId !== user.id) return fail('FORBIDDEN', 'Only the session pastor can push verses.', 403);
    if (session.status === 'ended') return fail('SESSION_ENDED', 'Session has ended.', 410);

    await base44.asServiceRole.entities.SermonSession.update(session.id, {
      currentVerseRef: verseRef,
      currentVerseText: verseText || '',
      verseUpdatedAt: new Date().toISOString(),
    });

    console.log(`Pastor ${user.id} pushed verse: ${verseRef} to session ${sessionId}`);
    return ok({ verseRef, pushedAt: new Date().toISOString() });
  } catch (e) {
    console.error('Push verse error:', e);
    return fail('SERVER_ERROR', 'Something went wrong.', 500);
  }
});