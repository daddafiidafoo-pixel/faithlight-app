import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { OfflineStorage } from './OfflineStorage';

export default function OfflineDownloadButton({ 
  type = 'lesson', // 'lesson', 'translation', 'course'
  data,
  onDownloadComplete
}) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    checkIfDownloaded();
  }, [data, type]);

  const checkIfDownloaded = () => {
    if (type === 'lesson') {
      setIsDownloaded(OfflineStorage.isLessonOffline(data.id));
    } else if (type === 'translation') {
      const translations = OfflineStorage.getAllTranslations();
      setIsDownloaded(!!translations[data.translation_code]);
    } else if (type === 'course') {
      const courses = OfflineStorage.getAllCourses();
      setIsDownloaded(!!courses[data.id]);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (type === 'lesson') {
        OfflineStorage.saveLesson(data);
      } else if (type === 'translation') {
        // Simulate download - in real app, fetch verses from API
        OfflineStorage.saveTranslation(data.translation_code, []);
      } else if (type === 'course') {
        OfflineStorage.saveCourse(data, []);
      }
      
      setIsDownloaded(true);
      if (onDownloadComplete) onDownloadComplete();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Remove offline access to this content?')) {
      if (type === 'lesson') {
        OfflineStorage.removeLesson(data.id);
      } else if (type === 'translation') {
        OfflineStorage.removeTranslation(data.translation_code);
      } else if (type === 'course') {
        OfflineStorage.removeCourse(data.id);
      }
      setIsDownloaded(false);
    }
  };

  return (
    <>
      {isDownloaded ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="gap-2 text-green-600 hover:text-red-600"
        >
          <CheckCircle className="w-4 h-4" />
          Downloaded
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
          className="gap-2"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download
            </>
          )}
        </Button>
      )}
    </>
  );
}