import React, { useState, useEffect } from 'react';
import { Download, Trash2, HardDrive, BookOpen, CheckCircle2 } from 'lucide-react';
import { getDownloadedChapters, deleteChapterOffline, getOfflineStorageSize } from '@/lib/offlineChapterDB';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function OfflineBibleManager({ languageCode }) {
  const [chapters, setChapters] = useState([]);
  const [storageSize, setStorageSize] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const downloadedChapters = await getDownloadedChapters(languageCode);
        setChapters(downloadedChapters);

        const size = await getOfflineStorageSize(languageCode);
        setStorageSize(size);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [languageCode]);

  const handleDeleteChapter = async (bibleId, book_id, chapter) => {
    try {
      await deleteChapterOffline(bibleId, languageCode, book_id, chapter);
      setChapters(prev =>
        prev.filter(ch => !(ch.book_id === book_id && ch.chapter === chapter))
      );
      const newSize = await getOfflineStorageSize(languageCode);
      setStorageSize(newSize);
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Storage Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <HardDrive className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">Offline Storage</h3>
        </div>
        <p className="text-2xl font-bold text-blue-600">{formatBytes(storageSize)}</p>
        <p className="text-sm text-slate-600 mt-2">{chapters.length} chapters downloaded</p>
      </div>

      {/* Chapters List */}
      {chapters.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No chapters downloaded yet</p>
          <p className="text-sm text-slate-500 mt-1">Download chapters from the Bible reader to read offline</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chapters.map(ch => (
            <div
              key={`${ch.book_id}-${ch.chapter}`}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-semibold text-slate-900">
                    {ch.book_id} {ch.chapter}
                  </p>
                  <p className="text-xs text-slate-600">{ch.verses?.length || 0} verses</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteChapter(ch.bible_id, ch.book_id, ch.chapter)}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                title="Delete offline copy"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}