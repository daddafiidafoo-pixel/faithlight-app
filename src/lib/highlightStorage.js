const HIGHLIGHTS_KEY = 'faithlight_highlights';

export const highlightStorage = {
  // Load all highlights
  loadHighlights: () => {
    const saved = localStorage.getItem(HIGHLIGHTS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  // Save highlight
  saveHighlight: (book, chapter, verse, text, color, note = '') => {
    const highlights = highlightStorage.loadHighlights();
    const verseId = `${book}-${chapter}-${verse}`;
    
    const updated = [
      ...highlights.filter(h => h.id !== verseId),
      {
        id: verseId,
        book,
        chapter,
        verse,
        text,
        color,
        note,
        createdAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Remove highlight
  removeHighlight: (verseId) => {
    const highlights = highlightStorage.loadHighlights();
    const updated = highlights.filter(h => h.id !== verseId);
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Get highlight color for a specific verse
  getHighlightColor: (book, chapter, verse) => {
    const highlights = highlightStorage.loadHighlights();
    const found = highlights.find(
      h => h.book === book && h.chapter === chapter && h.verse === verse
    );
    return found ? found.color : null;
  },

  // Get highlight by ID
  getHighlight: (verseId) => {
    const highlights = highlightStorage.loadHighlights();
    return highlights.find(h => h.id === verseId);
  }
};