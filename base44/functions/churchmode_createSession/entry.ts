import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ok = (data, status = 200) => Response.json({ success: true, ...data }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
const fail = (code, message, status = 400) => Response.json({ success: false, error: code, message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
const handleOptions = (req) => req.method === 'OPTIONS' ? new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } }) : null;

function genCode(len = 7) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

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

    const { churchId, title, languageCode, outlineJson, verseRefs, date } = body;
    if (!churchId || !title || !languageCode) {
      return fail('BAD_REQUEST', 'churchId, title, and languageCode are required.');
    }

    const churches = await base44.asServiceRole.entities.Church.filter({ id: churchId }, null, 1);
    const church = churches?.[0];
    if (!church?.id) return fail('NOT_FOUND', 'Church not found.', 404);

    let code = '';
    for (let i = 0; i < 6; i++) {
      const candidate = genCode(7);
      const existing = await base44.asServiceRole.entities.SermonSession.filter({ code: candidate }, null, 1);
      if (!existing?.length) { code = candidate; break; }
    }
    if (!code) return fail('CODE_GEN_FAILED', 'Could not generate a session code.', 500);

    const session = await base44.asServiceRole.entities.SermonSession.create({
      churchId, code, title, languageCode,
      outlineJson: outlineJson ?? null,
      verseRefs: verseRefs ?? [],
      status: 'live',
      date: date ?? new Date().toISOString(),
      createdByUserId: user.id,
    });

    return ok({ sessionId: session.id, code: session.code, status: session.status, title: session.title });
  } catch (e) {
    console.error('Session creation error:', e);
    return fail('SERVER_ERROR', 'Something went wrong.', 500);
  }
});