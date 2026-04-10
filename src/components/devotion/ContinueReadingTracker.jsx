// LocalStorage-based tracker for recently viewed verses and continue reading feature

export const ContinueReadingTracker = {
  STORAGE_KEY: 'faith_light_reading_history',
  MAX_HISTORY: 20,

  /**
   * Record a verse as read
   */
  addVerse(verseData) {
    const history = this.getHistory();
    
    // Remove if already exists (to avoid duplicates)
    const filtered = history.filter(v => v.reference !== verseData.reference);
    
    // Add new verse at the beginning
    const updated = [
      {
        reference: verseData.reference,
        text: verseData.text,
        translation: verseData.translation,
        viewedAt: new Date().toISOString(),
      },
      ...filtered,
    ].slice(0, this.MAX_HISTORY);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Get full reading history (most recent first)
   */
  getHistory() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error reading history:', e);
      return [];
    }
  },

  /**
   * Get the most recent verse (for continue reading)
   */
  getLastVerse() {
    const history = this.getHistory();
    return history.length > 0 ? history[0] : null;
  },

  /**
   * Clear all history
   */
  clearHistory() {
    localStorage.removeItem(this.STORAGE_KEY);
  },
};

export default ContinueReadingTracker;