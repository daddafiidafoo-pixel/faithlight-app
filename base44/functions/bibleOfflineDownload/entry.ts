/**
 * bibleOfflineDownload
 * Backend endpoint that validates offlineAllowed before serving chapter data.
 * Gate B (server-side): rejects requests for versions where offlineAllowed=false,
 * even if the UI somehow bypassed Gate A.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Inline bootstrap catalog for server-side gate check (must stay in sync with getBibleCatalog)
const OFFLINE_ALLOWED_VERSIONS = {
  en_web: { textFilesetId: 'ENGWEBN2ET', title: 'World English Bible (WEB)', license: 'public-domain' },
  en_kjv: { textFilesetId: 'ENGKJVN2ET', title: 'King James Version (KJV)', license: 'public-domain' },
  // Add additional public-domain versions here as they are confirmed
};

const BIBLE_BRAIN_API = 'https://4.dbt.io/api';

Deno.serve(async (req) => {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...corsHeaders, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    const base44 = createClientFromRequest(req);
    // Require authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required to download.' }, { status: 401, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const { versionId, bookId, chapter } = body;

    if (!versionId || !bookId || !chapter) {
      return Response.json({ error: 'Missing versionId, bookId, or chapter.' }, { status: 400, headers: corsHeaders });
    }

    // ── Gate B: Server-side license check ───────────────────────────────────
    const allowed = OFFLINE_ALLOWED_VERSIONS[versionId];
    if (!allowed) {
      console.warn(`Offline download blocked for version: ${versionId}`);
      return Response.json(
        { error: 'This version is not licensed for offline download. Only public-domain versions (WEB, KJV) can be saved offline.' },
        { status: 403, headers: corsHeaders }
      );
    }

    // ── Fetch chapter from BibleBrain ────────────────────────────────────────
    const key = Deno.env.get('BIBLE_BRAIN_KEY');
    if (!key) {
      return Response.json({ error: 'Bible Brain API not configured.' }, { status: 503, headers: corsHeaders });
    }

    const url = `${BIBLE_BRAIN_API}/bibles/filesets/${encodeURIComponent(allowed.textFilesetId)}/${encodeURIComponent(bookId)}/${chapter}?v=4&key=${encodeURIComponent(key)}`;
    const bbRes = await fetch(url);
    if (!bbRes.ok) {
      console.error(`BibleBrain error ${bbRes.status} for ${versionId} ${bookId} ${chapter}`);
      return Response.json({ error: 'Failed to fetch chapter from Bible Brain.' }, { status: 502, headers: corsHeaders });
    }

    const data = await bbRes.json();
    const rawVerses = Array.isArray(data?.data) ? data.data : [];
    if (!rawVerses.length) {
      return Response.json({ error: 'Chapter not found or no verses returned.' }, { status: 404, headers: corsHeaders });
    }

    const verses = rawVerses.map(v => ({
      verse: v.verse_start ?? v.verse,
      text:  v.verse_text ?? v.text ?? '',
    }));

    // Return the chapter data — frontend saves it to IndexedDB via offlineBibleManager
    return Response.json({
      versionId,
      bookId,
      chapter: Number(chapter),
      verses,
      title: allowed.title,
      license: allowed.license,
      savedAt: new Date().toISOString(),
    }, { headers: corsHeaders });

  } catch (err) {
    console.error('bibleOfflineDownload error:', err);
    return Response.json({ error: err.message || 'Internal server error.' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } });
  }
});