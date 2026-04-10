/**
 * useOfflineBible
 * ───────────────
 * React hook that wraps bibleOfflineDB with state management.
 * Use this in any component that needs offline read/save/delete.
 *
 * Usage:
 *   const { isSaved, saveForOffline, loadOffline, savedList, isSaving } = useOfflineBible();
 */
import { useState, useEffect, useCallback } from 'react';
import {
  saveChapter,
  loadChapter,
  deleteChapter,
  isChapterSaved,
  getSavedChapterList,
  clearAllOfflineData,
  getStorageSizeEstimate,
} from './bibleOfflineDB';

export default function useOfflineBible(bookCode, chapterNum, lang = 'en') {
  const [isSaved,  setIsSaved]  = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedList, setSavedList] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Online / offline detection
  useEffect(() => {
    const on  = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Check if the current chapter is saved
  useEffect(() => {
    if (!bookCode || !chapterNum) return;
    isChapterSaved(bookCode, chapterNum, lang).then(setIsSaved);
  }, [bookCode, chapterNum, lang]);

  // Load the full saved list and storage info
  const refreshList = useCallback(async () => {
    const [list, storage] = await Promise.all([
      getSavedChapterList(),
      getStorageSizeEstimate(),
    ]);
    setSavedList(list.sort((a, b) => b.savedAt - a.savedAt));
    setStorageInfo(storage);
  }, []);

  useEffect(() => { refreshList(); }, [refreshList]);

  /**
   * Save the current chapter for offline reading.
   * @param {string} title   - Human-readable title e.g. "Genesis 1"
   * @param {Array}  verses  - Array of verse objects to persist
   */
  const saveForOffline = useCallback(async (title, verses) => {
    if (!bookCode || !chapterNum || !verses?.length) return;
    setIsSaving(true);
    try {
      await saveChapter(bookCode, chapterNum, lang, title, verses);
      setIsSaved(true);
      await refreshList();
    } finally {
      setIsSaving(false);
    }
  }, [bookCode, chapterNum, lang, refreshList]);

  /**
   * Load the chapter from offline storage.
   * Returns null if not saved.
   */
  const loadOffline = useCallback(() => {
    if (!bookCode || !chapterNum) return Promise.resolve(null);
    return loadChapter(bookCode, chapterNum, lang);
  }, [bookCode, chapterNum, lang]);

  /**
   * Remove the current chapter from offline storage.
   */
  const removeOffline = useCallback(async () => {
    await deleteChapter(bookCode, chapterNum, lang);
    setIsSaved(false);
    await refreshList();
  }, [bookCode, chapterNum, lang, refreshList]);

  /** Wipe all offline data. */
  const clearAll = useCallback(async () => {
    await clearAllOfflineData();
    setIsSaved(false);
    await refreshList();
  }, [refreshList]);

  return {
    isSaved,
    isSaving,
    isOffline,
    savedList,
    storageInfo,
    saveForOffline,
    loadOffline,
    removeOffline,
    clearAll,
    refreshList,
  };
}