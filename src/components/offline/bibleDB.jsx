/**
 * BibleDB — IndexedDB-based local Bible storage + search index
 * Production pattern: YouVersion / Bible.is style
 */

const DB_NAME = 'faithlight_bible';
const DB_VERSION = 3; // bumped to add word_index + themes stores
const VERSES_STORE   = 'verses';
const META_STORE     = 'bible_meta';
const SCHEDULE_STORE = 'daily_schedule';
const INDEX_STORE    = 'word_index';   // word → [{languageCode, id, score}]
const THEMES_STORE   = 'verse_themes'; // id → [theme, ...]

let _db = null;

export async function openDB() {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(VERSES_STORE)) {
        const s = db.createObjectStore(VERSES_STORE, { keyPath: 'id' });
        s.createIndex('by_lang_book_ch_v', ['languageCode','bookCode','chapter','verse'], { unique: true });
        s.createIndex('by_language', 'languageCode', { unique: false });
        s.createIndex('by_lang_book', ['languageCode','bookCode'], { unique: false });
      }

      if (!db.objectStoreNames.contains(META_STORE))
        db.createObjectStore(META_STORE, { keyPath: 'languageCode' });

      if (!db.objectStoreNames.contains(SCHEDULE_STORE)) {
        const ss = db.createObjectStore(SCHEDULE_STORE, { keyPath: 'date' });
        ss.createIndex('by_date', 'date', { unique: true });
      }

      // Inverted word index: key = "word|languageCode"  value = {key, ids: [id,...]}
      if (!db.objectStoreNames.contains(INDEX_STORE)) {
        db.createObjectStore(INDEX_STORE, { keyPath: 'key' });
      }

      // Theme tags: key = "verseId|theme", indexed by theme + language
      if (!db.objectStoreNames.contains(THEMES_STORE)) {
        const ts = db.createObjectStore(THEMES_STORE, { keyPath: 'key' });
        ts.createIndex('by_theme_lang', ['theme','languageCode'], { unique: false });
        ts.createIndex('by_verse', 'verseId', { unique: false });
      }
    };
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

// ─── Verse CRUD ─────────────────────────────────────────────────────────────

export async function insertVerses(verses) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSES_STORE, 'readwrite');
    const store = tx.objectStore(VERSES_STORE);
    verses.forEach(v => store.put(v));
    tx.oncomplete = () => resolve(verses.length);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getVerse(languageCode, bookCode, chapter, verse) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSES_STORE, 'readonly');
    const req = tx.objectStore(VERSES_STORE).index('by_lang_book_ch_v').get([languageCode, bookCode, chapter, verse]);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getChapter(languageCode, bookCode, chapter) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSES_STORE, 'readonly');
    const results = [];
    const range = IDBKeyRange.bound([languageCode,bookCode,chapter,0],[languageCode,bookCode,chapter,999]);
    const req = tx.objectStore(VERSES_STORE).index('by_lang_book_ch_v').openCursor(range);
    req.onsuccess = (e) => {
      const c = e.target.result;
      if (c) { results.push(c.value); c.continue(); }
      else resolve(results.sort((a,b) => a.verse - b.verse));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getVersesByIds(ids) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSES_STORE, 'readonly');
    const store = tx.objectStore(VERSES_STORE);
    const results = [];
    let pending = ids.length;
    if (!pending) return resolve([]);
    ids.forEach(id => {
      const req = store.get(id);
      req.onsuccess = () => { if (req.result) results.push(req.result); if (--pending === 0) resolve(results); };
      req.onerror = () => { if (--pending === 0) resolve(results); };
    });
  });
}

// ─── Word Index ──────────────────────────────────────────────────────────────

