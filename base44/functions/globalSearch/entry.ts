import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, limit = 10 } = await req.json();

    if (!query || query.trim().length === 0) {
      return Response.json({ results: [], grouped: {} });
    }

    const q = query.toLowerCase();
    const results = [];

    // Search verses
    try {
      const verses = await base44.entities.BibleVerse.filter(
        { text: { $regex: q, $options: 'i' } },
        '-updated_date',
        limit / 3
      );
      results.push(
        ...verses.map((v) => ({
          type: 'verse',
          id: v.id,
          title: `${v.book} ${v.chapter}:${v.verse}`,
          description: v.text?.substring(0, 80),
          score: 90,
        }))
      );
    } catch (e) {
      console.log('Verse search error:', e.message);
    }

    // Search courses
    try {
      const courses = await base44.entities.Course.filter(
        { title: { $regex: q, $options: 'i' } },
        '-updated_date',
        limit / 3
      );
      results.push(
        ...courses.map((c) => ({
          type: 'course',
          id: c.id,
          title: c.title,
          description: c.description?.substring(0, 80),
          score: 75,
        }))
      );
    } catch (e) {
      console.log('Course search error:', e.message);
    }

    // Search forum topics
    try {
      const topics = await base44.entities.ForumTopic.filter(
        { title: { $regex: q, $options: 'i' } },
        '-updated_date',
        limit / 3
      );
      results.push(
        ...topics.map((t) => ({
          type: 'forum',
          id: t.id,
          title: t.title,
          description: `by ${t.author_name}`,
          score: 60,
        }))
      );
    } catch (e) {
      console.log('Forum search error:', e.message);
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Group by type
    const grouped = results.reduce((acc, r) => {
      if (!acc[r.type]) acc[r.type] = [];
      acc[r.type].push(r);
      return acc;
    }, {});

    return Response.json({ results: results.slice(0, limit), grouped });
  } catch (error) {
    console.error('Global search error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});