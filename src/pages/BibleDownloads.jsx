import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, BookOpen, HardDrive } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BibleDownloads() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('User not logged in');
      }
    };
    fetchUser();
  }, []);

  const { data: downloads = [], refetch } = useQuery({
    queryKey: ['offline-downloads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const offline = await base44.entities.OfflineText.filter(
          { user_id: user.id },
          '-downloaded_date',
          100
        );
        return offline || [];
      } catch (error) {
        console.error('Failed to load downloads:', error);
        return [];
      }
    },
    enabled: !!user?.id
  });

  const handleDelete = async (downloadId) => {
    try {
      await base44.entities.OfflineText.delete(downloadId);
      toast.success('Download removed');
      refetch();
    } catch (error) {
      toast.error('Failed to remove download');
    }
  };

  const calculateTotalSize = () => {
    // Rough estimate: average 3KB per verse
    const totalVerses = downloads.reduce((sum, d) => sum + (d.total_verses || 0), 0);
    const sizeKB = totalVerses * 3;
    
    if (sizeKB < 1024) return `${sizeKB} KB`;
    return `${(sizeKB / 1024).toFixed(1)} MB`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">Please log in to view downloads</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bible Downloads</h1>
          <p className="text-gray-600">Manage your offline Bible content</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <HardDrive className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900">{calculateTotalSize()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Chapters Downloaded</p>
                <p className="text-2xl font-bold text-gray-900">{downloads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {downloads.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Downloads Yet</h3>
              <p className="text-gray-600 mb-4">
                Download Bible chapters for offline reading
              </p>
              <Button onClick={() => window.location.href = '/BibleReader'}>
                Go to Bible Reader
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {downloads.map((download) => (
              <Card key={download.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {download.book_name} {download.chapter_number}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {download.translation_id}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {download.total_verses} verses
                          </span>
                          <span className="text-xs text-gray-400">
                            Downloaded {new Date(download.downloaded_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(download.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}