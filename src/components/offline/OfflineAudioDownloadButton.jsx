import React, { useState, useEffect } from 'react';
import { Download, Check, AlertCircle, Trash2 } from 'lucide-react';
import {
  downloadAudioChapter,
  isAudioDownloaded,
  removeOfflineAudio,
} from '@/lib/offlineAudioManager';

export default function OfflineAudioDownloadButton({
  filesetId,
  bookId,
  chapter,
  audioUrl,
  language_code,
  reference,
  verseText,
}) {
  const [status, setStatus] = useState('idle'); // idle, downloading, downloaded, error
  const [showDelete, setShowDelete] = useState(false);

  const audioId = `${language_code}:${filesetId}:${bookId}:${chapter}`;

  // Check if already downloaded on mount
  useEffect(() => {
    const checkStatus = async () => {
      const isDownloaded = await isAudioDownloaded(audioId);
      if (isDownloaded) {
        setStatus('downloaded');
      }
    };
    checkStatus();
  }, [audioId]);

  const handleDownload = async () => {
    try {
      setStatus('downloading');
      await downloadAudioChapter({
        filesetId,
        bookId,
        chapter,
        audioUrl,
        language_code,
        reference,
        verseText,
      });
      setStatus('downloaded');
    } catch (error) {
      console.error('Download failed:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleDelete = async () => {
    try {
      await removeOfflineAudio(audioId);
      setStatus('idle');
      setShowDelete(false);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (status === 'downloading') {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium cursor-not-allowed"
      >
        <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
        Downloading...
      </button>
    );
  }

  if (status === 'downloaded') {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium"
        >
          <Check className="w-4 h-4" />
          Downloaded
        </button>
        {showDelete ? (
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-2 py-2 rounded-lg bg-red-50 text-red-700 text-sm hover:bg-red-100"
              title="Confirm delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="px-2 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200"
              title="Cancel"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="px-2 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200"
            title="Remove download"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100"
      >
        <AlertCircle className="w-4 h-4" />
        Retry
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
    >
      <Download className="w-4 h-4" />
      Download
    </button>
  );
}