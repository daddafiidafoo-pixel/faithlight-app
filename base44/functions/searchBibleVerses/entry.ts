import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const { query, searchType } = await req.json();
    if (!query) return Response.json({ error: 'Query required' }, { status: 400 });

    const bibleApiKey = Deno.env.get('BIBLE_BRAIN_API_KEY');
    if (!bibleApiKey) return Response.json({ error: 'API key not configured' }, { status: 500 });

    let results = [];

    if (searchType === 'reference' || searchType === 'both') {
      const refMatch = query.match(/^([1-3]?\s*\w+)\s+(\d+):(\d+)(?:-(\d+))?$/i);
      if (refMatch) {
        const bookName = refMatch[1].trim();
        const chapter = refMatch[2];
        const startVerse = refMatch[3];
        const endVerse = refMatch[4] || startVerse;
        
        const url = `https://api.scripture.api.bible/v1/bibles/06125adad2d5898a-01/search?query=${encodeURIComponent(query)}&limit=5`;
        const response = await fetch(url, { headers: { 'api-key': bibleApiKey } });
        const data = await response.json();
        
        if (data.data?.verses) {
          results = data.data.verses.map(v => ({
            reference: v.reference,
            text: v.text,
            verseId: v.id,
            type: 'reference'
          }));
        }
      }
    }

    if ((searchType === 'keyword' || searchType === 'both') && results.length < 5) {
      const url = `https://api.scripture.api.bible/v1/bibles/06125adad2d5898a-01/search?query=${encodeURIComponent(query)}&limit=${5 - results.length}`;
      const response = await fetch(url, { headers: { 'api-key': bibleApiKey } });
      const data = await response.json();
      
      if (data.data?.verses) {
        const keywordResults = data.data.verses.map(v => ({
          reference: v.reference,
          text: v.text,
          verseId: v.id,
          type: 'keyword'
        }));
        results = [...results, ...keywordResults].slice(0, 5);
      }
    }

    return Response.json({ verses: results });
  } catch (error) {
    console.error('Verse search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});