import React, { useState, useEffect } from 'react';
import { Download, Check, Loader2, Trash2 } from 'lucide-react';
import {
  saveChapterOffline,
  isChapterDownloaded,
  removeOfflineChapter,
} from '@/components/lib/offlineBibleChapterService';
import { useI18n } from '@/components/I18nProvider';

/**
 * ChapterDownloadButton
 * Shows Download / Downloading / Downloaded badge for a Bible chapter.
 *
 * Props:
 *  - bookId: string (e.g. "GEN")
 *  - chapterNumber: number
 *  - language: string (default "en")
 *  - verses: array (required to save)
 *  - bookName: string
 *  - compact: bool — icon-only mode
 */
export default function ChapterDownloadButton({
  bookId,
  chapterNumber,
  language = 'en',
  verses = [],
  bookName = '',
  compact = false,
}) {
  const { t } = useI18n();
  const [status, setStatus] = useState('idle'); // idle | checking | downloading | downloaded

  useEffect(() => {
    let cancelled = false;
    setStatus('checking');
    isChapterDownloaded(bookId, chapterNumber, language).then(downloaded => {
      if (!cancelled) setStatus(downloaded ? 'downloaded' : 'idle');
    });
    return () => { cancelled = true; };
  }, [bookId, chapterNumber, language]);

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (status === 'downloading' || status === 'checking') return;

    if (status === 'downloaded') {
      // Toggle: remove
      setStatus('idle');
      await removeOfflineChapter(bookId, chapterNumber, language);
      return;
    }

    if (!verses || verses.length === 0) return;

    setStatus('downloading');
    await saveChapterOffline(bookId, chapterNumber, language, verses, bookName);
    setStatus('downloaded');
  };

  if (status === 'checking') return null;

  const isDownloaded = status === 'downloaded';
  const isDownloading = status === 'downloading';

  if (compact) {
    return (
      <button
        onClick={handleDownload}
        title={isDownloaded ? t('offline.removeOffline', 'Remove offline') : t('offline.download', 'Download')}
        className={`p-1.5 rounded-lg transition-all ${
          isDownloaded
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-indigo-100 hover:text-indigo-600'
        }`}
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isDownloaded ? (
          <Check className="w-4 h-4" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
        isDownloaded
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-red-100 hover:text-red-600 group'
          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 hover:text-indigo-700'
      }`}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {t('offline.downloading', 'Downloading…')}
        </>
      ) : isDownloaded ? (
        <>
          <Check className="w-3.5 h-3.5 group-hover:hidden" />
          <Trash2 className="w-3.5 h-3.5 hidden group-hover:block" />
          <span className="group-hover:hidden">{t('offline.downloaded', 'Downloaded')}</span>
          <span className="hidden group-hover:inline">{t('offline.remove', 'Remove')}</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5" />
          {t('offline.download', 'Download')}
        </>
      )}
    </button>
  );
}