import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Check, Loader2 } from 'lucide-react';
import { OfflineStorage } from './OfflineStorage';
import { toast } from 'sonner';

export default function LessonDownloader({ lesson, onDownloadComplete }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(
    OfflineStorage.isLessonOffline(lesson.id)
  );

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const success = OfflineStorage.saveLesson(lesson);
      if (success) {
        setIsDownloaded(true);
        toast.success('Lesson downloaded for offline access');
        onDownloadComplete?.();
      } else {
        toast.error('Failed to download lesson');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download lesson');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Remove offline access to this lesson?')) {
      OfflineStorage.removeLesson(lesson.id);
      setIsDownloaded(false);
      toast.success('Offline access removed');
    }
  };

  if (isDownloaded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        className="text-red-600 hover:bg-red-50 gap-2"
        title="Remove offline access"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Remove Offline</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isDownloading}
      className="gap-2"
      title="Download for offline access"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline">Downloading...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </>
      )}
    </Button>
  );
}