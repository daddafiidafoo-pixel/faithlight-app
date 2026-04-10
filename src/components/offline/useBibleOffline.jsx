/**
 * useBibleOffline hook
 * Provides offline-first verse lookup:
 *  1. Try IndexedDB (local)
 *  2. If online, fallback to API
 *  3. If offline and not cached, return null
 */
import { useState, useEffect, useCallback } from 'react';
import { getVerse, getChapter, searchVerses, getAllMeta, getDailyScheduleEntry } from './bibleDB';

export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return isOnline;
}

export function useDownloadedTranslations() {
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const meta = await getAllMeta();
      setTranslations(meta);
    } catch {
      setTranslations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, []);

  return { translations, loading, refresh };
}

/**
 * Offline-first verse lookup
 * Returns { verse, source: 'local'|'api'|null }
 */
export async function getVerseOfflineFirst(languageCode, bookCode, chapter, verse, invokeFunction, isOnline) {
  // 1. Try local IndexedDB
  try {
    const local = await getVerse(languageCode, bookCode, chapter, verse);
    if (local) return { verse: local, source: 'local' };
  } catch { /* ignore */ }

  // 2. Fallback to API if online
  if (isOnline && invokeFunction) {
    try {
      const res = await invokeFunction('bibleDailyVerse', { lang: languageCode });
      if (res.data?.success) return { verse: res.data.data, source: 'api' };
    } catch { /* ignore */ }
  }

  return { verse: null, source: null };
}

/**
 * Get today's verse offline-first
 */
export async function getDailyVerseOfflineFirst(languageCode, invokeFunction, isOnline) {
  const today = new Date().toISOString().slice(0, 10);

  // 1. Try local schedule + verse
  try {
    const entry = await getDailyScheduleEntry(today);
    if (entry) {
      const local = await getVerse(languageCode, entry.bookCode, entry.chapter, entry.verse);
      if (local) return { verse: local, source: 'local', theme: entry.theme };
    }
  } catch { /* ignore */ }

  // 2. Fallback to API
  if (isOnline && invokeFunction) {
    try {
      const res = await invokeFunction('bibleDailyVerse', { lang: languageCode });
      if (res.data?.success) return { verse: res.data.data, source: 'api' };
    } catch { /* ignore */ }
  }

  return { verse: null, source: null };
}

export { getChapter, searchVerses };