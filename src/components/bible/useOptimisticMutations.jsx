import { useState, useCallback } from 'react';

/**
 * Hook for optimistic UI mutations
 * Provides instant visual feedback while API updates in background
 * Automatically reverts on error
 */
export function useOptimisticMutation(mutationFn) {
  const [optimisticValue, setOptimisticValue] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(
    async (newValue, originalValue) => {
      // Immediately update UI (optimistic)
      setOptimisticValue(newValue);
      setError(null);
      setLoading(true);

      try {
        // Execute mutation in background
        const result = await mutationFn(newValue);
        setLoading(false);
        return result;
      } catch (err) {
        // Revert on error
        setOptimisticValue(originalValue);
        setError(err.message || 'Operation failed');
        setLoading(false);
        throw err;
      }
    },
    [mutationFn]
  );

  return {
    mutate,
    optimisticValue,
    error,
    loading,
  };
}

/**
 * Hook for verse interactions (bookmark/save)
 * Handles optimistic toggles for heart/bookmark icons
 */
export function useVerseInteractionMutation(verseId, currentState = false) {
  const [state, setState] = useState(currentState);
  const [isPending, setIsPending] = useState(false);

  const toggle = useCallback(
    async (mutationFn) => {
      const newState = !state;
      
      // Optimistic update
      setState(newState);
      setIsPending(true);

      try {
        // Execute mutation (bookmark/save toggle)
        await mutationFn(verseId, newState);
        setIsPending(false);
      } catch (err) {
        // Revert on error
        setState(state);
        setIsPending(false);
        console.error('Verse interaction failed:', err);
      }
    },
    [state, verseId]
  );

  return {
    state,
    toggle,
    isPending,
  };
}