import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Trash2 } from 'lucide-react';
import { OfflineStorage } from './OfflineStorage';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CourseDownloader({ course, onDownloadComplete }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(() => {
    const courses = OfflineStorage.getAllCourses();
    return !!courses[course.id];
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch all lessons in the course
      const lessons = await base44.entities.Lesson.filter(
        { course_id: course.id, status: 'approved' },
        '-created_date',
        1000
      );

      if (lessons.length === 0) {
        toast.error('No lessons found in this course');
        setIsDownloading(false);
        return;
      }

      // Save course with all lessons
      const success = OfflineStorage.saveCourse(course, lessons);
      
      if (success) {
        setIsDownloaded(true);
        toast.success(`Course downloaded with ${lessons.length} lessons`);
        onDownloadComplete?.();
      } else {
        toast.error('Failed to download course');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download course');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Remove offline access to this course?')) {
      OfflineStorage.removeCourse(course.id);
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
      title="Download entire course for offline access"
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