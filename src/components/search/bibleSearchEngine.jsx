/**
 * bibleSearchEngine
 * Fast offline-first Bible search using inverted word index in IndexedDB.
 * Falls back to API when offline data is unavailable.
 */
import { lookupWord, getVersesByIds, searchVerses, getVerseIdsByTheme, buildWordIndex, hasWordIndex } from '@/components/offline/bibleDB';
import { base44 } from '@/api/base44Client';

// Book category mapping (canonical 66-book Bible)
export const BOOK_CATEGORIES = {
  Law:        ['GEN','EXO','LEV','NUM','DEU'],
  History:    ['JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST'],
  Wisdom:     ['JOB','PSA','PRO','ECC','SNG'],
  Prophets:   ['ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAH','HAB','ZEP','HAG','ZEC','MAL'],
  Gospels:    ['MAT','MRK','LUK','JHN'],
  Acts:       ['ACT'],
  Letters:    ['ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD'],
  Revelation: ['REV'],
};

export function getCategoryForBook(bookCode) {
  for (const [cat, books] of Object.entries(BOOK_CATEGORIES)) {
    if (books.includes(bookCode?.toUpperCase())) return cat;
  }
  return 'Other';
}

// ─── Emotion → Theme mapping ────────────────────────────────────────────────

export const EMOTION_MAP = {
  // Anxiety / Worry
  anxiety:       { themes: ['peace','faith'],       emoji: '😟', label: 'Anxiety',       prayer: 'Lord, calm my heart and help me trust you with what I cannot control.' },
  worry:         { themes: ['peace','faith'],       emoji: '😟', label: 'Worry',          prayer: 'Father, replace my worries with your peace that passes understanding.' },
  // Fear
  fear:          { themes: ['strength','faith'],    emoji: '😨', label: 'Fear',           prayer: 'God, you have not given me a spirit of fear. Fill me with courage.' },
  afraid:        { themes: ['strength','faith'],    emoji: '😨', label: 'Fear',           prayer: 'Lord, let your presence cast out all fear in me.' },
  // Loneliness
  lonely:        { themes: ['love','hope'],         emoji: '😔', label: 'Loneliness',     prayer: 'Father, remind me that you are always near and I am never alone.' },
  loneliness:    { themes: ['love','hope'],         emoji: '😔', label: 'Loneliness',     prayer: 'Lord, be my companion in this season of isolation.' },
  // Grief / Loss
  grief:         { themes: ['hope','healing'],      emoji: '😢', label: 'Grief',          prayer: 'Lord, comfort me in my loss and hold me close.' },
  sad:           { themes: ['hope','joy'],          emoji: '😢', label: 'Sadness',        prayer: 'Father, turn my mourning into dancing. Restore my joy.' },
  sadness:       { themes: ['hope','joy'],          emoji: '😢', label: 'Sadness',        prayer: 'God, you are close to the broken-hearted. Heal me.' },
  // Anger
  angry:         { themes: ['forgiveness','peace'], emoji: '😠', label: 'Anger',          prayer: 'Lord, soften my heart and help me to release this anger.' },
  anger:         { themes: ['forgiveness','peace'], emoji: '😠', label: 'Anger',          prayer: 'Father, grant me self-control and a spirit of forgiveness.' },
  // Doubt
  doubt:         { themes: ['faith','hope'],        emoji: '🤔', label: 'Doubt',          prayer: 'Lord, I believe — help my unbelief and strengthen my faith.' },
  // Discouragement
  discouraged:   { themes: ['hope','strength'],     emoji: '😞', label: 'Discouragement', prayer: 'God, renew my strength and remind me of your promises.' },
  hopeless:      { themes: ['hope','faith'],        emoji: '😞', label: 'Hopelessness',   prayer: 'Father, you are the God of hope. Fill me with expectation.' },
  // Temptation
  tempted:       { themes: ['faith','wisdom'],      emoji: '⚔️', label: 'Temptation',     prayer: 'Lord, provide the way of escape and keep me from sin.' },
  temptation:    { themes: ['faith','wisdom'],      emoji: '⚔️', label: 'Temptation',     prayer: 'Father, help me flee temptation and walk in purity.' },
  // Forgiveness
  forgive:       { themes: ['forgiveness','grace'], emoji: '🕊️', label: 'Forgiveness',    prayer: 'Lord, help me release this hurt and forgive as you have forgiven me.' },
  unforgiveness: { themes: ['forgiveness','grace'], emoji: '🕊️', label: 'Forgiveness',    prayer: 'Father, free me from bitterness and fill me with your grace.' },
  // Gratitude
  grateful:      { themes: ['joy','grace'],         emoji: '🙏', label: 'Gratitude',      prayer: 'Lord, thank you for every good gift. May I never lose sight of your blessings.' },
  // Stress
  stressed:      { themes: ['peace','strength'],    emoji: '😫', label: 'Stress',         prayer: 'Father, I cast my burdens on you. Give me rest.' },
  overwhelmed:   { themes: ['strength','peace'],    emoji: '😫', label: 'Overwhelmed',    prayer: 'Lord, you are my refuge. Help me breathe and trust you.' },
  // Healing
  sick:          { themes: ['healing','faith'],     emoji: '🤒', label: 'Sickness',       prayer: 'Lord, you are Jehovah Rapha — my healer. Restore my body.' },
  healing:       { themes: ['healing','hope'],      emoji: '🤒', label: 'Healing',        prayer: 'Father, bring wholeness to every part of me.' },
};

