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
    if (!user?.id) return fail('UNAUTHENTICATED', 'Please sign in to save notes.', 401);

    const body = await req.json().catch(() => null);
    if (!body) return fail('BAD_REQUEST', 'Invalid JSON body.');

    const { sessionId, noteText } = body;
    if (!sessionId) return fail('BAD_REQUEST', 'sessionId is required.');
    if (typeof noteText !== 'string') return fail('BAD_REQUEST', 'noteText must be a string.');

    const sessions = await base44.asServiceRole.entities.SermonSession.filter({ id: sessionId }, null, 1);
    const session = sessions?.[0];
    if (!session?.id) return fail('NOT_FOUND', 'Session not found.', 404);
    if (session.status === 'ended') return fail('SESSION_ENDED', 'This session has ended.', 410);

    const existingNotes = await base44.asServiceRole.entities.SessionNote.filter({ sessionId, userId: user.id }, null, 1);
    const existingNote = existingNotes?.[0];

    let saved;
    if (existingNote?.id) {
      saved = await base44.asServiceRole.entities.SessionNote.update(existingNote.id, { noteText });
    } else {
      saved = await base44.asServiceRole.entities.SessionNote.create({ sessionId, userId: user.id, noteText });
    }

    return ok({ noteId: saved.id, sessionId, userId: user.id });
  } catch (e) {
    console.error('Save note error:', e);
    return fail('SERVER_ERROR', 'Something went wrong.', 500);
  }
});