import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { HardDrive, BookOpen, Volume2, Trash2, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../I18nProvider';
import { toast } from 'sonner';

const VERSIONS = {
  WEB: 'World English Bible',
  ASV: 'American Standard Version',
};

const TEXT_VERSIONS = [
  { id: 'WEB', name: 'World English Bible' },
  { id: 'ASV', name: 'American Standard Version' },
];

export default function DownloadedContentManager({ user }) {
  const { t } = useI18n();
  const [textChapters, setTextChapters] = useState({});
  const [audioChapters, setAudioChapters] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [storageUsage, setStorageUsage] = useState(0);

  useEffect(() => {
    const loadContent = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [texts, audios] = await Promise.all([
          base44.entities.OfflineTextChapter.list('book_id', 1000),
          base44.entities.OfflineAudioChapter.list('book_id', 1000),
        ]);

        // Group by version and book
        const textMap = {};
        texts?.forEach(t => {
          const key = `${t.version_id}`;
          if (!textMap[key]) textMap[key] = {};
          if (!textMap[key][t.book_id]) textMap[key][t.book_id] = [];
          textMap[key][t.book_id].push(t);
        });

        const audioMap = {};
        audios?.forEach(a => {
          const key = `${a.fileset_id_audio}`;
          if (!audioMap[key]) audioMap[key] = {};
          if (!audioMap[key][a.book_id]) audioMap[key][a.book_id] = [];
          audioMap[key][a.book_id].push(a);
        });

        setTextChapters(textMap);
        setAudioChapters(audioMap);

        // Estimate storage (rough: assume ~20KB per text chapter, ~2MB per audio URL)
        const textSize = Object.values(textMap).reduce((sum, v) => 
          sum + Object.values(v).reduce((s, chapters) => s + chapters.length * 20, 0), 0
        );
        const audioSize = Object.values(audioMap).reduce((sum, v) => 
          sum + Object.values(v).reduce((s, chapters) => s + chapters.length * 0.1, 0), 0
        );
        
        setStorageUsage(textSize + audioSize);
      } catch (err) {
        console.error('Error loading content:', err);
        toast.error('Failed to load downloaded content');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [user]);

  const deleteTextChapters = async (versionId, bookId) => {
    if (!window.confirm('Delete all chapters for this book?')) return;

    setDeleting(`text-${versionId}-${bookId}`);
    try {
      const chapters = textChapters[versionId]?.[bookId] || [];
      for (const ch of chapters) {
        await base44.entities.OfflineTextChapter.delete(ch.id);
      }

      const newMap = { ...textChapters };
      delete newMap[versionId][bookId];
      if (Object.keys(newMap[versionId]).length === 0) delete newMap[versionId];
      setTextChapters(newMap);
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const deleteAudioChapters = async (filesetId, bookId) => {
    if (!window.confirm('Delete all audio for this book?')) return;

    setDeleting(`audio-${filesetId}-${bookId}`);
    try {
      const chapters = audioChapters[filesetId]?.[bookId] || [];
      for (const ch of chapters) {
        await base44.entities.OfflineAudioChapter.delete(ch.id);
      }

      const newMap = { ...audioChapters };
      delete newMap[filesetId][bookId];
      if (Object.keys(newMap[filesetId]).length === 0) delete newMap[filesetId];
      setAudioChapters(newMap);
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const formatBytes = bytes => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          {t('offline.downloaded.title', 'Downloaded Content')}
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  const hasContent = Object.keys(textChapters).length > 0 || Object.keys(audioChapters).length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
          <HardDrive className="w-5 h-5 text-indigo-600" />
          {t('offline.downloaded.title', 'Downloaded Content')}
        </h2>
        <p className="text-sm text-gray-600">
          {t('offline.downloaded.storage', 'Storage used')}: <span className="font-semibold">{formatBytes(storageUsage * 1024)}</span>
        </p>
      </div>

      {!hasContent ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">{t('offline.downloaded.empty', 'No content downloaded yet.')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Text Chapters */}
          {Object.keys(textChapters).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                {t('offline.reading.title', 'Offline Reading')}
              </h3>
              <div className="space-y-2">
                {Object.entries(textChapters).map(([version, books]) => (
                  <div key={version} className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600">
                      {VERSIONS[version] || version}
                    </p>
                    <div className="space-y-1.5">
                      {Object.entries(books).map(([bookId, chapters]) => {
                        const bookName = chapters[0]?.book_name || `Book ${bookId}`;
                        return (
                          <div
                            key={`${version}-${bookId}`}
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{bookName}</p>
                              <p className="text-xs text-gray-500">
                                {chapters.length} chapter{chapters.length > 1 ? 's' : ''}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteTextChapters(version, bookId)}
                              disabled={deleting === `text-${version}-${bookId}`}
                              className="gap-1"
                            >
                              {deleting === `text-${version}-${bookId}` ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio URLs */}
          {Object.keys(audioChapters).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-500" />
                {t('offline.audio.title', 'Audio Streaming')}
              </h3>
              <div className="space-y-2">
                {Object.entries(audioChapters).map(([fileset, books]) => (
                  <div key={fileset} className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600">{fileset}</p>
                    <div className="space-y-1.5">
                      {Object.entries(books).map(([bookId, chapters]) => {
                        const bookName = chapters[0]?.book_name || `Book ${bookId}`;
                        return (
                          <div
                            key={`${fileset}-${bookId}`}
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{bookName}</p>
                              <p className="text-xs text-gray-500">
                                {chapters.length} stream URL{chapters.length > 1 ? 's' : ''}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteAudioChapters(fileset, bookId)}
                              disabled={deleting === `audio-${fileset}-${bookId}`}
                              className="gap-1"
                            >
                              {deleting === `audio-${fileset}-${bookId}` ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}