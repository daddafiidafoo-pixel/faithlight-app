import { base44 } from '@/api/base44Client';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  'Samuel','Kings','Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs',
  'Ecclesiastes','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel',
  'Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
  'Malachi','Matthew','Mark','Luke','John','Acts','Romans','Corinthians','Galatians',
  'Ephesians','Philippians','Colossians','Thessalonians','Timothy','Titus','Philemon',
  'Hebrews','James','Peter','Jude','Revelation',
];

const BOOK_REGEX = new RegExp(`\\b(${BIBLE_BOOKS.join('|')})\\b`, 'i');

export async function getUserSearchSignals(me) {
  if (!me?.id) return null;

  const signals = {
    preferredTranslationId: null,
    topBooks: [],
    topCourseCategories: [],
    downloadedKeysSet: new Set(),
    recentQueries: [],
  };

  const [items, history] = await Promise.all([
    base44.entities.OfflineItem.filter({ user_id: me.id }, '-created_date', 300).catch(() => []),
    base44.entities.SearchHistory.filter({ user_id: me.id }, '-created_date', 80).catch(() => []),
  ]);

  const translationCounts = {};
  for (const it of items || []) {
    signals.downloadedKeysSet.add(`${it.type}:${it.key}`);
    if (it.translation_id) {
      translationCounts[it.translation_id] = (translationCounts[it.translation_id] || 0) + 1;
    }
  }
  const topTranslation = Object.entries(translationCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (topTranslation) signals.preferredTranslationId = topTranslation;

  const books = {};
  const cats = {};
  const recentQSet = new Set();

  for (const h of history || []) {
    const q = String(h.query || '');
    if (q) recentQSet.add(q.toLowerCase().slice(0, 30));
    const m = q.match(BOOK_REGEX);
    if (m) books[m[1]] = (books[m[1]] || 0) + 1;
    if (h.clicked_type === 'Course' && h.clicked_meta?.category) {
      cats[h.clicked_meta.category] = (cats[h.clicked_meta.category] || 0) + 1;
    }
    if (h.clicked_meta?.book) {
      books[h.clicked_meta.book] = (books[h.clicked_meta.book] || 0) + 2;
    }
  }

  signals.topBooks = Object.entries(books).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);
  signals.topCourseCategories = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);
  signals.recentQueries = [...recentQSet].slice(0, 20);

  return signals;
}

export async function recordSearch(me, query, clickedType = null, clickedId = null, clickedMeta = null) {
  if (!me?.id || !query?.trim()) return;
  await base44.entities.SearchHistory.create({
    user_id: me.id,
    query: query.trim(),
    clicked_type: clickedType,
    clicked_id: clickedId,
    clicked_meta: clickedMeta,
  }).catch(() => {});
}