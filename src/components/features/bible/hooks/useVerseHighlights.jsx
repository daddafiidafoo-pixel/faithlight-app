/**
 * useVerseHighlights — manages verse highlight state.
 * All persistence via bibleService layer.
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchHighlights, saveHighlight, deleteHighlight } from '@/components/services/api';

export const HIGHLIGHT_COLORS = ['#FEF08A', '#BBF7D0', '#BFDBFE', '#FCA5A5', '#DDD6FE'];

export function useVerseHighlights(userId, book, chapter) {
  const [highlights, setHighlights] = useState({});

  useEffect(() => {
    if (!userId || !book || !chapter) return;
    fetchHighlights(userId, book, chapter).then(data => {
      const map = {};
      (data || []).forEach(h => { map[h.verse] = h.color; });
      setHighlights(map);
    });
  }, [userId, book, chapter]);

  const toggle = useCallback(async (verse, color) => {
    const current = highlights[verse];
    if (current === color) {
      setHighlights(prev => { const next = { ...prev }; delete next[verse]; return next; });
      await deleteHighlight(userId, book, chapter, verse);
    } else {
      setHighlights(prev => ({ ...prev, [verse]: color }));
      await saveHighlight(userId, { book, chapter, verse, color });
    }
  }, [highlights, userId, book, chapter]);

  return { highlights, toggle };
}