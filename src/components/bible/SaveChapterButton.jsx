import React, { useState, useEffect } from 'react';
import { Download, Check, Trash2, Loader } from 'lucide-react';
import { isChapterSaved, saveChapter, deleteChapter } from '@/lib/offlineChapterDB';
import { toast } from 'sonner';

/**
 * Drop-in button for any chapter view.
 * Props: bookCode, bookName, chapter, verses (array of {verse, text}), translation
 */
export default function SaveChapterButton({ bookCode, bookName, chapter, verses, translation = 'web', className = '' }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isChapterSaved(bookCode, chapter, translation).then(setSaved);
  }, [bookCode, chapter, translation]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (saved) {
        await deleteChapter(bookCode, chapter, translation);
        setSaved(false);
        toast.success('Chapter removed from offline library');
      } else {
        await saveChapter({ bookCode, bookName, chapter, verses, translation });
        setSaved(true);
        toast.success('Chapter saved for offline reading ✓');
      }
    } catch {
      toast.error('Failed to update offline storage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading || !verses?.length}
      title={saved ? 'Remove from offline' : 'Save for offline'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 ${
        saved
          ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
      } ${className}`}
    >
      {loading ? (
        <Loader size={12} className="animate-spin" />
      ) : saved ? (
        <Check size={12} />
      ) : (
        <Download size={12} />
      )}
      {saved ? 'Saved' : 'Save Offline'}
    </button>
  );
}