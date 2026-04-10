/**
 * OfflineBanner
 * ─────────────
 * Shows a non-intrusive banner when the user is offline.
 * Place this near the top of any page that has online-dependent content.
 */
import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

export default function OfflineBanner({ message }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const on  = () => { setIsOffline(false); setDismissed(false); };
    const off = () => setIsOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span className="flex-1">
        {message || 'You\'re offline — showing saved Bible chapters only.'}
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded hover:bg-amber-100 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}