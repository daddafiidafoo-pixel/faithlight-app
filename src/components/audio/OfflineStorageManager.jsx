import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { HardDrive, Trash2, RefreshCw } from 'lucide-react';
import offlineAudioStorage from '@/functions/offlineAudioStorage';
import { toast } from 'sonner';

export default function OfflineStorageManager() {
  const [storageUsage, setStorageUsage] = useState(null);
  const [downloadedFiles, setDownloadedFiles] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    setIsLoading(true);
    try {
      const usage = await offlineAudioStorage.getStorageUsage();
      const files = await offlineAudioStorage.getAllDownloaded();
      
      setStorageUsage(usage);
      setDownloadedFiles(files);
    } catch (error) {
      console.error('Failed to load storage info:', error);
      toast.error('Failed to load storage info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all offline audio files? This cannot be undone.')) return;

    try {
      await offlineAudioStorage.clearAll();
      setDownloadedFiles([]);
      setStorageUsage({ totalSize: 0, fileCount: 0, formattedSize: '0 Bytes' });
      toast.success('Offline storage cleared');
      setShowDetails(false);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      toast.error('Failed to clear storage');
    }
  };

  const handleDeleteFile = async (book, chapter, translation) => {
    try {
      await offlineAudioStorage.deleteAudioFile(book, chapter, translation);
      setDownloadedFiles(prev => prev.filter(f => !(f.book === book && f.chapter === chapter && f.translation === translation)));
      toast.success('File removed');
      
      // Refresh storage usage
      const usage = await offlineAudioStorage.getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600" />
            Offline Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {storageUsage && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-2xl font-bold text-blue-600">{storageUsage.formattedSize}</p>
                  <p className="text-xs text-gray-600">Total Used</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-2xl font-bold text-indigo-600">{storageUsage.fileCount}</p>
                  <p className="text-xs text-gray-600">Files Downloaded</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border text-sm text-gray-600">
                <p>Browser storage limit: ~50MB</p>
                <p className="text-xs mt-1">Delete files to free up space</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowDetails(true)}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading || downloadedFiles.length === 0}
                >
                  View Downloads
                </Button>
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700"
                  disabled={isLoading || downloadedFiles.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detailed Downloads Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Downloaded Chapters ({downloadedFiles.length})</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {downloadedFiles.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No files downloaded yet</p>
            ) : (
              downloadedFiles.map((file) => (
                <div key={`${file.book}_${file.chapter}_${file.translation}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {file.book} {file.chapter}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.translation} • {(file.size / 1024).toFixed(1)}KB
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteFile(file.book, file.chapter, file.translation)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowDetails(false)} className="flex-1">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}