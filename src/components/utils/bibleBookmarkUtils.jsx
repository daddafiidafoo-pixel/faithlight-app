export function saveBookmark(reference, chapter, verse, verseText) {
  const bookmark = {
    id: Date.now().toString(),
    reference,
    chapter,
    verse,
    verseText,
    savedAt: new Date().toISOString()
  };

  const bookmarks = JSON.parse(localStorage.getItem('faithlight.bibleBookmarks') || '[]');
  const existing = bookmarks.findIndex(b => b.reference === reference);

  if (existing >= 0) {
    bookmarks[existing] = bookmark;
  } else {
    bookmarks.push(bookmark);
  }

  localStorage.setItem('faithlight.bibleBookmarks', JSON.stringify(bookmarks));
  return bookmark;
}

export function loadBookmarks() {
  return JSON.parse(localStorage.getItem('faithlight.bibleBookmarks') || '[]');
}

export function deleteBookmark(id) {
  const bookmarks = JSON.parse(localStorage.getItem('faithlight.bibleBookmarks') || '[]');
  const filtered = bookmarks.filter(b => b.id !== id);
  localStorage.setItem('faithlight.bibleBookmarks', JSON.stringify(filtered));
  return filtered;
}

export function getReadingHistory() {
  const bookmarks = loadBookmarks();
  return bookmarks.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

export function saveReadingProgress(reference, progress) {
  const history = JSON.parse(localStorage.getItem('faithlight.readingHistory') || '[]');
  const existing = history.findIndex(h => h.reference === reference);
  
  const entry = {
    reference,
    progress,
    lastReadAt: new Date().toISOString()
  };

  if (existing >= 0) {
    history[existing] = entry;
  } else {
    history.push(entry);
  }

  localStorage.setItem('faithlight.readingHistory', JSON.stringify(history));
  return entry;
}

export function getReadingProgress(reference) {
  const history = JSON.parse(localStorage.getItem('faithlight.readingHistory') || '[]');
  return history.find(h => h.reference === reference);
}