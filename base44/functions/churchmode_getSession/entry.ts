import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ok = (data) => Response.json({ success: true, ...data }, { headers: { 'Access-Control-Allow-Origin': '*' } });
const fail = (code, message, status = 400) => Response.json({ success: false, error: code, message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
const handleOptions = (req) => req.method === 'OPTIONS'
  ? new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } })
  : null;

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const base44 = createClientFromRequest(req);

    let sessionId = '';
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      sessionId = body?.sessionId ?? '';
    } else {
      const url = new URL(req.url);
      sessionId = url.searchParams.get('sessionId') ?? '';
    }

    if (!sessionId) return fail('BAD_REQUEST', 'sessionId is required.');

    const sessions = await base44.asServiceRole.entities.SermonSession.list('-created_date', 200);
    const session = sessions?.find(s => s.id === sessionId);
    if (!session) return fail('NOT_FOUND', 'Session not found.', 404);

    return ok({
      sessionId: session.id,
      title: session.title,
      status: session.status,
      currentVerseRef: session.currentVerseRef ?? null,
      currentVerseText: session.currentVerseText ?? null,
      verseUpdatedAt: session.verseUpdatedAt ?? null,
      verseRefs: session.verseRefs ?? [],
    });
  } catch (e) {
    console.error('Get session error:', e);
    return fail('SERVER_ERROR', 'Something went wrong.', 500);
  }
});