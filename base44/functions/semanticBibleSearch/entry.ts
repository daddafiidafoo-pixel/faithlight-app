import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, language = 'en' } = await req.json();

    if (!query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Call AI to understand the search query and find matching verses
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a biblical scholar. The user is searching for Bible verses with this emotional/thematic query: "${query}"
      
Return a JSON response with exactly 8-10 verses that match this query. For each verse, provide:
- reference (e.g., "John 3:16")
- text (the verse text from the Bible)
- explanation (1-2 sentences explaining why this verse matches the user's query)
- relevanceScore (0-100, how well it matches)

IMPORTANT: You MUST have access to Bible text to provide accurate verses. Use well-known Bible verses you know. Format as valid JSON array only, no other text.

Example format:
[
  {
    "reference": "Psalm 23:1",
    "text": "The Lord is my shepherd, I lack nothing.",
    "explanation": "This verse speaks to trust and finding peace through faith.",
    "relevanceScore": 95
  }
]`,
      response_json_schema: {
        type: "object",
        properties: {
          verses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                reference: { type: "string" },
                text: { type: "string" },
                explanation: { type: "string" },
                relevanceScore: { type: "number" }
              }
            }
          }
        }
      },
      model: "gemini_3_flash"
    });

    const verses = aiResponse.verses || [];

    // Save search query to database for future analytics
    await base44.asServiceRole.entities.SemanticSearchQuery.create({
      userEmail: user.email,
      query: query,
      results: verses,
      searchedAt: new Date().toISOString()
    });

    return Response.json({
      success: true,
      query: query,
      results: verses,
      count: verses.length
    });

  } catch (error) {
    console.error('Semantic search error:', error);
    return Response.json({ 
      error: 'Search failed',
      details: error.message 
    }, { status: 500 });
  }
});