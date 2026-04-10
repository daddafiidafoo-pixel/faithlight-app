import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { OfflineProgressSync } from './OfflineProgressSync';
import { WifiOff, Wifi, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function OfflineDetector({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await syncProgressWhenOnline();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You are offline. Changes will sync when you reconnect.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncProgressWhenOnline = async () => {
    setSyncing(true);
    try {
      const user = await base44.auth.me();
      if (user?.id) {
        const result = await OfflineProgressSync.syncProgressToServer(user.id);
        
        if (result.success) {
          setSyncStatus({ synced: result.synced, failed: result.failed });
          if (result.synced > 0) {
            toast.success(`Synced ${result.synced} progress update(s)`);
          }
        } else if (result.synced > 0 && result.failed > 0) {
          toast.warning(`Synced ${result.synced} items, ${result.failed} failed`);
        } else if (result.failed > 0) {
          toast.error('Failed to sync some progress updates');
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync progress');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <WifiOff className="w-5 h-5" />
          <span>You are offline. Changes will sync when connected.</span>
        </div>
      )}

      {/* Sync Status Indicator */}
      {syncing && (
        <div className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Wifi className="w-5 h-5 animate-pulse" />
          <span>Syncing progress...</span>
        </div>
      )}

      {syncStatus && !syncing && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>Synced {syncStatus.synced} update(s)</span>
        </div>
      )}

      {children}
    </>
  );
}