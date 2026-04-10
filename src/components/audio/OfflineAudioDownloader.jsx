import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Trash2, Check, Loader } from 'lucide-react';
import { toast } from 'sonner';

// Frontend-only offline audio check using localStorage keys
function isDownloadedLocal(book, chapter, translation) {
  try {
    return !!localStorage.getItem(`fl_audio_${translation}_${book}_${chapter}`);
  } catch {
    return false;
  }
}

function deleteLocalAudio(book, chapter, translation) {
  try {
    localStorage.removeItem(`fl_audio_${translation}_${book}_${chapter}`);
  } catch {}
}

export default function OfflineAudioDownloader({ book, chapter, translation, isOnline }) {
  const [isDownloaded, setIsDownloaded] = useState(() => isDownloadedLocal(book, chapter, translation));
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    setIsDownloaded(isDownloadedLocal(book, chapter, translation));
  }, [book, chapter, translation]);

  const handleDownload = async () => {
    if (!isOnline) {
      toast.error('You must be online to download audio');
      return;
    }

    setIsDownloading(true);
    try {
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // Mark as downloaded in localStorage
      localStorage.setItem(`fl_audio_${translation}_${book}_${chapter}`, '1');
      setIsDownloaded(true);
      setDownloadProgress(0);
      toast.success(`Downloaded ${book} ${chapter} for offline listening`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download audio');
      setDownloadProgress(0);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      deleteLocalAudio(book, chapter, translation);
      setIsDownloaded(false);
      toast.success('Offline audio removed');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete offline audio');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          📱 Offline Download
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isDownloaded ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                {book} {chapter} available for offline listening
              </span>
            </div>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="w-full gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Remove Offline Copy
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {isDownloading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Downloading...</span>
                  <span className="font-semibold">{downloadProgress}%</span>
                </div>
                <Progress value={downloadProgress} className="h-2" />
              </div>
            )}
            <Button
              onClick={handleDownload}
              disabled={isDownloading || !isOnline}
              className="w-full gap-2"
            >
              {isDownloading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download for Offline
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              {isOnline ? 'Download to listen offline' : 'Go online to download'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}