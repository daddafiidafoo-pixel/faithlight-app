import React from 'react';
import { WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useOfflineCache } from './useOfflineCache';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';

export default function OfflineSyncBanner() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) base44.auth.me().then(me => setUserId(me?.id)).catch(() => {});
    }).catch(() => {});
  }, []);

  const { isOnline, syncStatus, pendingCount } = useOfflineCache(userId);

  if (isOnline && syncStatus === 'idle' && pendingCount === 0) return null;

  const configs = {
    offline: { bg: 'bg-orange-500', icon: <WifiOff className="w-4 h-4" />, msg: 'You are offline. Changes will sync when back online.' },
    syncing: { bg: 'bg-blue-500', icon: <RefreshCw className="w-4 h-4 animate-spin" />, msg: 'Syncing your offline changes...' },
    done:    { bg: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" />, msg: 'All changes synced!' },
    error:   { bg: 'bg-red-500',   icon: <AlertCircle className="w-4 h-4" />, msg: `${pendingCount} changes pending sync.` },
    pending: { bg: 'bg-yellow-500', icon: <RefreshCw className="w-4 h-4" />, msg: `${pendingCount} unsynced change${pendingCount > 1 ? 's' : ''} saved locally.` },
  };

  const key = !isOnline ? 'offline'
    : syncStatus === 'syncing' ? 'syncing'
    : syncStatus === 'done' ? 'done'
    : syncStatus === 'error' ? 'error'
    : pendingCount > 0 ? 'pending'
    : null;

  if (!key) return null;
  const { bg, icon, msg } = configs[key];

  return (
    <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 ${bg} text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium`}>
      {icon}
      <span>{msg}</span>
    </div>
  );
}