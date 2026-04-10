const DAILY_DEVOTIONAL_KEY = 'faithlight_daily_devotional';
const DAILY_VERSE_KEY = 'faithlight_daily_verse';

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

export const dailyDevotionalService = {
  // Get cached daily devotional
  getCached: () => {
    const saved = localStorage.getItem(DAILY_DEVOTIONAL_KEY);
    if (!saved) return null;
    
    const data = JSON.parse(saved);
    // Check if it's from today
    if (data.date === getTodayKey()) {
      return data;
    }
    return null;
  },

  // Save daily devotional
  saveDailyDevotional: (verse, devotional) => {
    const data = {
      date: getTodayKey(),
      verse,
      devotional,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(DAILY_DEVOTIONAL_KEY, JSON.stringify(data));
    return data;
  },

  // Clear cache to force refresh
  clearCache: () => {
    localStorage.removeItem(DAILY_DEVOTIONAL_KEY);
    localStorage.removeItem(DAILY_VERSE_KEY);
  }
};