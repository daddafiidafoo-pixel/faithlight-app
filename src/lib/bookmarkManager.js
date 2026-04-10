// Simple localStorage bookmark manager for MVP
const BOOKMARKS_KEY = 'faithlight_bookmarks';

export function getBookmarks() {
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error reading bookmarks:', err);
    return [];
  }
}

export function addBookmark(reference) {
  try {
    const bookmarks = getBookmarks();
    if (!bookmarks.find(b => b.reference === reference)) {
      bookmarks.push({
        reference,
        dateSaved: new Date().toISOString(),
      });
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }
    return bookmarks;
  } catch (err) {
    console.error('Error adding bookmark:', err);
    return getBookmarks();
  }
}

export function removeBookmark(reference) {
  try {
    const bookmarks = getBookmarks().filter(b => b.reference !== reference);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return bookmarks;
  } catch (err) {
    console.error('Error removing bookmark:', err);
    return getBookmarks();
  }
}

export function isBookmarked(reference) {
  return getBookmarks().some(b => b.reference === reference);
}