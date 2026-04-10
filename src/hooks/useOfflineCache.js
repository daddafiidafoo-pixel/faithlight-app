// Offline chapter/book caching using localStorage
const CACHE_KEY = 'fl_offline_chapters';

function getCacheIndex() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveCacheIndex(index) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(index));
}

export function getCachedChapter(bookId, chapter) {
  const index = getCacheIndex();
  return index[`${bookId}_${chapter}`] || null;
}

export function saveChapterToCache(bookId, chapter, verses, bookName) {
  const index = getCacheIndex();
  index[`${bookId}_${chapter}`] = {
    bookId,
    bookName,
    chapter,
    verses,
    cachedAt: new Date().toISOString(),
  };
  saveCacheIndex(index);
}

export function removeChapterFromCache(bookId, chapter) {
  const index = getCacheIndex();
  delete index[`${bookId}_${chapter}`];
  saveCacheIndex(index);
}

export function getAllCachedChapters() {
  return Object.values(getCacheIndex());
}

export function isChapterCached(bookId, chapter) {
  return !!getCacheIndex()[`${bookId}_${chapter}`];
}

export function clearAllCache() {
  localStorage.removeItem(CACHE_KEY);
}

export function getCacheSizeKB() {
  const raw = localStorage.getItem(CACHE_KEY) || '{}';
  return Math.round((raw.length * 2) / 1024); // approx bytes → KB
}