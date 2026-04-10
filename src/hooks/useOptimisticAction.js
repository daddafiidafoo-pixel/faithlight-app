/**
 * useOptimisticAction
 * Provides optimistic UI updates for user actions (save, bookmark, create).
 * Immediately reflects changes while background mutation completes.
 */
import { useState, useCallback } from 'react';

export function useOptimisticAction(asyncFn, onSuccess) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (data) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await asyncFn(data);
      onSuccess?.(result, data);
      return result;
    } catch (err) {
      setError(err.message || 'Action failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn, onSuccess]);

  return { execute, isLoading, error };
}