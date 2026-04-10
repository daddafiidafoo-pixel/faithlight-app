/**
 * Admin-only trigger to sync all supported Bible languages from Bible Brain.
 * Run manually from admin page or schedule weekly.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const API_BASE = Deno.env.get('BIBLE_BRAIN_BASE_URL') || 'https://4.dbt.io/api';
const API_KEY = Deno.env.get('BIBLE_BRAIN_API_KEY') || '';

// ── Language config ───────────────────────────────────────────────────────────
const BIBLE_LANGUAGE_CONFIG = {
  en: { code: 'en', label: 'English',      rtl: false, fallbackChain: ['en'],           preferredBibleIds: ['ENGESV', 'ENGKJV', 'ENGNIV'] },
  om: { code: 'om', label: 'Afaan Oromoo', rtl: false, fallbackChain: ['om', 'am', 'en'], preferredBibleIds: ['ORMWHM'] },
  am: { code: 'am', label: 'Amharic',      rtl: false, fallbackChain: ['am', 'en'],      preferredBibleIds: ['AMHNIV'] },
  fr: { code: 'fr', label: 'French',       rtl: false, fallbackChain: ['fr', 'en'],      preferredBibleIds: ['FRALSG'] },
  sw: { code: 'sw', label: 'Kiswahili',    rtl: false, fallbackChain: ['sw', 'en'],      preferredBibleIds: ['SWHNEN'] },
  ar: { code: 'ar', label: 'Arabic',       rtl: true,  fallbackChain: ['ar', 'en'],      preferredBibleIds: ['ARBVDV'] },
};

const TARGET_LANGUAGES = ['en', 'om', 'am', 'fr', 'sw', 'ar'];

// ── Bible Brain client ────────────────────────────────────────────────────────
function bbHeaders() {
  return { accept: 'application/json', 'x-api-key': API_KEY };
}

async function bbFetch(path, params = {}) {
  if (!API_KEY) throw new Error('Missing BIBLE_BRAIN_API_KEY');
  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && `${value}` !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  const res = await fetch(url.toString(), { headers: bbHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Bible Brain ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

// ── Resolve Bible + fileset for a language ────────────────────────────────────
async function resolveBibleForLanguage(lang) {
  const preferredBibleIds = BIBLE_LANGUAGE_CONFIG[lang].preferredBibleIds;

  const available = await bbFetch('/bibles', {
    language_code: preferredBibleIds[0]?.slice(0, 3),
  }).catch(() => ({ data: [] }));

  const items = Array.isArray(available?.data) ? available.data : [];

  for (const bibleId of preferredBibleIds) {
    const match = items.find((b) => b?.bibleId === bibleId);
    if (!match) continue;

    let filesetId = null;
    try {
      const filesets = await bbFetch(`/bibles/${bibleId}/filesets`);
      const fsItems = Array.isArray(filesets?.data) ? filesets.data : [];
      const textFileset = fsItems.find((fs) => {
        const media = String(fs?.media_type || fs?.mediaType || '').toLowerCase();
        return media.includes('text') || media === 'text_plain' || media === 'text_format';
      });
      filesetId = textFileset?.id || textFileset?.filesetId || null;
    } catch {
      filesetId = null;
    }

    return { language_code: lang, bible_id: bibleId, fileset_id: filesetId };
  }

  return null;
}

// ── Upsert helpers ────────────────────────────────────────────────────────────
async function upsertStructuredVerse(base44, row) {
  const existing = await base44.asServiceRole.entities.StructuredBibleVerse
    .filter({ verse_id: row.verse_id, language_code: row.language_code }, 'verse_id', 1)
    .catch(() => []);
  if (existing?.length) {
    return base44.asServiceRole.entities.StructuredBibleVerse.update(existing[0].id, row);
  }
  try {
    return await base44.asServiceRole.entities.StructuredBibleVerse.create(row);
  } catch (err) {
    if (err?.message?.includes('duplicate')) return null;
    throw err;
  }
}

async function upsertBibleBook(base44, row) {
  const existing = await base44.asServiceRole.entities.BibleBook
    .filter({ book_key: row.book_key, language_code: row.language_code }, 'book_key', 1)
    .catch(() => []);
  if (existing?.length) {
    return base44.asServiceRole.entities.BibleBook.update(existing[0].id, row);
  }
  try {
    return await base44.asServiceRole.entities.BibleBook.create(row);
  } catch (err) {
    if (err?.message?.includes('duplicate')) return null;
    throw err;
  }
}

async function upsertSyncStatus(base44, row) {
  const existing = await base44.asServiceRole.entities.BibleSyncStatus
    .filter({ language_code: row.language_code }, '-created_date', 1)
    .catch(() => []);
  if (existing?.length) {
    return base44.asServiceRole.entities.BibleSyncStatus.update(existing[0].id, row);
  }
  return base44.asServiceRole.entities.BibleSyncStatus.create(row);
}

// ── Sync one language ─────────────────────────────────────────────────────────
async function syncBibleLanguage(base44, lang) {
  console.log(`[syncAllBibles] Starting sync for: ${lang}`);

  const resolved = await resolveBibleForLanguage(lang).catch(() => null);
  if (!resolved) {
    await upsertSyncStatus(base44, {
      language_code: lang, bible_id: '', fileset_id: null,
      sync_status: 'failed', last_error: 'No Bible/fileset resolved for language',
      last_synced_at: new Date().toISOString(),
    });
    return { success: false, lang, message: `No Bible found for ${lang}` };
  }

  try {
    const booksPayload = await bbFetch(`/bibles/${resolved.bible_id}/books`, {
      fileset_id: resolved.fileset_id || undefined,
    });
    const books = Array.isArray(booksPayload?.data) ? booksPayload.data : [];

    let versesUpserted = 0;

    for (const book of books) {
      const bookKey = book.bookId || book.book_id || book.usfm || book.id;
      const bookName = book.name || book.bookName || book.title || bookKey;

      await upsertBibleBook(base44, {
        book_key: bookKey, name: bookName,
        language_code: lang, source: 'bible_brain',
      });

      const chapters = Number(book.chapters || book.numChapters || 0);
      for (let chapter = 1; chapter <= chapters; chapter++) {
        const chapterPayload = await bbFetch(
          `/bibles/${resolved.bible_id}/chapters/${bookKey}/${chapter}`,
          { fileset_id: resolved.fileset_id || undefined }
        ).catch(() => null);

        if (!chapterPayload) continue;

        const verseItems =
          Array.isArray(chapterPayload?.data?.verses) ? chapterPayload.data.verses :
          Array.isArray(chapterPayload?.data?.items) ? chapterPayload.data.items : [];

        for (const item of verseItems) {
          const verseNo = Number(item.verse || item.verse_start);
          const text = String(item.content || item.text || '').trim();
          if (!verseNo || !text) continue;

          await upsertStructuredVerse(base44, {
            verse_id: `${bookKey}.${chapter}.${verseNo}`,
            book_key: bookKey, chapter, verse: verseNo,
            reference: `${bookName} ${chapter}:${verseNo}`,
            text, language_code: lang,
            bible_id: resolved.bible_id,
            fileset_id: resolved.fileset_id,
            source: 'bible_brain', is_fallback: false,
          });
          versesUpserted++;
        }
      }
    }

    await upsertSyncStatus(base44, {
      language_code: lang, bible_id: resolved.bible_id,
      fileset_id: resolved.fileset_id, sync_status: 'success',
      last_success_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(), last_error: '',
    });

    console.log(`[syncAllBibles] ${lang} done — ${versesUpserted} verses upserted`);
    return { success: true, lang, bible_id: resolved.bible_id, verses_upserted: versesUpserted };
  } catch (error) {
    console.error(`[syncAllBibles] ${lang} failed:`, error?.message);
    await upsertSyncStatus(base44, {
      language_code: lang, bible_id: resolved.bible_id,
      fileset_id: resolved.fileset_id, sync_status: 'failed',
      last_synced_at: new Date().toISOString(),
      last_error: error?.message || 'Unknown sync error',
    });
    return { success: false, lang, error: error?.message };
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Parse optional ?lang= param to sync a single language
    const url = new URL(req.url);
    const singleLang = url.searchParams.get('lang');
    const langs = singleLang ? [singleLang] : TARGET_LANGUAGES;

    const results = [];
    for (const lang of langs) {
      results.push(await syncBibleLanguage(base44, lang));
    }

    return Response.json({ success: true, results });
  } catch (error) {
    console.error('[syncAllBibles]', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
});