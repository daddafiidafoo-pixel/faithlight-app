import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Wifi, WifiOff, CheckCircle2, AlertCircle, Loader, Trash2 } from 'lucide-react';
import { useI18n } from '../I18nProvider';
import { base44 } from '@/api/base44Client';

export default function OfflineSyncManagerV2() {
  const { t } = useI18n();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloads, setDownloads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [pendingChanges, setPendingChanges] = useState(0);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [syncError, setSyncError] = useState(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      autoSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline downloads from local storage
  useEffect(() => {
    loadDownloads();
    loadPendingChanges();
  }, []);

  const loadDownloads = async () => {
    try {
      const stored = localStorage.getItem('offline_downloads');
      if (stored) {
        setDownloads(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load downloads:', err);
    }
  };

  const loadPendingChanges = async () => {
    try {
      const stored = localStorage.getItem('pending_offline_changes');
      if (stored) {
        const changes = JSON.parse(stored);
        setPendingChanges(changes.length);
      }
    } catch (err) {
      console.error('Failed to load pending changes:', err);
    }
  };

  const downloadBook = async (bookName, chapters) => {
    setDownloadProgress((prev) => ({ ...prev, [bookName]: 0 }));

    let downloadItem;
    try {
      downloadItem = {
        id: Date.now(),
        type: 'book',
        name: bookName,
        chapters,
        status: 'downloading',
        downloadedAt: new Date(),
        size: 0,
      };

      setDownloads((prev) => [...prev, downloadItem]);

      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setDownloadProgress((prev) => ({ ...prev, [bookName]: i }));
      }

      setDownloads((prev) => prev.map(d => d.id === downloadItem.id ? { ...d, status: 'completed' } : d));
      localStorage.setItem('offline_downloads', JSON.stringify(downloads));
      loadDownloads();
    } catch (err) {
      console.error('Download failed:', err);
      setDownloads((prev) => prev.map(d => d.id === downloadItem.id ? { ...d, status: 'failed' } : d));
    }
  };

  const downloadAudioChapters = async (bookName, chapters) => {
    const key = `${bookName}_audio`;
    setDownloadProgress((prev) => ({ ...prev, [key]: 0 }));

    try {
      const downloadItem = {
        id: Date.now(),
        type: 'audio',
        name: `${bookName} (Audio)`,
        chapters,
        status: 'downloading',
        downloadedAt: new Date(),
      };

      setDownloads((prev) => [...prev, downloadItem]);

      for (let i = 0; i <= 100; i += 15) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setDownloadProgress((prev) => ({ ...prev, [key]: i }));
      }

      downloadItem.status = 'completed';
      localStorage.setItem('offline_downloads', JSON.stringify(downloads));
      loadDownloads();
    } catch (err) {
      console.error('Audio download failed:', err);
    }
  };

  const downloadReadingPlan = async (planId, planName) => {
    setDownloadProgress((prev) => ({ ...prev, [planId]: 0 }));

    try {
      const plan = await base44.entities.ReadingPlan.filter({ id: planId });
      const downloadItem = {
        id: planId,
        type: 'plan',
        name: planName,
        status: 'downloading',
        downloadedAt: new Date(),
      };

      setDownloads((prev) => [...prev, downloadItem]);

      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setDownloadProgress((prev) => ({ ...prev, [planId]: i }));
      }

      downloadItem.status = 'completed';
      localStorage.setItem('offline_downloads', JSON.stringify(downloads));
      localStorage.setItem(`plan_${planId}`, JSON.stringify(plan));
      loadDownloads();
    } catch (err) {
      console.error('Plan download failed:', err);
    }
  };

  const autoSync = async () => {
    if (!isOnline || uploading || pendingChanges === 0) return;

    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const pending = localStorage.getItem('pending_offline_changes');
      if (!pending) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
        return;
      }

      const changes = JSON.parse(pending);

      // Upload highlights
      const highlights = changes.filter((c) => c.type === 'highlight');
      for (const h of highlights) {
        await base44.entities.VerseHighlight.create({
          verse_ref: h.verseRef,
          color: h.color,
          user_id: h.userId,
        });
      }

      // Upload notes
      const notes = changes.filter((c) => c.type === 'note');
      for (const n of notes) {
        await base44.entities.VerseNote.create({
          verse_ref: n.verseRef,
          content: n.content,
          user_id: n.userId,
        });
      }

      // Upload reading progress
      const progress = changes.filter((c) => c.type === 'progress');
      for (const p of progress) {
        await base44.entities.ReadingHistory.create({
          verse_ref: p.verseRef,
          read_at: new Date(),
          user_id: p.userId,
        });
      }

      localStorage.removeItem('pending_offline_changes');
      setPendingChanges(0);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncStatus('error');
      setSyncError(err.message || 'Sync failed');
    }
  };

  const deleteDownload = (id) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
    localStorage.setItem('offline_downloads', JSON.stringify(downloads.filter((d) => d.id !== id)));
  };

  const getTotalSize = () => {
    return (downloads.reduce((sum, d) => sum + (d.size || 50), 0) / 1024).toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Connection Status */}
      <div
        className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
          isOnline
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-semibold text-green-900 dark:text-green-300">
                {t('offline.online', 'Online')}
              </p>
              <p className="text-sm text-green-800 dark:text-green-400">
                {pendingChanges > 0 ? `${pendingChanges} changes ready to sync` : 'All synced'}
              </p>
            </div>
            {pendingChanges > 0 && (
              <Button
                onClick={autoSync}
                disabled={uploading}
                size="sm"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-900 dark:text-yellow-300">
                {t('offline.offline', 'Offline')}
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                {pendingChanges > 0
                  ? `${pendingChanges} changes will sync when online`
                  : 'Using offline content'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Sync Status */}
      {syncStatus !== 'idle' && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 ${
            syncStatus === 'syncing'
              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300'
              : syncStatus === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-300'
          }`}
        >
          {syncStatus === 'syncing' ? (
            <>
              <Loader className="w-4 h-4 animate-spin text-blue-600" />
              <p className="text-sm text-blue-900 dark:text-blue-300">Syncing your changes...</p>
            </>
          ) : syncStatus === 'success' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-900 dark:text-green-300">Sync complete!</p>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-900 dark:text-red-300">{syncError}</p>
            </>
          )}
        </div>
      )}

      {/* Download Books */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            {t('offline.downloadBible', 'Download Bible Books')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Genesis', 'Exodus', 'Matthew', 'Mark', 'Luke', 'John', 'Romans', 'Psalms'].map((book) => (
              <Button
                key={book}
                variant="outline"
                size="sm"
                onClick={() => downloadBook(book, 'all')}
                className="text-xs h-8"
              >
                {book}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Download Status */}
      {downloads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('offline.downloads', 'Downloaded Content')} ({downloads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('offline.totalSize', 'Total storage used')}: {getTotalSize()} MB
            </p>

            {downloads.map((download) => (
              <div key={download.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {download.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {download.type} • {new Date(download.downloadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={download.status === 'completed' ? 'default' : 'outline'}
                    className="ml-2"
                  >
                    {download.status}
                  </Badge>
                </div>

                {download.status === 'downloading' && (
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all"
                      style={{ width: `${downloadProgress[download.name] || 0}%` }}
                    />
                  </div>
                )}

                {download.status === 'completed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDownload(download.id)}
                    className="h-6 text-xs text-red-600"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}