export async function buildWordIndex(languageCode) {
  const db = await openDB();
  // Fetch all verses for language
  const verses = await new Promise((resolve, reject) => {
    const tx = db.transaction(VERSES_STORE, 'readonly');
    const results = [];
    const req = tx.objectStore(VERSES_STORE).index('by_language').openCursor(IDBKeyRange.only(languageCode));
    req.onsuccess = (e) => { const c = e.target.result; if(c){results.push(c.value);c.continue();}else resolve(results); };
    req.onerror = () => reject(req.error);
  });

  // Build inverted index in memory
  const wordMap = {};
  const STOP_WORDS = new Set(['the','a','an','and','or','of','in','to','is','was','he','she','it','they','for','with','his','her','be','not','but','at','on','as','by','we','you','i','this','that','from','are','have','had','my','our','thy','thee','thine','ye','him','them','who','which','what','unto','shall','will','said','into']);
  
  for (const v of verses) {
    const words = (v.text || '').toLowerCase().replace(/[^a-z0-9'\s]/g,'').split(/\s+/);
    const seen = new Set();
    for (const w of words) {
      if (w.length < 3 || STOP_WORDS.has(w)) continue;
      if (!seen.has(w)) {
        seen.add(w);
        if (!wordMap[w]) wordMap[w] = [];
        wordMap[w].push(v.id);
      }
    }
  }

  // Store index
  await new Promise((resolve, reject) => {
    const tx = db.transaction(INDEX_STORE, 'readwrite');
    const store = tx.objectStore(INDEX_STORE);
    for (const [word, ids] of Object.entries(wordMap)) {
      store.put({ key: `${word}|${languageCode}`, word, languageCode, ids });
    }
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });

  return Object.keys(wordMap).length;
}

export async function lookupWord(word, languageCode) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(INDEX_STORE, 'readonly');
    const req = tx.objectStore(INDEX_STORE).get(`${word}|${languageCode}`);
    req.onsuccess = () => resolve(req.result?.ids || []);
    req.onerror = () => reject(req.error);
  });
}

export async function hasWordIndex(languageCode) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(INDEX_STORE, 'readonly');
    const req = tx.objectStore(INDEX_STORE).index
      ? tx.objectStore(INDEX_STORE).openCursor(IDBKeyRange.bound(`a|${languageCode}`,`z|${languageCode}`))
      : null;
    if (!req) return resolve(false);
    req.onsuccess = (e) => resolve(!!e.target.result);
    req.onerror = () => resolve(false);
  });
}

// ─── Theme Tags ──────────────────────────────────────────────────────────────

export async function insertThemeTags(tags) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(THEMES_STORE, 'readwrite');
    const store = tx.objectStore(THEMES_STORE);
    tags.forEach(t => store.put({ key: `${t.verseId}|${t.theme}`, ...t }));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

export async function getVerseIdsByTheme(theme, languageCode) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(THEMES_STORE, 'readonly');
    const results = [];
    const req = tx.objectStore(THEMES_STORE).index('by_theme_lang').openCursor(IDBKeyRange.only([theme, languageCode]));
    req.onsuccess = (e) => {
      const c = e.target.result;
      if(c){results.push(c.value.verseId);c.continue();}else resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

// ─── Simple fallback scan search (when no word index yet) ───────────────────

export async function searchVerses(languageCode, term, limit = 40) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSES_STORE, 'readonly');
    const results = [];
    const lower = term.toLowerCase();
    const req = tx.objectStore(VERSES_STORE).index('by_language').openCursor(IDBKeyRange.only(languageCode));
    req.onsuccess = (e) => {
      const c = e.target.result;
      if (c && results.length < limit) {
        const v = c.value;
        if (v.text?.toLowerCase().includes(lower) || v.reference?.toLowerCase().includes(lower)) results.push(v);
        c.continue();
      } else resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

// ─── Meta ────────────────────────────────────────────────────────────────────

export async function saveMeta(langCode, meta) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite');
    tx.objectStore(META_STORE).put({ languageCode: langCode, ...meta });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllMeta() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readonly');
    const req = tx.objectStore(META_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteTranslation(languageCode) {
  const db = await openDB();
  // delete verses
  await new Promise((resolve, reject) => {
    const tx = db.transaction(VERSES_STORE, 'readwrite');
    const req = tx.objectStore(VERSES_STORE).index('by_language').openCursor(IDBKeyRange.only(languageCode));
    req.onsuccess = (e) => { const c = e.target.result; if(c){c.delete();c.continue();}else resolve(); };
    req.onerror = () => reject(req.error);
  });
  // delete word index
  await new Promise((resolve, reject) => {
    const tx = db.transaction(INDEX_STORE, 'readwrite');
    const store = tx.objectStore(INDEX_STORE);
    const range = IDBKeyRange.bound(`|${languageCode}`, `\uffff|${languageCode}`);
    const req = store.openCursor(range);
    req.onsuccess = (e) => { const c = e.target.result; if(c){c.delete();c.continue();}else resolve(); };
    req.onerror = () => resolve();
    tx.oncomplete = resolve;
  });
  // delete meta
  await new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite');
    tx.objectStore(META_STORE).delete(languageCode);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Daily Schedule ──────────────────────────────────────────────────────────

export async function saveDailySchedule(entries) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SCHEDULE_STORE, 'readwrite');
    const store = tx.objectStore(SCHEDULE_STORE);
    entries.forEach(e => store.put(e));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

export async function getDailyScheduleEntry(date) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SCHEDULE_STORE, 'readonly');
    const req = tx.objectStore(SCHEDULE_STORE).get(date);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}