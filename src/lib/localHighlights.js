// Local-device highlight persistence (no login required)
const KEY = 'faithlight_highlights';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

// key format: {bookId}-{chapter}-{verseNumber}
function makeKey(bookId, chapter, verseNumber) {
  return `${bookId}-${chapter}-${verseNumber}`;
}

export function getLocalHighlightsForChapter(bookId, chapter) {
  const all = load();
  const prefix = `${bookId}-${chapter}-`;
  const result = {};
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith(prefix)) {
      const verseNum = parseInt(k.split('-').pop());
      result[verseNum] = v; // { color }
    }
  }
  return result;
}

export function setLocalHighlight(bookId, chapter, verseNumber, color) {
  const all = load();
  all[makeKey(bookId, chapter, verseNumber)] = { color };
  save(all);
}

export function removeLocalHighlight(bookId, chapter, verseNumber) {
  const all = load();
  delete all[makeKey(bookId, chapter, verseNumber)];
  save(all);
}