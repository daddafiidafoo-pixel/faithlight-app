/**
 * Import licensed Bible verses into StructuredBibleVerse entity.
 * 
 * Called by admins to bulk-import verified, licensed Bible text.
 * NEVER used for AI-generated text — this is for official datasets only.
 * 
 * POST payload:
 *   {
 *     translation_abbrev: "MQ",
 *     translation_id: "<BibleTranslation record id>",
 *     verses: [
 *       { book_order: 1, book_name: "Uumama", chapter: 1, verse: 1, text: "..." },
 *       ...
 *     ]
 *   }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { translation_abbrev, translation_id, verses } = body;

    if (!translation_abbrev || !translation_id || !Array.isArray(verses) || verses.length === 0) {
      return Response.json({ error: 'translation_abbrev, translation_id, and verses[] are required' }, { status: 400 });
    }

    // Confirm translation exists and is official
    const trans = await base44.asServiceRole.entities.BibleTranslation.filter({ abbrev: translation_abbrev });
    if (!trans || trans.length === 0) {
      return Response.json({ error: `Translation "${translation_abbrev}" not found in BibleTranslation table` }, { status: 404 });
    }
    if (!trans[0].is_official) {
      return Response.json({ error: 'Only officially licensed translations can be imported' }, { status: 403 });
    }

    // Bulk insert in chunks
    const CHUNK_SIZE = 100;
    let imported = 0;
    for (let i = 0; i < verses.length; i += CHUNK_SIZE) {
      const chunk = verses.slice(i, i + CHUNK_SIZE).map(v => ({
        translation_id,
        translation_abbrev,
        book_order: v.book_order,
        book_name: v.book_name || '',
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
      }));
      await base44.asServiceRole.entities.StructuredBibleVerse.bulkCreate(chunk);
      imported += chunk.length;
    }

    return Response.json({ message: `Imported ${imported} verses for ${translation_abbrev}` });
  } catch (error) {
    console.error('importBibleTranslation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});