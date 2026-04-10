import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/I18nProvider';

/**
 * Reusable async state handler for AI/API operations
 * Handles: loading, success, error, empty states with proper messaging
 * 
 * Usage:
 * <AsyncStateHandler
 *   state={state}
 *   onRetry={() => handleRetry()}
 *   loadingText="Generating content..."
 *   errorText="Could not generate content."
 * >
 *   {children}
 * </AsyncStateHandler>
 */

export default function AsyncStateHandler({
  state = 'idle', // idle, loading, success, error, empty
  children,
  onRetry,
  loadingText,
  errorText,
  emptyText,
  showRetryOnError = true,
}) {
  const { t } = useI18n();

  // Default messages
  const defaultLoading = t('common.loading', 'Loading...');
  const defaultError = t('common.error_friendly', 'Something went wrong. Please try again.');
  const defaultEmpty = t('common.empty', 'No results found.');

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center gap-3 p-6">
        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
        <p className="text-gray-600">{loadingText || defaultLoading}</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{errorText || defaultError}</p>
        </div>
        {showRetryOnError && onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="outline"
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            {t('common.retry', 'Try Again')}
          </Button>
        )}
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{emptyText || defaultEmpty}</p>
      </div>
    );
  }

  // success or idle state
  return children;
}