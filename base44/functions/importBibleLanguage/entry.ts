import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Generic Bible language importer
 * 
 * Accepts a payload with:
 * {
 *   language_code: "om",
 *   verses: [ {...verse objects...} ]
 * }
 * 
 * Verse object schema:
 * {
 *   language_code: "om",
 *   book_id: "GEN",
 *   book_name: "Umuma",
 *   chapter: 1,
 *   verse: 1,
 *   text: "Umuma jalqaba, Waaqayyoon..."
 * }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can import
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { language_code, verses } = await req.json();

    if (!language_code || !verses || !Array.isArray(verses)) {
      return Response.json(
        { error: 'Missing language_code or verses array' },
        { status: 400 }
      );
    }

    if (verses.length === 0) {
      return Response.json(
        { error: 'verses array is empty' },
        { status: 400 }
      );
    }

    console.log(`Starting import for ${language_code}: ${verses.length} verses`);

    // Validate schema on sample verses
    const sample = verses[0];
    const requiredFields = ['language_code', 'book_id', 'chapter', 'verse', 'text'];
    const missing = requiredFields.filter(f => !(f in sample));
    if (missing.length > 0) {
      return Response.json(
        { error: `Invalid schema. Missing fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if language already exists
    const existing = await base44.asServiceRole.entities.BibleVerseText.filter({
      language_code,
    }, null, 1);

    if (existing && existing.length > 0) {
      return Response.json(
        {
          error: `${language_code} already exists with ${existing.length} verses. Delete first or use update endpoint.`,
        },
        { status: 409 }
      );
    }

    // Batch import in chunks (API limits)
    const BATCH_SIZE = 1000;
    let imported = 0;
    let failed = 0;

    for (let i = 0; i < verses.length; i += BATCH_SIZE) {
      const batch = verses.slice(i, i + BATCH_SIZE);
      try {
        const result = await base44.asServiceRole.entities.BibleVerseText.bulkCreate(batch);
        imported += result.length || batch.length;
        console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: imported ${result.length || batch.length} verses`);
      } catch (err) {
        console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, err.message);
        failed += batch.length;
      }
    }

    const summary = {
      language_code,
      imported,
      failed,
      total: verses.length,
      success: failed === 0,
      nextStep: failed === 0
        ? `Run: base44.functions.invoke('validateBibleLanguageReadiness', { language_code: '${language_code}' })`
        : `Review failures and retry`,
    };

    console.log('Import summary:', summary);
    return Response.json(summary);
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});