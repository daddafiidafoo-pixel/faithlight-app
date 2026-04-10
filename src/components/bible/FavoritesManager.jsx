// Utility for managing favorite verses in localStorage
const STORAGE_KEY = 'faithlight_favorite_verses';

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addFavorite(verse) {
  const favs = getFavorites();
  const exists = favs.some(f => f.verse_id === verse.verse_id);
  if (exists) return favs;
  const updated = [{ ...verse, savedAt: new Date().toISOString() }, ...favs];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFavorite(verseId) {
  const updated = getFavorites().filter(f => f.verse_id !== verseId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function isFavorite(verseId) {
  return getFavorites().some(f => f.verse_id === verseId);
}