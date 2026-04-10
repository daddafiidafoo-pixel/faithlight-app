import React from 'react';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * SafeQueryFallback: Friendly UI for loading, error, and empty states
 * Used with useSafeQuery hook to show consistent UX across the app
 */
export function LoadingFallback({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}

export function ErrorFallback({ error, onRetry, text = 'Failed to load' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
      <AlertCircle className="w-8 h-8 text-gray-400 mb-3" />
      <p className="text-sm text-gray-600 mb-4">{text}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export function EmptyFallback({ text = 'No items found' }) {
  return (
    <div className="flex items-center justify-center p-8 text-center">
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

/**
 * SafeQueryRenderer: All-in-one component for handling query states
 * Usage: <SafeQueryRenderer state={queryState} render={(data) => <...>} />
 */
export function SafeQueryRenderer({
  state,
  render,
  loadingText = 'Loading...',
  errorText = 'Failed to load',
  emptyText = 'No items found'
}) {
  if (state.isLoading) {
    return <LoadingFallback text={loadingText} />;
  }

  if (state.isError) {
    return (
      <ErrorFallback
        error={state.error}
        onRetry={state.refetch}
        text={errorText}
      />
    );
  }

  if (!state.data || (Array.isArray(state.data) && state.data.length === 0)) {
    return <EmptyFallback text={emptyText} />;
  }

  return render(state.data);
}