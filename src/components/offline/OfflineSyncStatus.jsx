import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { OfflineSyncManager } from './OfflineSyncManager';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Show offline/online status and sync status
 */
export default function OfflineSyncStatus({ userId }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | success | error
  const [lastSync, setLastSync] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncManager, setSyncManager] = useState(null);

  // Initialize sync manager
  useEffect(() => {
    const manager = new OfflineSyncManager(base44, userId);
    setSyncManager(manager);

    // Setup listeners
    manager.setupListeners((result) => {
      if (result.synced > 0 || result.failed === 0) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
      }
      setPendingCount(0);
    });

    // Listen for online/offline changes
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      manager.syncOfflineChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId]);

  // Check pending items periodically
  useEffect(() => {
    const checkPending = async () => {
      try {
        const pending = await base44.entities.SyncQueue.filter(
          { user_id: userId, is_synced: false }
        );
        setPendingCount(pending.length);
      } catch (error) {
        console.error('Error checking pending items:', error);
      }
    };

    checkPending();
    const interval = setInterval(checkPending, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [userId]);

  const handleManualSync = async () => {
    if (!syncManager || !isOnline) return;
    setSyncStatus('syncing');
    const result = await syncManager.syncOfflineChanges();
    setSyncStatus(result.synced > 0 ? 'success' : 'idle');
  };

  return (
    <Card className={`border-l-4 ${isOnline ? 'border-l-green-500 bg-green-50' : 'border-l-orange-500 bg-orange-50'}`}>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-orange-600" />
          )}
          <div>
            <p className="font-semibold text-sm">
              {isOnline ? 'Online' : 'Offline Mode'}
            </p>
            {!isOnline ? (
              <p className="text-xs text-gray-600">Changes will sync when online</p>
            ) : pendingCount > 0 ? (
              <p className="text-xs text-gray-600">{pendingCount} pending changes</p>
            ) : (
              <p className="text-xs text-gray-600">All changes synced</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {syncStatus === 'success' && (
            <Badge className="bg-green-100 text-green-800 gap-1">
              <CheckCircle className="w-3 h-3" />
              Synced
            </Badge>
          )}
          {syncStatus === 'error' && (
            <Badge className="bg-red-100 text-red-800 gap-1">
              <AlertCircle className="w-3 h-3" />
              Sync Error
            </Badge>
          )}
          {isOnline && pendingCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualSync}
              disabled={syncStatus === 'syncing'}
              className="gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}