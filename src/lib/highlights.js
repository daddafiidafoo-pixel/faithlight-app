const HIGHLIGHTS_KEY = 'faithlight_highlights';

export function getHighlights(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(HIGHLIGHTS_KEY) || '[]');
    return all.filter(h => h.userEmail === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
}

export function createHighlight(userEmail, book, chapter, verseStart, verseEnd, verseReference, textSnippet, color = 'yellow') {
  try {
    const all = JSON.parse(localStorage.getItem(HIGHLIGHTS_KEY) || '[]');
    
    const highlight = {
      id: Math.random().toString(36).substring(2, 11),
      userEmail,
      book,
      chapter,
      verseStart,
      verseEnd,
      verseReference,
      textSnippet,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    all.push(highlight);
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(all));
    return highlight;
  } catch (e) {
    console.error('Error creating highlight:', e);
    return null;
  }
}

export function deleteHighlight(userEmail, id) {
  try {
    const all = JSON.parse(localStorage.getItem(HIGHLIGHTS_KEY) || '[]');
    const filtered = all.filter(h => !(h.id === id && h.userEmail === userEmail));
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Error deleting highlight:', e);
    return false;
  }
}

export function getHighlightsForChapter(userEmail, book, chapter) {
  const highlights = getHighlights(userEmail);
  return highlights.filter(h => h.book === book && h.chapter === chapter);
}

export function updateHighlightColor(userEmail, id, color) {
  try {
    const all = JSON.parse(localStorage.getItem(HIGHLIGHTS_KEY) || '[]');
    const idx = all.findIndex(h => h.id === id && h.userEmail === userEmail);
    
    if (idx < 0) return null;

    all[idx].color = color;
    all[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(all));
    return all[idx];
  } catch (e) {
    console.error('Error updating highlight:', e);
    return null;
  }
}