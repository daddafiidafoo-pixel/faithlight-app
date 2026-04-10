import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Trash2, Loader2, WifiOff } from 'lucide-react';
import {
  saveChapterAudio,
  isChapterDownloaded,
  deleteChapterAudio,
  getChapterAudioBlob,
  getBlobURL,
} from '@/lib/audioOfflineDB';
import { toast } from 'sonner';

/**
 * A self-contained button that:
 * - Downloads a Bible chapter MP3 to IndexedDB
 * - Shows download status (idle / downloading / saved / error)
 * - Can delete the cached file
 * - Exposes onOfflineReady(blobUrl) so parent can play offline audio
 */
export default function AudioChapterOfflineButton({
  book,
  chapter,
  translation,
  audioUrl,           // remote URL to download from
  onOfflineReady,     // called with blob URL when ready to play offline
  compact = false,
}) {
  const [status, setStatus] = useState('idle'); // idle | checking | downloading | saved | error
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!book || !chapter || !translation) return;
    setStatus('checking');
    isChapterDownloaded(book, chapter, translation)
      .then(ok => setStatus(ok ? 'saved' : 'idle'))
      .catch(() => setStatus('idle'));
  }, [book, chapter, translation]);

  const handleDownload = async () => {
    if (!audioUrl) {
      toast.error('No audio URL available for this chapter.');
      return;
    }
    setStatus('downloading');
    setProgress(0);
    try {
      await saveChapterAudio(book, chapter, translation, audioUrl);
      setStatus('saved');
      toast.success(`${book} ${chapter} saved for offline listening 📥`);
      // Provide blob URL to parent
      const entry = await getChapterAudioBlob(book, chapter, translation);
      if (entry && onOfflineReady) onOfflineReady(getBlobURL(entry.blob));
    } catch (err) {
      console.error('[AudioChapterOfflineButton] Download failed:', err);
      setStatus('error');
      toast.error('Download failed. Please try again.');
    }
  };

  const handleDelete = async () => {
    await deleteChapterAudio(book, chapter, translation);
    setStatus('idle');
    toast('Offline copy removed');
  };

  const handlePlay = async () => {
    const entry = await getChapterAudioBlob(book, chapter, translation);
    if (entry && onOfflineReady) onOfflineReady(getBlobURL(entry.blob));
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {status === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        {status === 'idle' && audioUrl && (
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            title="Download for offline"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
        {status === 'downloading' && (
          <div className="flex items-center gap-1 text-xs text-indigo-600">
            <Loader2 className="w-4 h-4 animate-spin" /> Saving…
          </div>
        )}
        {status === 'saved' && (
          <div className="flex items-center gap-1">
            <button onClick={handlePlay} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Play offline copy">
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Remove offline copy">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {status === 'error' && (
          <button onClick={handleDownload} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100" title="Retry download">
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {status === 'checking' && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Checking…
        </div>
      )}

      {status === 'idle' && (
        <button
          onClick={handleDownload}
          disabled={!audioUrl}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          {audioUrl ? 'Save for Offline' : 'Audio not available'}
        </button>
      )}

      {status === 'downloading' && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-700">Downloading…</p>
            <p className="text-xs text-indigo-500">Saving {book} {chapter} to your device</p>
          </div>
        </div>
      )}

      {status === 'saved' && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 flex-1">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-green-700">Saved Offline</p>
              <p className="text-xs text-green-600">{book} {chapter} · available without internet</p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2.5 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Remove offline copy"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {status === 'error' && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
        >
          <Download className="w-4 h-4" /> Retry Download
        </button>
      )}
    </div>
  );
}