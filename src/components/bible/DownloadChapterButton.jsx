import React, { useState, useEffect } from 'react';
import { Download, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { offlineDb } from '../lib/offlineDb';

export default function DownloadChapterButton({ reference, title, text, language = 'en' }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if already downloaded
    const checkDownload = async () => {
      const existing = await offlineDb.getChapter(reference);
      setIsDownloaded(!!existing);
    };
    checkDownload();
  }, [reference]);

  const handleDownload = async () => {
    if (!text || !reference) {
      setError('Missing chapter data');
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      await offlineDb.saveChapter(reference, title, text, language, {
        reference,
        title,
      });
      setIsDownloaded(true);
    } catch (err) {
      setError('Download failed');
      console.error('Offline save error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isDownloaded) {
    return (
      <Button variant="ghost" size="sm" className="gap-2 text-green-600" disabled>
        <Check size={16} />
        Downloaded
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading}
        className="gap-2"
      >
        <Download size={16} />
        {isDownloading ? 'Downloading...' : 'Download'}
      </Button>
      {error && (
        <AlertCircle size={16} className="text-red-500" title={error} />
      )}
    </div>
  );
}