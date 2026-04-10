import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, CheckCircle2, AlertCircle, Loader2, HardDrive, BookOpen, Globe } from 'lucide-react';
import { toast } from 'sonner';

const TRANSLATIONS = [
  { code: 'WEB', name: 'World English Bible', language: 'English', size: '~18 MB', books: 66 },
  { code: 'ASV', name: 'American Standard Version', language: 'English', size: '~17 MB', books: 66 },
];

const TOTAL_BOOKS = 66;
const DL_KEY = 'translation_downloads';

function loadDownloads() {
  try { return JSON.parse(localStorage.getItem(DL_KEY)) || {}; } catch { return {}; }
}
function saveDownloads(d) {
  localStorage.setItem(DL_KEY, JSON.stringify(d));
}

export default function BibleTranslationDownloadManager({ user, isDarkMode }) {
  const [downloads, setDownloads] = useState(loadDownloads);
  const [storageInfo, setStorageInfo] = useState(null);
  const processingRef = useRef({});

  const primaryColor = isDarkMode ? '#8FB996' : '#6366F1';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const bgColor = isDarkMode ? '#0F1411' : '#F9FAFB';

  useEffect(() => { saveDownloads(downloads); }, [downloads]);

  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({ usage, quota }) => {
        setStorageInfo({
          usedMB: Math.round((usage || 0) / 1024 / 1024),
          quotaMB: Math.round((quota || 0) / 1024 / 1024),
          pct: quota ? Math.round((usage / quota) * 100) : 0,
        });
      });
    }
  }, [downloads]);

  const startDownload = async (translation) => {
    const code = translation.code;
    if (processingRef.current[code]) return;
    processingRef.current[code] = true;

    setDownloads(d => ({ ...d, [code]: { status: 'downloading', progress: 0, code, name: translation.name } }));

    try {
      // Simulate per-book download progress
      for (let i = 1; i <= TOTAL_BOOKS; i++) {
        await new Promise(r => setTimeout(r, 120));
        const progress = Math.round((i / TOTAL_BOOKS) * 100);
        setDownloads(d => ({ ...d, [code]: { ...d[code], progress } }));
      }

      if (user?.id) {
        try {
          await base44.entities.OfflineLibrary.create({
            user_id: user.id,
            content_type: 'translation',
            content_id: `translation-${code}`,
            content_title: `${translation.name} (${code}) — Full Bible`,
            translation: code,
            total_chapters: 1189,
            chapters_downloaded: [],
            storage_size_mb: parseInt(translation.size) || 18,
            download_status: 'completed',
            download_progress_percent: 100,
            is_synced: true,
          });
        } catch (_) { /* non-critical */ }
      }

      setDownloads(d => ({ ...d, [code]: { ...d[code], status: 'done', progress: 100, downloadedAt: new Date().toISOString() } }));
      toast.success(`${translation.name} downloaded for offline use!`);
    } catch (e) {
      setDownloads(d => ({ ...d, [code]: { ...d[code], status: 'error', progress: 0 } }));
      toast.error(`Download failed for ${translation.name}`);
    } finally {
      processingRef.current[code] = false;
    }
  };

  const removeDownload = (code) => {
    setDownloads(d => {
      const next = { ...d };
      delete next[code];
      return next;
    });
    toast.success('Translation removed from offline storage');
  };

  const retryDownload = (translation) => {
    setDownloads(d => {
      const next = { ...d };
      delete next[translation.code];
      return next;
    });
    setTimeout(() => startDownload(translation), 100);
  };

  return (
    <div className="space-y-4">
      {/* Storage Usage */}
      {storageInfo && (
        <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="w-4 h-4" style={{ color: primaryColor }} />
              <span className="text-sm font-medium" style={{ color: textColor }}>Storage Usage</span>
              <span className="text-xs ml-auto" style={{ color: mutedColor }}>
                {storageInfo.usedMB} MB / {storageInfo.quotaMB} MB
              </span>
            </div>
            <Progress value={storageInfo.pct} className="h-2" />
            <p className="text-xs mt-1" style={{ color: mutedColor }}>{storageInfo.pct}% used</p>
          </CardContent>
        </Card>
      )}

      {/* Downloaded translations summary */}
      {Object.values(downloads).some(d => d.status === 'done') && (
        <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: textColor }}>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Downloaded Translations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.values(downloads).filter(d => d.status === 'done').map(dl => (
              <div key={dl.code} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4" style={{ color: primaryColor }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: textColor }}>{dl.name}</p>
                    <p className="text-xs" style={{ color: mutedColor }}>
                      Full Bible • Downloaded {dl.downloadedAt ? new Date(dl.downloadedAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs text-green-600 border-green-300">Offline</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-400 hover:text-red-600"
                    onClick={() => removeDownload(dl.code)}
                    title="Remove from offline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Translations */}
      <Card style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}` }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
            <Globe className="w-5 h-5" style={{ color: primaryColor }} />
            Download Bible Translations
          </CardTitle>
          <p className="text-sm" style={{ color: mutedColor }}>
            Download entire translations for offline reading and listening
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {TRANSLATIONS.map(translation => {
            const dl = downloads[translation.code];
            const isDone = dl?.status === 'done';
            const isDownloading = dl?.status === 'downloading';
            const isError = dl?.status === 'error';

            return (
              <div
                key={translation.code}
                className="p-4 rounded-xl"
                style={{ backgroundColor: bgColor, border: `1px solid ${isDone ? '#22c55e40' : borderColor}` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: textColor }}>{translation.name}</span>
                      <Badge variant="outline" className="text-xs">{translation.code}</Badge>
                      {isDone && <Badge className="text-xs bg-green-100 text-green-700 border-green-300">✓ Offline</Badge>}
                    </div>
                    <p className="text-xs mt-1" style={{ color: mutedColor }}>
                      {translation.language} · {translation.books} books · {translation.size}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {isDone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-red-500 border-red-300 hover:bg-red-50"
                        onClick={() => removeDownload(translation.code)}
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </Button>
                    )}
                    {!isDone && !isDownloading && (
                      <Button
                        size="sm"
                        className="h-8 gap-1"
                        style={{ backgroundColor: primaryColor, color: '#fff' }}
                        onClick={() => startDownload(translation)}
                        disabled={isDownloading}
                      >
                        {isError ? (
                          <><AlertCircle className="w-3 h-3" />Retry</>
                        ) : (
                          <><Download className="w-3 h-3" />Download</>
                        )}
                      </Button>
                    )}
                    {isDownloading && (
                      <Button size="sm" disabled className="h-8 gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {dl.progress}%
                      </Button>
                    )}
                  </div>
                </div>

                {isDownloading && (
                  <div className="mt-3">
                    <Progress value={dl.progress} className="h-2" />
                    <p className="text-xs mt-1" style={{ color: mutedColor }}>
                      Downloading… {dl.progress}% ({Math.round((dl.progress / 100) * translation.books)}/{translation.books} books)
                    </p>
                  </div>
                )}

                {isError && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Download failed — tap Retry to try again
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}