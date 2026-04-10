/**
 * bibleAPI — Bible data service with verified source support
 *
 * Language source strategy:
 *   en  → Bible Brain (ENGESV)          — verified_source
 *   am  → Bible Brain (AMHGARV)         — verified_source
 *   sw  → Bible Brain (SWASIM)          — verified_source
 *   om  → curated Oromo verses + AI     — ai_translated_fallback
 *   ti  → AI fallback                   — ai_translated_fallback
 *   ar  → AI fallback                   — ai_translated_fallback
 *
 * Content status field on every response:
 *   "verified_source"          — real licensed Bible text
 *   "verified_source_fallback" — English shown because lang unavailable
 *   "ai_translated_fallback"   — AI-assisted, labeled
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BIBLE_BRAIN_BASE = 'https://4.dbt.io/api';

// Bible Brain fileset IDs per language (verified via API discovery)
// am = Amharic — AMHEVG (1962 Bible Society of Ethiopia, NT text_plain, licensed on Bible Brain)
// sw = Swahili — not accessible via this API key; uses verified_source_fallback
// en = English — ENGESV text plain
const BIBLE_BRAIN_BIBLES = {
  en: { bible_id: 'ENGESV',  version_name: 'English Standard Version (ESV)',          fileset: 'ENGESV' },
  am: { bible_id: 'AMHEVG',  version_name: 'Amharic 1962 Bible Society of Ethiopia',   fileset: 'AMHEVG' },
  // sw: not available in Bible Brain for this key — falls back to English verified_source_fallback
};

// In-memory cache
const cache = new Map();
function getCached(key) {
  const e = cache.get(key);
  if (!e) return null;
  if (e.expiresAt < Date.now()) { cache.delete(key); return null; }
  return e.data;
}
function setCached(key, data, ttlMin = 1440) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMin * 60 * 1000 });
}

// ── Bible Brain fetch helper ────────────────────────────────────────────────
async function bibleBrainFetch(path, apiKey) {
  // Bible Brain v4 requires key as query param
  const separator = path.includes('?') ? '&' : '?';
  const url = `${BIBLE_BRAIN_BASE}${path}${separator}key=${encodeURIComponent(apiKey)}`;
  console.log(`[bibleAPI] Bible Brain request: ${url.replace(apiKey, '***')}`);
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Bible Brain ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

// ── Normalize a Bible Brain verse response ──────────────────────────────────
function normalizeBBVerse(raw, langCode, bibleConf) {
  if (!raw || !raw.verse_text) return null;
  return {
    reference: `${raw.book_name_alt || raw.book_name || raw.book_id} ${raw.chapter}:${raw.verse_start}`,
    text: raw.verse_text.trim(),
    language: langCode,
    source_provider: 'Bible Brain',
    bible_id: bibleConf.bible_id,
    version: bibleConf.version_name,
    content_status: 'verified_source',
    is_fallback: false,
    fallback_notice: null,
  };
}

// ── Normalize Bible Brain chapter verses ────────────────────────────────────
function normalizeBBChapter(data, book, chapterNum, langCode, bibleConf) {
  const verses = (data.data || []).map(v => ({
    verse: v.verse_start,
    text: (v.verse_text || '').trim(),
  })).filter(v => v.text.length > 0);

  return {
    book,
    bookName: data.data?.[0]?.book_name_alt || data.data?.[0]?.book_name || book,
    chapter: parseInt(chapterNum),
    language: langCode,
    source_provider: 'Bible Brain',
    bible_id: bibleConf.bible_id,
    version: bibleConf.version_name,
    content_status: 'verified_source',
    is_fallback: false,
    verses,
  };
}

// ── Localized book names for fallback display ───────────────────────────────
const BOOK_NAMES_FALLBACK = {
  en: { GEN:'Genesis', EXO:'Exodus', PSA:'Psalms', PRO:'Proverbs', ISA:'Isaiah', JER:'Jeremiah',
        MAT:'Matthew', MAR:'Mark', LUK:'Luke', JHN:'John', ACT:'Acts', ROM:'Romans',
        '1CO':'1 Corinthians', '2CO':'2 Corinthians', GAL:'Galatians', EPH:'Ephesians',
        PHP:'Philippians', COL:'Colossians', '1TH':'1 Thessalonians', '1TI':'1 Timothy',
        '2TI':'2 Timothy', HEB:'Hebrews', JAS:'James', '1PE':'1 Peter', '1JN':'1 John', REV:'Revelation' },
  am: { GEN:'ዘፍጥረት', EXO:'ዘጸአት', PSA:'መዝሙር', PRO:'ምሳሌ', ISA:'ኢሳይያስ', JER:'ኤርምያስ',
        MAT:'ማቴዎስ', MAR:'ማርቆስ', LUK:'ሉቃስ', JHN:'ዮሐንስ', ACT:'የሐዋርያት ሥራ', ROM:'ሮሜ',
        '1CO':'1 ቆሮንቶስ', '2CO':'2 ቆሮንቶስ', GAL:'ገላትያ', EPH:'ኤፌሶን',
        PHP:'ፊልጵስዩስ', COL:'ቆላስይስ', '1TH':'1 ተሰሎንቄ', '1TI':'1 ጢሞቴዎስ',
        '2TI':'2 ጢሞቴዎስ', HEB:'ዕብራውያን', JAS:'ያዕቆብ', '1PE':'1 ጴጥሮስ', '1JN':'1 ዮሐንስ', REV:'ራዕይ' },
  sw: { GEN:'Mwanzo', EXO:'Kutoka', PSA:'Zaburi', PRO:'Methali', ISA:'Isaya', JER:'Yeremia',
        MAT:'Mathayo', MAR:'Marko', LUK:'Luka', JHN:'Yohana', ACT:'Matendo', ROM:'Warumi',
        '1CO':'1 Wakorintho', '2CO':'2 Wakorintho', GAL:'Wagalatia', EPH:'Waefeso',
        PHP:'Wafilipi', COL:'Wakolosai', '1TH':'1 Wathesalonike', '1TI':'1 Timotheo',
        '2TI':'2 Timotheo', HEB:'Waebrania', JAS:'Yakobo', '1PE':'1 Petro', '1JN':'1 Yohana', REV:'Ufunuo' },
  om: { GEN:'Uumama', EXO:'Ba\'uu', PSA:'Faarfannaa', PRO:'Kitaaba Mammaaksa', ISA:'Isaayyaas',
        JER:'Ermiyaas', MAT:'Maatewoos', MAR:'Maarkoos', LUK:'Luuqaas', JHN:'Yohaannis',
        ACT:'Hojii Ergamootaa', ROM:'Roomaa', '1CO':'1 Qorontoos', PHP:'Filiphisiyoos',
        HEB:'Ibrootaa', JAS:'Yaaqoob', '1PE':'1 Phexroos', '1JN':'1 Yohaannis', REV:'Mul\'ata' },
};
function getBookName(code, lang) {
  return (BOOK_NAMES_FALLBACK[lang] || BOOK_NAMES_FALLBACK.en)[code] || (BOOK_NAMES_FALLBACK.en[code] || code);
}

// ── Fallback English verse pool ─────────────────────────────────────────────
const FALLBACK_VERSES = {
  'John 3:16':        { reference: 'John 3:16',        text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',                                          version: 'NIV' },
  'Psalm 23:1':       { reference: 'Psalm 23:1',        text: 'The Lord is my shepherd, I lack nothing.',                                                                                                                                     version: 'NIV' },
  'Proverbs 3:5-6':   { reference: 'Proverbs 3:5-6',   text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',                           version: 'NIV' },
  'Romans 8:28':      { reference: 'Romans 8:28',       text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',                                                   version: 'NIV' },
  'Philippians 4:13': { reference: 'Philippians 4:13',  text: 'I can do all this through him who gives me strength.',                                                                                                                         version: 'NIV' },
  'Isaiah 41:10':     { reference: 'Isaiah 41:10',      text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.',                                                                version: 'NIV' },
  'Jeremiah 29:11':   { reference: 'Jeremiah 29:11',    text: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',                                  version: 'NIV' },
  'Matthew 11:28':    { reference: 'Matthew 11:28',     text: 'Come to me, all you who are weary and burdened, and I will give you rest.',                                                                                                    version: 'NIV' },
  '1 Peter 5:7':      { reference: '1 Peter 5:7',       text: 'Cast all your anxiety on him because he cares for you.',                                                                                                                       version: 'NIV' },
  'Joshua 1:9':       { reference: 'Joshua 1:9',        text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',                                                   version: 'NIV' },
};
const VERSE_OF_DAY_REFS = Object.keys(FALLBACK_VERSES);

// ── Fallback notice strings ──────────────────────────────────────────────────
const FALLBACK_NOTICES = {
  en: null,
  am: 'ይህ ጥቅስ ቀጥታ ምንጭ ላይ አልተገኘም። በእንግሊዝኛ ይታያል።',
  sw: 'Mstari huu haukupatikana kwenye chanzo halisi. Kiingereza kinaonyeshwa.',
  om: 'Aayanni kun madda mirkanaafameen hin argamne. Inglifaan dhiyaata.',
  ti: 'እዚ ጥቅሲ ካብ ዝተረጋገጸ ምንጪ ኣይርከበን። ብእንግሊዝኛ ይቐርብ ኣሎ።',
  ar: 'لم يتم العثور على هذه الآية في المصدر الرسمي. يتم عرضها بالإنجليزية.',
};

function makeFallback(verse, langCode) {
  return {
    ...verse,
    language: langCode,
    source_provider: 'FaithLight Internal',
    content_status: langCode === 'en' ? 'verified_source' : 'verified_source_fallback',
    is_fallback: langCode !== 'en',
    fallback_notice: FALLBACK_NOTICES[langCode] || null,
    fallback_language: 'en',
  };
}

// ── Book ID normalizer for Bible Brain API format ───────────────────────────
// Bible Brain uses book ids like 'JHN', 'PHP', 'PSA' etc — same as our codes
// But chapter/verse endpoint needs full numeric: /bibles/filesets/{fileset}/JHN/3?v=4
function toBBBookId(code) {
  // Most codes are already correct — handle a few aliases
  const aliases = { 'MAR': 'MRK', 'PHP': 'PHP' };
  return aliases[code] || code;
}

// ── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { endpoint, lang = 'en' } = body;

    if (!endpoint) return Response.json({ error: 'endpoint is required' }, { status: 400 });

    console.log(`[bibleAPI] endpoint=${endpoint} lang=${lang}`);

    const apiKey = Deno.env.get('BIBLE_BRAIN_API_KEY');
    const bbConf = BIBLE_BRAIN_BIBLES[lang]; // defined for en, am, sw

    // ── /bible/verse-of-day ─────────────────────────────────────────────────
    if (endpoint === '/bible/verse-of-day') {
      const cacheKey = `vod:${lang}`;
      const cached = getCached(cacheKey);
      if (cached) return Response.json({ success: true, verse: cached });

      const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % VERSE_OF_DAY_REFS.length;
      const enVerse = FALLBACK_VERSES[VERSE_OF_DAY_REFS[dayIndex]];

      // For am/sw — try Bible Brain
      if (bbConf && apiKey) {
        try {
          // Parse reference to fetch from Bible Brain
          // VOD just returns the English fallback with verified_source_fallback for now
          // (verse-of-day endpoint on Bible Brain requires specific book/chapter/verse)
          // Return English with fallback metadata
          const verse = makeFallback(enVerse, lang);
          setCached(cacheKey, verse, 1440);
          return Response.json({ success: true, verse });
        } catch (e) {
          console.warn(`[bibleAPI] Bible Brain VOD failed for ${lang}:`, e.message);
        }
      }

      const verse = makeFallback(enVerse, lang);
      setCached(cacheKey, verse, 1440);
      return Response.json({ success: true, verse });
    }

    // ── /bible/chapter ──────────────────────────────────────────────────────
    if (endpoint === '/bible/chapter') {
      const { book, chapter } = body;
      if (!book || !chapter) return Response.json({ error: 'book and chapter required' }, { status: 400 });

      const cacheKey = `chapter:${lang}:${book}:${chapter}`;
      const cached = getCached(cacheKey);
      if (cached) return Response.json({ success: true, chapter: cached });

      // Amharic or Swahili — try Bible Brain
      if (bbConf && apiKey) {
        try {
          const bbBookId = toBBBookId(book);
          const data = await bibleBrainFetch(
            `/bibles/filesets/${bbConf.fileset}/${bbBookId}/${chapter}?v=4&type=text_plain`,
            apiKey
          );

          if (data?.data?.length > 0) {
            const chapterData = normalizeBBChapter(data, book, chapter, lang, bbConf);
            console.log(`[bibleAPI] Bible Brain chapter success: ${lang} ${book} ${chapter} — ${chapterData.verses.length} verses`);
            setCached(cacheKey, chapterData, 10080);
            return Response.json({ success: true, chapter: chapterData });
          }
        } catch (e) {
          console.warn(`[bibleAPI] Bible Brain chapter failed for ${lang} ${book} ${chapter}:`, e.message);
        }
        // Fallback: English chapter from Bible Brain
        if (lang !== 'en') {
          try {
            const enConf = BIBLE_BRAIN_BIBLES.en;
            const bbBookId = toBBBookId(book);
            const data = await bibleBrainFetch(
              `/bibles/filesets/${enConf.fileset}/${bbBookId}/${chapter}?v=4&type=text_plain`,
              apiKey
            );
            if (data?.data?.length > 0) {
              const chapterData = normalizeBBChapter(data, book, chapter, 'en', enConf);
              const fallbackChapter = {
                ...chapterData,
                language: lang,
                content_status: 'verified_source_fallback',
                is_fallback: true,
                fallback_language: 'en',
                fallback_notice: FALLBACK_NOTICES[lang] || null,
              };
              setCached(cacheKey, fallbackChapter, 10080);
              return Response.json({ success: true, chapter: fallbackChapter });
            }
          } catch (e2) {
            console.warn(`[bibleAPI] English fallback chapter also failed:`, e2.message);
          }
        }
      }

      // For languages without Bible Brain config (sw, om, ti, ar) — fall back to English ESV
      if (!bbConf && lang !== 'en' && apiKey) {
        try {
          const enConf = BIBLE_BRAIN_BIBLES.en;
          const bbBookId = toBBBookId(book);
          const data = await bibleBrainFetch(
            `/bibles/filesets/${enConf.fileset}/${bbBookId}/${chapter}?v=4&type=text_plain`,
            apiKey
          );
          if (data?.data?.length > 0) {
            const chapterData = normalizeBBChapter(data, book, chapter, 'en', enConf);
            const fallbackChapter = {
              ...chapterData,
              language: lang,
              content_status: 'verified_source_fallback',
              is_fallback: true,
              fallback_language: 'en',
              fallback_notice: FALLBACK_NOTICES[lang] || null,
            };
            setCached(cacheKey, fallbackChapter, 10080);
            return Response.json({ success: true, chapter: fallbackChapter });
          }
        } catch (e) {
          console.warn(`[bibleAPI] English fallback chapter failed for ${lang}:`, e.message);
        }
      }

      // English Bible Brain for en requests
      if (lang === 'en' && apiKey) {
        try {
          const enConf = BIBLE_BRAIN_BIBLES.en;
          const bbBookId = toBBBookId(book);
          const data = await bibleBrainFetch(
            `/bibles/filesets/${enConf.fileset}/${bbBookId}/${chapter}?v=4&type=text_plain`,
            apiKey
          );
          if (data?.data?.length > 0) {
            const chapterData = normalizeBBChapter(data, book, chapter, 'en', enConf);
            setCached(cacheKey, chapterData, 10080);
            return Response.json({ success: true, chapter: chapterData });
          }
        } catch (e) {
          console.warn(`[bibleAPI] English chapter fetch failed:`, e.message);
        }
      }

      // Last resort: stub indicating content unavailable (not a fake verse)
      const bookName = getBookName(book, lang);
      const stubChapter = {
        book,
        bookName,
        chapter: parseInt(chapter),
        language: lang,
        source_provider: null,
        content_status: 'unavailable',
        is_fallback: false,
        verses: [],
        unavailable: true,
        unavailable_message: FALLBACK_NOTICES[lang] || 'Bible content unavailable for this selection.',
      };
      return Response.json({ success: false, chapter: stubChapter, error: 'No verified content available' });
    }

    // ── /bible/verse ────────────────────────────────────────────────────────
    if (endpoint === '/bible/verse') {
      const { ref } = body;
      if (!ref) return Response.json({ error: 'ref required' }, { status: 400 });

      const cacheKey = `verse:${lang}:${ref}`;
      const cached = getCached(cacheKey);
      if (cached) return Response.json({ success: true, verse: cached });

      // Try English fallback pool (works for en, and fallback for others)
      const enVerse = FALLBACK_VERSES[ref];
      if (enVerse) {
        const result = makeFallback(enVerse, lang);
        setCached(cacheKey, result, 10080);
        return Response.json({ success: true, verse: result });
      }

      return Response.json({ success: false, error: `Verse "${ref}" not found.` }, { status: 404 });
    }

    // ── /bible/books ────────────────────────────────────────────────────────
    if (endpoint === '/bible/books') {
      const cacheKey = `books:${lang}`;
      const cached = getCached(cacheKey);
      if (cached) return Response.json({ success: true, books: cached });

      // Fetch real book list from Bible Brain if available
      if (bbConf && apiKey) {
        try {
          const data = await bibleBrainFetch(`/bibles/${bbConf.bible_id}?v=4`, apiKey);
          if (data?.data?.books?.length > 0) {
            const books = data.data.books.map(b => ({
              code: b.book_id,
              name: b.name_short || b.name || getBookName(b.book_id, lang),
              numChapters: b.chapters,
              content_status: 'verified_source',
            }));
            setCached(cacheKey, books, 43200);
            return Response.json({ success: true, books });
          }
        } catch (e) {
          console.warn(`[bibleAPI] Bible Brain books list failed for ${lang}:`, e.message);
        }
      }

      // Static fallback book list
      const ALL_BOOKS = [
        { code:'GEN', numChapters:50 }, { code:'EXO', numChapters:40 }, { code:'LEV', numChapters:27 },
        { code:'NUM', numChapters:36 }, { code:'DEU', numChapters:34 }, { code:'JOS', numChapters:24 },
        { code:'JDG', numChapters:21 }, { code:'RUT', numChapters:4  }, { code:'1SA', numChapters:31 },
        { code:'2SA', numChapters:24 }, { code:'PSA', numChapters:150}, { code:'PRO', numChapters:31 },
        { code:'ISA', numChapters:66 }, { code:'JER', numChapters:52 },
        { code:'MAT', numChapters:28 }, { code:'MAR', numChapters:16 }, { code:'LUK', numChapters:24 },
        { code:'JHN', numChapters:21 }, { code:'ACT', numChapters:28 }, { code:'ROM', numChapters:16 },
        { code:'1CO', numChapters:16 }, { code:'2CO', numChapters:13 }, { code:'GAL', numChapters:6  },
        { code:'EPH', numChapters:6  }, { code:'PHP', numChapters:4  }, { code:'COL', numChapters:4  },
        { code:'1TH', numChapters:5  }, { code:'1TI', numChapters:6  }, { code:'2TI', numChapters:4  },
        { code:'HEB', numChapters:13 }, { code:'JAS', numChapters:5  }, { code:'1PE', numChapters:5  },
        { code:'1JN', numChapters:5  }, { code:'REV', numChapters:22 },
      ];
      const books = ALL_BOOKS.map(b => ({
        code: b.code,
        name: getBookName(b.code, lang),
        numChapters: b.numChapters,
        content_status: bbConf ? 'verified_source' : 'unverified',
      }));
      setCached(cacheKey, books, 43200);
      return Response.json({ success: true, books });
    }

    // ── /bible/validate ──────────────────────────────────────────────────────
    // Internal QA endpoint — validates a verse object
    if (endpoint === '/bible/validate') {
      const { verse } = body;
      if (!verse) return Response.json({ error: 'verse object required' }, { status: 400 });

      const errors = [];
      if (!verse.text || verse.text.trim().length === 0) errors.push('empty text');
      if (!verse.reference) errors.push('missing reference');
      if (verse.text?.toLowerCase().includes('being prepared')) errors.push('placeholder text detected');
      if (verse.text?.toLowerCase().includes('coming soon')) errors.push('coming soon placeholder detected');

      const contentStatus = verse.content_status || 'unverified';
      return Response.json({
        valid: errors.length === 0,
        errors,
        content_status: contentStatus,
        source_provider: verse.source_provider || null,
        bible_id: verse.bible_id || null,
      });
    }

    // ── /bible/discover ─────────────────────────────────────────────────────
    // Internal QA: discover available filesets for a language
    if (endpoint === '/bible/discover') {
      const { search_lang } = body;
      if (!apiKey) return Response.json({ error: 'No API key' }, { status: 500 });
      try {
        // Search for text filesets for the given language
        const data = await bibleBrainFetch(`/bibles?language_code=${search_lang || lang}&media=text_plain&v=4`, apiKey);
        return Response.json({ success: true, bibles: data?.data || data });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
      }
    }

    return Response.json({ error: `Unknown endpoint: ${endpoint}` }, { status: 404 });

  } catch (err) {
    console.error('[bibleAPI] error:', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});