/**
 * Admin audit: returns verse count per language and sync status.
 * Use this to determine which languages are launch-ready vs. coming soon.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const TARGET_LANGUAGES = ['en', 'om', 'am', 'fr', 'sw', 'ar'];

const LANGUAGE_LABELS = {
  en: 'English', om: 'Afaan Oromoo', am: 'Amharic',
  fr: 'French',  sw: 'Kiswahili',   ar: 'Arabic',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const report = [];

    for (const lang of TARGET_LANGUAGES) {
      // Count verses (cap at 5000 for performance)
      const verses = await base44.asServiceRole.entities.StructuredBibleVerse
        .filter({ language_code: lang }, '-created_date', 5000)
        .catch(() => []);

      // Fetch latest sync status
      const syncRows = await base44.asServiceRole.entities.BibleSyncStatus
        .filter({ language_code: lang }, '-created_date', 1)
        .catch(() => []);

      const sync = syncRows?.[0] || null;

      report.push({
        language_code: lang,
        label: LANGUAGE_LABELS[lang] || lang,
        verse_count: verses?.length || 0,
        ready: (verses?.length || 0) > 0,
        sync_status: sync?.sync_status || 'never_run',
        last_synced_at: sync?.last_synced_at || null,
        last_success_at: sync?.last_success_at || null,
        last_error: sync?.last_error || null,
        bible_id: sync?.bible_id || null,
      });
    }

    const totalReady = report.filter(r => r.ready).length;

    return Response.json({
      success: true,
      total_languages: TARGET_LANGUAGES.length,
      languages_ready: totalReady,
      report,
    });
  } catch (error) {
    console.error('[auditBibleCoverage]', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
});