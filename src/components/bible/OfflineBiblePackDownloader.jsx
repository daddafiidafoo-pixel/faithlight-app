/**
 * Offline Bible Pack Downloader
 * UI for browsing, downloading, and managing offline Bible packs
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  downloadAndInstallPack,
} from '@/components/lib/offlinePackManager';
import {
  getRegistryPacks,
  checkForUpdates,
  getInstalledPacks,
  saveInstalledPack,
  deleteInstalledPack,
  verifyContentHash,
} from '@/components/lib/registryManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Trash2, CheckCircle, Loader2, HardDrive } from 'lucide-react';

export default function OfflineBiblePackDownloader() {
  const [downloadProgress, setDownloadProgress] = useState({});
  const queryClient = useQueryClient();

  // Fetch registry packs
  const { data: packs = [], isLoading: packsLoading } = useQuery({
    queryKey: ['registryPacks'],
    queryFn: () => getRegistryPacks(null, 'text'),
  });

  // Fetch installed packs
  const { data: installedPacks = [] } = useQuery({
    queryKey: ['installedPacks'],
    queryFn: getInstalledPacks,
  });

  // Check for updates
  const { data: availableUpdates = [] } = useQuery({
    queryKey: ['packUpdates'],
    queryFn: () => checkForUpdates(installedPacks),
    enabled: installedPacks.length > 0,
  });

  const installedMap = installedPacks.reduce((acc, pack) => {
    acc[pack.packId] = pack;
    return acc;
  }, {});

  const updateMap = availableUpdates.reduce((acc, update) => {
    acc[update.packId] = update;
    return acc;
  }, {});

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async ({ pack, packId }) => {
      await downloadAndInstallPack(pack, (progress) => {
        setDownloadProgress(prev => ({ ...prev, [packId]: progress }));
      });
      // Save to installed registry
      await saveInstalledPack({
        packId: pack.packId,
        type: pack.type,
        packVersion: pack.packVersion,
        contentHash: pack.contentHash,
      });
    },
    onSuccess: (_, { packId }) => {
      setDownloadProgress(prev => {
        const updated = { ...prev };
        delete updated[packId];
        return updated;
      });
      queryClient.invalidateQueries({ queryKey: ['installedPacks'] });
      queryClient.invalidateQueries({ queryKey: ['packUpdates'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (packId) => deleteInstalledPack(packId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installedPacks'] });
      queryClient.invalidateQueries({ queryKey: ['packUpdates'] });
    },
  });

  const groupedByLanguage = packs.reduce((acc, pack) => {
    if (!acc[pack.languageCode]) {
      acc[pack.languageCode] = { language: pack, packs: [] };
    }
    acc[pack.languageCode].packs.push(pack);
    return acc;
  }, {});

  if (packsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading packs...</span>
      </div>
    );
  }

  if (packs.length === 0) {
    return (
      <div className="py-12 text-center">
        <HardDrive className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">No offline packs available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <HardDrive className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Offline Bible Packs
        </h2>
      </div>

      {Object.entries(groupedByLanguage).map(([langCode, { packs: langPacks }]) => (
        <div key={langCode} className="space-y-3">
          <h3 className="font-semibold text-gray-800">
            {langPacks[0].languageName}
          </h3>

          <div className="grid gap-3">
            {langPacks.map(pack => {
              const installed = installedMap[pack.packId];
              const update = updateMap[pack.packId];
              const isDownloading = downloadProgress[pack.packId];
              const progress = downloadProgress[pack.packId] || 0;

              return (
              <Card key={pack.packId} className="border-gray-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">
                          {pack.versionName}
                        </h4>
                        {pack.type !== 'text' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {pack.type === 'audio' ? '🎧 Audio' : '📚 Study'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <p>
                          📚 {pack.bookCount} books, {pack.chapterCount} chapters
                        </p>
                        <p className="flex items-center gap-1">
                          💾 {Math.round(pack.fileSizeBytes / 1024 / 1024)}MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {installed ? (
                        <>
                          {update ? (
                            <>
                              <div className="flex items-center gap-2 text-amber-600">
                                <span className="text-xs font-medium bg-amber-100 px-2 py-1 rounded">
                                  Update v{update.latest}
                                </span>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  downloadMutation.mutate({
                                    pack,
                                    packId: pack.packId,
                                  })
                                }
                                disabled={isDownloading}
                                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                              >
                                {isDownloading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {progress}%
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-4 h-4" />
                                    Update
                                  </>
                                )}
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">v{installed.packVersion}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  deleteMutation.mutate(pack.packId)
                                }
                                disabled={deleteMutation.isPending}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            downloadMutation.mutate({
                              pack,
                              packId: pack.packId,
                            })
                          }
                          disabled={isDownloading}
                          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {progress}%
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Download
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {isDownloading && (
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              );
              })}
          </div>
        </div>
      ))}

      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mt-6">
        <p className="font-semibold mb-1">💡 Tip:</p>
        <p>Downloaded packs are stored locally and work completely offline. Uninstall to free up space.</p>
      </div>
    </div>
  );
}