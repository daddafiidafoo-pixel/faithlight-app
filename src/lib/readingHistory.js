const HISTORY_KEY = 'faithlight_reading_history';

export function saveReadingHistory(book, chapter) {
  const entry = { book, chapter, timestamp: Date.now() };
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entry));
}

export function getReadingHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearReadingHistory() {
  localStorage.removeItem(HISTORY_KEY);
}