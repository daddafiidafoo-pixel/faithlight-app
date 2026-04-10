/**
 * Optimistic UI Patterns
 * Helper functions for immediate UI feedback while background operations complete.
 */

/**
 * saveVerseOptimistic
 * Immediately add to highlights, then sync to server.
 */
export function saveVerseOptimistic(verse, onRollback) {
  const highlights = JSON.parse(localStorage.getItem('verse_highlights') || '[]');
  const updated = [...highlights, { ...verse, saved_at: new Date().toISOString() }];
  localStorage.setItem('verse_highlights', JSON.stringify(updated));

  return async (saveFn) => {
    try {
      await saveFn(verse);
    } catch (err) {
      // Rollback on failure
      localStorage.setItem('verse_highlights', JSON.stringify(highlights));
      onRollback?.(err);
      throw err;
    }
  };
}

/**
 * addBookmarkOptimistic
 * Immediately add to bookmarks, then sync to server.
 */
export function addBookmarkOptimistic(bookmark, onRollback) {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  const updated = [...bookmarks, { ...bookmark, created_at: new Date().toISOString() }];
  localStorage.setItem('bookmarks', JSON.stringify(updated));

  return async (addFn) => {
    try {
      await addFn(bookmark);
    } catch (err) {
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      onRollback?.(err);
      throw err;
    }
  };
}

/**
 * createAIOutputOptimistic
 * Immediately add to saved AI outputs, then persist to server.
 */
export function createAIOutputOptimistic(output, onRollback) {
  const outputs = JSON.parse(localStorage.getItem('ai_outputs') || '[]');
  const updated = [...outputs, { ...output, id: `temp_${Date.now()}`, created_at: new Date().toISOString() }];
  localStorage.setItem('ai_outputs', JSON.stringify(updated));

  return async (saveFn) => {
    try {
      const result = await saveFn(output);
      // Replace temp ID with server ID
      const final = updated.map(o => o.id === `temp_${Date.now()}` ? result : o);
      localStorage.setItem('ai_outputs', JSON.stringify(final));
      return result;
    } catch (err) {
      localStorage.setItem('ai_outputs', JSON.stringify(outputs));
      onRollback?.(err);
      throw err;
    }
  };
}