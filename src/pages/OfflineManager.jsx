import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { HardDrive, Info, Loader2, Search, BookOpen, Volume2, BookMarked } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import TextDownloader from '../components/offline/TextDownloader';
import AudioDownloader from '../components/offline/AudioDownloader';
import DownloadedItemsList from '../components/offline/DownloadedItemsList';
import DownloadedContentManager from '../components/offline/DownloadedContentManager';
import OfflineStorageManager from '../components/offline/OfflineStorageManager';
import OfflineErrorHandler from '../components/offline/OfflineErrorHandler';

function QueueStatus() {
  const [queued, setQueued] = useState([]);
  const [failed, setFailed] = useState([]);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const load = () => {
      base44.entities.DownloadQueue.filter({ status: 'queued' }, 'created_date', 50)
        .then(setQueued).catch(() => {});
      base44.entities.DownloadQueue.filter({ status: 'failed' }, 'created_date', 50)
        .then(setFailed).catch(() => {});
    };
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);

  const retryFailed = async () => {
    setRetrying(true);
    await Promise.all(failed.map(f => base44.entities.DownloadQueue.update(f.id, { status: 'queued', error: null })));
    setFailed([]);
    setRetrying(false);
  };

  if (!queued.length && !failed.length) return null;
  return (
    <div className="space-y-2">
      {queued.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{queued.length} chapter{queued.length > 1 ? 's' : ''} queued for download…</span>
        </div>
      )}
      {failed.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
          <span>{failed.length} chapter{failed.length > 1 ? 's' : ''} failed</span>
          <button onClick={retryFailed} disabled={retrying}
            className="font-semibold underline hover:text-red-900 disabled:opacity-50">
            {retrying ? 'Retrying…' : 'Retry all'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function OfflineManager() {
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleQueued = () => setRefreshKey(k => k + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gray-800 flex items-center justify-center shadow-md">
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Offline Bible Downloads</h1>
            <p className="text-xs text-gray-400">Download Bible text and audio for use without internet</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3 flex-wrap">
          <Link to={createPageUrl('OfflineReader')}
            className="flex-1 min-w-fit flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-200 hover:bg-indigo-50 transition-all text-sm font-medium text-gray-700">
            <BookOpen className="w-4 h-4 text-indigo-500" /> Read Offline
          </Link>
          <Link to={createPageUrl('OfflineSearch')}
            className="flex-1 min-w-fit flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-200 hover:bg-indigo-50 transition-all text-sm font-medium text-gray-700">
            <Search className="w-4 h-4 text-indigo-500" /> Search Library
          </Link>
          <Link to={createPageUrl('OfflineNotesLibrary')}
            className="flex-1 min-w-fit flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-200 hover:bg-indigo-50 transition-all text-sm font-medium text-gray-700">
            <BookMarked className="w-4 h-4 text-indigo-500" /> Notes & Highlights
          </Link>
        </div>

        {/* Queue status */}
        <QueueStatus />

        {/* Info note */}
        <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p><strong>📖 Offline Reading (Text):</strong> Fully offline — chapters are saved to the database and readable with zero internet.</p>
            <p><strong>🔊 Audio Streaming:</strong> Saves the stream URL so playback is instant with no API delay — but still requires an internet connection to play.</p>
          </div>
        </div>

        {/* Text downloader */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <TextDownloader user={user} onQueued={handleQueued} />
          </CardContent>
        </Card>

        {/* Audio downloader */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <AudioDownloader user={user} onQueued={handleQueued} />
          </CardContent>
        </Card>

        {/* Storage Manager */}
        <OfflineStorageManager userId={user?.id} />

        {/* Error Handler */}
        {downloadError && (
          <OfflineErrorHandler
            error={downloadError}
            onRetry={() => setDownloadError(null)}
            onDismiss={() => setDownloadError(null)}
          />
        )}

        {/* Downloaded Content Manager */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <DownloadedContentManager user={user} onError={setDownloadError} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}