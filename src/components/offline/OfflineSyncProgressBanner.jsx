import React, { useEffect, useState } from 'react';
import { RefreshCw, Check } from 'lucide-react';

export default function OfflineSyncProgressBanner() {
  const [state, setState] = useState({ syncing: false, progress: 0, message: '', done: false });

  useEffect(() => {
    const onProgress = (e) => setState(prev => ({ ...prev, ...e.detail, done: false }));
    const onDone = () => {
      setState(prev => ({ ...prev, syncing: false, progress: 100, done: true }));
      setTimeout(() => setState({ syncing: false, progress: 0, message: '', done: false }), 3000);
    };

    window.addEventListener('faithlight:offlineSyncProgress', onProgress);
    window.addEventListener('faithlight:offlineSyncDone', onDone);
    return () => {
      window.removeEventListener('faithlight:offlineSyncProgress', onProgress);
      window.removeEventListener('faithlight:offlineSyncDone', onDone);
    };
  }, []);

  if (!state.syncing && !state.done) return null;

  return (
    <div className="bg-white border border-indigo-200 rounded-xl p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {state.done
            ? <Check className="w-4 h-4 text-green-600" />
            : <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
          }
          <span className="text-sm font-medium text-gray-800">
            {state.done ? 'Sync complete!' : (state.message || 'Syncing offline content…')}
          </span>
        </div>
        <span className="text-xs font-semibold text-indigo-600">{state.progress}%</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${state.done ? 'bg-green-500' : 'bg-indigo-500'}`}
          style={{ width: `${state.progress}%` }}
        />
      </div>
      {!state.done && (
        <p className="text-xs text-gray-400 mt-1.5">Keep the app open to finish syncing.</p>
      )}
    </div>
  );
}

export function emitSyncProgress(progress, message) {
  window.dispatchEvent(new CustomEvent('faithlight:offlineSyncProgress', {
    detail: { syncing: true, progress, message }
  }));
}

export function emitSyncDone() {
  window.dispatchEvent(new CustomEvent('faithlight:offlineSyncDone'));
}