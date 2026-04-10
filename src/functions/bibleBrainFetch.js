/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Fetch Bible text from CDN
 * Supports Oromo (hae/gaz), English, and other languages via Bible Brain CDN
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { filesetId, bookId, chapter } = await req.json();

    if (!filesetId || !bookId || !chapter) {
      return Response.json({ error: 'Missing params' }, { status: 400 });
    }

    // Strip "-json" suffix if present for CDN paths
    const baseFilesetId = filesetId.replace(/-json$/, '');
    
    // CDN chapter file format: BBOOKKK_CCC.json or similar
    // Example: HAEBSEN_ET-json for book, then 040MAT_001.json for chapter
    const chapterCode = String(chapter).padStart(3, '0');
    const cdnPath = `https://d1gd73roq7kqw6.cloudfront.net/text/${baseFilesetId}/${bookId.padStart(2, '0')}${bookId}_${chapterCode}.json`;
    
    console.log(`Fetching from CDN: ${cdnPath}`);
    
    const resp = await fetch(cdnPath);
    if (!resp.ok) {
      console.error(`CDN error: ${resp.status}`);
      return Response.json({ error: `Chapter not found` }, { status: 404 });
    }

    const data = await resp.json();
    console.log(`CDN response loaded for ${bookId} ch ${chapter}`);
    
    // Extract verses from CDN JSON
    // CDN returns { data: { verses: [...] } } or similar structure
    let verses = data?.data?.verses || data?.verses || [];
    
    // If still empty, try getting from different possible structures
    if (!verses.length && data && typeof data === 'object') {
      const keys = Object.keys(data);
      for (const key of keys) {
        if (Array.isArray(data[key])) {
          verses = data[key];
          break;
        } else if (data[key]?.verses && Array.isArray(data[key].verses)) {
          verses = data[key].verses;
          break;
        }
      }
    }
    
    // Normalize to standard format
    const standardVerses = (verses || []).map(v => ({
      verse: v.verse || v.verse_number || v.verseNum || 0,
      text: v.text || v.verse_text || v.content || ''
    })).filter(v => v.verse && v.text);
    
    if (!standardVerses.length) {
      console.error(`No verses found in CDN response for ${bookId} ${chapter}`);
      return Response.json({ error: 'No verses found' }, { status: 404 });
    }
    
    return Response.json({ data: { verses: standardVerses } });
  } catch (error) {
    console.error('bibleBrainFetch error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});