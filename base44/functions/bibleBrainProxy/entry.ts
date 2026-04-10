/**
 * Bible Brain Proxy
 * Backend proxy for Bible Brain API
 * - Hides API keys
 * - Validates requests
 * - Caches responses
 * - Normalizes data
 */

const BIBLE_BRAIN_API = 'https://4.dbt.io/api';
const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

// In-memory cache (simple; upgrade to Redis for production)
const cache = new Map();

/**
 * Get cache key
 */
function getCacheKey(versionId, book, chapter) {
  return `${versionId}_${book}_${chapter}`;
}

/**
 * Get from cache if exists and not expired
 */
function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const age = Math.floor(Date.now() / 1000) - entry.timestamp;
  if (age > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

/**
 * Save to cache
 */
function saveToCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Math.floor(Date.now() / 1000),
  });
}

/**
 * Normalize book name for Bible Brain API
 * Bible Brain uses specific IDs - map common names to them
 */
function normalizeBookName(bookName) {
  const bookMap = {
    'Genesis': 'GEN',
    'Exodus': 'EXO',
    'Leviticus': 'LEV',
    'Numbers': 'NUM',
    'Deuteronomy': 'DEU',
    'Joshua': 'JOS',
    'Judges': 'JDG',
    'Ruth': 'RUT',
    '1 Samuel': '1SA',
    '2 Samuel': '2SA',
    '1 Kings': '1KI',
    '2 Kings': '2KI',
    '1 Chronicles': '1CH',
    '2 Chronicles': '2CH',
    'Ezra': 'EZR',
    'Nehemiah': 'NEH',
    'Esther': 'EST',
    'Job': 'JOB',
    'Psalm': 'PSA',
    'Proverbs': 'PRO',
    'Ecclesiastes': 'ECC',
    'Song of Songs': 'SNG',
    'Isaiah': 'ISA',
    'Jeremiah': 'JER',
    'Lamentations': 'LAM',
    'Ezekiel': 'EZK',
    'Daniel': 'DAN',
    'Hosea': 'HOS',
    'Joel': 'JOL',
    'Amos': 'AMO',
    'Obadiah': 'OBA',
    'Jonah': 'JON',
    'Micah': 'MIC',
    'Nahum': 'NAH',
    'Habakkuk': 'HAB',
    'Zephaniah': 'ZEP',
    'Haggai': 'HAG',
    'Zechariah': 'ZEC',
    'Malachi': 'MAL',
    'Matthew': 'MAT',
    'Mark': 'MRK',
    'Luke': 'LUK',
    'John': 'JHN',
    'Acts': 'ACT',
    'Romans': 'ROM',
    '1 Corinthians': '1CO',
    '2 Corinthians': '2CO',
    'Galatians': 'GAL',
    'Ephesians': 'EPH',
    'Philippians': 'PHP',
    'Colossians': 'COL',
    '1 Thessalonians': '1TH',
    '2 Thessalonians': '2TH',
    '1 Timothy': '1TI',
    '2 Timothy': '2TI',
    'Titus': 'TIT',
    'Philemon': 'PHM',
    'Hebrews': 'HEB',
    'James': 'JAS',
    '1 Peter': '1PE',
    '2 Peter': '2PE',
    '1 John': '1JN',
    '2 John': '2JN',
    '3 John': '3JN',
    'Jude': 'JUD',
    'Revelation': 'REV',
  };
  
  return bookMap[bookName] || bookName.toUpperCase();
}

/**
 * Fetch text from Bible Brain
 */
