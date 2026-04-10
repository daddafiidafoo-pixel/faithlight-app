import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Trash2, Loader } from 'lucide-react';
import { isChapterCached, saveChapterToCache, removeChapterFromCache } from '../../hooks/useOfflineCache';

export default function OfflineDownloadButton({ bookId, bookName, chapter, verses }) {
  const [cached, setCached] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCached(isChapterCached(bookId, chapter));
  }, [bookId, chapter]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 300)); // brief UX pause
    saveChapterToCache(bookId, chapter, verses || [], bookName);
    setCached(true);
    setSaving(false);
  };

  const handleRemove = () => {
    removeChapterFromCache(bookId, chapter);
    setCached(false);
  };

  if (saving) {
    return (
      <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-400 text-xs font-medium">
        <Loader className="w-3.5 h-3.5 animate-spin" /> Saving...
      </button>
    );
  }

  if (cached) {
    return (
      <button
        onClick={handleRemove}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        title="Remove from offline"
      >
        <CheckCircle className="w-3.5 h-3.5" /> Saved Offline
        <Trash2 className="w-3 h-3 ml-0.5 opacity-50" />
      </button>
    );
  }

  return (
    <button
      onClick={handleSave}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium hover:bg-indigo-100 transition-colors"
      title="Save for offline reading"
    >
      <Download className="w-3.5 h-3.5" /> Save Offline
    </button>
  );
}