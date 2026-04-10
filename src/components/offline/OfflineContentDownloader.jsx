import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Trash2, Pin, Loader2, CheckCircle, HardDrive } from 'lucide-react';
import { initializeDB, getOfflineContent, deleteOfflineContent, getTotalStorageUsed } from '@/lib/offlineStorageManager';

/**
 * Download and manage offline content (courses/lessons)
 */
export default function OfflineContentDownloader({ userId }) {
  const [offlineDB, setOfflineDB] = useState(null);
  const queryClient = useQueryClient();

  // Initialize IndexedDB
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.indexedDB) {
      initializeDB()
        .then(db => setOfflineDB(db))
        .catch(err => console.warn('IndexedDB unavailable:', err));
    }
  }, []);

  // Get all available courses
  const { data: courses = [] } = useQuery({
    queryKey: ['available-courses'],
    queryFn: async () => {
      return await base44.entities.Course.filter(
        { is_published: true },
        '-created_at',
        20
      );
    },
  });

  // Get offline content
  const { data: offlineContent = [], isLoading } = useQuery({
    queryKey: ['offline-content', userId],
    queryFn: async () => {
      if (!offlineDB) return [];
      try {
        return await getOfflineContent(userId);
      } catch (error) {
        console.warn('Error loading offline content:', error);
        return [];
      }
    },
    enabled: !!offlineDB,
    refetchInterval: 10000,
    retry: false,
  });

  // Get storage info
  const { data: storageInfo } = useQuery({
    queryKey: ['storage-used', userId],
    queryFn: async () => {
      if (!offlineDB) return { used: 0, available: 5 * 1024 * 1024 * 1024 };
      try {
        const used = await getTotalStorageUsed(userId);
        return { used, available: 5 * 1024 * 1024 * 1024 };
      } catch (error) {
        console.warn('Error calculating storage:', error);
        return { used: 0, available: 5 * 1024 * 1024 * 1024 };
      }
    },
    enabled: !!offlineDB,
    retry: false,
  });

  // Download course mutation
  const downloadCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await base44.functions.invoke('downloadCourseForOffline', {
        user_id: userId,
        course_id: courseId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-content'] });
      queryClient.invalidateQueries({ queryKey: ['storage-used'] });
    },
  });

  // Delete offline content mutation
  const deleteContentMutation = useMutation({
    mutationFn: async (content) => {
      await deleteOfflineContent(userId, content.content_type, content.content_id);
      return content;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-content'] });
      queryClient.invalidateQueries({ queryKey: ['storage-used'] });
    },
  });

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const percentageUsed = storageInfo ? Math.floor((storageInfo.used / storageInfo.available) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Offline Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{formatBytes(storageInfo?.used || 0)} used</span>
              <span className="text-sm text-gray-600">{formatBytes(storageInfo?.available || 0)} available</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  percentageUsed > 80 ? 'bg-red-500' : percentageUsed > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${percentageUsed}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">{percentageUsed}% used</p>
          </div>
        </CardContent>
      </Card>

      {/* Downloaded Content */}
      {offlineContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Downloaded Content ({offlineContent.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {offlineContent.map((content) => (
              <div key={`${content.content_type}_${content.content_id}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{content.content_title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {content.content_type}
                    </Badge>
                    <span className="text-xs text-gray-600">
                      {formatBytes(content.file_size_bytes || 0)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(content.downloaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={content.is_pinned ? 'text-yellow-600' : ''}
                  >
                    <Pin className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteContentMutation.mutate(content)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Courses to Download */}
      <Card>
        <CardHeader>
          <CardTitle>Download for Offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-sm text-gray-600">No courses available</p>
          ) : (
            courses.map((course) => {
              const isDownloaded = offlineContent.some(
                c => c.content_type === 'course' && c.content_id === course.id
              );

              return (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{course.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{course.duration_hours}h • Level {course.level}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={isDownloaded ? 'outline' : 'default'}
                    disabled={isDownloaded || downloadCourseMutation.isPending}
                    onClick={() => downloadCourseMutation.mutate(course.id)}
                    className="gap-1"
                  >
                    {isDownloaded ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Downloaded
                      </>
                    ) : downloadCourseMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Downloading
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}