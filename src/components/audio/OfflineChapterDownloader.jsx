import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflineChapterDownloader({ book, chapter, version }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Check if chapter is already downloaded
  useEffect(() => {
    const checkDownload = async () => {
      try {
        // Check local storage for downloaded chapter
        const stored = localStorage.getItem(`bible_chapter_${version}_${book}_${chapter}`);
        setIsDownloaded(!!stored);
      } catch (err) {
        console.log('Check download failed:', err);
      }
    };
    checkDownload();
  }, [version, book, chapter]);

  const downloadMutation = useMutation({
    mutationFn: async () => {
      setIsDownloading(true);

      try {
        // Fetch chapter from API
        const data = await base44.integrations.Core.InvokeLLM({
          prompt: `Fetch the text of ${book} chapter ${chapter} from the ${version} Bible version. Return full verses.`,
          add_context_from_internet: true
        });

        // Store in local storage
        localStorage.setItem(
          `bible_chapter_${version}_${book}_${chapter}`,
          JSON.stringify({
            book,
            chapter,
            version,
            content: data,
            downloadedAt: new Date().toISOString()
          })
        );

        setIsDownloaded(true);
        return true;
      } finally {
        setIsDownloading(false);
      }
    },
    onError: () => {
      alert('Download failed. Please try again.');
    }
  });

  return (
    <Button
      onClick={() => downloadMutation.mutate()}
      disabled={isDownloading || isDownloaded}
      variant={isDownloaded ? 'outline' : 'default'}
      className={`gap-2 ${isDownloaded ? 'text-green-600 border-green-600' : ''}`}
    >
      {isDownloaded ? (
        <>
          <CheckCircle2 className="w-4 h-4" /> Downloaded
        </>
      ) : isDownloading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" /> Download for Offline
        </>
      )}
    </Button>
  );
}