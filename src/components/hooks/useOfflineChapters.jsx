import { useState, useCallback } from 'react';
import { offlineChapterStorage } from '../lib/offlineChapterStorage';

export function useOfflineChapters() {
  const [savedChapters, setSavedChapters] = useState([]);
  const [loading, setLoading] = useState(false);

  const saveChapter = useCallback(async (chapterId, chapterData) => {
    try {
      setLoading(true);
      await offlineChapterStorage.saveChapter(chapterId, chapterData);
      await offlineChapterStorage.pruneOldest(10); // Keep last 10
      await refreshSavedChapters();
    } catch (err) {
      console.error('Failed to save chapter:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getChapter = useCallback(async (chapterId) => {
    try {
      return await offlineChapterStorage.getChapter(chapterId);
    } catch (err) {
      console.error('Failed to get chapter:', err);
      return null;
    }
  }, []);

  const refreshSavedChapters = useCallback(async () => {
    try {
      const chapters = await offlineChapterStorage.getAllChapters();
      setSavedChapters(chapters.slice(0, 10));
    } catch (err) {
      console.error('Failed to refresh chapters:', err);
    }
  }, []);

  const deleteChapter = useCallback(async (chapterId) => {
    try {
      await offlineChapterStorage.deleteChapter(chapterId);
      await refreshSavedChapters();
    } catch (err) {
      console.error('Failed to delete chapter:', err);
    }
  }, [refreshSavedChapters]);

  return {
    savedChapters,
    loading,
    saveChapter,
    getChapter,
    deleteChapter,
    refreshSavedChapters,
  };
}