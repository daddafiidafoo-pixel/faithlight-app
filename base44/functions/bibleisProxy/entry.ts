import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const API_BASE = 'https://4.dbt.io/api';
const API_KEY = Deno.env.get('BIBLEIS_API_KEY') || '';

const TIMEOUT_MS = 12000; // 12 second timeout

// Language code → Bible.is language code mapping for common languages
const LANG_MAP = {
  en: 'ENG', om: 'GAZ', am: 'AMH', fr: 'FRN', ar: 'ARB', fa: 'PES',
  ur: 'URD', es: 'SPA', pt: 'POR', de: 'DEU', it: 'ITA', nl: 'NLD',
  sv: 'SWE', no: 'NOR', da: 'DAN', fi: 'FIN', pl: 'POL', cs: 'CES',
  ro: 'RON', hu: 'HUN', el: 'ELL', ru: 'RUS', uk: 'UKR', tr: 'TUR',
  hi: 'HIN', bn: 'BEN', ta: 'TAM', te: 'TEL', id: 'IND', sw: 'SWA',
};

async function apiFetch(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set('v', '4');
  url.searchParams.set('key', API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) throw new Error(`Bible.is API error: ${res.status} ${res.statusText}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Guard: API key must be configured
  if (!API_KEY) {
    console.error('bibleisProxy: BIBLEIS_API_KEY is not set.');
    return Response.json({
      success: false,
      error: 'missing_api_key',
      message: 'Bible.is API key is not configured. Add BIBLEIS_API_KEY in Dashboard → Settings → Environment Variables.',
    }, { status: 503 });
  }

  const body = await req.json();
  const { action, lang, fileset_id, book_id, chapter } = body;

  try {
    // ── 1. Get available audio filesets for a language ──────────────────────
    if (action === 'get_filesets') {
      const isoCode = LANG_MAP[lang] || lang?.toUpperCase();
      const data = await apiFetch('/bibles', { language_code: isoCode, media: 'audio' });
      const bibles = data?.data || [];
      // Extract filesets that have audio
      const filesets = [];
      for (const bible of bibles) {
        for (const fs of (bible.filesets || [])) {
          if (fs.type?.startsWith('audio')) {
            filesets.push({
              fileset_id: fs.id,
              type: fs.type,
              size: fs.size,
              bible_id: bible.abbr,
              bible_name: bible.name,
              language: bible.language,
            });
          }
        }
      }
      return Response.json({ filesets, lang_code: isoCode });
    }

    // ── 2. Get books for a fileset ───────────────────────────────────────────
    if (action === 'get_books') {
      const data = await apiFetch(`/bibles/filesets/${fileset_id}/books`);
      return Response.json({ books: data?.data || [] });
    }

    // ── 3. Get chapters for a book ───────────────────────────────────────────
    if (action === 'get_chapters') {
      const data = await apiFetch(`/bibles/filesets/${fileset_id}/${book_id}`);
      return Response.json({ chapters: data?.data || [] });
    }

    // ── 4. Get audio URL for a specific chapter ──────────────────────────────
    if (action === 'get_chapter_audio') {
      const data = await apiFetch(`/bibles/filesets/${fileset_id}/${book_id}/${chapter}`);
      const files = data?.data || [];
      // Each item has a path (streamable URL) and verse info
      return Response.json({ files });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    console.error('bibleisProxy error:', err.message);
    return Response.json({
      success: false,
      error: isTimeout ? 'timeout' : 'api_error',
      message: isTimeout
        ? 'Audio Bible request timed out. Please try again.'
        : 'Audio Bible is temporarily unavailable. Please try again later.',
    }, { status: 503 });
  }
});