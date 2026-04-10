import React, { useState } from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflineErrorHandler({
  error = null,
  onRetry = null,
  onDismiss = null,
  actionLabel = 'Retry',
}) {
  const [dismissed, setDismissed] = useState(false);

  if (!error || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleRetry = () => {
    setDismissed(false);
    onRetry?.();
  };

  const errorMessages = {
    DOWNLOAD_FAILED: 'Download failed. Check your connection and try again.',
    INSUFFICIENT_SPACE: 'Not enough storage space. Remove some offline content.',
    INVALID_FILESET: 'Audio content not available for this language.',
    NETWORK_ERROR: 'Connection error. Please check your internet.',
    FILE_NOT_FOUND: 'Content file not found. Try downloading again.',
  };

  const message = errorMessages[error.code] || error.message || 'Something went wrong.';

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-red-800 font-medium">Download Error</p>
        <p className="text-sm text-red-700 mt-1">{message}</p>
        {error.details && <p className="text-xs text-red-600 mt-1 opacity-75">{error.details}</p>}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {onRetry && (
          <Button
            size="sm"
            onClick={handleRetry}
            className="bg-red-600 hover:bg-red-700 gap-1 text-xs h-8"
          >
            <RefreshCw className="w-3 h-3" /> {actionLabel}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-red-600 hover:bg-red-100 h-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}