import React from 'react';
import { useSafeQuery } from '../useSafeQuery';
import { base44 } from '@/api/base44Client';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SafeLiveEventsLoader({ 
  filter = {}, 
  children,
  emptyMessage = 'No live events found',
  retryLabel = 'Retry'
}) {
  const { 
    data: events, 
    isLoading, 
    error, 
    clearError, 
    retry 
  } = useSafeQuery({
    queryKey: ['live-events', JSON.stringify(filter)],
    queryFn: async () => {
      const result = await base44.entities.LiveEvent.filter(filter);
      return result || [];
    },
    isCritical: true,
    silentFail: false,
    retries: 2,
  });

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading events...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 text-sm font-semibold">{error}</p>
            <Button
              onClick={() => {
                clearError();
                retry();
              }}
              size="sm"
              variant="outline"
              className="mt-2 gap-2 text-red-700 border-red-300"
            >
              <RefreshCw className="w-4 h-4" />
              {retryLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return <div className="text-center py-8 text-gray-500">{emptyMessage}</div>;
  }

  return children(events);
}