/**
 * Detect emotion from natural language input.
 * Returns { emotion, meta } or null.
 */
export function detectEmotion(query) {
  const q = query.toLowerCase();
  // Direct key match
  for (const [key, meta] of Object.entries(EMOTION_MAP)) {
    if (q.includes(key)) return { emotion: key, meta };
  }
  // Phrase patterns
  if (q.includes('can\'t sleep') || q.includes('cannot sleep')) return { emotion: 'anxiety', meta: EMOTION_MAP.anxiety };
  if (q.includes('give up') || q.includes('no hope')) return { emotion: 'hopeless', meta: EMOTION_MAP.hopeless };
  if (q.includes('lost someone') || q.includes('someone died')) return { emotion: 'grief', meta: EMOTION_MAP.grief };
  if (q.includes('hurt') || q.includes('pain')) return { emotion: 'healing', meta: EMOTION_MAP.healing };
  return null;
}

// Theme keywords → search terms mapping
export const THEME_KEYWORDS = {
  hope:        ['hope','trust','wait','future'],
  love:        ['love','beloved','charity','affection'],
  peace:       ['peace','rest','calm','still','quiet'],
  strength:    ['strength','strong','power','mighty','courage'],
  fear:        ['fear not','afraid','anxious','worry','troubled'],
  faith:       ['faith','believe','trust','conviction'],
  healing:     ['heal','restore','health','recover','wholeness'],
  forgiveness: ['forgive','pardon','mercy','sin','repent'],
  joy:         ['joy','rejoice','gladness','delight','happiness'],
  wisdom:      ['wisdom','understanding','knowledge','discern'],
  prayer:      ['pray','prayer','petition','intercede','ask'],
  grace:       ['grace','favour','undeserved','gift'],
};

export function detectTheme(query) {
  const q = query.toLowerCase();
  for (const [theme, words] of Object.entries(THEME_KEYWORDS)) {
    if (words.some(w => q.includes(w)) || q === theme) return theme;
  }
  return null;
}

// Score a verse for relevance
function scoreVerse(verse, queryWords) {
  const text = (verse.text || '').toLowerCase();
  let score = 0;

  // Exact phrase match (highest weight)
  const phrase = queryWords.join(' ');
  if (text.includes(phrase)) score += 10;

  // Individual keyword hits
  for (const w of queryWords) {
    const matches = (text.match(new RegExp(w, 'g')) || []).length;
    score += matches * 2;
  }

  // Shorter verses rank slightly higher (easier to memorise / share)
  if (text.length < 80) score += 1;
  if (text.length < 50) score += 1;

  // Popular books bonus
  const popular = ['JHN','PSA','PRO','ROM','PHP','ISA','MAT'];
  if (popular.includes(verse.bookCode?.toUpperCase())) score += 1;

  return score;
}