async function fetchTextFromBibleBrain(versionId, bookId, chapter) {
  const key = Deno.env.get('BIBLE_BRAIN_KEY');
  if (!key) {
    console.error('BIBLE_BRAIN_KEY not set');
    return null;
  }

  try {
    const url = `${BIBLE_BRAIN_API}/bibles/filesets/${encodeURIComponent(versionId)}/${encodeURIComponent(bookId)}/${chapter}?v=4&key=${encodeURIComponent(key)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Bible Brain API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('Bible Brain text response keys:', Object.keys(data));

    // DBP v4 fileset text endpoint returns data as array of verse objects
    const rawVerses = Array.isArray(data?.data) ? data.data : data?.data?.verses;
    if (!rawVerses || !rawVerses.length) {
      console.warn('No verses in Bible Brain response:', JSON.stringify(data).slice(0, 300));
      return null;
    }

    // Normalize verses format — DBP v4 fields
    const verses = rawVerses.map(v => ({
      verse: v.verse_start ?? v.verse,
      end_verse: v.verse_end ?? v.verse_start ?? v.verse,
      text: v.verse_text ?? v.text ?? '',
      book: v.book_name ?? v.book ?? '',
      chapter: v.chapter_start ?? v.chapter ?? chapter,
    }));

    return verses;
  } catch (error) {
    console.error('Bible Brain text fetch error:', error.message);
    return null;
  }
}

/**
 * Fetch audio URL from Bible Brain (DBP v4 fileset audio endpoint)
 */
async function fetchAudioFromBibleBrain(filesetId, bookId, chapter) {
  const key = Deno.env.get('BIBLE_BRAIN_KEY');
  if (!key) return null;

  try {
    const url = `${BIBLE_BRAIN_API}/bibles/filesets/${encodeURIComponent(filesetId)}/${encodeURIComponent(bookId)}/${chapter}?v=4&key=${encodeURIComponent(key)}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Bible Brain audio ${response.status}`);
      return null;
    }
    const data = await response.json();
    const files = Array.isArray(data?.data) ? data.data : [];
    // DBP returns a list of files per chapter; first one is the chapter audio
    if (!files.length) return null;
    return {
      url: files[0].path ?? null,
      duration: files[0].duration ?? null,
      codec: files[0].codec ?? 'mp3',
    };
  } catch (error) {
    console.error('Bible Brain audio fetch error:', error.message);
    return null;
  }
}

/**
 * List available bibles/filesets for a language code (ISO 639-3)
 */
async function listBiblesForLanguage(langCode) {
  const key = Deno.env.get('BIBLE_BRAIN_KEY');
  if (!key) return null;

  try {
    const url = `${BIBLE_BRAIN_API}/bibles?language_code=${encodeURIComponent(langCode)}&v=4&key=${encodeURIComponent(key)}`;
    const r = await fetch(url);
    if (!r.ok) {
      console.warn(`DBP list bibles ${r.status} for lang=${langCode}`);
      return null;
    }
    return await r.json();
  } catch (e) {
    console.error('DBP listBibles error:', e.message);
    return null;
  }
}

/**
 * Main handler
 */
Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    // Check API key early
    if (!Deno.env.get('BIBLE_BRAIN_KEY')) {
      return Response.json(
        { error: 'BIBLE_BRAIN_KEY not configured', setup_needed: true },
        { status: 503, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Support both JSON body (SDK invoke) and query params
    let action = 'text', versionId, book, chapter, langCode;
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      action    = body.action    || 'text';
      versionId = body.versionId;
      book      = body.book;
      chapter   = body.chapter;
      langCode  = body.langCode;
    } else {
      const params = new URLSearchParams(new URL(req.url).search);
      action    = params.get('action') || 'text';
      versionId = params.get('versionId');
      book      = params.get('book');
      chapter   = params.get('chapter');
      langCode  = params.get('langCode');
    }

    // ── Action: list bibles for a language ──────────────────────────────────
    if (action === 'list') {
      if (!langCode) {
        return Response.json({ error: 'Missing langCode' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
      const result = await listBiblesForLanguage(langCode);
      return Response.json(result, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // ── Action: audio ───────────────────────────────────────────────────────
    if (action === 'audio') {
      if (!versionId || !book || !chapter) {
        return Response.json({ error: 'Missing versionId, book, or chapter' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
      const bookId = normalizeBookName(book);
      const chapterNum = parseInt(chapter);
      const audio = await fetchAudioFromBibleBrain(versionId, bookId, chapterNum);
      return Response.json({ data: { audio } }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // ── Action: text (default) ───────────────────────────────────────────────
    if (!versionId || !book || !chapter) {
      return Response.json(
        { error: 'Missing versionId, book, or chapter' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const bookId = normalizeBookName(book);
    const chapterNum = parseInt(chapter);

    // Check cache
    const cacheKey = getCacheKey(versionId, book, chapterNum);
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${cacheKey}`);
      return Response.json(
        { data: { verses: cached, fromCache: true } },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Fetch text from Bible Brain (DBP v4)
    const verses = await fetchTextFromBibleBrain(versionId, bookId, chapterNum);
    
    if (!verses) {
      console.warn(`No verses found: ${versionId} ${book} ${chapter}`);
      return Response.json(
        { error: 'Chapter not found', hint: 'Check fileset ID — use action=list&langCode=xxx to discover IDs' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    saveToCache(cacheKey, verses);

    return Response.json(
      { data: { verses, versionId, book, chapter: chapterNum } },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Bible Brain proxy error:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
});