import React from 'react';
import { Clock } from 'lucide-react';

/**
 * Honest placeholder for offline Bible download.
 * Replaces any fake "Saved" / "0.0 MB" UI until real download is implemented.
 */
export default function BibleOfflineDownloadButton({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 ${className}`}>
      <Clock size={14} className="text-gray-400 flex-shrink-0" />
      <span>Offline Bible — coming soon</span>
    </div>
  );
}