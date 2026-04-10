import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Trash2, HardDrive, DownloadCloud } from 'lucide-react';

export default function BibleOfflineManager() {
  const [downloads, setDownloads] = useState([]);
  const [storageSize, setStorageSize] = useState('0');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = () => {
    const metadata = JSON.parse(localStorage.getItem('bible_downloads') || '{}');
    const items = Object.values(metadata).sort((a, b) => 
      new Date(b.downloadedAt) - new Date(a.downloadedAt)
    );
    setDownloads(items);
    calculateStorageSize();
  };

  const calculateStorageSize = () => {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bible_')) {
        totalSize += localStorage.getItem(key).length;
      }
    }
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    setStorageSize(sizeInMB);
  };

  const handleDelete = (download) => {
    if (download.type === 'book') {
      localStorage.removeItem(`bible_book_${download.book}_${download.translation}`);
    } else {
      localStorage.removeItem(`bible_${download.book}_${download.chapter}_${download.translation}`);
    }

    const metadata = JSON.parse(localStorage.getItem('bible_downloads') || '{}');
    const key = Object.keys(metadata).find(k => {
      const item = metadata[k];
      return item.book === download.book && 
             item.translation === download.translation &&
             ((download.type === 'book' && item.type === 'book') ||
              (download.type === 'chapter' && item.chapter === download.chapter));
    });
    if (key) delete metadata[key];
    localStorage.setItem('bible_downloads', JSON.stringify(metadata));

    setDeleteConfirm(null);
    loadDownloads();
  };

  const handleClearAll = () => {
    if (window.confirm('Delete ALL offline Bible content? This cannot be undone.')) {
      const metadata = JSON.parse(localStorage.getItem('bible_downloads') || '{}');
      Object.values(metadata).forEach(item => {
        if (item.type === 'book') {
          localStorage.removeItem(`bible_book_${item.book}_${item.translation}`);
        } else {
          localStorage.removeItem(`bible_${item.book}_${item.chapter}_${item.translation}`);
        }
      });
      localStorage.removeItem('bible_downloads');
      loadDownloads();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <DownloadCloud className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bible Offline Library</h1>
              <p className="text-gray-600">Manage downloaded Bible books and chapters</p>
            </div>
          </div>

          {/* Storage Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Downloaded Items</p>
                  <p className="text-2xl font-bold text-indigo-600">{downloads.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold text-indigo-600">{storageSize} MB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verses Available</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {downloads.reduce((sum, d) => sum + (d.verseCount || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {downloads.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleClearAll} className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Downloads
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Downloads List */}
        {downloads.length > 0 ? (
          <div className="space-y-3">
            {downloads.map((download, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {download.book}
                        {download.type === 'chapter' && ` · Chapter ${download.chapter}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {download.type === 'book' ? `Full book • ${download.chapterCount} chapters • ` : ''}
                        {download.verseCount.toLocaleString()} verses •{' '}
                        {new Date(download.downloadedAt).toLocaleDateString()} • {download.translation}
                      </p>
                    </div>
                  </div>

                  <Dialog open={deleteConfirm === idx} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(idx)}
                        className="ml-2"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Offline Download?</DialogTitle>
                      </DialogHeader>
                      <p className="text-gray-600">
                        Delete {download.book}
                        {download.type === 'chapter' && ` Chapter ${download.chapter}`} from your device?
                      </p>
                      <div className="flex gap-2 justify-end mt-4">
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => handleDelete(download)}>Delete</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Offline Content</h3>
              <p className="text-gray-600">
                Open the Bible Reader and tap the download icon to save books or chapters for offline reading.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}