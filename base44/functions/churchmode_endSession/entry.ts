import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ok = (data, status = 200) => Response.json({ success: true, ...data }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
const fail = (code, message, status = 400) => Response.json({ success: false, error: code, message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
const handleOptions = (req) => req.method === 'OPTIONS' ? new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } }) : null;

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  if (req.method !== 'POST') return fail('METHOD_NOT_ALLOWED', 'Use POST.', 405);

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.id) return fail('UNAUTHENTICATED', 'Please sign in.', 401);

    const body = await req.json().catch(() => null);
    if (!body?.sessionId) return fail('BAD_REQUEST', 'sessionId is required.');

    const sessions = await base44.asServiceRole.entities.SermonSession.filter({ id: body.sessionId }, null, 1);
    const session = sessions?.[0];
    if (!session?.id) return fail('NOT_FOUND', 'Session not found.', 404);

    if (session.createdByUserId && session.createdByUserId !== user.id) {
      return fail('FORBIDDEN', "You don't have permission to end this session.", 403);
    }

    if (session.status === 'ended') return ok({ sessionId: session.id, status: 'ended' });

    const updated = await base44.asServiceRole.entities.SermonSession.update(session.id, { status: 'ended' });
    return ok({ sessionId: updated.id, status: updated.status });
  } catch (e) {
    console.error('End session error:', e);
    return fail('SERVER_ERROR', 'Something went wrong.', 500);
  }
});