import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook for saving reading history to the database
 * Tracks which passages the user has read
 */
export function useReadingHistory() {
  const saveReading = useCallback(async (userId, book, chapter, reference, translation, options = {}) => {
    if (!userId) return;
    
    try {
      await base44.entities.ReadingHistory.create({
        user_id: userId,
        book,
        chapter,
        reference,
        translation,
        reading_duration_seconds: options.duration || 0,
        notes: options.notes || null,
        is_bookmarked: options.isBookmarked || false,
        highlight_color: options.highlightColor || null
      });
    } catch (error) {
      console.error('Error saving reading history:', error);
      // Fail silently to not interrupt user experience
    }
  }, []);

  const getReadingHistory = useCallback(async (userId, limit = 20) => {
    if (!userId) return [];
    
    try {
      const history = await base44.entities.ReadingHistory.filter(
        { user_id: userId },
        '-created_date',
        limit
      );
      return history || [];
    } catch (error) {
      console.error('Error fetching reading history:', error);
      return [];
    }
  }, []);

  const getReadingStats = useCallback(async (userId) => {
    if (!userId) return null;
    
    try {
      const history = await base44.entities.ReadingHistory.filter(
        { user_id: userId },
        '-created_date',
        1000
      );
      
      if (!history || history.length === 0) {
        return { total_readings: 0, unique_books: 0, unique_chapters: 0, total_duration: 0 };
      }

      const uniqueBooks = new Set(history.map(h => h.book)).size;
      const uniqueChapters = new Set(history.map(h => `${h.book}:${h.chapter}`)).size;
      const totalDuration = history.reduce((sum, h) => sum + (h.reading_duration_seconds || 0), 0);

      return {
        total_readings: history.length,
        unique_books: uniqueBooks,
        unique_chapters: uniqueChapters,
        total_duration: totalDuration
      };
    } catch (error) {
      console.error('Error computing reading stats:', error);
      return null;
    }
  }, []);

  return { saveReading, getReadingHistory, getReadingStats };
}