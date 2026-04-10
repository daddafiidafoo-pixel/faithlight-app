import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { q, scope, translation, has_notes, has_highlights, user_id, limit = 30, offset = 0 } = body;

    if (!q || q.trim().length < 2) {
      return Response.json({
        results: [],
        total: 0,
      });
    }

    // Mock search results - in production this would search actual Bible data
    return Response.json({
      results: [],
      total: 0,
    });
  } catch (error) {
    console.error('Bible search error:', error);
    return Response.json({ error: 'Search failed', details: error.message }, { status: 500 });
  }
});