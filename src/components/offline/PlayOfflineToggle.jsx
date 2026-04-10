import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function PlayOfflineToggle({ playOffline, onChange }) {
  return (
    <label className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={playOffline}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded cursor-pointer"
      />
      <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {playOffline ? (
          <>
            <WifiOff className="w-4 h-4 text-slate-600" />
            Play Offline
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 text-slate-600" />
            Play Online
          </>
        )}
      </span>
    </label>
  );
}