/**
 * Main search function.
 * @param {string} languageCode
 * @param {string} query
 * @param {object} options - { filter: 'all'|'OT'|'NT'|'Gospels'|'Letters'|'Wisdom', limit: number }
 */
export async function searchBible(languageCode, query, options = {}) {
  const { filter = 'all', limit = 50 } = options;
  const start = Date.now();

  const rawWords = query.toLowerCase().replace(/[^a-z0-9'\s]/g,'').split(/\s+/).filter(w => w.length >= 2);
  const STOP = new Set(['the','a','an','and','or','of','in','to','is','was','be','not','but','at','on','as','by','we','you','i','this','that','thy','thee']);
  const queryWords = rawWords.filter(w => !STOP.has(w));

  if (!queryWords.length) return { results: [], elapsed: 0, source: 'none' };

  let verseIds = null;
  let source = 'local_index';

  // Try inverted word index first
  const indexed = await hasWordIndex(languageCode);
  if (indexed) {
    const idSets = await Promise.all(queryWords.map(w => lookupWord(w, languageCode)));
    // Union all results (OR search), track frequency for ranking
    const freq = {};
    for (const ids of idSets) {
      for (const id of ids) {
        freq[id] = (freq[id] || 0) + 1;
      }
    }
    // Sort by frequency (how many query words matched)
    verseIds = Object.entries(freq)
      .sort((a,b) => b[1] - a[1])
      .map(([id]) => id)
      .slice(0, 200);
  }

  let verses = [];

  if (verseIds?.length) {
    verses = await getVersesByIds(verseIds);
  } else {
    // Fallback: linear scan (slower, but works before index is built)
    source = 'scan';
    for (const w of queryWords) {
      const found = await searchVerses(languageCode, w, 100);
      verses.push(...found);
    }
    // Deduplicate
    const seen = new Set();
    verses = verses.filter(v => { if (seen.has(v.id)) return false; seen.add(v.id); return true; });
  }

  // Apply testament / category filter
  if (filter && filter !== 'all') {
    const OT_BOOKS = Object.values(BOOK_CATEGORIES).slice(0,4).flat();
    const NT_BOOKS = Object.values(BOOK_CATEGORIES).slice(4).flat();
    verses = verses.filter(v => {
      const bc = v.bookCode?.toUpperCase();
      if (filter === 'OT') return OT_BOOKS.includes(bc);
      if (filter === 'NT') return NT_BOOKS.includes(bc);
      const catBooks = BOOK_CATEGORIES[filter];
      return catBooks ? catBooks.includes(bc) : true;
    });
  }

  // Score and sort
  verses = verses
    .map(v => ({ ...v, _score: scoreVerse(v, queryWords) }))
    .sort((a,b) => b._score - a._score)
    .slice(0, limit);

  const elapsed = Date.now() - start;
  return { results: verses, elapsed, source, total: verses.length };
}

/**
 * Search by theme (emotion / topic).
 */
export async function searchByTheme(languageCode, theme, limit = 30) {
  const start = Date.now();
  const themeWords = THEME_KEYWORDS[theme] || [theme];
  let verses = [];

  for (const w of themeWords) {
    const found = await searchVerses(languageCode, w, 50);
    verses.push(...found);
  }

  const seen = new Set();
  verses = verses.filter(v => { if(seen.has(v.id)) return false; seen.add(v.id); return true; });
  verses = verses.slice(0, limit);

  return { results: verses, elapsed: Date.now() - start, source: 'theme' };
}

/**
 * Build the word index for a language (call after download).
 */
export async function buildSearchIndex(languageCode, onProgress) {
  onProgress?.(10);
  const count = await buildWordIndex(languageCode);
  onProgress?.(100);
  return count;
}

/**
 * Search suggestions based on common Bible topics.
 */
export const SEARCH_SUGGESTIONS = [
  'faith','love','peace','hope','strength','fear not','healing',
  'forgiveness','grace','wisdom','joy','pray','trust','eternal life',
  'be not afraid','light of the world','I am the way',
  'all things are possible','love your enemies',
];

export function getSuggestions(prefix) {
  if (!prefix || prefix.length < 2) return [];
  const lower = prefix.toLowerCase();
  return SEARCH_SUGGESTIONS.filter(s => s.startsWith(lower)).slice(0, 6);
}