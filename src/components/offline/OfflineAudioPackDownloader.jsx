import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Trash2, Loader2, CheckCircle, HardDrive } from 'lucide-react';

/**
 * Download Bible audio packs for offline listening
 * Supports: Books, Testaments, and full Bible
 */
export default function OfflineAudioPackDownloader({ language = 'en' }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const queryClient = useQueryClient();

  // Get available audio packs
  const { data: packs, isLoading } = useQuery({
    queryKey: ['audio-packs', language],
    queryFn: async () => {
      const response = await base44.functions.invoke('manageOfflineAudio', {
        action: 'available-packs',
        language,
      });
      return response.data?.packs || [];
    },
  });

  // Get user's downloaded audio
  const { data: downloaded } = useQuery({
    queryKey: ['offline-audio'],
    queryFn: async () => {
      const response = await base44.functions.invoke('manageOfflineAudio', {
        action: 'list',
      });
      return response.data?.audio_downloads || [];
    },
  });

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async (pack) => {
      setDownloadingId(pack.id);
      await base44.functions.invoke('manageOfflineAudio', {
        action: 'download',
        pack_type: pack.type,
        pack_id: pack.id,
        pack_title: pack.title,
        book_name: pack.book_abbr,
        language: pack.language,
        chapters: pack.chapters,
        estimated_size_bytes: pack.estimated_size_mb * 1024 * 1024,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-audio'] });
      setDownloadingId(null);
    },
    onError: (error) => {
      setDownloadingId(null);
      console.error('Download failed:', error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (downloadId) => {
      await base44.functions.invoke('manageOfflineAudio', {
        action: 'delete',
        download_id: downloadId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-audio'] });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">Loading audio packs...</p>
        </CardContent>
      </Card>
    );
  }

  // Group packs by type
  const testaments = packs?.filter(p => p.type === 'testament') || [];
  const books = packs?.filter(p => p.type === 'book') || [];

  return (
    <div className="space-y-6">
      {/* Downloaded Audio */}
      {downloaded && downloaded.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Downloaded Audio ({downloaded.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {downloaded.map((audio) => (
              <div key={audio.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{audio.title}</p>
                  <p className="text-xs text-gray-600">{audio.file_size_mb} MB</p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(audio.id)}
                  disabled={deleteMutation.isPending}
                  className="gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Testaments */}
      {testaments.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Full Testaments</h3>
          <div className="grid gap-3">
            {testaments.map((pack) => {
              const isDownloaded = downloaded?.some(d => d.id === pack.id);
              const isDownloading = downloadingId === pack.id;

              return (
                <Card key={pack.id}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{pack.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{pack.description}</p>
                      <p className="text-xs text-gray-500 mt-1">~{pack.estimated_size_mb} MB</p>
                    </div>
                    <Button
                      onClick={() => downloadMutation.mutate(pack)}
                      disabled={isDownloading || isDownloaded}
                      variant={isDownloaded ? 'outline' : 'default'}
                      className="gap-2 ml-4 flex-shrink-0"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : isDownloaded ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Downloaded
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Individual Books */}
      {books.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Individual Books</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {books.slice(0, 20).map((pack) => {
              const isDownloaded = downloaded?.some(d => d.id === pack.id);
              const isDownloading = downloadingId === pack.id;

              return (
                <Card key={pack.id} className="p-3">
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{pack.title}</h4>
                      <p className="text-xs text-gray-600">{pack.description}</p>
                    </div>
                    <Button
                      onClick={() => downloadMutation.mutate(pack)}
                      disabled={isDownloading || isDownloaded}
                      size="sm"
                      variant={isDownloaded ? 'outline' : 'default'}
                      className="w-full gap-1"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Downloading...
                        </>
                      ) : isDownloaded ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Downloaded
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          {books.length > 20 && (
            <p className="text-xs text-gray-600 mt-4 text-center">
              + {books.length - 20} more books available
            </p>
          )}
        </div>
      )}

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 text-sm text-blue-900">
          <p className="font-medium mb-2">Offline Audio Features</p>
          <ul className="space-y-1 text-xs">
            <li>✓ Download whole testaments or individual books</li>
            <li>✓ Listen without internet connection</li>
            <li>✓ Smooth playback from local storage</li>
            <li>✓ Pause, resume, and rewind controls</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}