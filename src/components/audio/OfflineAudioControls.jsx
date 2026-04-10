import React, { useState, useEffect } from 'react';
import { Download, Trash2, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { saveAudioChapter, deleteAudioChapter, getOfflineStorage } from '@/lib/offlineDb';

export default function OfflineAudioControls({ chapterRef, audioUrl, onOfflineMode }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);

  useEffect(() => {
    getOfflineStorage().then(setStorageInfo);
  }, [downloaded]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await saveAudioChapter(chapterRef, audioUrl);
      setDownloaded(true);
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAudioChapter(chapterRef);
      setDownloaded(false);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
      {downloading ? (
        <div className="flex-1 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-600">Downloading...</span>
        </div>
      ) : downloaded ? (
        <>
          <div className="flex-1 flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Downloaded</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600 flex-1">Not Downloaded</span>
          <Button
            size="sm"
            onClick={handleDownload}
            className="h-8 gap-1"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </>
      )}

      {storageInfo && (
        <span className="text-xs text-slate-500">
          {storageInfo.sizeMB}MB
        </span>
      )}
    </div>
  );
}