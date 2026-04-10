import React from 'react';
import { Check, Download, Cloud } from 'lucide-react';

/**
 * Badge showing offline availability status of a chapter
 */
export default function OfflineStatusBadge({ isOffline, isDarkMode = false }) {
  if (!isOffline) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
        style={{
          backgroundColor: isDarkMode ? '#1F2937' : '#DBEAFE',
          color: isDarkMode ? '#93C5FD' : '#1E40AF',
        }}
      >
        <Cloud className="w-3 h-3" />
        Online
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
      style={{
        backgroundColor: isDarkMode ? '#064E3B' : '#D1FAE5',
        color: isDarkMode ? '#6EE7B7' : '#065F46',
      }}
    >
      <Check className="w-3 h-3" />
      Offline ✓
    </div>
  );
}