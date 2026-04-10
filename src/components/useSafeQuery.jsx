import { useQuery } from '@tanstack/react-query';
import { useErrorLog } from './useErrorLog';

/**
 * SafeQuery wrapper for data fetching with error handling
 * Normalizes query states and provides fallback UI
 * Logs errors silently without user interruption
 */
export const useSafeQuery = (queryKey, queryFn, options = {}) => {
  const { logError } = useErrorLog();
  
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes default
    retry = false, // Don't retry by default for non-critical content
    showFallback = true,
    errorCode = 'QUERY_ERROR',
    ...restOptions
  } = options;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        // Log error silently
        logError(error, {
          errorCode,
          message: `Query failed: ${queryKey[0]}`,
          meta: { queryKey, queryFn: queryFn.name || 'anonymous' }
        });
        throw error;
      }
    },
    enabled,
    staleTime,
    retry,
    ...restOptions
  });

  // Normalize return state
  return {
    status: query.status, // 'idle' | 'loading' | 'success' | 'error'
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorCode: query.isError ? errorCode : null,
    refetch: query.refetch,
    isFetching: query.isFetching,
    // Helper for rendering
    isReady: query.status === 'success' || (query.status === 'idle' && !enabled)
  };
};

/**
 * Get normalized state object
 */
export const getSafeQueryState = (query) => {
  return {
    status: query.status,
    data: query.data,
    errorCode: query.errorCode,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isError: query.isError
  };
};