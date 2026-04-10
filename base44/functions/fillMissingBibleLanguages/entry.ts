/**
 * Checks which languages have no verses yet and triggers sync only for those.
 * Safe to call on deploy or on a weekly schedule — skips languages already present.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const TARGET_LANGUAGES = ['en', 'om', 'am', 'fr', 'sw', 'ar'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const results = [];

    for (const lang of TARGET_LANGUAGES) {
      const existing = await base44.asServiceRole.entities.StructuredBibleVerse
        .filter({ language_code: lang }, '-created_date', 1)
        .catch(() => []);

      if (existing?.length) {
        results.push({ lang, status: 'already_present' });
        console.log(`[fillMissingBibleLanguages] ${lang}: already present, skipping`);
        continue;
      }

      // Trigger sync for this language via the syncAllBibles function
      console.log(`[fillMissingBibleLanguages] ${lang}: missing — triggering sync`);
      const syncResult = await base44.asServiceRole.functions.invoke('syncAllBibles', { lang });
      results.push({ lang, status: 'synced', result: syncResult });
    }

    return Response.json({ success: true, results });
  } catch (error) {
    console.error('[fillMissingBibleLanguages]', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
});