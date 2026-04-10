import React, { useState, useEffect } from 'react';
import { useOfflineChapters } from '../hooks/useOfflineChapters';
import { Button } from '@/components/ui/button';
import { Download, Trash2, WifiOff } from 'lucide-react';

export default function OfflineChapterDownloader({ chapterId, chapterData }) {
  const { savedChapters, loading, saveChapter, deleteChapter, refreshSavedChapters } = useOfflineChapters();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    refreshSavedChapters();
  }, [refreshSavedChapters]);

  useEffect(() => {
    setIsSaved(savedChapters.some((ch) => ch.id === chapterId));
  }, [savedChapters, chapterId]);

  const handleSave = async () => {
    if (!chapterData) return;
    await saveChapter(chapterId, chapterData);
  };

  const handleDelete = async () => {
    await deleteChapter(chapterId);
  };

  return (
    <div className="flex items-center gap-2">
      {isSaved ? (
        <>
          <span className="flex items-center gap-1 text-sm text-green-600">
            <WifiOff className="w-4 h-4" />
            Saved for offline
          </span>
          <Button
            onClick={handleDelete}
            size="sm"
            variant="outline"
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <Button
          onClick={handleSave}
          size="sm"
          disabled={loading}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save for Offline'}
        </Button>
      )}
    </div>
  );
}