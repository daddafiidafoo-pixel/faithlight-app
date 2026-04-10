// localStorage-based reading progress tracker
const STORAGE_KEY = 'fl_reading_progress';

function getProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { completedChapters: {}, completedBooks: {} };
  } catch {
    return { completedChapters: {}, completedBooks: {} };
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save reading progress:', e);
  }
}

export function markChapterComplete(book, chapter) {
  const progress = getProgress();
  const chapterKey = `${book}:${chapter}`;
  progress.completedChapters[chapterKey] = Date.now();
  
  if (!progress.completedBooks[book]) {
    progress.completedBooks[book] = { firstCompletedDate: Date.now(), chaptersRead: [] };
  }
  if (!progress.completedBooks[book].chaptersRead.includes(chapter)) {
    progress.completedBooks[book].chaptersRead.push(chapter);
  }
  
  saveProgress(progress);
}

export function isChapterComplete(book, chapter) {
  const progress = getProgress();
  const chapterKey = `${book}:${chapter}`;
  return !!progress.completedChapters[chapterKey];
}

export function getChapterCompletionDate(book, chapter) {
  const progress = getProgress();
  const chapterKey = `${book}:${chapter}`;
  return progress.completedChapters[chapterKey];
}

export function getBookProgress(book) {
  const progress = getProgress();
  return progress.completedBooks[book] || null;
}

export function getAllProgress() {
  return getProgress();
}

export function getTotalChaptersRead() {
  const progress = getProgress();
  return Object.keys(progress.completedChapters).length;
}

export function getReadingStreak() {
  const progress = getProgress();
  const today = new Date().toDateString();
  const lastReadKey = 'fl_last_read_date';
  const lastRead = localStorage.getItem(lastReadKey);
  
  if (lastRead === today) {
    const streakKey = 'fl_reading_streak';
    return parseInt(localStorage.getItem(streakKey) || '1', 10);
  }
  
  return 0;
}

export function updateReadingStreak() {
  const today = new Date().toDateString();
  const lastReadKey = 'fl_last_read_date';
  const streakKey = 'fl_reading_streak';
  const lastRead = localStorage.getItem(lastReadKey);
  
  if (lastRead !== today) {
    const currentStreak = lastRead === new Date(Date.now() - 86400000).toDateString() 
      ? (parseInt(localStorage.getItem(streakKey) || '0', 10) + 1)
      : 1;
    localStorage.setItem(lastReadKey, today);
    localStorage.setItem(streakKey, currentStreak.toString());
  }
}