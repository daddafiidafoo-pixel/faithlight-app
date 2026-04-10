/**
 * useOptimisticMutations
 * Hook for optimistic UI updates on bookmark and highlight actions
 * Updates UI immediately, reverts on API failure
 */

import { useState } from 'react';
import { toast } from 'sonner';

export function useOptimisticBookmark() {
  const [bookmarks, setBookmarks] = useState({});
  const [pending, setPending] = useState({});

  const toggleBookmark = async (verseId, onSave, onDelete) => {
    const isBookmarked = bookmarks[verseId];
    
    // Optimistic update
    setBookmarks(prev => {
      const updated = { ...prev };
      if (isBookmarked) {
        delete updated[verseId];
      } else {
        updated[verseId] = true;
      }
      return updated;
    });

    // Mark as pending
    setPending(prev => ({ ...prev, [verseId]: true }));

    try {
      if (isBookmarked) {
        await onDelete(verseId);
      } else {
        await onSave(verseId);
      }
    } catch (error) {
      // Revert on failure
      setBookmarks(prev => {
        const updated = { ...prev };
        if (isBookmarked) {
          updated[verseId] = true;
        } else {
          delete updated[verseId];
        }
        return updated;
      });
      toast.error('Failed to update bookmark. Try again.');
      console.error('Bookmark error:', error);
    } finally {
      setPending(prev => {
        const updated = { ...prev };
        delete updated[verseId];
        return updated;
      });
    }
  };

  return {
    bookmarks,
    setBookmarks,
    toggleBookmark,
    isPending: (verseId) => !!pending[verseId],
  };
}

export function useOptimisticHighlight() {
  const [highlights, setHighlights] = useState({});
  const [pending, setPending] = useState({});

  const toggleHighlight = async (verseId, color, onSave, onClear) => {
    const currentColor = highlights[verseId];
    
    // Optimistic update
    setHighlights(prev => {
      const updated = { ...prev };
      if (currentColor === color) {
        delete updated[verseId];
      } else {
        updated[verseId] = color;
      }
      return updated;
    });

    // Mark as pending
    setPending(prev => ({ ...prev, [verseId]: true }));

    try {
      if (currentColor === color) {
        await onClear(verseId);
      } else {
        await onSave(verseId, color);
      }
    } catch (error) {
      // Revert on failure
      setHighlights(prev => {
        const updated = { ...prev };
        if (currentColor) {
          updated[verseId] = currentColor;
        } else {
          delete updated[verseId];
        }
        return updated;
      });
      toast.error('Failed to update highlight. Try again.');
      console.error('Highlight error:', error);
    } finally {
      setPending(prev => {
        const updated = { ...prev };
        delete updated[verseId];
        return updated;
      });
    }
  };

  return {
    highlights,
    setHighlights,
    toggleHighlight,
    isPending: (verseId) => !!pending[verseId],
  };
}