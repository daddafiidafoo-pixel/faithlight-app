import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Trash2, BookOpen, HardDrive } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { OfflineStorage } from '../components/OfflineStorage';

export default function OfflineLessons() {
  const [offlineLessons, setOfflineLessons] = useState([]);
  const [storageInfo, setStorageInfo] = useState({ kb: '0', lessonCount: 0 });

  useEffect(() => {
    loadOfflineLessons();
  }, []);

  const loadOfflineLessons = () => {
    const lessons = OfflineStorage.getAllLessons();
    setOfflineLessons(Object.values(lessons));
    setStorageInfo(OfflineStorage.getStorageSize());
  };

  const handleRemoveLesson = (lessonId) => {
    if (confirm('Remove this lesson from offline storage?')) {
      OfflineStorage.removeLesson(lessonId);
      loadOfflineLessons();
    }
  };

  const handleClearAll = () => {
    if (confirm('Remove all offline lessons? This cannot be undone.')) {
      OfflineStorage.clearAll();
      loadOfflineLessons();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <WifiOff className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Offline Lessons</h1>
              <p className="text-gray-600">Access your downloaded lessons without internet</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {storageInfo.lessonCount} lesson{storageInfo.lessonCount !== 1 ? 's' : ''} • {storageInfo.kb} KB
                    </span>
                  </div>
                </div>
                {offlineLessons.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleClearAll}>
                    Clear All
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {offlineLessons.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <WifiOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Offline Lessons</h3>
              <p className="text-gray-600 mb-4">
                Download lessons from the library to access them without internet
              </p>
              <Link to={createPageUrl('Home')}>
                <Button>Browse Lessons</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {offlineLessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <Link to={createPageUrl(`LessonView?id=${lesson.id}`)} className="flex gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{lesson.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          {lesson.scripture_references && (
                            <Badge variant="outline" className="text-xs">
                              {lesson.scripture_references}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            Downloaded {new Date(lesson.downloadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLesson(lesson.id)}
                      title="Remove offline access"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}