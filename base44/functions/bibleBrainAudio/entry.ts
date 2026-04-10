/**
 * Bible Brain Audio API — server-side proxy
 * Keeps API key secret. Supports:
 *   action=catalog    → list audio versions for a language
 *   action=chapter    → get playable audio URL for fileset/book/chapter
 *   action=timing     → get verse timing data for fileset/book/chapter
 *   action=text       → get chapter text for a bibleId/book/chapter
 *   action=books      → list books available in a fileset
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const DBP_BASE = "https://4.dbt.io/api";

// Standard 66-book fallback when the API doesn't return books
const STANDARD_BOOKS = [
  { bookId: "GEN", bookName: "Genesis", testament: "OT", chapters: 50 },
  { bookId: "EXO", bookName: "Exodus", testament: "OT", chapters: 40 },
  { bookId: "LEV", bookName: "Leviticus", testament: "OT", chapters: 27 },
  { bookId: "NUM", bookName: "Numbers", testament: "OT", chapters: 36 },
  { bookId: "DEU", bookName: "Deuteronomy", testament: "OT", chapters: 34 },
  { bookId: "JOS", bookName: "Joshua", testament: "OT", chapters: 24 },
  { bookId: "JDG", bookName: "Judges", testament: "OT", chapters: 21 },
  { bookId: "RUT", bookName: "Ruth", testament: "OT", chapters: 4 },
  { bookId: "1SA", bookName: "1 Samuel", testament: "OT", chapters: 31 },
  { bookId: "2SA", bookName: "2 Samuel", testament: "OT", chapters: 24 },
  { bookId: "1KI", bookName: "1 Kings", testament: "OT", chapters: 22 },
  { bookId: "2KI", bookName: "2 Kings", testament: "OT", chapters: 25 },
  { bookId: "1CH", bookName: "1 Chronicles", testament: "OT", chapters: 29 },
  { bookId: "2CH", bookName: "2 Chronicles", testament: "OT", chapters: 36 },
  { bookId: "EZR", bookName: "Ezra", testament: "OT", chapters: 10 },
  { bookId: "NEH", bookName: "Nehemiah", testament: "OT", chapters: 13 },
  { bookId: "EST", bookName: "Esther", testament: "OT", chapters: 10 },
  { bookId: "JOB", bookName: "Job", testament: "OT", chapters: 42 },
  { bookId: "PSA", bookName: "Psalms", testament: "OT", chapters: 150 },
  { bookId: "PRO", bookName: "Proverbs", testament: "OT", chapters: 31 },
  { bookId: "ECC", bookName: "Ecclesiastes", testament: "OT", chapters: 12 },
  { bookId: "SNG", bookName: "Song of Solomon", testament: "OT", chapters: 8 },
  { bookId: "ISA", bookName: "Isaiah", testament: "OT", chapters: 66 },
  { bookId: "JER", bookName: "Jeremiah", testament: "OT", chapters: 52 },
  { bookId: "LAM", bookName: "Lamentations", testament: "OT", chapters: 5 },
  { bookId: "EZK", bookName: "Ezekiel", testament: "OT", chapters: 48 },
  { bookId: "DAN", bookName: "Daniel", testament: "OT", chapters: 12 },
  { bookId: "HOS", bookName: "Hosea", testament: "OT", chapters: 14 },
  { bookId: "JOL", bookName: "Joel", testament: "OT", chapters: 3 },
  { bookId: "AMO", bookName: "Amos", testament: "OT", chapters: 9 },
  { bookId: "OBA", bookName: "Obadiah", testament: "OT", chapters: 1 },
  { bookId: "JON", bookName: "Jonah", testament: "OT", chapters: 4 },
  { bookId: "MIC", bookName: "Micah", testament: "OT", chapters: 7 },
  { bookId: "NAM", bookName: "Nahum", testament: "OT", chapters: 3 },
  { bookId: "HAB", bookName: "Habakkuk", testament: "OT", chapters: 3 },
  { bookId: "ZEP", bookName: "Zephaniah", testament: "OT", chapters: 3 },
  { bookId: "HAG", bookName: "Haggai", testament: "OT", chapters: 2 },
  { bookId: "ZEC", bookName: "Zechariah", testament: "OT", chapters: 14 },
  { bookId: "MAL", bookName: "Malachi", testament: "OT", chapters: 4 },
  { bookId: "MAT", bookName: "Matthew", testament: "NT", chapters: 28 },
  { bookId: "MRK", bookName: "Mark", testament: "NT", chapters: 16 },
  { bookId: "LUK", bookName: "Luke", testament: "NT", chapters: 24 },
  { bookId: "JHN", bookName: "John", testament: "NT", chapters: 21 },
  { bookId: "ACT", bookName: "Acts", testament: "NT", chapters: 28 },
  { bookId: "ROM", bookName: "Romans", testament: "NT", chapters: 16 },
  { bookId: "1CO", bookName: "1 Corinthians", testament: "NT", chapters: 16 },
  { bookId: "2CO", bookName: "2 Corinthians", testament: "NT", chapters: 13 },
  { bookId: "GAL", bookName: "Galatians", testament: "NT", chapters: 6 },
  { bookId: "EPH", bookName: "Ephesians", testament: "NT", chapters: 6 },
  { bookId: "PHP", bookName: "Philippians", testament: "NT", chapters: 4 },
  { bookId: "COL", bookName: "Colossians", testament: "NT", chapters: 4 },
  { bookId: "1TH", bookName: "1 Thessalonians", testament: "NT", chapters: 5 },
  { bookId: "2TH", bookName: "2 Thessalonians", testament: "NT", chapters: 3 },
  { bookId: "1TI", bookName: "1 Timothy", testament: "NT", chapters: 6 },
  { bookId: "2TI", bookName: "2 Timothy", testament: "NT", chapters: 4 },
  { bookId: "TIT", bookName: "Titus", testament: "NT", chapters: 3 },
  { bookId: "PHM", bookName: "Philemon", testament: "NT", chapters: 1 },
  { bookId: "HEB", bookName: "Hebrews", testament: "NT", chapters: 13 },
  { bookId: "JAS", bookName: "James", testament: "NT", chapters: 5 },
  { bookId: "1PE", bookName: "1 Peter", testament: "NT", chapters: 5 },
  { bookId: "2PE", bookName: "2 Peter", testament: "NT", chapters: 3 },
  { bookId: "1JN", bookName: "1 John", testament: "NT", chapters: 5 },
  { bookId: "2JN", bookName: "2 John", testament: "NT", chapters: 1 },
  { bookId: "3JN", bookName: "3 John", testament: "NT", chapters: 1 },
  { bookId: "JUD", bookName: "Jude", testament: "NT", chapters: 1 },
  { bookId: "REV", bookName: "Revelation", testament: "NT", chapters: 22 },
];

// Language → Bible Brain language ISO codes used in their API
const LANG_ISO_MAP = {
  en:  'eng',
  om:  'gaz',
  am:  'amh',
  ar:  'arb',
  fr:  'fra',
  sw:  'swh',
  tir: 'tir',
  tig: 'tig',
  hae: 'hae',
  pt:  'por',
  es:  'spa',
  de:  'deu',
  hi:  'hin',
  ru:  'rus',
  zh:  'cmn',
};

async function dbpGet(path, apiKey) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `${DBP_BASE}${path}${sep}key=${apiKey}&v=4`;
  console.log(`DBP GET: ${url.replace(apiKey, '[KEY]')}`);
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`BibleBrain ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action, lang, bibleId, filesetId, bookId, chapter } = body;

    const apiKey = Deno.env.get("BIBLE_BRAIN_API_KEY");
    if (!apiKey) {
      return Response.json({ error: "BIBLE_BRAIN_API_KEY not set" }, { status: 503 });
    }

    // ── catalog: discover audio-capable versions for a language ───────────────
    if (action === "catalog") {
      const iso = LANG_ISO_MAP[lang] || lang;
      console.log(`Catalog lookup: lang=${lang} iso=${iso}`);

      // Query Bible Brain bibles by language ISO
      const data = await dbpGet(`/bibles?language_code=${iso}&media=audio`, apiKey);
      const bibles = data?.data || [];
      console.log(`Found ${bibles.length} bibles for ${iso}`);

      // For each bible, find audio filesets
      const versions = [];
      for (const bible of bibles.slice(0, 8)) {
        // filesets may be an object keyed by type, or an array
        let filsetsRaw = bible.filesets || {};

        // Bible Brain returns filesets as object keyed by CDN provider (e.g. "dbp-prod")
        // Each value is an array of fileset objects with a "type" field
        let filesetArr = [];
        if (Array.isArray(filsetsRaw)) {
          filesetArr = filsetsRaw;
        } else if (typeof filsetsRaw === 'object') {
          // Flatten all CDN provider arrays into one list
          for (const items of Object.values(filsetsRaw)) {
            if (Array.isArray(items)) {
              filesetArr.push(...items);
            }
          }
        }

        console.log(`Bible ${bible.abbr} total filesets: ${filesetArr.length}, types: ${[...new Set(filesetArr.map(f=>f.type))].join(',')}`);

        const audioFilesets = filesetArr.filter(f => f.type === 'audio' || f.type === 'audio_drama');
        for (const fs of audioFilesets) {
          versions.push({
            bibleId: bible.abbr,
            bibleName: bible.name || bible.vname || bible.abbr,
            filesetId: fs.id,
            type: fs.type,
            size: fs.size,
            hasDownload: false,
          });
        }
      }

      // Prefer non-opus16 filesets; deduplicate by base filesetId (strip -opus16 suffix)
      // Group by base ID, keep the non-opus16 version
      const byBase = new Map();
      for (const v of versions) {
        const base = v.filesetId.replace(/-opus16$/, '');
        if (!byBase.has(base)) {
          byBase.set(base, v);
        } else if (!v.filesetId.endsWith('-opus16')) {
          // Prefer the non-opus16 variant
          byBase.set(base, v);
        }
      }
      const unique = Array.from(byBase.values());

      // Clean up bible names: strip leading "Language - " prefix if it matches lang
      for (const v of unique) {
        v.bibleName = v.bibleName.replace(/^\w[\w\s]+ - /, '').trim();
      }

      // Capability flags
      const caps = {
        hasAudio: unique.length > 0,
        hasText: false, // checked separately
        hasVerseTiming: false,
        hasDownloadableAudio: false,
      };

      return Response.json({ ok: true, versions: unique, capabilities: caps });
    }

    // ── books: list books available in a fileset/bible ───────────────────────
    if (action === "books") {
      if (!filesetId && !bibleId) return Response.json({ error: "filesetId or bibleId required" }, { status: 400 });

      let books = [];

      // Try bibleId-based endpoint first (most reliable)
      const effectiveBibleId = bibleId || filesetId.slice(0, 6); // e.g. ENGESV from ENGESVN2DA
      console.log(`Books lookup: bibleId=${effectiveBibleId}`);
      try {
        const data = await dbpGet(`/bibles/${effectiveBibleId}/book`, apiKey);
        const raw = data?.data || [];
        books = raw.map(b => ({
          bookId: b.book_id || b.id,
          bookName: b.name || b.name_short || b.book_id,
          testament: b.testament,
          chapters: b.chapters || b.chapter_count || 1,
        }));
        console.log(`Got ${books.length} books via /bibles/${effectiveBibleId}/book`);
      } catch (e) {
        console.warn(`bibleId book lookup failed: ${e.message}`);
      }

      // Fallback: use hardcoded standard 66-book list
      if (books.length === 0) {
        console.log("Falling back to standard 66-book list");
        books = STANDARD_BOOKS;
      }

      return Response.json({ ok: true, books });
    }

    // ── chapter: get audio URL(s) for a book/chapter ──────────────────────────
    if (action === "chapter") {
      if (!filesetId || !bookId || !chapter) {
        return Response.json({ error: "filesetId, bookId, chapter required" }, { status: 400 });
      }
      const bookCode = bookId.toUpperCase();
      const data = await dbpGet(
        `/bibles/filesets/${filesetId}/${bookCode}/${chapter}`,
        apiKey
      );
      const items = data?.data || [];
      if (items.length === 0) {
        return Response.json({ error: "No audio found for this chapter" }, { status: 404 });
      }
      // Return primary URL + all verse items with timing
      const audioUrl = items[0]?.path || null;
      const verseItems = items.map(i => ({
        path: i.path || null,
        verse_start: i.verse_start,
        verse_end: i.verse_end,
        duration: i.duration,
        verse_start_time: i.verse_start_time || null,
        verse_end_time: i.verse_end_time || null,
      }));

      // Check if verse timing exists
      const hasVerseTiming = verseItems.some(v => v.verse_start_time != null);

      return Response.json({
        ok: true,
        audioUrl,
        items: verseItems,
        hasVerseTiming,
      });
    }

    // ── timing: get verse timing data ─────────────────────────────────────────
    if (action === "timing") {
      if (!filesetId || !bookId || !chapter) {
        return Response.json({ error: "filesetId, bookId, chapter required" }, { status: 400 });
      }
      const bookCode = bookId.toUpperCase();
      const data = await dbpGet(
        `/bibles/filesets/${filesetId}/${bookCode}/${chapter}/timing`,
        apiKey
      );
      return Response.json({ ok: true, timing: data?.data || [] });
    }

    // ── text: get chapter text ─────────────────────────────────────────────────
    if (action === "text") {
      if (!bibleId || !bookId || !chapter) {
        return Response.json({ error: "bibleId, bookId, chapter required" }, { status: 400 });
      }
      // Find a text fileset for this bible — filesets come back as object keyed by CDN
      const bibleMeta = await dbpGet(`/bibles/${bibleId}`, apiKey);
      const fsRaw = bibleMeta?.data?.filesets || {};
      let allFilesets = [];
      if (Array.isArray(fsRaw)) {
        allFilesets = fsRaw;
      } else {
        for (const items of Object.values(fsRaw)) {
          if (Array.isArray(items)) allFilesets.push(...items);
        }
      }
      const textFileset = allFilesets.find(f => f.type === 'text_plain' || f.type === 'text_format');
      if (!textFileset) {
        return Response.json({ error: "No text fileset for this bible", verses: [] });
      }
      const bookCode = bookId.toUpperCase();
      const textData = await dbpGet(
        `/bibles/filesets/${textFileset.id}/${bookCode}/${chapter}`,
        apiKey
      );
      const verses = (textData?.data || []).map(v => ({
        verse: v.verse_start,
        text: v.verse_text,
      }));
      return Response.json({ ok: true, verses });
    }

    return Response.json({ error: "Unknown action. Use: catalog | books | chapter | timing | text" }, { status: 400 });

  } catch (err) {
    console.error("bibleBrainAudio error:", err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});