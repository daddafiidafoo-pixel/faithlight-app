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

    const { query, bookType, limit = 30 } = await req.json();
    if (!query) {
      return Response.json({ error: 'Query required' }, { status: 400 });
    }

    // Mock Bible verse database with search index
    const bibleDatabase = [
      { ref: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", book: "John", bookCode: "JHN", chapter: 3, verse: 16, bookType: "new_testament", themes: ["love", "faith", "salvation"], emotions: ["hope", "grace"] },
      { ref: "Psalm 23:1", text: "The Lord is my shepherd, I lack nothing.", book: "Psalm", bookCode: "PSA", chapter: 23, verse: 1, bookType: "old_testament", themes: ["comfort", "protection", "trust"], emotions: ["peace", "security"] },
      { ref: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", book: "Romans", bookCode: "ROM", chapter: 8, verse: 28, bookType: "new_testament", themes: ["faith", "purpose", "trust"], emotions: ["hope", "reassurance"] },
      { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", book: "Proverbs", bookCode: "PRV", chapter: 3, verse: 5, bookType: "old_testament", themes: ["wisdom", "trust", "guidance"], emotions: ["confidence", "peace"] },
      { ref: "Philippians 4:13", text: "I can do all this through him who gives me strength.", book: "Philippians", bookCode: "PHP", chapter: 4, verse: 13, bookType: "new_testament", themes: ["strength", "faith", "perseverance"], emotions: ["courage", "empowerment"] },
      { ref: "Isaiah 41:10", text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.", book: "Isaiah", bookCode: "ISA", chapter: 41, verse: 10, bookType: "old_testament", themes: ["comfort", "strength", "faith"], emotions: ["courage", "peace"] },
      { ref: "Matthew 11:28", text: "Come to me, all you who are weary and burdened, and I will give you rest.", book: "Matthew", bookCode: "MAT", chapter: 11, verse: 28, bookType: "new_testament", themes: ["rest", "comfort", "invitation"], emotions: ["peace", "relief"] },
      { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", book: "Jeremiah", bookCode: "JER", chapter: 29, verse: 11, bookType: "old_testament", themes: ["hope", "future", "purpose"], emotions: ["hope", "confidence"] },
    ];

    // Search by keyword (full-text)
    const queryLower = query.toLowerCase();
    let results = bibleDatabase.filter(v => 
      v.text.toLowerCase().includes(queryLower) || 
      v.themes.some(t => t.toLowerCase().includes(queryLower)) ||
      v.emotions.some(e => e.toLowerCase().includes(queryLower))
    );

    // Filter by book type if specified
    if (bookType && bookType !== 'all') {
      results = results.filter(v => v.bookType === bookType);
    }

    // Score and sort by relevance
    results = results.map(v => {
      let score = 0;
      if (v.text.toLowerCase().includes(queryLower)) score += 3;
      if (v.themes.some(t => t.toLowerCase() === queryLower)) score += 2;
      if (v.emotions.some(e => e.toLowerCase() === queryLower)) score += 2;
      return { ...v, relevanceScore: score / 7 };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);

    // Group by book type
    const grouped = {};
    results.forEach(v => {
      if (!grouped[v.bookType]) grouped[v.bookType] = [];
      grouped[v.bookType].push(v);
    });

    return Response.json({
      success: true,
      query,
      totalResults: results.length,
      results,
      grouped
    });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});