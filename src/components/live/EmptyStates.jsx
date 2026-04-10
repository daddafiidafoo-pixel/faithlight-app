import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, WifiOff } from 'lucide-react';
import { createPageUrl } from '../../utils';
import { EMPTY_STATES, FRIENDLY_ERRORS } from './liveEventWizardHelpers';

export function NoEventsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Calendar className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Live Events Yet</h3>
      <p className="text-gray-600 text-center mb-6 max-w-sm">{EMPTY_STATES.noEvents}</p>
      <Button
        onClick={() => window.location.href = createPageUrl('CreateLiveEvent')}
        className="bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)]"
      >
        Schedule Your First Event
      </Button>
    </div>
  );
}

export function NoFilterMatchEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Events Found</h3>
      <p className="text-gray-600 text-center mb-6 max-w-sm">{EMPTY_STATES.noMatch}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Clear Filters
      </Button>
    </div>
  );
}

export function OfflineEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-amber-50 border border-amber-200 rounded-lg">
      <WifiOff className="w-12 h-12 text-amber-600 mb-4" />
      <h3 className="text-lg font-semibold text-amber-900 mb-2">You're Offline</h3>
      <p className="text-amber-800 text-center mb-6 max-w-sm">{EMPTY_STATES.offline}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );
}

export function LoadError({ onRetry = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">Can't Load Right Now</h3>
      <p className="text-red-800 text-center mb-6 max-w-sm">{FRIENDLY_ERRORS.load}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Button
          onClick={onRetry || (() => window.location.reload())}
          className="bg-red-600 hover:bg-red-700"
        >
          Retry
        </Button>
      </div>
    </div>
  );
}