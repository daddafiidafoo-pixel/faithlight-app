/**
 * Returns a verse for a requested language, falling back through the chain.
 * Never silently returns English under a non-English label — is_fallback is always set.
 *
 * Payload: { verse_id: "JHN.3.16", language_code: "om" }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const FALLBACK_CHAINS = {
  en: ['en'],
  om: ['om', 'am', 'en'],
  am: ['am', 'en'],
  fr: ['fr', 'en'],
  sw: ['sw', 'en'],
  ar: ['ar', 'en'],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { verse_id, language_code } = await req.json();

    if (!verse_id || !language_code) {
      return Response.json({ error: 'verse_id and language_code are required' }, { status: 400 });
    }

    const chain = FALLBACK_CHAINS[language_code] || [language_code, 'en'];

    for (const lang of chain) {
      const rows = await base44.asServiceRole.entities.StructuredBibleVerse
        .filter({ verse_id, language_code: lang }, 'verse_id', 1)
        .catch(() => []);

      if (rows?.length) {
        return Response.json({
          success: true,
          requested_language: language_code,
          actual_language: lang,
          is_fallback: lang !== language_code,
          verse: rows[0],
        });
      }
    }

    return Response.json({
      success: false,
      requested_language: language_code,
      error: 'VERSE_NOT_FOUND_IN_FALLBACK_CHAIN',
    }, { status: 404 });
  } catch (error) {
    console.error('[getVerseWithFallback]', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
});