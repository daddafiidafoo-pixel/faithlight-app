import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    const { bookCode, chapter, verse, reference } = await req.json();

    if (!bookCode || !chapter || !verse || !reference) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if verse already logged today
    const existing = await base44.entities.VerseHistory.filter({
      userId: user.email,
      date: today,
    });

    if (existing?.length > 0) {
      // Already logged today
      return Response.json({ success: true, alreadyLogged: true });
    }

    // Log the verse
    await base44.entities.VerseHistory.create({
      userId: user.email,
      date: today,
      bookCode,
      chapter: Number(chapter),
      verse: Number(verse),
      reference,
    });

    return Response.json({ success: true, alreadyLogged: false });
  } catch (error) {
    console.error('logVerseView error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});