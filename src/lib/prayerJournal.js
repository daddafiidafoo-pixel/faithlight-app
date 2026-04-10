const JOURNAL_KEY = 'faithlight_prayer_journal';

export function getPrayerJournalEntries(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
    return all.filter(e => e.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
}

export function getPrayerJournalEntry(userId, id) {
  const entries = getPrayerJournalEntries(userId);
  return entries.find(e => e.id === id);
}

export function createPrayerJournalEntry(userId, verseReference, noteContent, mood = null, tags = []) {
  try {
    const all = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
    
    const entry = {
      id: Math.random().toString(36).substring(2, 11),
      userId,
      verseReference,
      noteContent,
      mood,
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrivate: true,
    };

    all.push(entry);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(all));
    return entry;
  } catch (e) {
    console.error('Error creating prayer journal entry:', e);
    return null;
  }
}

export function updatePrayerJournalEntry(userId, id, updates) {
  try {
    const all = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
    const idx = all.findIndex(e => e.id === id && e.userId === userId);
    
    if (idx < 0) return null;

    all[idx] = {
      ...all[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(JOURNAL_KEY, JSON.stringify(all));
    return all[idx];
  } catch (e) {
    console.error('Error updating prayer journal entry:', e);
    return null;
  }
}

export function deletePrayerJournalEntry(userId, id) {
  try {
    const all = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
    const filtered = all.filter(e => !(e.id === id && e.userId === userId));
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Error deleting prayer journal entry:', e);
    return false;
  }
}

export function getEntriesForVerse(userId, verseReference) {
  const entries = getPrayerJournalEntries(userId);
  return entries.filter(e => e.verseReference.toLowerCase() === verseReference.toLowerCase());
}