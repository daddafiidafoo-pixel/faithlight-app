import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ok = (data, status = 200) => Response.json({ success: true, ...data }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
const fail = (code, message, status = 400) => Response.json({ success: false, error: code, message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
const handleOptions = (req) => req.method === 'OPTIONS' ? new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } }) : null;

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  if (req.method !== 'GET' && req.method !== 'POST') return fail('METHOD_NOT_ALLOWED', 'Use GET or POST.', 405);

  try {
    let code = '';
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      code = (body?.code ?? '').trim().toUpperCase();
    } else {
      const url = new URL(req.url);
      code = (url.searchParams.get('code') ?? '').trim().toUpperCase();
    }

    if (!code) return fail('BAD_REQUEST', 'code is required.');

    const base44 = createClientFromRequest(req);
    const sessions = await base44.asServiceRole.entities.SermonSession.filter({ code }, null, 1);
    const session = sessions?.[0];

    if (!session?.id) return fail('NOT_FOUND', 'Session not found.', 404);
    if (session.status === 'ended') return fail('SESSION_ENDED', 'This session has ended.', 410);

    const churches = await base44.asServiceRole.entities.Church.filter({ id: session.churchId }, null, 1);
    const church = churches?.[0];

    return ok({
      session: {
        id: session.id, title: session.title, date: session.date,
        languageCode: session.languageCode, verseRefs: session.verseRefs ?? [],
        outlineJson: session.outlineJson ?? null, status: session.status,
        churchName: church?.name ?? '',
      },
    });
  } catch (e) {
    console.error('Join session error:', e);
    return fail('SERVER_ERROR', 'Something went wrong.', 500);
  }
});